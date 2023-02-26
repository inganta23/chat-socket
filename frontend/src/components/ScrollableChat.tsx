import { Avatar, Tooltip } from '@chakra-ui/react';
import React from 'react';
import ScrollableFeed from 'react-scrollable-feed';
import { isLastMessage, isSameSender, isSameSenderMargin, isSameUser } from '../config/ChatLogic';
import { ChatState, MessageType } from '../context/ChatContext';

const ScrollableChat = ({ messages }: { messages: Array<MessageType> }) => {
    const { user } = ChatState();
    return (
        <ScrollableFeed>
            {messages &&
                messages.map((message, index) => (
                    <div style={{ display: 'flex' }} key={message._id}>
                        {(isSameSender(messages, message, index, user._id) || isLastMessage(messages, index, user._id)) && (
                            <Tooltip label={message.sender.name} placement="bottom-start" hasArrow>
                                <Avatar mt={'7px'} mr={3} size="sm" cursor="pointer" name={message.sender.name} src={message.sender.pic} />
                            </Tooltip>
                        )}
                        <span
                            style={{
                                backgroundColor: `${message.sender._id === user._id ? '#bee3f8' : '#b9f5d0'}`,
                                borderRadius: '20px',
                                padding: '5px 15px',
                                maxWidth: '75%',
                                marginLeft: isSameSenderMargin(messages, message, index, user._id),
                                marginTop: isSameUser(messages, message, index) ? 3 : 10
                            }}
                        >
                            {message.content}
                        </span>
                    </div>
                ))}
        </ScrollableFeed>
    );
};

export default ScrollableChat;
