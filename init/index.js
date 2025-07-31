// init/index.js
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({ ...obj, owner: "688082196b5252eb6db7bb87" }));
    await Listing.insertMany(initData.data);
    console.log("✅ Data was initialized");
};

module.exports = initDB;
