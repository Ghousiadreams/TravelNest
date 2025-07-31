// init/updateCoordinates.js
const axios = require("axios");
const Listing = require("../models/listing");

const updateCoordinates = async () => {
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
            "User-Agent": "TravelNest/1.0 (travelnest.project@gmail.com)"
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

        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (err) {
        console.error(`❌ Error for ${fullAddress}:`, err.message);
      }
    }
  }

  console.log("✅ Coordinates update completed.");
};

module.exports = updateCoordinates;
