import { BellIcon, ChevronDownIcon } from '@chakra-ui/icons';
import {
    Avatar,
    Box,
    Button,
    Drawer,
    DrawerBody,
    DrawerContent,
    DrawerHeader,
    DrawerOverlay,
    Input,
    Menu,
    MenuButton,
    MenuDivider,
    MenuItem,
    MenuList,
    Spinner,
    Text,
    Tooltip,
    useDisclosure,
    useToast
} from '@chakra-ui/react';
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSender } from '../../config/ChatLogic';
import { ChatState, ChatType, UserType } from '../../context/ChatContext';
import ChatLoading from '../ChatLoading';
import UserListItem from '../UserAvatar/UserListItem';
import ProfileModal from './ProfileModal';
// @ts-ignore
import NotificationBadge, { Effect } from 'react-notification-badge';

const SideDrawer = () => {
    const [search, setSearch] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingChat, setLoadingChat] = useState(false);

    const toast = useToast();
    const navigate = useNavigate();
    const { user, saveSelectedChat, chats, saveChats, selectedChat, notification, saveNotification } = ChatState();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const logoutHandler = () => {
        localStorage.removeItem('userInfo');
        navigate('/');
    };

    const handleSearch = async () => {
        if (!search) {
            toast({
                title: 'Please enter something in search',
                status: 'warning',
                duration: 5000,
                isClosable: true,
                position: 'top-left'
            });
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user?.token}`
                }
            };

            const { data } = await axios.get(`/api/user?search=${search}`, config);
            setSearchResult(data);

            setLoading(false);
        } catch (error) {
            toast({
                title: 'Error Occured!',
                description: 'Failed to load search results',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'bottom-left'
            });
        }
    };

    const accessChat = async (userId: string) => {
        try {
            setLoadingChat(true);

            const config = {
                headers: {
                    'Content-type': 'application/json',
                    Authorization: `Bearer ${user?.token}`
                }
            };

            const { data } = await axios.post('api/chat', { userId }, config);

            if (!chats.find((c: ChatType) => c._id === data._id)) saveChats([data, ...chats]);

            console.log(chats);

            saveSelectedChat(data);
            setLoadingChat(false);
            onClose();
        } catch (error: any) {
            toast({
                title: 'Error fetching the chat',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'bottom-left'
            });
        }
    };

    return (
        <div>
            <Box display={'flex'} justifyContent="space-between" alignItems={'center'} bg="white" w={'100%'} p="5px 10px 5px 10px" borderWidth="5px">
                <Tooltip label="Search Users to chat" hasArrow placement="bottom-end">
                    <Button variant={'ghost'} onClick={onOpen}>
                        <i className="fa-solid fa-magnifying-glass"></i>
                        <Text display={{ base: 'none', md: 'flex' }} px="4">
                            Search User
                        </Text>
                    </Button>
                </Tooltip>
                <Text fontSize="2xl" fontFamily="Work sans">
                    Chat App
                </Text>

                <div>
                    <Menu>
                        <MenuButton p={1}>
                            <NotificationBadge count={notification.length} effect={Effect.SCALE} />
                            <BellIcon fontSize={'2xl'} m={1} />
                        </MenuButton>
                        <MenuList pl={2}>
                            {!notification.length && 'No New Messages'}
                            {notification.map((notif) => (
                                <MenuItem
                                    key={notif._id}
                                    onClick={() => {
                                        saveSelectedChat(notif.chat);
                                        saveNotification(notification.filter((n) => n !== notif));
                                    }}
                                >
                                    {notif.chat.isGroupChat ? `New Message in ${notif.chat.chatName}` : `New Message from ${getSender(user, notif.chat.users)}`}
                                </MenuItem>
                            ))}
                        </MenuList>
                    </Menu>
                    <Menu>
                        <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                            <Avatar size={'sm'} cursor="pointer" name={user?.name} src={user?.pic} />
                        </MenuButton>
                        <MenuList>
                            <ProfileModal user={user}>
                                <MenuItem>My Profile</MenuItem>
                            </ProfileModal>
                            <MenuDivider />
                            <MenuItem onClick={logoutHandler}>Logout</MenuItem>
                        </MenuList>
                    </Menu>
                </div>
            </Box>

            <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerHeader borderBottomWidth={'1px'}>Search Users</DrawerHeader>
                    <DrawerBody>
                        <Box display={'flex'} pb={2}>
                            <Input placeholder="Search by name or email" mr={2} value={search} onChange={(e) => setSearch(e.target.value)} />
                            <Button onClick={handleSearch}>Go</Button>
                        </Box>
                        {loading ? <ChatLoading /> : searchResult?.map((userRes: UserType) => <UserListItem key={userRes?._id} user={userRes} handleFunction={() => accessChat(userRes?._id)} />)}
                        {loadingChat && <Spinner ml={'auto'} display="flex" />}
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </div>
    );
};

export default SideDrawer;
