const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoClient = require('mongodb').MongoClient;
const dbConfig = require('./dbConfig.json');
const client = new mongoClient(dbConfig.baseUrl, {
    useNewUrlParser: true
})

const app = express();
const port = 3000;


app.use(cors());
app.use(bodyParser.json());


//  tells you the absolute path of the directory containing the currently executing file.
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
})

app.get('/api/markers', async (req, res) => {
    try {
        await client.connect()
        const db = client.db(dbConfig.db)
        const coll = db.collection(dbConfig.coll)
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

app.listen(port, () => {
    console.log(`API is running at http://localhost:${port}`);
})