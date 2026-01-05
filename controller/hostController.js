const Home = require('../models/home');
const Favourite = require('../models/favourite');
const { deleteFile } = require('../utils/file');


exports.addHome = (req, res, next) => {
  res.render('host/edithome', {editing:false, pageTitle: 'Add Home to airbnb',   user: req.session.user,});
}

 exports.addSuccess = (req, res, next) => {
  const { houseName, price, rating, location, description }= req.body;

  // Convert path to URL format: public/uploads/file.jpg -> /uploads/file.jpg
  const photoUrl = req.file ? '/uploads/' + req.file.filename : '';
  console.log('File uploaded:', req.file);
  console.log('Photo URL:', photoUrl);
  
  const newHome = new Home({houseName, price, rating, photoUrl, location, description, host: req.session.user._id});
  newHome.save().then(() => {
    console.log('Home saved:', newHome._id);
    res.redirect('/homes');
  }).catch(err => {
    console.error('Error saving home:', err);
    res.redirect('/host/add-home');
  });
    }

exports.posteditHome = (req, res, next) => {
  const { id, houseName, price, location, rating, description } = req.body;
  
  // Get the existing home to preserve photo if not updating it
  Home.findById(id).then(existingHome => {
    let photoUrl = existingHome.photoUrl;
    
    // If a new file was uploaded, delete the old one and use the new one
    if (req.file) {
      // Delete the old photo file if it exists
      if (existingHome.photoUrl) {
        const oldPhotoPath = 'public' + existingHome.photoUrl; // Convert URL back to file path
        deleteFile(oldPhotoPath);
      }
      photoUrl = '/uploads/' + req.file.filename;
      console.log('Old photo deleted, new photo uploaded:', photoUrl);
    }
    
    Home.findByIdAndUpdate(id, { $set: { houseName, price, location, description, rating, photoUrl } }).then(() => {
      console.log('Home updated successfully');
      res.redirect('/homes');
    }).catch(err => {
      console.error('Error updating home:', err);
      res.redirect('/host/edit');
    });
  }).catch(err => {
    console.error('Error finding home:', err);
    res.redirect('/host/edit');
  });
}

exports.getedit = (req, res, next) => {
  Home.find({host: req.session.user._id}).then( registeredHomes => {
  res.render('host/edit', {houseName: registeredHomes, pageTitle: 'Edit home', isLoggedIn: req.session.isLoggedIn,  user: req.session.user,} );
 });

}

exports.edithome = (req, res, next) => {
  const editing = req.query.editing === 'true'
  if(!editing) {
    console.log('editing not set poperly')
    return res.redirect("/host/edit")
  }
     const homeId = req.params.homeId;
  Home.findById(homeId).then(home => {
      if(!home) {
    console.log('home not found ')
    return res.redirect("/host/edit")
  }
    console.log(homeId, home, editing)
    res.render('host/edithome', {editing: editing, home:home,  pageTitle: 'edit Home airbnb', isLoggedIn: req.session.isLoggedIn,   user: req.session.user,} );
  })
  
}

exports.deletehome = (req, res, next) => {
  const homeId = req.body.homeId;
  if (!homeId) {
    return res.redirect('/host/edit');
  }
  
  // First, fetch the home to get the photo URL
  Home.findById(homeId).then(home => {
    if (home && home.photoUrl) {
      // Delete the photo file if it exists
      const photoPath = 'public' + home.photoUrl; // Convert URL back to file path
      deleteFile(photoPath);
      console.log('Photo deleted:', photoPath);
    }
    
    // Then delete the home and associated favourites
    Promise.all([
      Home.findByIdAndDelete(homeId),
      Favourite.deleteMany({ homeId: homeId })
    ]).then(() => {
      console.log('Home and associated favourites deleted successfully');
      res.redirect('/host/edit');
    }).catch((err) => {
      console.log('Error deleting home or favourites:', err);
      res.redirect('/host/edit');
    });
  }).catch((err) => {
    console.log('Error finding home:', err);
    res.redirect('/host/edit');
  });
}