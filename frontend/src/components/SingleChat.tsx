import { ArrowBackIcon } from '@chakra-ui/icons';
import { Box, FormControl, IconButton, Input, Spinner, Text, useToast } from '@chakra-ui/react';
import axios from 'axios';
import React, { useState } from 'react';
import { useEffect } from 'react';

import { io } from 'socket.io-client';

import { getSender, getSenderFull } from '../config/ChatLogic';
import { ChatState, ChatType, MessageType, UserType } from '../context/ChatContext';
import ProfileModal from './Miscellaneous/ProfileModal';
import UpdateGroupChatModal from './Miscellaneous/UpdateGroupChatModal';
import ScrollableChat from './ScrollableChat';

const ENDPOINT = 'https://chat-app-johanes.up.railway.app/';

const socket = io(ENDPOINT);
let selectedChatCompare: ChatType | undefined;

const SingleChat = ({ fetchAgain, setFetchAgain }: { fetchAgain: boolean; setFetchAgain: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const [messages, setMessages] = useState<Array<MessageType>>([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [sockedConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    const { user, selectedChat, saveSelectedChat, notification, saveNotification } = ChatState();
    const toast = useToast();

    // useEffect(() => {
    //     console.log('tes');
    //     socket.on('message received', (newMessageRecieved) => {
    //         console.log(newMessageRecieved);
    //         if (!selectedChatCompare || selectedChatCompare._id !== newMessageRecieved.chat._id) {
    //         } else {
    //             setMessages([...messages, newMessageRecieved]);
    //         }
    //     });
    // });

    useEffect(() => {
        if (user._id) socket.emit('setup', user);
        socket.on('connected', () => setSocketConnected(true));
        socket.on('typing', () => setIsTyping(true));
        socket.on('stop typing', () => setIsTyping(false));
    }, [user]);

    useEffect(() => {
        socket.on('receive message', function (msg) {
            if (!selectedChatCompare || selectedChatCompare._id !== msg.chat._id) {
                if (!notification.includes(msg)) {
                    saveNotification([msg, ...notification]);
                    setFetchAgain(!fetchAgain);
                }
            } else {
                setMessages([...messages, msg]);
            }
        });
    });
    useEffect(() => {
        socket.on('connectToRoom', function (room) {
            console.log(room);
        });
    });

    useEffect(() => {
        fetchMessages();
        selectedChatCompare = selectedChat;
    }, [selectedChat]);

    console.log(notification);

    const sendMessage = async (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && newMessage.length > 0) {
            socket.emit('stop typing', selectedChat?._id);
            try {
                const config = {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${user?.token}`
                    }
                };
                setNewMessage('');
                const { data } = await axios.post(
                    `/api/message`,
                    {
                        content: newMessage,
                        chatId: selectedChat?._id
                    },
                    config
                );

                socket.emit('send message', data);
                // socket.emit('new message', data);
                setMessages([...messages, data]);
            } catch (error) {
                toast({
                    title: 'Error Occured!',
                    description: 'Failed to load the chats',
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                    position: 'bottom-left'
                });
            }
        }
    };

    const fetchMessages = async () => {
        if (!selectedChat) return;

        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user?.token}`
                }
            };
            const { data } = await axios.get(`/api/message/${selectedChat._id}`, config);
            setMessages(data);
            socket.emit('join chat', selectedChat._id);
        } catch (error) {
            toast({
                title: 'Error Occured!',
                description: 'Failed to load the messages',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'bottom-left'
            });
        }
        setLoading(false);
    };

    const typingHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value);
        if (!sockedConnected) return;

        if (!typing) {
            setTyping(true);
            socket.emit('typing', selectedChat?._id);
        }
        let lastTypingTime = new Date().getTime();
        let timerLength = 3000;
        setTimeout(() => {
            let timeNow = new Date().getTime();
            let timeDiff = timeNow - lastTypingTime;

            if (timeDiff >= timerLength && typing) {
                socket.emit('stop typing', selectedChat?._id);
                setTyping(false);
            }
        }, timerLength);
    };

    return (
        <>
            {selectedChat ? (
                <>
                    <Text fontSize={{ base: '28px', md: '30px' }} pb={3} px={2} w="100%" fontFamily={'Work sans'} display="flex" justifyContent={{ base: 'space-between' }} alignItems="center">
                        <IconButton display={{ base: 'flex', md: 'none' }} aria-label="back-icon" icon={<ArrowBackIcon />} onClick={() => saveSelectedChat(undefined)} />
                        {!selectedChat.isGroupChat ? (
                            <>
                                {getSender(user, selectedChat.users)}
                                <ProfileModal user={getSenderFull(user, selectedChat.users)} />
                            </>
                        ) : (
                            <>
                                {selectedChat.chatName.toUpperCase()}
                                <UpdateGroupChatModal fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} fetchMessages={fetchMessages} />
                            </>
                        )}
                    </Text>
                    <Box display={'flex'} flexDir="column" justifyContent={'flex-end'} p={3} bg="#e8e8e8" w={'100%'} h="100%" borderRadius={'lg'} overflowY="hidden">
                        {loading ? (
                            <Spinner size={'xl'} w={20} h={20} alignSelf="center" margin={'auto'} />
                        ) : (
                            <Box display={'flex'} flexDir="column" overflowY={'hidden'}>
                                <ScrollableChat messages={messages} />
                            </Box>
                        )}
                        <FormControl onKeyDown={sendMessage} isRequired mt={3}>
                            {isTyping ? <div>Loading...</div> : <></>}
                            <Input variant={'filled'} bg="white" placeholder="Enter a message.." onChange={typingHandler} value={newMessage} />
                        </FormControl>
                    </Box>
                </>
            ) : (
                <Box display={'flex'} alignItems="center" justifyContent={'center'} h="100%">
                    <Text fontSize={'3xl'} pb={3} fontFamily="Work sans">
                        Click on a user to start chatting
                    </Text>
                </Box>
            )}
        </>
    );
};

export default SingleChat;
