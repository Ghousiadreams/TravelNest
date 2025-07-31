// cleanupReviews.js

const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const Review = require("../models/review");

// Replace with your MongoDB connection string if needed
mongoose.connect("mongodb://127.0.0.1:27017/travelnest")
    .then(() => {
        console.log("MongoDB connected");
        cleanUpInvalidReviews("686672a340c9172b904532ea");
    })
    .catch(err => console.log(err));

async function cleanUpInvalidReviews(listingId) {
    const listing = await Listing.findById(listingId);
    if (!listing) {
        console.log("Listing not found.");
        mongoose.connection.close();
        return;
    }

    const existingReviews = await Review.find({ _id: { $in: listing.reviews } });
    const validReviewIds = existingReviews.map(review => review._id.toString());

    listing.reviews = listing.reviews.filter(id =>
        validReviewIds.includes(id.toString())
    );

    await listing.save();
    console.log(`✅ Cleaned up reviews for listing: ${listing.title}`);
    mongoose.connection.close();
}
