const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoClient = require('mongodb').MongoClient;
const {
    send
} = require('process');

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

// Route for all the markers for on the map
app.get('/api/markers', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(process.env.DV);
        const coll = db.collection(process.env.COLL);
        const markers = await coll.find({}).toArray();

        res.status(200).send(markers);
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

// The user can register
app.post('/api/register', async (req, res) => {
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
                userPW: req.body.userPW,
                score: 0
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
});

// User can login
app.post('/api/login', async (req, res) => {
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
                res.status(200).send({
                    user: user.userMail
                });
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

// the users score will be saved on MongoDB and updated
app.put('/api/updatescore', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(process.env.DV);
        const coll = db.collection(process.env.COLLUSER);

        const user = await coll.findOne({
            userMail: req.body.userMail
        });
        console.log(user, req.body.userMail, req.body.score);

        if (user) {
            await coll.findOneAndUpdate({
                userMail: req.body.userMail
            }, {
                $set: {
                    score: req.body.score
                },
            });
            res.status(200).send("score updated!")
        } else(
            res.status(412).send("Something went wrong!")
        )


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

// The user can see its score with this route
app.post('/api/yourscore', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(process.env.DV);
        const coll = db.collection(process.env.COLLUSER);

        const user = await coll.findOne({
            userMail: req.body.userMail
        });
        if (user) {
            res.status(200).send({
                score: user.score || "Don't have a score yet"
            });
        } else(
            res.status(412).send("Something went wrong!")
        )
    } catch (err) {
        res.status(500).send({
            err: 'Something went wrong. Try again later',
            value: err
        })
    } finally {
        await client.close()
    }
});

// User can delete its score
app.delete('/api/yourscore', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(process.env.DV);
        const coll = db.collection(process.env.COLLUSER);

        const user = await coll.findOne({
            userMail: req.body.userMail
        });
        if (user) {
            const query = {
                score: 1
            };
            const deleteScore = await coll.updateOne({
                userMail: req.body.userMail
            }, {
                $unset: query,
            });
            console.log(deleteScore);

            res.status(200).send("Score succesfully deleted!");
            console.log(user)
        } else(
            res.status(412).send("Something went wrong!")
        )
    } catch (err) {
        res.status(500).send({
            err: 'Something went wrong. Try again later',
            value: err
        })
    } finally {
        await client.close()
    }
});

// Main route
app.listen(port, () => {
    console.log(`API is running at http://localhost:${port}`);
})