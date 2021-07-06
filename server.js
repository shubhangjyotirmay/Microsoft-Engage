require('dotenv').config();
const bodyParser = require("body-parser");
const path = require('path');
const express = require('express')
const http = require('http')
const moment = require('moment');

const app = express();
const server = http.createServer(app);
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

//  all variables for users
let rooms = {};
let socketRooms = {};
let socketName = {};
let mic = {};
let video = {};
let whiteboard = {};

//  socket connection
const socketio = require('socket.io');
const io = socketio(server);
function onConnect(socket) {

    //  joining room
    socket.on("join room", (roomid, username) => {
        socket.join(roomid);
        socketRooms[socket.id] = roomid;
        socketName[socket.id] = username;
        mic[socket.id] = 'on';
        video[socket.id] = 'on';
        if (rooms[roomid] && rooms[roomid].length > 0) {
            rooms[roomid].push(socket.id);
            socket.to(roomid).emit('message', `${username} joined the room.`, 'Meet-Bot', moment().format(
                "h:mm a"
            ));
            io.to(socket.id).emit('join room', rooms[roomid].filter(pid => pid != socket.id), socketName, mic, video);
        } else {
            rooms[roomid] = [socket.id];
            io.to(socket.id).emit('join room', null, null, null, null);
        }
        io.to(roomid).emit('user count', rooms[roomid].length);
    });

    //  video/mic related stuff
    socket.on('action', msg => {
        if (msg == 'mute') {
            mic[socket.id] = 'off';
        }
        else if (msg == 'unmute') {
            mic[socket.id] = 'on';
        }
        else if (msg == 'videoon') {
            video[socket.id] = 'on';
        }
        else if (msg == 'videooff') {
            video[socket.id] = 'off';
        }
        socket.to(socketRooms[socket.id]).emit('action', msg, socket.id);
    });

    socket.on('video-offer', (offer, sid) => {
        socket.to(sid).emit('video-offer', offer, socket.id, socketName[socket.id], mic[socket.id], video[socket.id]);
    });

    socket.on('video-answer', (answer, sid) => {
        socket.to(sid).emit('video-answer', answer, socket.id);
    });

    socket.on('new icecandidate', (candidate, sid) => {
        socket.to(sid).emit('new icecandidate', candidate, socket.id);
    });

    //  Chats message
    socket.on('message', (msg, username, roomid) => {
        io.to(roomid).emit('message', msg, username, moment().format(
            "h:mm a"
        ));
    });

    //  Whiteboard canvas
    socket.on('getCanvas', () => {
        if (whiteboard[socketRooms[socket.id]])
            socket.emit('getCanvas', whiteboard[socketRooms[socket.id]]);
    });

    socket.on('draw', (newx, newy, prevx, prevy, color, size) => {
        socket.to(socketRooms[socket.id]).emit('draw', newx, newy, prevx, prevy, color, size);
    });

    socket.on('clearBoard', () => {
        socket.to(socketRooms[socket.id]).emit('clearBoard');
    });

    socket.on('store canvas', url => {
        whiteboard[socketRooms[socket.id]] = url;
    });

    //  Leave Room/disconnect
    socket.on('disconnect', () => {
        if (!socketRooms[socket.id]) {
            return;
        }
        socket.to(socketRooms[socket.id]).emit('message', `${socketName[socket.id]} left the chat.`, `Meet-Bot`, moment().format(
            "h:mm a"
        ));
        socket.to(socketRooms[socket.id]).emit('remove peer', socket.id);
        let index = rooms[socketRooms[socket.id]].indexOf(socket.id);
        rooms[socketRooms[socket.id]].splice(index, 1);
        io.to(socketRooms[socket.id]).emit('user count', rooms[socketRooms[socket.id]].length);
        delete socketRooms[socket.id];
        console.log('leaving room.....');
        console.log(rooms[socketRooms[socket.id]]);
    });
}

io.on('connect', onConnect);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server Started on port ${PORT}!`);
});