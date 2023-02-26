import { Box } from '@chakra-ui/react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import ChatBox from '../components/ChatBox';
import SideDrawer from '../components/Miscellaneous/SideDrawer';
import MyChats from '../components/MyChats';
import { ChatState } from '../context/ChatContext';

// type ChatType = {
//     isGroupChat: boolean;
//     users: Array<object>;
//     _id: string;
//     chatName: string;
// };

const ChatPage = () => {
    const { user } = ChatState();
    const [fetchAgain, setFetchAgain] = useState(false);

    return (
        <div style={{ width: '100%' }}>
            {user && <SideDrawer />}
            <Box display="flex" justifyContent={'space-between'} w="100%" h="91.5vh" p="10px">
                {user && <MyChats fetchAgain={fetchAgain} />}
                {user && <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />}
            </Box>
        </div>
    );
};

export default ChatPage;
