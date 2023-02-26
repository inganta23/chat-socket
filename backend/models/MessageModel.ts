import mongoose from 'mongoose';
import { ChatDocument } from './ChatModel';
import { UserDocument } from './UserModel';

interface Message {
    sender: UserDocument['_id'];
    content: string;
    chat: ChatDocument['_id'];
}

export interface MessageDocument extends Message, mongoose.Document {
    createdAt: Date;
    updatedAt: Date;
}

const messageSchema = new mongoose.Schema(
    {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        content: { type: String, trim: true },
        chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }
    },
    { timestamps: true }
);

const MessageModel = mongoose.model('Message', messageSchema);

export default MessageModel;
