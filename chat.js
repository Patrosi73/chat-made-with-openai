const express = require('express');
const socketIO = require('socket.io');
const cors = require('cors');
const htmlEscape = require('html-escape');
const multer = require('multer');

const app = express();

app.use(cors());

const server = app.listen(3000, (err) => {
    if (err) {
        console.error(err);
    } else {
        console.log('Server listening on port 3000');
    }
});


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
        io.emit('new message', { username, message });
    });

    socket.on('new image', (data) => {
        io.emit('new image', { username, data });
    });

    socket.on('disconnect', () => {
        io.emit('user disconnected', { username });
    });
});

app.post('/upload', upload.single('image'), (req, res) => {
    const image = req.file;

    if (!image) {
        return res.status(400).send('No image was uploaded.');
    }

    res.status(200).send(image);
});
