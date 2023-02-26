import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import connectDb from './config/db';
import userRoutes from './routes/user.route';
import chatRoutes from './routes/chat.route';
import messageRoutes from './routes/message.route';
import { errorHandler, notFound } from './middleware/errorMiddleware';
import { Server } from 'socket.io';
import { UserDocument } from './models/UserModel';
import path from 'path';

const app = express();
dotenv.config();

app.use(express.json());

app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT;
const server = app.listen(PORT, async () => {
    console.log('App is running on port ' + PORT);
    connectDb();
});

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000'
    }
});

io.on('connection', (socket: any) => {
    console.log('connected to socket.io');

    socket.on('setup', (userData: UserDocument) => {
        socket.join(userData._id);
        socket.emit('connected');
        io.sockets.in(userData._id).emit('connectToRoom', 'This is your personal room ' + userData._id);
    });

    //@ts-ignore
    socket.on('send message', (message) => {
        const { users } = message.chat;
        // const publicRoom = message.chat._id;
        const sender = message.sender._id;
        for (let i = 0; i < users.length; i++) {
            if (users[i]._id !== sender) io.sockets.in(users[i]._id).emit('receive message', message);
        }
    });

    socket.on('join chat', (room: any) => {
        socket.join(room);
        console.log('User joined room: ' + room);
        io.sockets.in(room).emit('connectToRoom', 'You are in room ' + room);
    });
    socket.on('typing', (room: any) => socket.in(room).emit('typing'));
    socket.on('stop typing', (room: any) => socket.in(room).emit('stop typing'));

    socket.off('setup', () => {
        console.log('User Disconnected');
        socket.leave();
    });
});
