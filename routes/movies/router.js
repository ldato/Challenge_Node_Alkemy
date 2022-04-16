const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const bodyParser = require('body-parser');
const dbConfig = require('../../dbConfig');
const JWT = require('jsonwebtoken');
const secret = require('../../config');
const multer = require('multer');
const util = require('util');
const connectionSQL = mysql.createConnection(dbConfig);
const query = util.promisify(connectionSQL.query).bind(connectionSQL); //para usar async await con mysql

router.use(bodyParser.urlencoded({extended: false}));
router.use(bodyParser.json());

router.get('/', (req, res) => {
    const token = req.headers['x-access-token'];
    if (!token) {
        res.status(401).send({error: "Es necesario el token de autenticación"});
    } else {
        JWT.verify(token, secret, (error, user) => {
            if (error) {
                return res.json({message: "Token invalido"});
            } else {
                try {
                    const connection = mysql.createConnection(dbConfig);
                    connection.query('SELECT imagen, titulo, fechaCreacion FROM peliculasseries;', 
                    function (error, result) {
                        if (error) {
                            throw error;
                        } else {
                            console.log(result);
                            res.send(result);
                        }
                    })
                } catch (error) {
                    
                }
            }
        })
    }
})

module.exports = router;
