import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

async function test() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/react-example');
  
  // get a user
  const user = await mongoose.model('User').findOne({ role: 'client' });
  const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || 'secret');

  const res = await fetch('http://localhost:3000/api/tenders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      title: 'TEST',
      description: 'test description',
      location: 'test location'
    })
  });
  
  console.log(res.status);
  const data = await res.text();
  console.log(data);
  process.exit(0);
}

test();
