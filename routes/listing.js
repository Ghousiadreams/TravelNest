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



//New Route - It was there below show,put,delte router, but why we placed before these is that our router might assume /new as /:id and might search for newId which is not possible, so we placed it before them to excape errors.
router.get("/new",isLoggedIn, listingController.renderNewForm);

// Search Route 
router.get("/search", wrapAsync(async (req, res) => {
    const searchQuery = req.query.q;

    if (!searchQuery) {
        req.flash("error", "Please enter a search term.");
        return res.redirect("/listings");
    }

    const allListings = await Listing.find({
        $or: [
            { title: { $regex: searchQuery, $options: 'i' } },
            { description: { $regex: searchQuery, $options: 'i' } },
            { location: { $regex: searchQuery, $options: 'i' } },
            { country: { $regex: searchQuery, $options: 'i' } }
        ]
    });
    
    if (allListings.length === 0) {
        req.flash("error", "No listings found for that search query.");
        return res.redirect("/listings");
    }
    
    // Pass the search results to the index template
    res.render("listings/index.ejs", { allListings });
}));


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