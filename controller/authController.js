const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { usernameValidation, passwordValidation, confirmPasswordValidation, emailValidation, userTypeValidation, termsValidation } = require('./validations');

const sgMail = require('@sendgrid/mail');
const user = require('../models/user');
const Send_Key = process.env.SENDGRID_API_KEY;
sgMail.setApiKey(Send_Key);

// Login validation middleware
const loginEmailValidation = check('email')
  .trim()
  .notEmpty()
  .withMessage('Email must not be empty')
  .isEmail()
  .withMessage('Please enter a valid email address')
  .normalizeEmail();

const loginPasswordValidation = check('password')
  .notEmpty()
  .withMessage('Password is required')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters long');

exports.loginValidation = [loginEmailValidation, loginPasswordValidation];

exports.getlogin = (req, res, next) => {
  res.render('auth/login', { pageTitle: 'Login', user: null });
};

exports.getpassword = (req, res, next) => {
  res.render('auth/password', { pageTitle: ' Password', isLoggedIn: false,  });
};

exports.getResetPassword = (req, res, next) => {
  const{ email }= req.query;

  res.render('auth/new-password', { pageTitle: 'Reset Password', isLoggedIn: false,email: email  });
};

exports.postResetpassword = [
  passwordValidation,
  confirmPasswordValidation,
  async (req, res, next) => {
    const { email, otp, password, } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render('auth/new-password', {
        pageTitle: 'Reset Password',
        isLoggedIn: false,
        email,
        errorMessages: errors.array().map(err => err.msg),
      });
    }

    try {
      const user = await User.findOne({ email });

      if (!user) {
        return res.render('auth/new-password', {
          pageTitle: 'Reset Password',
          isLoggedIn: false,
          email,
          errorMessages: ['User not found'],
        });
      }

      if (user.otp !== otp || user.otpExpiration < Date.now()) {
        return res.render('auth/new-password', {
          pageTitle: 'Reset Password',
          isLoggedIn: false,
          email,
          errorMessages: ['Invalid or expired OTP'],
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      user.password = hashedPassword;
      user.otp = undefined;
      user.otpExpiration = undefined;
      await user.save();

      return res.redirect('/auth/login');
    } catch (err) {
      return res.render('auth/new-password', {
        pageTitle: 'Reset Password',
        isLoggedIn: false,
        email,
        errorMessages: ['Unable to reset password. Try again.'],
      });
    }
  }
];

exports.postpassword = async(req, res, next) => {
const { email } = req.body;
  try {
    const user = await User.findOne({ email: email });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiration = Date.now() + 20 * 60 * 1000; // 20 minutes from now
    await user.save();

      const forgetEmail = {
          to: email,
          from: process.env.SENDER_EMAIL ,
          //  'gaikwadakash3717@gmail.com',
          subject: 'Here is your OTP to reset password',
          html: `<h1>Your OTP is ${otp}</h1>
                <p>Enter This otp on <a href="http://localhost:3000/new-password?email=${email}">Reset Password</a> page</p>`
        };
        await sgMail.send(forgetEmail);

    res.redirect(`/auth/new-password?email=${encodeURIComponent(email)}`);
  } catch (err) {
    res.status(500).render('auth/password', {
      pageTitle: 'Reset Password',
      isLoggedIn: false,
      errorMessages: ['Unable to process request. Try again.']
    });
  }
};

exports.postlogin = async (req, res, next) => {
  const { email, password } = req.body;
  console.log('POST /auth/login called with:', { email });
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Login validation errors:', errors.array());
    return res.status(400).render('auth/login', {
      pageTitle: 'Login',
      isLoggedIn: false,
      user: null,
      errorMessages: errors.array().map(e => e.msg)
    });
  }
  try {
    const user = await User.findOne({ email: email });
    console.log('User lookup result:', !!user);
    if (!user) {
      return res.status(401).render('auth/login', {
        pageTitle: 'Login',
        isLoggedIn: false,
        user: null,
        errorMessages: ['Invalid email or password']
      });
    }

    const match = await bcrypt.compare(password, user.password);
    console.log('Password match:', match);
    if (!match) {
      return res.status(401).render('auth/login', {
        pageTitle: 'Login',
        isLoggedIn: false,
        user: null,
        errorMessages: ['Invalid email or password']
      });
    }

    if (!req.session) {
      return res.status(500).render('auth/login', {
        pageTitle: 'Login',
        isLoggedIn: false,
        user: null,
        errorMessages: ['Session unavailable']
      });
    }

    req.session.isLoggedIn = true;
    req.session.userType = user.user_type;
    // Store plain data in the session to avoid BSON version mismatches
    req.session.user = { _id: user._id.toString(), email: user.email, user_type: user.user_type };

    // persist the session before redirecting so the next request sees the role
    await new Promise((resolve, reject) => {
      req.session.save(err => (err ? reject(err) : resolve()));
    });

    const redirectPath = user.user_type === 'host' ? '/host/edit' : '/homes';
    console.log('Session saved, redirecting to', redirectPath);
    res.redirect(redirectPath);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).render('auth/signin' ,
      {
      pageTitle: 'Login',
      isLoggedIn: false,
      user: null,
      errorMessages: ['Unable to login. Try again.']
    });
  }
};


exports.getsignin = (req, res, next) => {
  res.render('auth/signin', { ...req.body, pageTitle: 'Sign In', user: null });
}

exports.postsignin = [
  usernameValidation,
  emailValidation,
  passwordValidation,
  confirmPasswordValidation,
  userTypeValidation,
  termsValidation,
  async (req, res, next) => {
    console.log('Signin validation middleware executed', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('auth/signin', {
        ...req.body,
        pageTitle: 'Sign In',
        isLoggedIn: false,
        user: null,
        errorMessages: errors.array().map(err => err.msg),
      });
    }

    const { username, password, user_type, email } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = new User({   
        username: username,
        password: hashedPassword,
        user_type: user_type,
        email: email,
      });
      
      await user.save();
      console.log('User saved successfully:', email);
      
      // Send welcome email
      try {
        const welcomeEmail = {
          to: email,
          from: process.env.SENDER_EMAIL ,
          // 'gaikwadakash3717@gmail.com'
          subject: 'Welcome to Our AirBNB',
          html: `<h1>Welcome, ${username}!</h1><p>Thank you for signing up as a ${user_type}.</p>`
        };

        const response = await sgMail.send(welcomeEmail);
        console.log('✅ Welcome email sent successfully to:', email);
       
      } catch (emailError) {
        console.error('❌ Error sending welcome email:', emailError.message);
        if (emailError.response) {
          console.error('SendGrid error details:', emailError.response.body);
        }
      }
      
      res.redirect('/auth/login');
    } catch(err) {
      console.error('Signup error:', err);
      res.render('auth/signin', {
        ...req.body,
        pageTitle: 'Sign In',
        isLoggedIn: false,
        user: null,
        errorMessages: ['Unable to create account. Try again.']
      });
    }
  } 
];

exports.preSignin = (req, res, next) => {
  // noop middleware to match router usage; can be extended later
  next();
};

exports.postlogout = (req, res, next) => {
  if (req.session) {
    req.session.destroy(err => {
      return res.redirect('/');
    });
  } else {
    res.redirect('/');
  }
};

