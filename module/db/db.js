const mongoose = require('mongoose');

// MongoDB connection string (Make sure this is correct)
// const MONGO_URI = "mongodb+srv://2021kucp1005:Barman@2002@cluster0.fkzm4.mongodb.net/?retryWrites=true&w=majority";
const MONGO_URI = 'mongodb+srv://2021kucp1005:Barman%402002@cluster0.fkzm4.mongodb.net/customer_service?retryWrites=true&w=majority';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection failed:', err);
    process.exit(1); // Exit the process with failure code
  }
};

// Schema for customer service requests
const requestSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  username: {type: String, required: true },
  email: { type: String, required: true },
  category: { type: String, required: true },
  comments: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Request = mongoose.model('Request', requestSchema);

// Export the connection and model
module.exports = { connectDB, Request };
