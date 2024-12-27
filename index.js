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
const fs = require('fs');

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

app.get(route + '/materials', (req, res) => {
    res.sendFile(__dirname + '/views/materials.html');
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


let materials = [];

async function getMaterials(){
    // get from the file in the public folder
    try{
        let data = fs.readFileSync('public/materials.json');
        materials = JSON.parse(data);
        materials = materials.materials;
    }catch(e){
        materials = [];
    }

    
}

async function writeMaterials(){
    let data = JSON.stringify({materials: materials});
    fs.writeFileSync('public/materials.json', data);
}

getMaterials();

app.get(route + '/get-materials', (req, res) => {
    res.send({documents: materials});
});


io.on('connection', (socket) => {

    socket.emit('stream-state', streamState);
    socket.emit('data-state', dataState);
    socket.emit('material-write', materials);

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

    socket.on('material-write', (data) => {
        materials = data;
        writeMaterials();
        io.emit('new-material-write', data);
    });
});


server.listen(3000, () => {
    console.log('Server running on port 3000');
});