
// External Module
const express = require('express');
const authRouter = express.Router();
const authController = require('../controller/authController')


// Show add-home form
authRouter.get('/login', authController.getlogin);

authRouter.post('/login', authController.loginValidation, authController.postlogin);

authRouter.post('/logout', authController.postlogout);

authRouter.get('/signin', authController.getsignin);

authRouter.post('/signin', authController.preSignin, authController.postsignin);

authRouter.get('/reset-password', authController.getpassword);

authRouter.post('/reset-password', authController.postpassword);

authRouter.get('/new-password', authController.getResetPassword);

authRouter.post('/new-password', authController.postResetpassword);



exports.authRouter = authRouter;
