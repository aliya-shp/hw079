const express = require('express');

const mysqlDB = require('../mysqlDB');

const router = express.Router();

router.get('/', async (req, res) => {
    const locations = await mysqlDB.getConnection().query('SELECT `id`, `title` FROM `locations`');
    res.send(locations);
});

router.get('/:id', async (req, res) => {
    const location = await mysqlDB.getConnection().query('SELECT * FROM `locations` WHERE `id` = ?', req.params.id);

    const item = location[0];
    if (!item) {
        return res.status(404).send({message: 'Not found'});
    }
    res.send(item);
});

router.post('/', async (req, res) => {
    const location = req.body;

    if (!location.title || !location.description) return res.status(400).send({message: 'You forgot to fill all the fields!'});

    const result = await mysqlDB.getConnection().query(
        'INSERT INTO `locations` (`title`, `description`) VALUES (?, ?)',
        [location.title, location.description]
    );

    location.id = result.insertId;

    res.send(location);
});

router.delete('/:id', async (req, res) => {
    const location = await mysqlDB.getConnection().query('SELECT * FROM `locations` WHERE `id` = ?', req.params.id);

    if (location.length === 0) {
        res.status(400).send({message: 'No such location!'});
    } else {
        mysqlDB.getConnection().query('DELETE FROM `locations` WHERE `id` = ?', req.params.id);
        res.send({message: 'Deleted location successfully'});
    }
});

router.put('/:id', async (req, res) => {
    const location = req.body;

    const oldLocation = await mysqlDB.getConnection().query(
        'SELECT * FROM `locations` WHERE `id` = ?;',
        [req.params.id]
    );

    if (Object.entries(location).length === 0) {
        return res.status(400).send({message: 'No updates here'})
    }

    if (!location.title) location.title = oldLocation[0].title;

    if (!location.description) location.description = oldLocation[0].description;

    await mysqlDB.getConnection().query(
        'UPDATE `locations` SET `title` = ?, `description` = ? WHERE `id` = ?',
        [location.title, location.description, req.params.id]
    );

    const updatedLocation = await mysqlDB.getConnection().query(
        'SELECT * FROM `locations` WHERE `id` = ?;',
        [req.params.id]
    );

    res.send(updatedLocation);
});

module.exports = router;