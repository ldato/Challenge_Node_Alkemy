const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const bodyParser = require('body-parser');
const dbConfig = require('../../dbConfig');
const JWT = require('jsonwebtoken');
const secret = require('../../config');
const multer = require('multer')({dest: 'public/files'});

router.use(bodyParser.urlencoded({extended: false}));
router.use(bodyParser.json());



router.get('/', (req, res) => {
    const token = req.headers['x-access-token'];
    if (!token) {
        res.status(401).send({error: "Es necesario el token de autenticación"});
    } else {
        JWT.verify(token, secret, async (error, user) => {
            if (error) {
                return res.json({message: "Token invalido"});
            } else {
                try {
                    const connection = mysql.createConnection(dbConfig);
                    connection.query('SELECT * FROM generos', function (error, result) {
                        console.log(result);
                        res.send(result);
                    })
                } catch (error) {
                    res.send(error);
                }
                
            }
        })
    }
})

router.post('/agregarGenero', [multer.single('imagen')], (req, res) => {
    let file = req.file;
    let nombre = req.body.nombre;
    // console.log(file);
    // res.send(file);
    const token = req.headers['x-access-token'];
    if (!token) {
        res.status(401).send({error: "Es necesario el token de autenticación"});
    } else {
        JWT.verify(token, secret, async (error, result) => {
            if (error) {
                return res.json({message: 'Token invalido'});
            } else {
                if (!req.file) {
                    res.send("No se adjunto ninguna imagen");
                } else {
                    let path = file.path;
                    try {
                        const connection = mysql.createConnection(dbConfig);
                        connection.query('INSERT INTO generos (nombre, imagen) VALUES (?, ?)',[nombre, path],
                        function (error, result) {
                            if (error) {
                                throw error;
                            } else {
                                console.log(result);
                                res.send(result);
                            }
                        })
                    } catch (error) {
                        res.send(error);
                    }
                }
            }
        })
    }
})

router.delete('/eliminarGenero/:id', (req, res) => {
    let id = req.params.id;
    const token = req.headers['x-access-token'];
    if (!token) {
        res.status(401).send({error: "Es necesario el token de autenticación"});
    } else {
        JWT.verify(token, secret, async (error, user) => {
            if (error) {
                return res.json({message: 'Token invalido'});
            } else {
                try {
                    const connection = mysql.createConnection(dbConfig);
                    connection.query('DELETE FROM generos WHERE idGenero =?', [id], 
                    function (error, result) {
                        if (error) {
                            throw error;
                        } else {
                            res.send(result);
                            console.log(result);
                        }
                    })
                } catch (error) {
                    res.send(error);
                    console.log(error);
                }
            }
        })
    }
})

router.put('/modificarGenero/:id', (req, res) => {
    let id = req.params.id;
    let nvoGenero = req.body.genero;
    const token = req.headers['x-access-token'];
    if (!token) {
        res.status(401).send({error: 'Es necesario el token de autenticación'})
    } else {
        JWT.verify(token, secret, async (error, user) => {
            if (error) {
                return res.json({message: 'Token invalido'});
            } else {
                const connection = mysql.createConnection(dbConfig);
                connection.query('UPDATE generos SET nombre = ? WHERE idGenero = ?', [nvoGenero, id],
                function (error, result) {
                    if (error) {
                        throw error;
                    } else {
                        res.send(result);
                        console.log(result);
                    }
                });
                
            }
        })
    }
})

module.exports = router;