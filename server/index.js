const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const mysqlDB = require('./mysqlDB');
const categories = require('./app/categories');
const locations = require('./app/locations');
const equipment = require('./app/equipment');

const app = express();
const port = 8000;

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json())


// app.use(express.json());
app.use(cors());
app.use(express.static('public'));

app.use('/categories', categories);
app.use('/locations', locations);
app.use('/equipment', equipment);

const run = async () => {
    await mysqlDB.connect();

    app.listen(port, () => {
        console.log(`Server has started working on ${port} port!`);
    });

    process.on('exit', () => {
        mysqlDB.disconnect();
    })
};

run().catch(e => {
    console.error(e);
});