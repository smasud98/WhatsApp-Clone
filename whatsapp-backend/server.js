import express from 'express';
import mongoose from 'mongoose';
import Messages from './dbMessages.js';
import Pusher from 'pusher';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 9000;
const CONNECTION_URL = `mongodb+srv://admin:tMkmxgvZBcNIT22N@cluster0.3o9li.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const pusher = new Pusher({
    appId: "1282493",
    key: "40904ea81bba5c84881d",
    secret: "284a5f26c4a7c47b7457",
    cluster: "us2",
    useTLS: true
});

app.use(express.json());
app.use(cors())

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
})

mongoose.connect(CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;

db.once('open', () => {
    console.log("DB Connected");

    const msgCollection = db.collection("messagecontents");
    const changeStream = msgCollection.watch();

    changeStream.on('change', (change) => {
        console.log(change);

        if (change.operationType === 'insert') {
            const messageDetails = change.fullDocument;
            pusher.trigger('messages', 'inserted', {
                name: messageDetails.name,
                message: messageDetails.message,
                timestamp: messageDetails.timestamp,
                received: messageDetails.received
            })
        } else {
            console.log("Error triggering pusher")
        }
    })
})

app.get('/', (req, res) => {
    res.status(200).send('Hello World')
});

app.get('/messages/sync', (req, res) => {

    Messages.find((err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(200).send(data)
        }
    })
})

app.post('/messages/new', (req, res) => {
    const dbMessage = req.body;

    Messages.create(dbMessage, (err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(201).send(`New message created: ${data}`)
        }
    })
})

app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`))