const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const bodyParser = require('body-parser');
const dbConfig = require('../../dbConfig');
const JWT = require('jsonwebtoken');
const secret = require('../../config');
const multer = require('multer')({ dest: 'public/files' });
const util = require('util');
const connectionSQL = mysql.createConnection(dbConfig);
const query = util.promisify(connectionSQL.query).bind(connectionSQL);

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/', (req, res) => {
    const token = req.headers['x-access-token'];
    if (!token) {
        res.status(401).send({ error: "Es necesario el token de autenticación" })
    } else {
        JWT.verify(token, secret, async (error, user) => {
            if (error) {
                return res.json({ message: 'token invalido' });
            } else {
                try {
                    const connection = mysql.createConnection(dbConfig);
                    connection.query('SELECT nombre, imagen FROM personajes', function (error, result) {
                        res.send(result);
                        console.log(result);
                    })
                } catch (error) {
                    res.send(error);
                    console.log(error);
                }
            }
        })
    }
})

router.post('/crearPersonaje', [multer.single('imagen')], (req, res) => {
    let file = req.file;
    let personaje = req.body;
    let nombre = personaje.nombre;
    let edad = parseInt(personaje.edad);
    let peso = parseFloat(personaje.peso);
    let historia = personaje.historia;
    const token = req.headers['x-access-token'];
    if (!token) {
        res.status(401).send({ error: "Es necesario el token de autenticación" });
    } else {
        JWT.verify(token, secret, async (error, user) => {
            if (error) {
                return res.json({ message: 'token invalido' });
            } else {
                if (!req.file) {
                    res.send('No se adjunto ninguna imagen');
                } else {
                    let path = file.path;
                    try {
                        const connection = mysql.createConnection(dbConfig);
                        connection.query(`INSERT INTO personajes (imagen, nombre, edad, peso, historia) 
                        VALUES (?, ?, ?, ?, ?)`, [path, nombre, edad, peso, historia],
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
                    }
                }
            }
        })
    }
})

router.put('/modificarPersonaje/:id', async (req, res) => {
    let id = req.params.id;
    let consulta = "SELECT * FROM personajes WHERE idPersonaje = " + id;
    const personaje = await query(consulta);
    let nvaInformacion = req.body;
    let nvaInfoArray = [
        nombre = nvaInformacion.nombre === undefined ? personaje[0].nombre : nvaInformacion.nombre,
        edad = nvaInformacion.edad === undefined ? personaje[0].edad : parseInt(nvaInformacion.edad),
        peso = nvaInformacion.peso === undefined ? personaje[0].peso : parseFloat(nvaInformacion.peso),
        historia = nvaInformacion.historia === undefined ? personaje[0].historia : nvaInformacion.historia
    ];
    const token = req.headers['x-access-token'];
    if (!token) {
        res.status(401).send({ error: "Es necesario el token de autenticación" });
    } else {
        JWT.verify(token, secret, (error, user) => {
            if (error) {
                throw error;
            } else {
                try {
                    console.log("nvaInfoArray");
                    console.log(nvaInfoArray);
                    connectionSQL.query(`UPDATE personajes SET nombre = ?, edad = ?, peso = ?,
                    historia = ? WHERE idPersonaje = ` + id + `;`, nvaInfoArray, function (error, result) {
                        if (error) {
                            throw error;
                        } else {
                            res.send(result);
                        }
                    })
                } catch (error) {
                    res.send(error);
                }
            }
        })
    }
})

router.delete('/eliminarPersonaje/:id', (req, res) => {
    let id = req.params.id;
    const token = req.headers['x-access-token'];
    if (!token) {
        res.status(401).send({ error: "Es necesario el token de autenticación" });
    } else {
        JWT.verify(token, secret, (error, user) => {
            if (error) {
                throw error;
            } else {
                try {
                    const connection = mysql.createConnection(dbConfig);
                    connection.query('DELETE FROM personajes WHERE idPersonaje = ?', [id], function (error, result) {
                        if (error) {
                            throw error;
                        } else {
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