import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import UserModel, { UserDocument } from '../models/UserModel';

interface DecodedJwt extends jwt.JwtPayload {
    id: string;
}

export interface RequestInfo extends Request {
    user?: UserDocument;
}

dotenv.config();

const protect = async (req: RequestInfo, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedJwt;

            const user = await UserModel.findById(decoded.id).select('-password');

            if (user) req.user = user;

            next();
        } catch (error) {
            return res.status(401).send(error);
        }
    }

    if (!token) {
        return res.status(401).send({ message: 'Not authorized' });
    }
};

export { protect };
