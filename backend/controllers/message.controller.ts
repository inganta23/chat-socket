import { Request, Response, NextFunction } from 'express';
import { RequestInfo } from '../middleware/authMiddleware';
import ChatModel from '../models/ChatModel';
import MessageModel from '../models/MessageModel';
import UserModel from '../models/UserModel';

const sendMessage = async (req: RequestInfo, res: Response) => {
    const { content, chatId } = req.body;

    if (!content || !chatId) {
        return res.sendStatus(400).send({ message: 'Invalid request data' });
    }

    const newMessage = {
        sender: req?.user?._id,
        content: content,
        chat: chatId
    };

    try {
        let message = await MessageModel.create(newMessage);
        message = await message.populate('sender', 'name pic');
        message = await message.populate('chat');
        message = await UserModel.populate(message, {
            path: 'chat.users',
            select: 'name pic email'
        });

        await ChatModel.findByIdAndUpdate(req.body.chatId, {
            latestMessage: message
        });

        return res.json(message);
    } catch (error: any) {
        return res.status(400).send({ message: error.message });
    }
};
const allMessages = async (req: RequestInfo, res: Response) => {
    try {
        const messages = await MessageModel.find({
            chat: req.params.chatId
        })
            .populate('sender', 'name pic email')
            .populate('chat');

        return res.json(messages);
    } catch (error: any) {
        return res.status(400).send({ message: error.message });
    }
};
export { sendMessage, allMessages };
