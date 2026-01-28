const mongoose = require('mongoose');
const dns = require('dns');

// Use Google DNS for SRV lookups (fixes some network issues)
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('Please check your MongoDB connection string and network.');
    process.exit(1);
  }
};

module.exports = connectDB;
