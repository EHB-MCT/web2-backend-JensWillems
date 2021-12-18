"use strict";
const mongoClient = require('mongodb').MongoClient;
const client = new mongoClient(process.env.FINAL_URL, {
    useNewUrlParser: true
})

const register = async (req, res) => {
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
}


const login = async (req, res) => {
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
}

const updateScore = async (req, res) => {
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
}
module.exports = {
    register,
    login,
    updateScore
}