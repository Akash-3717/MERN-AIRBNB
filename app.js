const ENV = process.env.NODE_ENV || 'production';
require('dotenv').config({
   path: `.env.${ENV}` });

// Core Module
const path = require('path');
const fs = require('fs');

// External Module
const express = require('express');

//Local Module
const storeRouter = require("./routes/storeRouter")
const {hostRouter} = require("./routes/hostRouter")
const rootDir = require("./utils/pathUtil");
const errorController = require('./controller/errorController');
const {authRouter} = require("./routes/authRouter")
const session = require('express-session');
const MongoDbStore = require('connect-mongodb-session')(session);
const multer = require('multer');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
// const Mongo_Db_Url = "mongodb+srv://root:akash2003@akash.nnixybo.mongodb.net/airbnb?retryWrites=true&w=majority"; 
const Mongo_Db_Url = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@akash.nnixybo.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`;

const store = new MongoDbStore({
  uri: Mongo_Db_Url,
  collection: 'sessions'
});

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  }
  else {
    cb(null, false);
  }
}

const accessLogStream = fs.createWriteStream(path.join(rootDir, 'access.log'), { flags: 'a' })
const app = express();
app.use(helmet());
app.use(compression());
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.urlencoded({ extended: true }));

// Serve static files BEFORE routes
app.use(express.static(path.join(rootDir, 'public')))
app.use('/uploads', express.static(path.join(rootDir, 'public/uploads')))
app.use(morgan('combined', { stream: accessLogStream }))

app.use(session({
  secret: 'MERN LIVE',
  resave: false,
  saveUninitialized: true,
  store: store,
}))

// expose login state to all views
app.use((req, res, next) => {
  res.locals.isLoggedIn = !!(req.session && req.session.isLoggedIn);
  next();
});

// app.use((req, res, next) => {
//   const cookieHeader = req.get('Cookie') || '';
//   const parts = cookieHeader.split('=');
//   const logged = parts[1] === 'true';
//   req.isLoggedIn = logged;
//   res.session.isLoggedIn = logged;
//   next();
// });

app.use(storeRouter);
app.use('/host', (req,res, next)=> {
  if(!req.session.isLoggedIn){
    return res.redirect('/logic')
  }
  next();
})
app.use("/host", multer({storage: multerStorage, fileFilter: fileFilter}).single('photo'), hostRouter);
app.use("/auth", authRouter);

app.use(errorController.error)

const mongoose = require('mongoose');
const PORT = process.env.PORT || 3000;

mongoose.connect(Mongo_Db_Url)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on address http://localhost:${PORT}`);
    });
  })
 

