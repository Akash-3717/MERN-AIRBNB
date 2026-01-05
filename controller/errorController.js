

exports.error = (req, res, next) => {
  res.status(404).render('404', {pageTitle: 'Page Not Found', isLoggedIn: req.session.isLoggedI, 
       user: req.session.user,
  });
}