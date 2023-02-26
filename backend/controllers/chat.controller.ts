import { Request, Response, NextFunction } from 'express';
import { RequestInfo } from '../middleware/authMiddleware';
import ChatModel from '../models/ChatModel';
import UserModel from '../models/UserModel';

const accessChat = async (req: RequestInfo, res: Response) => {
    const { userId } = req.body;

    if (!userId) return res.sendStatus(400).send({ message: 'UserId is not in request body' });

    const isChat = await ChatModel.find({
        isGroupChat: false,
        $and: [{ users: { $elemMatch: { $eq: req.user?._id } } }, { users: { $elemMatch: { $eq: userId } } }]
    })
        .populate('users', '-password')
        .populate('latestMessage');

    const latest = await UserModel.populate(isChat, {
        path: 'latestMessage.sender',
        select: 'name pic email'
    });

    if (latest.length > 0) {
        res.send(latest[0]);
    } else {
        const chatData = {
            chatName: 'sender',
            isGroupChat: false,
            users: [req.user?._id, userId]
        };

        try {
            const createdChat = await ChatModel.create(chatData);
            const fullChat = await ChatModel.findOne({ _id: createdChat._id }).populate('users', '-password');

            res.status(200).send(fullChat);
        } catch (error) {
            res.status(400).send(error);
        }
    }
};

const fetchChats = async (req: RequestInfo, res: Response) => {
    try {
        const chats = await ChatModel.find({
            users: { $elemMatch: { $eq: req.user?._id } }
        })
            .populate('users', '-password')
            .populate('groupAdmin', '-password')
            .populate('latestMessage')
            .sort({ updatedAt: -1 });

        const newChats = await UserModel.populate(chats, {
            path: 'latestMessage.sender',
            select: 'name pic email'
        });

        return res.status(200).send(newChats);
    } catch (error) {
        return res.status(400).send(error);
    }
};

const createGroupChat = async (req: RequestInfo, res: Response) => {
    if (!req.body.users || !req.body.name) {
        return res.status(400).send({ message: 'Please fill all the fields' });
    }

    const users = JSON.parse(req.body.users);

    if (users.length < 2) return res.status(400).send({ message: 'More than 2 users is required to form a group chat' });

    users.push(req.user);

    try {
        const groupChat = await ChatModel.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user
        });

        const fullGroupChat = await ChatModel.findOne({ _id: groupChat._id }).populate('users', '-password').populate('groupAdmin', '-password');

        return res.status(200).json(fullGroupChat);
    } catch (error) {
        return res.status(400).send(error);
    }
};

const renameGroup = async (req: RequestInfo, res: Response) => {
    const { chatId, chatName } = req.body;

    const updatedChat = await ChatModel.findByIdAndUpdate(chatId, { chatName }, { new: true }).populate('users', '-password').populate('groupAdmin', '-password');

    if (!updatedChat) {
        return res.status(404).send({ message: 'Chat Not Found' });
    } else return res.json(updatedChat);
};

const addToGroup = async (req: RequestInfo, res: Response) => {
    const { chatId, userId } = req.body;

    const addUser = await ChatModel.findByIdAndUpdate(
        chatId,
        {
            $push: { users: userId }
        },
        { new: true }
    )
        .populate('users', '-password')
        .populate('groupAdmin', '-password');

    if (!addUser) {
        return res.status(404).send({ message: 'Chat not found' });
    } else {
        return res.json(addUser);
    }
};

const removeFromGroup = async (req: RequestInfo, res: Response) => {
    const { chatId, userId } = req.body;

    const removeUser = await ChatModel.findByIdAndUpdate(
        chatId,
        {
            $pull: { users: userId }
        },
        { new: true }
    )
        .populate('users', '-password')
        .populate('groupAdmin', '-password');

    if (!removeUser) {
        return res.status(404).send({ message: 'Chat not found' });
    } else {
        return res.json(removeUser);
    }
};

export { accessChat, fetchChats, createGroupChat, renameGroup, addToGroup, removeFromGroup };
