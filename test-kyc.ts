import mongoose from 'mongoose';
import { User } from './src/server/models/User.js';

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/artisan');
  const user = await User.findOne();
  if (!user) {
    console.log('No user');
    process.exit(0);
  }
  
  const updated = await User.findByIdAndUpdate(user._id, { kycStatus: 'verified' }, { new: true });
  console.log('updated:', updated.kycStatus);
  process.exit(0);
}
run();
