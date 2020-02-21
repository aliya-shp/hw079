const express = require('express');

const mysqlDB = require('../mysqlDB');

const router = express.Router();

router.get('/', async (req, res) => {
    const categories = await mysqlDB.getConnection().query('SELECT `id`, `title` FROM `categories`');
    res.send(categories);
});

router.get('/:id', async (req, res) => {
    const category = await mysqlDB.getConnection().query('SELECT * FROM `categories` WHERE `id` = ?', req.params.id);

    const item = category[0];
    if (!item) {
        return res.status(404).send({message: 'Not found'});
    }
    res.send(item);
});

router.post('/', async (req, res) => {
    const category = req.body;

    if (!category.title || !category.description) return res.status(400).send({message: 'You forgot to fill all the fields!'});

    const result = await mysqlDB.getConnection().query(
        'INSERT INTO `categories` (`title`, `description`) VALUES (?, ?)',
        [category.title, category.description]
    );

    category.id = result.insertId;

    res.send(category);
});

router.delete('/:id', async (req, res) => {
    const category = await mysqlDB.getConnection().query('SELECT * FROM `categories` WHERE `id` = ?', req.params.id);

    if (category.length === 0) {
        res.status(400).send({message: 'No such category!'});
    } else {
        mysqlDB.getConnection().query('DELETE FROM `categories` WHERE `id` = ?', req.params.id);
        res.send({message: 'Deleted category successfully'});
    }
});

router.put('/:id', async (req, res) => {
    const category = req.body;

    const oldCategory = await mysqlDB.getConnection().query(
        'SELECT * FROM `categories` WHERE `id` = ?;',
        [req.params.id]
    );

    if (Object.entries(category).length === 0) {
        return res.status(400).send({message: 'No updates here'})
    }

    if (!category.title) category.title = oldCategory[0].title;

    if (!category.description) category.description = oldCategory[0].description;

    await mysqlDB.getConnection().query(
        'UPDATE `categories` SET `title` = ?, `description` = ? WHERE `id` = ?',
        [category.title, category.description, req.params.id]
    );

    const updatedCategory = await mysqlDB.getConnection().query(
        'SELECT * FROM `categories` WHERE `id` = ?;',
        [req.params.id]
    );

    res.send(updatedCategory);
});

module.exports = router;