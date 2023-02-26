import { Box, Button, FormControl, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner, useDisclosure, useToast } from '@chakra-ui/react';
import axios from 'axios';
import React, { useState } from 'react';
import { ChatState, UserType } from '../../context/ChatContext';
import UserBadgeItem from '../UserAvatar/UserBadgeItem';
import UserListItem from '../UserAvatar/UserListItem';

const GroupChatModal: React.FC<{ children: JSX.Element }> = ({ children }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [groupChatName, setGroupChatName] = useState<string>();
    const [selectedUsers, setSelectedUsers] = useState<Array<UserType>>([]);
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const { user, chats, saveChats } = ChatState();

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
    const handleSubmit = async () => {
        if (!groupChatName || !selectedUsers) {
            toast({
                title: 'Please fill all the fields',
                status: 'warning',
                duration: 5000,
                isClosable: true,
                position: 'top'
            });
            return;
        }
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user?.token}`
                }
            };

            const { data } = await axios.post(`/api/chat/group`, { name: groupChatName, users: JSON.stringify(selectedUsers.map((user) => user._id)) }, config);

            saveChats([data, ...chats]);
            toast({
                title: 'New group chat created',
                status: 'success',
                duration: 5000,
                isClosable: true,
                position: 'bottom'
            });
        } catch (error: any) {
            toast({
                title: 'Failed to create chat group',
                description: error.response.data,
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'bottom'
            });
        }
        onClose();
    };
    const handleGroup = (user: UserType) => {
        if (selectedUsers.includes(user)) {
            toast({
                title: 'User already added',
                status: 'warning',
                duration: 5000,
                isClosable: true,
                position: 'top'
            });
            return;
        }
        setSelectedUsers([...selectedUsers, user]);
    };
    const handleDelete = (user: UserType) => {
        setSelectedUsers(selectedUsers.filter((sel) => sel._id !== user._id));
    };
    return (
        <>
            <span onClick={onOpen}>{children}</span>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader fontSize={'35px'} fontFamily="Work sans" display={'flex'} justifyContent="center">
                        Create Group Chat
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody display={'flex'} flexDir="column" alignItems={'center'}>
                        <FormControl>
                            <Input placeholder="Chat Name" mb={3} onChange={(e) => setGroupChatName(e.target.value)} />
                        </FormControl>
                        <FormControl>
                            <Input placeholder="Add Users eg: Jane, John" mb={1} onChange={(e) => handleSearch(e.target.value)} />
                        </FormControl>

                        {/* selected useres */}
                        <Box w={'100%'} display="flex" flexWrap={'wrap'}>
                            {selectedUsers.map((user: UserType) => (
                                <UserBadgeItem key={user._id} user={user} handleFunction={() => handleDelete(user)} />
                            ))}
                        </Box>
                        {/* render */}
                        {loading ? (
                            <Spinner ml={'auto'} display="flex" />
                        ) : (
                            searchResult.slice(0, 4).map((user: UserType) => <UserListItem key={user._id} user={user} handleFunction={() => handleGroup(user)} />)
                        )}
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
                            Create Chat
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default GroupChatModal;
