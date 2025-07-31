const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const { isLoggedIn } = require("../middleware.js"); 
const wrapAsync = require("../utils/wrapAsync.js");
const User = require("../models/user.js");

// Route to add a listing to the user's wishlist
router.post("/:id", isLoggedIn, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const currUser = await User.findById(req.user._id);
    const listingToAdd = await Listing.findById(id);

    if (!listingToAdd) {
        req.flash("error", "Listing not found!");
        return res.redirect(`/listings/${id}`);
    }

    // Check if the listing is already in the wishlist to prevent duplicates
    if (!currUser.wishlist.includes(listingToAdd._id)) {
        currUser.wishlist.push(listingToAdd._id);
        await currUser.save();
        req.flash("success", "Listing added to your wishlist!");
    } else {
        req.flash("error", "This listing is already in your wishlist.");
    }
    
    res.redirect(`/listings/${id}`);
}));


// Route to remove a listing from the user's wishlist
router.delete("/:id", isLoggedIn, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const currUser = await User.findById(req.user._id);

    // Remove the listing ID from the wishlist array
    currUser.wishlist.pull(id);
    await currUser.save();

    req.flash("success", "Listing removed from your wishlist!");
    res.redirect(`/listings/${id}`);
}));


// Route to display the user's wishlist page
router.get("/", isLoggedIn, wrapAsync(async (req, res) => {
    const currUser = await User.findById(req.user._id).populate("wishlist");
    res.render("wishlists/index.ejs", { listings: currUser.wishlist });
}));


module.exports = router;