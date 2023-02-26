import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const generateToken = (id: mongoose.Schema.Types.ObjectId) => {
    return jwt.sign({ id }, process.env.JWT_SECRET as string, {
        expiresIn: '30d'
    });
};

export { generateToken };
