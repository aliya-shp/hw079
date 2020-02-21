const path = require('path');

const rootPath = __dirname;

module.exports = {
    rootPath,
    uploadPath: path.join(rootPath, 'public', 'uploads'),
    database: {
        host: 'localhost',
        user: 'aliya',
        password: 'circle',
        database: 'eq-app',
    }
};