import { Request, Response, NextFunction } from 'express';
import { generateToken } from '../config/generateToken';
import { RequestInfo } from '../middleware/authMiddleware';
import UserModel from '../models/UserModel';

const registerUser = async (req: Request, res: Response) => {
    const { name, email, password, pic } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please Enter all the fields');
    }

    const userExists = await UserModel.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const newUser = await UserModel.create({
        name,
        email,
        password,
        pic
    });

    if (newUser) {
        res.status(201).json({
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            pic: newUser.pic,
            token: generateToken(newUser._id)
        });
    } else {
        res.status(400);
        throw new Error('Failed to create new user');
    }
};

const authUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });

    if (user && (await user.comparePassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            token: generateToken(user._id)
        });
    } else {
        return res.status(400).send('Invalid Email or Password');
    }
};

const allUsers = async (req: RequestInfo, res: Response) => {
    const keyword = req.query.search
        ? {
              $or: [{ name: { $regex: req.query.search, $options: 'i' } }, { email: { $regex: req.query.search, $options: 'i' } }]
          }
        : {};

    const users = await UserModel.find(keyword).find({ _id: { $ne: req.user?._id } });

    res.send(users);
};

export { registerUser, authUser, allUsers };
