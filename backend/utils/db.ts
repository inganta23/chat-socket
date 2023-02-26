import mongoose from 'mongoose';
import dotenv from 'dotenv';
import config from 'config';

dotenv.config();
const dbUri = config.get('MONGO_URI') as string;

const connectDb = async () => {
    try {
        mongoose.set('strictQuery', false);
        const conn = await mongoose.connect(dbUri);
        console.log('MongoDB Connected: ' + conn.connection.host);
    } catch (error: any) {
        console.log('Error: ' + error.message);
        process.exit();
    }
};

export { connectDb };
