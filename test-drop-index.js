import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  try {
    await mongoose.connection.collection('users').dropIndex('email_1');
    console.log('Drop email_1 index successful');
  } catch(e) {
    console.log('Index drop failed or not exist', e.message);
  }
  process.exit();
}
main();
