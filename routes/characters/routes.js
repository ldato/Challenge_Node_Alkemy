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
    let nombre = req.query.name;
    let edad = parseInt(req.query.age);
    let movies = parseInt(req.query.idMovie);
    let consulta = "";
    let parametro = [];
    const token = req.headers['x-access-token'];
    if (!token) {
        res.status(401).send({ error: "Es necesario el token de autenticación" })
    } else {
        JWT.verify(token, secret, async (error, user) => {
            if (error) {
                return res.json({ message: 'token invalido' });
            } else {
                try {
                    let querySinParametros = `SELECT a.idPersonaje, a.imagen, a.nombre, a.edad, a.peso, a.historia, b.titulo 
                    FROM personajes a
                    JOIN peliculaspersonajes c ON a.idPersonaje = c.idPersonaje
                    JOIN peliculasseries b ON c.idPeliculaSerie =  b.idPeliculaSerie`;
                    let queryConParametros = `SELECT a.idPersonaje, a.imagen, a.nombre, a.edad, a.peso, a.historia, b.titulo 
                    FROM personajes a
                    JOIN peliculaspersonajes c ON a.idPersonaje = c.idPersonaje
                    JOIN peliculasseries b ON c.idPeliculaSerie =  b.idPeliculaSerie WHERE `;
                    let condicionWhere = ""
                    if ((req.query.name === undefined || req.query.name === "") && (req.query.age === undefined || req.query.age === "") && (req.query.idMovie === undefined || req.query.idMovie === "")) {
                        consulta = querySinParametros;
                    } else {
                        consulta = queryConParametros;
                        if ((req.query.name !== undefined || req.query.name !== "") && (req.query.age === undefined || req.query.age === "") && (req.query.idMovie === undefined || req.query.idMovie === "")) {
                            condicionWhere = "a.nombre LIKE ?";
                            parametro.push(nombre);
                        }
                        if ((req.query.name === undefined || req.query.name === "") && (req.query.age !== undefined || req.query.age !== "") && (req.query.idMovie === undefined || req.query.idMovie === "")) {
                            condicionWhere = "a.edad = ?";
                            parametro.push(edad);
                        }
                        if ((req.query.name === undefined || req.query.name === "") && (req.query.age === undefined || req.query.age === "") && (req.query.idMovie !== undefined || req.query.idMovie !== "")) {
                            condicionWhere = " b.idPeliculaSerie = ?";
                            parametro.push(movies);
                        }
                    }
                    let consultaFinal = consulta + condicionWhere;
                    let response = await query(consultaFinal, parametro);
                    console.log(response);
                    res.send(response);

                } catch (error) {
                    res.send(error);
                    console.log(error);
                }
            }
        })
    }
})


//ESTE ENDPOINT TRATA DE SEGUIR LA CONSIGNA DE BUSCAR POR NOMBRE Y LUEGO APLICAR LOS FILTROS DE EDAD Y PELICULA
router.get('/queryParameters/:nombre', async (req, res) => {
    let nombre = req.params.nombre;
    let edad = parseInt(req.query.edad);
    let movies = parseInt(req.query.idMovie);
    let parametros = [nombre];
    let condicion = "";
    let consulta = "";

    let querySinCond = `SELECT a.idPersonaje, a.imagen, a.nombre, a.edad, a.peso, a.historia, b.titulo 
    FROM personajes a
    JOIN peliculaspersonajes c ON a.idPersonaje = c.idPersonaje
    JOIN peliculasseries b ON c.idPeliculaSerie =  b.idPeliculaSerie
    WHERE a.nombre LIKE ?`;

    let queryConCond = `SELECT a.idPersonaje, a.imagen, a.nombre, a.edad, a.peso, a.historia, b.titulo 
    FROM personajes a
    JOIN peliculaspersonajes c ON a.idPersonaje = c.idPersonaje
    JOIN peliculasseries b ON c.idPeliculaSerie =  b.idPeliculaSerie
    WHERE a.nombre LIKE ? AND `;

    if ((req.query.edad === undefined || req.query.edad === "") && (req.query.idMovie === undefined || req.query.idMovie === "")) {
        consulta = querySinCond;
    } else {
        consulta = queryConCond;
        if ((req.query.edad !== undefined || req.query.edad !== "") && (req.query.idMovie === undefined || req.query.idMovie === "")) {
            condicion = "a.edad = ?";
            parametros.push(edad);
        }
        if ((req.query.edad === undefined || req.query.edad === "") && (req.query.idMovie !== undefined || req.query.idMovie !== "")) {
            condicion = "b.idPeliculaSerie = ?";
            parametros.push(movies);
        }
    }
    let consultaFinal = consulta + condicion;

    let response = await query(consultaFinal, parametros);
    //console.log(response);
    res.send(response);

    console.log(consultaFinal, parametros);
})
//---------------------------------------------------------------------------------------------------------------


