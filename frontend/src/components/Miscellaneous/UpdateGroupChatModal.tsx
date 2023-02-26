import { ViewIcon } from '@chakra-ui/icons';
import {
    Box,
    Button,
    FormControl,
    IconButton,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Spinner,
    useDisclosure,
    useToast
} from '@chakra-ui/react';
import axios from 'axios';
import React, { useState } from 'react';
import { ChatState, UserType } from '../../context/ChatContext';
import UserBadgeItem from '../UserAvatar/UserBadgeItem';
import UserListItem from '../UserAvatar/UserListItem';

const UpdateGroupChatModal = ({
    fetchAgain,
    setFetchAgain,
    fetchMessages
}: {
    fetchAgain: boolean;
    setFetchAgain: React.Dispatch<React.SetStateAction<boolean>>;
    fetchMessages: () => Promise<void>;
}) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    const [groupChatName, setGroupChatName] = useState('');
    const [renameLoading, setRenameLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchResult, setSearchResult] = useState([]);

    const { selectedChat, saveSelectedChat, user } = ChatState();

    const handleRemove = async (removedUser: UserType) => {
        if (selectedChat?.groupAdmin._id !== user._id) {
            toast({
                title: 'Only admin can remove user!',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'bottom'
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

            const { data } = await axios.put(
                `/api/chat/groupremove`,
                {
                    chatId: selectedChat._id,
                    userId: removedUser._id
                },
                config
            );

            removedUser._id === user._id ? saveSelectedChat(undefined) : saveSelectedChat(data);

            setFetchAgain(!fetchAgain);
            fetchMessages();
        } catch (error: any) {
            toast({
                title: 'Error Occured!',
                description: error.response.data.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'bottom'
            });
        }
        setLoading(false);
    };
    const handleRename = async () => {
        if (!groupChatName) return;
        try {
            setRenameLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user?.token}`
                }
            };

            const { data } = await axios.put(
                `/api/chat/rename`,
                {
                    chatId: selectedChat?._id,
                    chatName: groupChatName
                },
                config
            );

            saveSelectedChat(data);
            setFetchAgain(!fetchAgain);
        } catch (error: any) {
            toast({
                title: 'Error Occured!',
                description: error.response.data.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'bottom'
            });
        }
        setRenameLoading(false);
        setGroupChatName('');
    };
    const handleSearch = async (query: string) => {
        if (!query) return;

        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user?.token}`
                }
            };
            const { data } = await axios.get(`/api/user?search=${query}`, config);
            setSearchResult(data);
        } catch (error) {}
        setLoading(false);
    };
    const handleAddUser = async (userCandidate: UserType) => {
        if (selectedChat?.users.find((user) => user._id === userCandidate._id)) {
            toast({
                title: 'User Already in group',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'bottom'
            });
            return;
        }

        if (selectedChat?.groupAdmin._id !== user._id) {
            toast({
                title: 'Only admin can add user!',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'bottom'
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

            const { data } = await axios.put(
                `/api/chat/groupadd`,
                {
                    chatId: selectedChat._id,
                    userId: userCandidate._id
                },
                config
            );

            saveSelectedChat(data);
            setFetchAgain(!fetchAgain);
        } catch (error: any) {
            toast({
                title: 'Error Occured!',
                description: error.response.data.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'bottom'
            });
        }
        setLoading(false);
    };

    return (
        <>
            <IconButton display={{ base: 'flex' }} icon={<ViewIcon />} aria-label="open-modal" onClick={onOpen} />

            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader fontSize={'35px'} fontFamily="Work sans" display={'flex'} justifyContent="center">
                        {selectedChat?.chatName}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Box pb={3} display="flex" flexWrap={'wrap'}>
                            {selectedChat?.users.map((user) => (
                                <UserBadgeItem key={user._id} user={user} handleFunction={() => handleRemove(user)} />
                            ))}
                        </Box>
                        <FormControl display={'flex'}>
                            <Input placeholder="Chat Name" mb={3} value={groupChatName} onChange={(e) => setGroupChatName(e.target.value)} />
                            <Button variant={'solid'} colorScheme="teal" ml={1} isLoading={renameLoading} onClick={handleRename}>
                                Update
                            </Button>
                        </FormControl>
                        <FormControl>
                            <Input placeholder="Add user to group" mb={1} onChange={(e) => handleSearch(e.target.value)} />
                        </FormControl>
                        {loading ? <Spinner size={'lg'} /> : searchResult.slice(0, 4).map((user: UserType) => <UserListItem key={user._id} user={user} handleFunction={() => handleAddUser(user)} />)}
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="red" mr={3} onClick={() => handleRemove(user)}>
                            Leave Group
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default UpdateGroupChatModal;
