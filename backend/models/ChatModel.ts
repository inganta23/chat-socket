import mongoose from 'mongoose';
import { MessageDocument } from './MessageModel';
import { UserDocument } from './UserModel';

interface Chat {
    chatName: string;
    isGroupChat: boolean;
    latestMessage: MessageDocument['_id'];
    users: Array<UserDocument['_id']>;
    groupAdmin: UserDocument['_id'];
}

export interface ChatDocument extends Chat, mongoose.Document {
    createdAt: Date;
    updatedAt: Date;
}

const chatSchema = new mongoose.Schema<ChatDocument>(
    {
        chatName: { type: String, trim: true },
        isGroupChat: { type: Boolean, default: false },
        users: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        latestMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message'
        },
        groupAdmin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: true
    }
);

const ChatModel = mongoose.model<ChatDocument>('Chat', chatSchema);

export default ChatModel;
