import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import ChatProvider from './context/ChatContext';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <BrowserRouter>
        <ChatProvider>
            <ChakraProvider>
                <App />
            </ChakraProvider>
        </ChatProvider>
    </BrowserRouter>
);
