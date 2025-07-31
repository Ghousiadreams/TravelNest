const mongoose = require("mongoose");
const Review = require("./review.js");

const Schema = mongoose.Schema;

let listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        url: String, 
        filename: String,
    },
    price: {
        type: Number,
        min: 0
    },
    location: String,
    country: String,
    reviews: [
        {
            type:Schema.Types.ObjectId,
            ref: "Review"
        },
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    coordinates: {
    lat: Number,
    lon: Number
    }
});

listingSchema.post("findOneAndDelete", async function (doc) {
    if (doc) {
        await Review.deleteMany({ _id: { $in: doc.reviews } });
    }
});


const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;