const { cloudinary } = require('./utils/cloudinary');
const express = require('express');
const mysql = require('mysql');
const app = express();
var cors = require('cors');

// Create database connection.
const db = mysql.createConnection({
    host: 'localhost',
    port: '8889',
    user: 'root',
    password: 'root',
    database: 'nodemysql',
    socketPath: ''
});

// Connect
db.connect((err) => {
    if(err){
        console.log(err)
    }
    console.log('My Sql connected...');
});

app.use(express.static('public'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// let sql = 'CREATE TABLE images(id int AUTO_INCREMENT, url VARCHAR(500), PRIMARY KEY(id))';
// db.query(sql, (err, result) => {
//     if(err) throw err;
//     console.log('Table Created...');
// });

// app.get('/createdb', (req, res) => {
//     let sql = 'CREATE DATABASE nodemysql';
//     db.query(sql, (err, result) => {
//         if(err) throw err;
//         console.log(result);
//         res.send('DB Created...');
//     });
// });

app.get('/api/images', async (req, res) => {
    const { resources } = await cloudinary.search
        .expression('folder:imageUploader')
        .sort_by('public_id', 'desc')
        .max_results(30)
        .execute();

    const publicIds = resources.map((file) => file.public_id);
    res.send(publicIds);
});
app.post('/api/upload', async (req, res) => {
    try {
        const fileStr = req.body.data;
        const uploadResponse = await cloudinary.uploader.upload(fileStr, {
            upload_preset: 'hdziq54l',
        });
        console.log(uploadResponse);
        let image = {url: uploadResponse.secure_url};
        let sql = 'INSERT INTO images SET ?';
        db.query(sql, image, (err, result) => {
            if(err) throw err;
            console.log(result);
        });
        res.json({ msg: 'Uploaded!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ err: 'Something went wrong' });
    }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log('listening on 3001');
});
