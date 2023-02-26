import React, { useState } from 'react';
import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, VStack } from '@chakra-ui/react';
import { useToast } from '@chakra-ui/react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [show, setShow] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);

    const toast = useToast();
    const navigate = useNavigate();

    const submitForm = async () => {
        setLoading(true);
        if (!email || !password) {
            toast({
                title: 'Please fill all the field',
                status: 'warning',
                duration: 5000,
                isClosable: true,
                position: 'bottom'
            });
            setLoading(false);
            return;
        }

        try {
            const { data } = await axios.post('api/user/login', { email, password });
            toast({
                title: 'Login Successful',
                status: 'success',
                duration: 5000,
                isClosable: true,
                position: 'bottom'
            });
            localStorage.setItem('userInfo', JSON.stringify(data));
            setLoading(false);
            navigate('chats');
        } catch (error: any) {
            toast({
                title: 'Error Occured!',
                description: error.response.data.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'bottom'
            });
            setLoading(false);
        }
    };
    return (
        <VStack spacing={'5px'} color="black">
            <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input variant="filled" type={'email'} placeholder="Enter Your Name" onChange={(e) => setEmail(e.target.value)} value={email} />
            </FormControl>
            <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                    <Input variant="filled" type={show ? 'text' : 'password'} placeholder="Enter Your Name" onChange={(e) => setPassword(e.target.value)} value={password} />
                    <InputRightElement>
                        <Button h={'100%'} size="sm" onClick={() => setShow(!show)}>
                            {show ? 'Hide' : 'Show'}
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>

            <Button marginTop={15} size="sm" width={'100%'} colorScheme="blue" onClick={submitForm} isLoading={loading}>
                Login
            </Button>
            <Button
                variant="solid"
                colorScheme="red"
                marginTop={15}
                size="sm"
                width={'100%'}
                onClick={() => {
                    setEmail('guest@example.com');
                    setPassword('123456');
                }}
            >
                Get Guest User Credentials
            </Button>
        </VStack>
    );
};

export default Login;
