import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, VStack } from '@chakra-ui/react';
import React, { useState } from 'react';
import { useToast } from '@chakra-ui/react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
    const toast = useToast();
    const navigate = useNavigate();
    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [pic, setPic] = useState();
    const [show, setShow] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);

    const submitPicture = (pics: any) => {
        setLoading(true);
        if (pics === undefined) {
            toast({
                title: 'Please select an image',
                status: 'warning',
                duration: 5000,
                isClosable: true,
                position: 'bottom'
            });
            return;
        }

        if (pics.type === 'image/jpeg' || pics.type === 'image/png') {
            const data = new FormData();
            data.append('file', pics);
            data.append('upload_preset', 'chat-app');
            data.append('cloud_name', 'dontqomnd');
            fetch('https://api.cloudinary.com/v1_1/dontqomnd/image/upload', {
                method: 'post',
                body: data
            })
                .then((res) => res.json())
                .then((data) => {
                    setPic(data.url.toString());
                    setLoading(false);
                })
                .catch((err: any) => {
                    console.log(err);
                    setLoading(false);
                });
        } else {
            toast({
                title: 'Please select an image',
                status: 'warning',
                duration: 5000,
                isClosable: true,
                position: 'bottom'
            });
            setLoading(false);
            return;
        }
    };
    const submitForm = async () => {
        setLoading(true);
        if (!name || !email || !password || !confirmPassword) {
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
        if (password !== confirmPassword) {
            toast({
                title: 'Password do not match',
                status: 'warning',
                duration: 5000,
                isClosable: true,
                position: 'bottom'
            });
            setLoading(false);
            return;
        }
        try {
            const { data } = await axios.post('/api/user', {
                name,
                email,
                password,
                pic
            });
            toast({
                title: 'Registration Successful',
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
                <FormLabel>Name</FormLabel>
                <Input variant="filled" placeholder="Enter Your Name" onChange={(e) => setName(e.target.value)} value={name} />
            </FormControl>
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
            <FormControl isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <InputGroup>
                    <Input variant="filled" type={show ? 'text' : 'password'} placeholder="Confirm Password" onChange={(e) => setConfirmPassword(e.target.value)} value={confirmPassword} />
                    <InputRightElement>
                        <Button h={'100%'} size="sm" onClick={() => setShow(!show)}>
                            {show ? 'Hide' : 'Show'}
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>
            <FormControl isRequired>
                <FormLabel>Upload Your Picture</FormLabel>
                <Input variant="filled" type="file" p={1.5} accept="image/*" onChange={(e: any) => submitPicture(e.target.files[0])} />
            </FormControl>

            <Button marginTop={15} size="sm" width={'100%'} colorScheme="blue" onClick={submitForm} isLoading={loading}>
                Sign Up
            </Button>
        </VStack>
    );
};

export default SignUp;
