import { useEffect } from 'react';
import { createContext, useContext } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export interface UserType {
    _id: string;
    name: string;
    email: string;
    pic: string;
    token: string;
}

export interface ChatType {
    _id: string;
    chatName: string;
    latestMessage: MessageType;
    isGroupChat: MessageType;
    users: Array<UserType>;
    groupAdmin: UserType;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface MessageType {
    _id: string;
    sender: UserType;
    content: string;
    chat: ChatType;
    createdAt: string;
    updatedAt: string;
}

interface ContextValue {
    user: UserType;
    setUser: (value: UserType) => void;
    selectedChat?: ChatType;
    saveSelectedChat: (value: any) => void;
    chats: any;
    saveChats: (value: any) => void;
    notification: Array<MessageType>;
    saveNotification: (value: any) => void;
}

const ChatContext = createContext<ContextValue>({} as ContextValue);

function ChatProvider({ children }: { children: JSX.Element }) {
    const navigate = useNavigate();
    const [user, setUser] = useState<UserType>({} as UserType);
    const [selectedChat, setSelectedChat] = useState<ChatType>();
    const [chats, setChats] = useState([]);
    const [notification, setNotification] = useState([]);

    const saveSelectedChat = (value: any) => {
        setSelectedChat(value);
    };

    const saveNotification = (value: any) => {
        setNotification(value);
    };

    const saveChats = (value: any) => {
        setChats(value);
    };

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') as string);
        setUser(userInfo);

        if (!userInfo) navigate('/');
    }, [navigate]);

    return <ChatContext.Provider value={{ user, setUser, selectedChat, saveSelectedChat, chats, saveChats, notification, saveNotification }}>{children}</ChatContext.Provider>;
}

export const ChatState = () => {
    return useContext(ChatContext);
};

export default ChatProvider;
