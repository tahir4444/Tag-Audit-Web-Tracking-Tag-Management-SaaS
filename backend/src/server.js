const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');
const normalizeUrl = require('normalize-url');

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

function getMongoDbSafeUri(uri) {
  // Hide credentials for logging
  if (!uri) return '';
  return uri.replace(/(mongodb(?:\+srv)?:\/\/)(.*?:.*?@)/, '$1<hidden>:<hidden>@');
}

async function startServer() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    console.log(`MongoDB URI: ${getMongoDbSafeUri(MONGODB_URI)}`);
    const host = process.env.HOST || 'localhost';
    app.listen(PORT, () => {
      console.log(`Server is running at http://${host}:${PORT}`);
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

startServer(); 