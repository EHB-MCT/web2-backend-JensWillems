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

app.use('/api/user', require('./user.router')());


app.listen(port, () => {
    console.log(`API is running at http://localhost:${port}`);
})