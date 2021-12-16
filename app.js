const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoClient = require('mongodb').MongoClient;


require('dotenv').config();


// Mongo Client
const client = new mongoClient(process.env.FINAL_URL, {
    useNewUrlParser: true
})


const app = express();
const port = process.env.PORT;


app.use(cors());
app.use(bodyParser.json());

//  tells you the absolute path of the directory containing the currently executing file.
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
})

app.get('/api/markers', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(process.env.DV);
        const coll = db.collection(process.env.COLL);
        const markers = await coll.find({}).toArray();

        res.status(200).send(markers);
        //return res.status(200).json("Hello form markers endpoint!");
    } catch (err) {
        console.log('get', err);
        res.status(500).send({
            err: 'Something went wrong. Try again later',
            value: err
        })
    } finally {
        await client.close();
    }

    //console.log(markers)

})

// The root for the register
app.post('/api/register', async (req, res) => {
    // console.log("hello");
    try {
        await client.connect();
        console.log(req.body);
        const db = client.db(process.env.DV);
        const coll = db.collection(process.env.COLLUSER);

        const existingUser = await coll.findOne({
            userMail: req.body.userMail
        });
        console.log(existingUser);
        if (!existingUser) {
            await coll.insertOne({
                userMail: req.body.userMail,
                userPW: req.body.userPW
            });
            res.status(200).send("user succesfully made!");
        } else {
            res.status(409).send("user has been taken!");
        }
    } catch (err) {
        console.log('get', err);
        res.status(500).send({
            err: 'Something went wrong. Try again later',
            value: err
        })
    } finally {
        await client.close();
    }
})

// The root for the login
app.post('/api/login', async (req, res) => {
    // console.log("hello");
    try {
        await client.connect();
        const db = client.db(process.env.DV);
        const coll = db.collection(process.env.COLLUSER);

        const user = await coll.findOne({
            userMail: req.body.loginMail
        });
        console.log(user);
        if (user) {
            if (user.userPW === req.body.loginPW) {
                res.status(200).send("user succesfully loged in");
            } else {
                res.status(401).send({
                    message: "incorrect username or password!"
                });
            }

        } else if (!user) {
            res.status(401).send("incorrect username or password!");
        }
    } catch (err) {
        console.log('get', err);
        res.status(500).send({
            err: 'Something went wrong. Try again later',
            value: err
        })
    } finally {
        await client.close();
    }
})


app.listen(port, () => {
    console.log(`API is running at http://localhost:${port}`);
})