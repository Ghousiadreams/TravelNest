const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn , isOwner, validateListing} = require("../middleware.js");

const listingController = require("../controllers/listings.js");

const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });

//index, post routes
router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn, 
        upload.single('listing[image]'),
        validateListing,
        wrapAsync(listingController.createListing)
    );


//New Route
router.get("/new",isLoggedIn, listingController.renderNewForm);

// 💡 NEW: The search route is simplified and now points to the controller function
router.get("/search", wrapAsync(listingController.searchListings));


//show, put, delete
router
    .route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(
        isLoggedIn,
        isOwner, 
        upload.single('listing[image]'),
        validateListing,
        wrapAsync(listingController.updateListing)
    )
    .delete(
        isLoggedIn,
        isOwner, 
        wrapAsync(listingController.destroyListing)
    );

//Edit Route
router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;