const path = require('path');
const express = require('express');
const multer = require('multer');
const nanoid = require('nanoid');
const mysqlDB = require('../mysqlDB');
const config = require('../config');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, config.uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, nanoid() + path.extname(file.originalname));
    }
});

const upload = multer({storage});

const router = express.Router();

router.get('/', async (req, res) => {
    const equipment = await mysqlDB.getConnection().query('SELECT `id`, `title` FROM `equipment`');
    res.send(equipment);
});

router.get('/:id', async (req, res) => {
    const equipment = await mysqlDB.getConnection().query('SELECT * FROM `equipment` WHERE `id` = ?', req.params.id);

    const item = equipment[0];
    if (!item) {
        return res.status(404).send({message: 'Not found'});
    }
    res.send(item);
});

router.post('/', upload.single('image'), async (req, res) => {
    const equipment = req.body;

    if (req.file) {
        equipment.image = req.file.filename;
    }

    const result = await mysqlDB.getConnection().query(
        'INSERT INTO `equipment` (`category_id`, `location_id`, `title`, `description`, `image`, `registration_date`) VALUES ' +
        '(?, ?, ?, ?, ?, ?)',
        [equipment.categoryId, equipment.locationId, equipment.title, equipment.description, equipment.image, equipment.registration_date]
    );

    if (Object.values(equipment).length < 6) {
        return res.status(400).send({message: 'You forgot to fill all the fields!'});
    }

    equipment.id = result.insertId;

    res.send(equipment);
});

router.delete('/:id', async (req, res) => {
    const equipment = await mysqlDB.getConnection().query('SELECT * FROM `equipment` WHERE `id` = ?', req.params.id);

    if (equipment[0]) {
        const categoryId = equipment[0].category_id;
        const locationId = equipment[0].location_id;

        if (categoryId) {
            res.status(403).send({message: 'Equipment cannot be deleted as it has connected categories'});
        } else if (locationId) {
            res.status(403).send({message: 'Equipment cannot be deleted as it has connected locations'});
        } else {
            mysqlDB.getConnection().query('DELETE FROM `equipment` WHERE `id` = ?', req.params.id);
            res.send({message: 'Deleted equipment successfully'});
        }
    } else {
        res.status(404).send({message: 'No such equipment!'})
    }
});

router.put('/:id', upload.single('image'), async (req, res) => {
    const equipment = req.body;

    console.log(equipment, 'equipment');

    if (req.file) {
        equipment.image = req.file.filename;
    }

    console.log(equipment, 'equipment');

    const oldEquipment = await mysqlDB.getConnection().query(
        'SELECT * FROM `equipment` WHERE `id` = ?;',
        [req.params.id]
    );

    console.log(oldEquipment, 'oldEquipment');

    if (Object.values(equipment).length === 0) {
        return res.status(400).send({message: 'No updates here'});
    }

    console.log(equipment, 'equipment after Obj.val');

    for (let key in equipment) {
        if (!equipment[key]) {
            equipment[key] = oldEquipment[0][key];
        }
    }

    await mysqlDB.getConnection().query(
        'UPDATE `equipment` ' +
        'SET `category_id` = ?, ' +
        '`location_id` = ?, ' +
        '`title` = ?, ' +
        '`description` = ?, ' +
        '`image` = ?, ' +
        '`registration_date` = ? ' +
        'WHERE `id` = ?',
        [
            equipment.categoryId,
            equipment.locationId,
            equipment.title,
            equipment.description,
            equipment.image,
            equipment.registration_date,
            req.params.id
        ]
    );

    const updatedEquipment = await mysqlDB.getConnection().query(
        'SELECT * FROM `equipment` WHERE `id` = ?;',
        [req.params.id]
    );
    res.send(updatedEquipment);
});

module.exports = router;