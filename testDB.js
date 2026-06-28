const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  require('./src/server/models/User'); // ensure User model is loaded
  const PublicTender = require('./src/server/models/PublicTender').PublicTender;
  const ServiceRequest = require('./src/server/models/ServiceRequest').ServiceRequest;

  const reqs = await ServiceRequest.find({ tenderId: { $ne: null } }).populate('tenderId');
  console.log('Tender requests count:', reqs.length);
  if (reqs.length > 0) {
    console.log('Sample populated tenderId bool:', !!reqs[0].tenderId);
  }
  process.exit();
}
run();
