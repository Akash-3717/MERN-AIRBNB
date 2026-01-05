const path = require('path');
const rootDir = require('../utils/pathUtil');

const Home  = require('../models/home');
const User = require('../models/user');

exports.getIndex = (req, res, next) => {
    Home.find().then(registeredHomes => {
      res.render('store/home', {houseName: registeredHomes,  pageTitle: 'airbnb index',   user: req.session.user,});
    });
  }

exports.getHomes= (req, res, next) => {
 Home.find().then(registeredHomes => {
    res.render('store/homes', {
      homes: registeredHomes,
     pageTitle: 'airbnb Home', 
     isLoggedIn: req.session.isLoggedIn, 
      user: req.session.user,} );
 });

};

exports.getHomeDetail = (req, res, next) => {
  const homeId = req.params.homeId;
  Home.findById(homeId).then(home => {
    if (home) {
      res.render('store/home-detail', { home: home, pageTitle: home.houseName , isLoggedIn: req.session.isLoggedIn , user: req.session.user,});
    } else {
      res.status(404).send('Home not found');
    }
  });
};


exports.getFavriteHomes = async (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  const userId = req.session.user._id;
  try {
  const user = await User.findById(userId).populate('favouriteHomes');
  if (!user) {
    return res.redirect('/auth/login');
  }
    res.render('store/fav', {
    homes: user.favouriteHomes,
    pageTitle: 'Favorite Homes' ,
    isLoggedIn: req.session.isLoggedIn,
    user: req.session.user
  });
  } catch (err) {
    console.log(err);
    res.redirect('/');
  }
};


exports.postAddToFav = async(req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  const homeId = req.body.homeId;
  const userId = req.session.user._id;

  try{
  const user = await User.findOne({ _id: userId});
    if (!user.favouriteHomes.includes(homeId)) {
      user.favouriteHomes.push(homeId);
       await user.save();
    } 
  }catch(err){
    console.log(err);
  } finally {
    res.redirect('/fav');
  }
 }


exports.postRemoveFromFav = async (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  const homeId = req.body.homeId;
  const userId = req.session.user._id;
  if (!homeId) return res.redirect('/fav');
  
  try {
    const user = await User.findById(userId);
    user.favouriteHomes = user.favouriteHomes.filter(id => id.toString() !== homeId);
    await user.save();
    res.redirect('/fav');
  } catch (err) {
    console.log(err);
    res.redirect('/fav');
  }
};

exports.getRules = (req, res, next) => {
  const filePath = path.join(rootDir, 'rules', 'homes-rules.pdf');
  console.log('Rules handler -> rootDir:', rootDir);
  console.log('Rules handler -> resolved filePath:', filePath);

  res.download(filePath, 'homes-rules.pdf', (err) => {
    if (err) {
      console.error('Error downloading rules PDF:', err);
      return res.status(404).send('Rules file not found');
    }
    console.log('Rules PDF downloaded successfully');
  });
};
