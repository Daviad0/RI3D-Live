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

const io = socketio(server);

app.use('/public', express.static('public'));
app.use('/css', express.static('css'));
app.use('/js', express.static('js'));

app.get('/control', (req, res) => {
    res.sendFile(__dirname + '/views/control.html');
});

app.get('/data-control', (req, res) => {
    res.sendFile(__dirname + '/views/data-control.html');
});

app.get('/stream', (req, res) => {
    res.sendFile(__dirname + '/views/stream.html');
});

let streamState = {
    time_target: "2021-01-01T00:00",
    build_stage: "Build Stage",
    stream_view: "Timer",
    data_name: "Data Name",
    data_segment: "Hidden",
    scrolling_text: "Scrolling Text"
}

let dataState = {
    counter: 28,
    points: 0,
    timer: "0:00"
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