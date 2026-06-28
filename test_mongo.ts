import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI || '').then(async () => {
    console.log("Connected to MongoDB!");
    try {
        const RequestModel = mongoose.model('ServiceRequest', new mongoose.Schema({}, { strict: false }));
        const req = await RequestModel.findOne();
        console.log("Found request:", req);
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
});
