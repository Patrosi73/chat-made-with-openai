const express = require('express');
const socketIO = require('socket.io');
const htmlEscape = require('html-escape');
const multer = require('multer');

const app = express();
const server = app.listen(3000);
const io = socketIO(server);

const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    let username = '';

    socket.on('new user', (data) => {
        username = htmlEscape(data.username);
        socket.broadcast.emit('new user', { username });
    });

    socket.on('new message', (data) => {
        const message = htmlEscape(data.message);
        socket.broadcast.emit('new message', { username, message });
    });

    socket.on('new image', (data) => {
        socket.broadcast.emit('new image', { username, data });
    });
});

app.post('/upload', upload.single('image'), (req, res) => {
    const image = req.file;

    if (!image) {
        return res.status(400).send('No image was uploaded.');
    }

    res.status(200).send(image);
});
