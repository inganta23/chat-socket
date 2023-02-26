import { CloseIcon } from '@chakra-ui/icons';
import { Badge, Box } from '@chakra-ui/react';
import React from 'react';
import { UserType } from '../../context/ChatContext';

const UserBadgeItem = ({ handleFunction, user }: { user: UserType; handleFunction: () => void }) => {
    return (
        <Badge px={2} py={1} borderRadius="lg" colorScheme="purple" m={1} mb={2} fontSize={12} cursor="pointer" variant={'solid'} onClick={handleFunction} display="flex" alignItems={'center'}>
            {user.name}
            <CloseIcon pl={1} />
        </Badge>
    );
};

export default UserBadgeItem;
