const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const shortid = require('shortid');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.use(express.static('public'));

app.get('/', (req, res, next) => {
    res.sendFile(__dirname + '/views/index.html');
});

// Schema
let Schema = mongoose.Schema;

let userSchema = new Schema({
    username: String,
    userId: String,
    description: String,
    duration: Number,
    date: String
});

// Model
let userModel = mongoose.model('user', userSchema);

app.post('/api/exercise/new-user', (req, res, next) => {
    let userName = req.body.username;

    userModel.find().exec().then(d => {
        let data = d;
        let identity = shortid.generate();

        data = data.filter(obj => obj.username == userName);

        if (data.length === 0) {    
            
            res.json({ username: userName, id: identity });
            new userModel({ username: userName, userId: identity, description: '', duration: 0, date: '' }).save();
        } else {
            res.send('username already taken');
        }
    });
});

app.post('/api/exercise/add', (req, res, next) => {
    let id = req.body.userId;

    userModel.find().exec().then(d => {
        let data = d;

        data = data.filter(obj => obj.userId == id);

        if (data.length === 0) {
            res.send(`unknown user ID "${id}"`);
        } else {
            res.json({
                username: data[0].username,
                id: id,
                description: req.body.description,
                duration: req.body.duration + ' min',
                date: req.body.date
            });
            data[0].description = req.body.description;
            data[0].duration = req.body.duration;
            data[0].date = req.body.date;
            data[0].save();
        }
    });
});


app.get('/api/exercise/log', (req, res) => {
    let id = req.query.userId;

    userModel.find().exec().then(d => {
        let data = d;

        data = data.filter(obj => obj.userId == id);

        if (data.length === 0) {
            res.send(`unknown user ID "${id}"`);
        } else {
            res.json({
                id: data[0].userId,
                username: data[0].username,
                count: 1,
                log: [{
                        description: data[0].description,
                        duration: data[0].duration,
                        date: new Date(data[0].date).toLocaleDateString("en-us", {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            weekday: 'short'
                        })
                }]
            });
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));