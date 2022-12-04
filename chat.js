const express = require('express');
const socketIO = require('socket.io');
const cors = require('cors');
const escapeHtml = require('escape-html');
const multer = require('multer');

const app = express();

app.use(cors());

const server = app.listen(3000, '0.0.0.0', (err) => {
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
        // Validate username
        if (!data.username || typeof data.username !== 'string') {
            return;
        }

        username = escapeHtml(data.username);
        socket.broadcast.emit('new user', { username });
    });

    socket.on('new message', (data) => {
        // Validate message
        if (!data.message || typeof data.message !== 'string') {
            return;
        }

        const message = escapeHtml(data.message);
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

    // Validate image
    if (!image || !image.mimetype.startsWith('image/')) {
        return res.status(400).send('Invalid image format.');
    }

    res.status(200).send(image);
});
