import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './src/server/models/User.js';

dotenv.config();

async function makeAdmin(email: string) {
  if (!process.env.MONGO_URI) {
    console.error("No MONGO_URI");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne({ email });
  if (user) {
    user.role = 'admin';
    await user.save();
    console.log(`User ${email} is now admin.`);
  } else {
    console.log(`User ${email} not found.`);
  }
  await mongoose.disconnect();
}

makeAdmin('kbims2024@gmail.com').catch(console.error);
