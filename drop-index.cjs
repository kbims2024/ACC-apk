require('dotenv').config();
const mongoose = require('mongoose');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  try {
    await mongoose.connection.collection('users').dropIndex('email_1');
    console.log('Index dropped');
  } catch(e) {
    console.log('Error dropping index (might not exist):', e.message);
  }
  process.exit(0);
}
main();