router.get('/detallePersonaje/:id', (req, res) => {
    let id = req.params.id;
    const token = req.headers['x-access-token'];
    if (!token) {
        res.status(401).send({ error: "Es necesario el token de autenticación" })
    } else {
        JWT.verify(token, secret, async (error, user) => {
            if (error) {
                return res.json({ message: 'token invalido' });
            } else {
                try {
                    let consultaDetalle = `SELECT a.idPersonaje, a.imagen, a.nombre, a.edad, a.peso, a.historia, b.titulo 
                    FROM personajes a
                    JOIN peliculaspersonajes c ON a.idPersonaje = c.idPersonaje
                    JOIN peliculasseries b ON c.idPeliculaSerie =  b.idPeliculaSerie
                    WHERE a.idPersonaje = ?;`
                    let peliculas = [];
                    let detalle = await query(consultaDetalle, [id]);
                    for (let i = 0; i < detalle.length; i++) {
                        let pelicula = detalle[i].titulo;
                        peliculas.push(pelicula);
                    }
                    let response = {
                        "nombre": detalle[0].nombre,
                        "edad": detalle[0].edad,
                        "peso": detalle[0].peso,
                        "historia": detalle[0].historia,
                        "peliculas": peliculas
                    }
                    console.log(response);
                    res.send(response);
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
    const token = req.headers['x-access-token'];
    if (!token) {
        res.status(401).send({ error: "Es necesario el token de autenticación" });
    } else {
        JWT.verify(token, secret, async (error, user) => {
            if (error) {
                return res.json({ message: "token invalido" });
            } else {
                try {
                    let consulta = "SELECT * FROM personajes WHERE idPersonaje = ?";
                    const personaje = await query(consulta, [id]);
                    let nvaInformacion = req.body;
                    let nvaInfoArray = [
                        nombre = nvaInformacion.nombre === undefined ? personaje[0].nombre : nvaInformacion.nombre,
                        edad = nvaInformacion.edad === undefined ? personaje[0].edad : parseInt(nvaInformacion.edad),
                        peso = nvaInformacion.peso === undefined ? personaje[0].peso : parseFloat(nvaInformacion.peso),
                        historia = nvaInformacion.historia === undefined ? personaje[0].historia : nvaInformacion.historia
                    ];
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
        JWT.verify(token, secret, async (error, user) => {
            if (error) {
                return res.json({ message: 'token invalido' });
            } else {
                try {
                    let consultaDelAsoc = 'DELETE FROM peliculaspersonajes WHERE idPersonaje = ?';
                    let consultaPersonaje = 'DELETE FROM personajes WHERE idPersonaje = ?';
                    let queryTabla1 = await query(consultaDelAsoc, [id]);
                    let queryTabla2 = await query(consultaPersonaje, [id]);
                    if (queryTabla1 && queryTabla2) {
                        res.status(200).send({ message: "El personaje fue eliminado con éxito" });
                    } else {
                        res.status(400).send({ message: "A ocurrido un error al eliminar el personaje" });
                    }

                } catch (error) {

                }
            }
        })
    }
})

module.exports = router;