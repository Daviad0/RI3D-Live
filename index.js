/**
 * Server to handle the livestream and automatic functions managed by RI3D at MTU staff
 * 
 * The project will consist of four endpoints
 * - /live/control
 * - /live/data-control
 */

const express = require('express');
const socketio = require('socket.io');

const app = express();
const server = require('http').createServer(app);

const io = socketio(server, {path: '/live/socket.io'});

const route = process.env.ROUTE || '/live';

app.use(route + '/public', express.static('public'));
app.use(route + '/css', express.static('css'));
app.use(route + '/js', express.static('js'));

app.get(route + '/control', (req, res) => {
    res.sendFile(__dirname + '/views/control.html');
});

app.get(route + '/data-control', (req, res) => {
    res.sendFile(__dirname + '/views/data-control.html');
});

app.get(route + '/stream', (req, res) => {
    res.sendFile(__dirname + '/views/stream.html');
});

app.get(route + '/status', (req, res) => {
    res.sendFile(__dirname + '/views/status.html');
});

app.get(route + '/tech', (req, res) => {
    res.sendFile(__dirname + '/views/tech.html');
});

let streamState = {
    time_target: "2025-01-01T00:00",
    build_stage: "Initial",
    stream_view: "timer",
    data_name: "Data:",
    data_segment: "hidden",
    scrolling_text: "Scrolling Text",
    full_screen_message: "Full Screen Message",
}

let dataState = {
    counter: 28,
    points: 0,
    timer: "0:00",
    time_pinged: Date.now()
}


io.on('connection', (socket) => {

    socket.emit('stream-state', streamState);
    socket.emit('data-state', dataState);

    console.log('New connection');
    socket.on('control', (data) => {
        console.log('Control data: ', data);
    });
    socket.on('data-control', (data) => {
        console.log('Data control data: ', data);
    });
    socket.on('new-stream-state', (data) => {
        streamState = data;
        io.emit('stream-state', streamState);
    });

    socket.on('new-data-state', (data) => {
        dataState = data;
        io.emit('data-state', dataState);
    });
});


server.listen(3000, () => {
    console.log('Server running on port 3000');
});