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

// Modify the showListing function
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
        return res.redirect("/listings"); // Use return to stop execution
    }

    // New check: See if the listing is in the current user's wishlist
    let isWishlisted = false;
    if (req.user) {
        const user = await User.findById(req.user._id);
        isWishlisted = user.wishlist.includes(listing._id);
    }

    res.render("listings/show.ejs", { listing, isWishlisted });
};



module.exports.createListing = async (req, res, next) => {
    try {
        let url = req.file.path;
        let filename = req.file.filename;

        const { location, country } = req.body.listing;
        const fullAddress = `${location}, ${country}`;

        // Geocode using Nominatim
        const geoRes = await axios.get("https://nominatim.openstreetmap.org/search", {
            params: {
                q: fullAddress,
                format: "json",
                limit: 1
            },
            headers: {
                "User-Agent": "TravelNest/1.0 (travelnest.project@gmail.com)", // replace with your app/email
            }
        });

        let lat = 0;
        let lon = 0;
        if (geoRes.data && geoRes.data.length > 0) {
            lat = geoRes.data[0].lat;
            lon = geoRes.data[0].lon;
        }

        // Create new listing with everything (image, owner, location, coords)
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = { url, filename };
        newListing.coordinates = { lat, lon }; // 💡 new field added

        await newListing.save();
        req.flash("success", "New Listing Created Successfully");
        res.redirect(`/listings/${newListing._id}`);
    } catch (err) {
        console.error("Listing creation failed:", err);
        req.flash("error", "Failed to create listing. Try again.");
        res.redirect("/listings");
    }
};


module.exports.renderEditForm= async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");


    res.render("./listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async(req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing},  { runValidators: true });
    console.log({...req.body.listing});

    if(typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }

    req.flash("success", "Listing Updating Successfully");
    res.redirect(`/listings`);
};

module.exports.destroyListing = async(req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Deleted Successfully");
    res.redirect("/listings");
};