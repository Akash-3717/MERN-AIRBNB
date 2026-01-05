// Core Modules


const storeController = require('../controller/storeController')

// External Module
const express = require('express');
const storeRouter = express.Router();

// Local Module


storeRouter.get("/", storeController.getIndex)

storeRouter.get("/homes", storeController.getHomes)
storeRouter.get("/homes/:homeId", storeController.getHomeDetail)

storeRouter.get("/fav", storeController.getFavriteHomes)
storeRouter.post("/fav", storeController.postAddToFav)
storeRouter.post("/fav/delete", storeController.postRemoveFromFav)
storeRouter.get("/rules/:homeId", storeController.getRules)


module.exports = storeRouter;