import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import config from 'config';

dotenv.config();

const generateToken = (id: mongoose.Schema.Types.ObjectId) => {
    return jwt.sign({ id }, config.get('JWT_SECRET') as string, {
        expiresIn: '30d'
    });
};

export { generateToken };
