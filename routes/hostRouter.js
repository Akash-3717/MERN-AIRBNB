
const hostController = require('../controller/hostController')

// External Module
const express = require('express');
const hostRouter = express.Router();


// Show add-home form
hostRouter.get('/add-home', hostController.addHome);

// Handle add-home submission
hostRouter.post('/add-home', hostController.addSuccess);

// Delete a home
hostRouter.post('/delete-home', hostController.deletehome);

// List homes for editing
hostRouter.get('/edit', hostController.getedit);

// Show edit form for specific home
hostRouter.get('/edit-home/:homeId', hostController.edithome);

// Handle edit submission
hostRouter.post('/edit-home', hostController.posteditHome);




exports.hostRouter = hostRouter;

