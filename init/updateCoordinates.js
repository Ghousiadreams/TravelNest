const axios = require("axios");
const Listing = require("../models/listing");
const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/travelnest", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", async () => {
  console.log("Database connected");

  const listings = await Listing.find({});
  for (let listing of listings) {
    if (!listing.coordinates || !listing.coordinates.lat || !listing.coordinates.lon) {
      const fullAddress = `${listing.location}, ${listing.country}`;
      try {
        const geoRes = await axios.get("https://nominatim.openstreetmap.org/search", {
          params: {
            q: fullAddress,
            format: "json",
            limit: 1,
          },
          headers: {
            "User-Agent": "TravelNest/1.0 (travelnest.project@gmail.com)" // Use your project email
          }
        });

        if (geoRes.data && geoRes.data.length > 0) {
          const { lat, lon } = geoRes.data[0];
          listing.coordinates = { lat, lon };
          await listing.save();
          console.log(`✅ Updated: ${fullAddress} → (${lat}, ${lon})`);
        } else {
          console.log(`⚠️ No coordinates found for: ${fullAddress}`);
        }

        // Add the delay here before going to the next listing
        await new Promise((resolve) => setTimeout(resolve, 1000));

      } catch (err) {
        console.error(`❌ Error for ${fullAddress}:`, err.message);
      }
    }
  }

  mongoose.connection.close();

    console.log("Coordinates update completed.");
});