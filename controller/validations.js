const { check } = require('express-validator');


exports.usernameValidation = check('username')
  .trim()
  .notEmpty()
  .withMessage('Name must not be empty')
  .isLength({ min: 5 })
  .withMessage('Name must be at least 5 characters long')
  .matches(/^[A-Za-z\s]+$/)
  .withMessage('Name must contain only letters and spaces');

exports.passwordValidation = check('password')
  .notEmpty()
  .withMessage('Password is required')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters long');

exports.confirmPasswordValidation = check('confirm_password')
  .notEmpty()
  .withMessage('Confirm password is required')
  .custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  });

exports.emailValidation = check('email')
  .trim()
  .notEmpty()
  .withMessage('Email must not be empty')
  .isEmail()
  .withMessage('Please enter a valid email address')
  .normalizeEmail();

exports.userTypeValidation = check('user_type')
  .notEmpty()
  .withMessage('User type is required')
  .isIn(['guest', 'host'])
  .withMessage('Invalid user type');

exports.termsValidation = check('terms')
  .custom(value => {
    if (!value) {
      throw new Error('You must accept the Terms and Conditions');
    }
    return true;
  });