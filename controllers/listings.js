const Listing = require("../models/listing.js");
const axios = require("axios");
const User = require("../models/user.js");

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs",{allListings});
};

module.exports.renderNewForm = (req, res) => {
    res.render("./listings/new.ejs");
};

module.exports.showListing = async(req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({
    path: "reviews",
    populate: {
        path: "author",
     },
    })
    .populate("owner");
    if (!listing) {
    req.flash("error", "Listing you requested does not exist");
    return res.redirect("/listings");
    }

    let isWishlisted = false;
    if (req.user) {
     const user = await User.findById(req.user._id);
    if (user) { // Added a null check for the user
     isWishlisted = user.wishlist.includes(listing._id);
     }
    }

    res.render("listings/show.ejs", { listing, isWishlisted });
};

module.exports.createListing = async (req, res, next) => {
    try {
    let url = req.file.path;
    let filename = req.file.filename;

    const { location, country } = req.body.listing;
    const fullAddress = `${location}, ${country}`;

     const geoRes = await axios.get("https://nominatim.openstreetmap.org/search", {
            params: {
                q: fullAddress,
                format: "json",
                limit: 1
            },
            headers: {
            "User-Agent": "TravelNest/1.0 (travelnest.project@gmail.com)",
            }
    });

        let lat = 0;
        let lon = 0;
        if (geoRes.data && geoRes.data.length > 0) {
            lat = geoRes.data[0].lat;
            lon = geoRes.data[0].lon;
        }

        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = { url, filename };
        newListing.coordinates = { lat, lon };

        await newListing.save();
        req.flash("success", "New Listing Created Successfully");
        return res.redirect(`/listings/${newListing._id}`);
    } catch (err) {
        console.error("Listing creation failed:", err);
        req.flash("error", "Failed to create listing. Try again.");
        return res.redirect("/listings");
    }
};

module.exports.renderEditForm= async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");

    res.render("./listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async(req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing},  { runValidators: true });
    console.log({...req.body.listing});

    if(typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }

    req.flash("success", "Listing Updated Successfully");
    res.redirect(`/listings`);
};

module.exports.destroyListing = async(req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted Successfully");
    return res.redirect("/listings"); // <-- Added return here
};