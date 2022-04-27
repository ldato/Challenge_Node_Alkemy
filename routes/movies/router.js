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
const query = util.promisify(connectionSQL.query).bind(connectionSQL); //para usar async await con mysql

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

//----------------------------------------ORIGINAL--------------------------------------------------------
// router.get('/', (req, res) => {
//     const token = req.headers['x-access-token'];
//     if (!token) {
//         res.status(401).send({ error: "Es necesario el token de autenticación" });
//     } else {
//         JWT.verify(token, secret, (error, user) => {
//             if (error) {
//                 return res.json({ message: "Token invalido" });
//             } else {
//                 try {
//                     const connection = mysql.createConnection(dbConfig);
//                     connection.query('SELECT imagen, titulo, fechaCreacion FROM peliculasseries;',
//                         function (error, result) {
//                             if (error) {
//                                 throw error;
//                             } else {
//                                 console.log(result);
//                                 res.send(result);
//                             }
//                         })
//                 } catch (error) {
//                     res.send(error);
//                 }
//             }
//         })
//     }
// })
//---------------------------------------------------------------------------------------------------------------
router.get('/', async (req, res) => {
    let titulo = req.query.name;
    let genero = parseInt(req.query.genre);
    let order = "ORDER BY a.titulo ASC";
    let consulta = "";
    let parametros = [];
    let condicion = "";
    let orden = "";
    const token = req.headers['x-access-token'];
    if (!token) {
        res.status(401).send({ error: "Es necesario el token de autenticación" });
    } else {
        JWT.verify(token, secret, async (error, user) => {
            if (error) {
                return res.json({ message: "Token invalido" });
            } else {
                try {
                    let querySinCondicion = `SELECT a.idPeliculaSerie, a.imagen, a.titulo, a.fechaCreacion, a.calificacion, c.nombre AS genero, d.nombre AS personaje
                    FROM peliculasseries a 
                    JOIN generos c ON a.idGenero = c.idGenero
                    JOIN peliculaspersonajes b ON a.idPeliculaSerie = b.idPeliculaSerie
                    JOIN personajes d ON b.idPersonaje = d.idPersonaje `;
                    let queryNombreCondicion = `SELECT a.idPeliculaSerie, a.imagen, a.titulo, a.fechaCreacion, a.calificacion, c.nombre AS genero, d.nombre AS personaje
                    FROM peliculasseries a 
                    JOIN generos c ON a.idGenero = c.idGenero
                    JOIN peliculaspersonajes b ON a.idPeliculaSerie = b.idPeliculaSerie
                    JOIN personajes d ON b.idPersonaje = d.idPersonaje 
                    WHERE a.titulo LIKE ? `;
                    let queryConCondicion = `SELECT a.idPeliculaSerie, a.imagen, a.titulo, a.fechaCreacion, a.calificacion, c.nombre AS genero, d.nombre AS personaje
                    FROM peliculasseries a 
                    JOIN generos c ON a.idGenero = c.idGenero
                    JOIN peliculaspersonajes b ON a.idPeliculaSerie = b.idPeliculaSerie
                    JOIN personajes d ON b.idPersonaje = d.idPersonaje WHERE c.idGenero = ? `;
                    if ((req.query.name === undefined || req.query.name === "") && (req.query.genre === undefined || req.query.genre === "") && (req.query.order === undefined || req.query.order === "")) {
                        consulta = querySinCondicion;
                    } else {                        
                        if ((req.query.name !== undefined || req.query.name !== "") && (req.query.genre === undefined || req.query.genre === "") && (req.query.order === undefined || req.query.order === "")) {
                            consulta = queryNombreCondicion;
                            parametros.push(titulo);
                        }
                        if ((req.query.name === undefined || req.query.name === "") && (req.query.genre !== undefined || req.query.genre !== "") && (req.query.order === undefined || req.query.order === "")) {
                            consulta = queryConCondicion;
                            //condicion = "c.idGenero = ? ";
                            parametros.push(genero);
                        }
                        if ((req.query.name === undefined || req.query.name === "") && (req.query.genre === undefined || req.query.genre === "") && (req.query.order !== undefined || req.query.order !== "")) {
                            consulta = querySinCondicion;
                            order ="ORDER BY a.titulo DESC"
                        }
                    }
                    let consultaFinal = consulta + order;
                    let response = await query(consultaFinal, parametros)
                    res.send(response);
                    console.log(response);
                    console.log(consultaFinal);
                } catch (error) {
                    res.send(error);
                }
            }
        })
    }
})



//MEDIANTE ESTE ENDPOINT SE BUSCA POR TITULO, SE FILTRA POR GENERO Y SE ORDENA DE MANERA ASCENDENTE O DESCENDENTE
router.get('/queryParameters/:titulo', async (req, res) => {
    let titulo = req.params.titulo;
    let genero = parseInt(req.query.idGenero);
    let orden = req.query.order;
    let parametros = [titulo];
    let condicion = "";
    let order = "ORDER BY a.titulo ASC"
    let consulta = "";
    let querySinCondicion = `SELECT a.idPeliculaSerie, a.imagen, a.titulo, a.fechaCreacion, a.calificacion, c.nombre AS genero, d.nombre AS personaje
    FROM peliculasseries a 
    JOIN generos c ON a.idGenero = c.idGenero
    JOIN peliculaspersonajes b ON a.idPeliculaSerie = b.idPeliculaSerie
    JOIN personajes d ON b.idPersonaje = d.idPersonaje
    WHERE a.titulo LIKE ?`;
    let queryConCondicion = `SELECT a.idPeliculaSerie, a.imagen, a.titulo, a.fechaCreacion, a.calificacion, c.nombre AS genero, d.nombre AS personaje
    FROM peliculasseries a 
    JOIN generos c ON a.idGenero = c.idGenero
    JOIN peliculaspersonajes b ON a.idPeliculaSerie = b.idPeliculaSerie
    JOIN personajes d ON b.idPersonaje = d.idPersonaje 
    WHERE a.titulo LIKE ? `;

    if ((req.query.idGenero === undefined || req.query.idGenero === "") && (req.query.order === undefined || req.query === "")) {
        consulta = querySinCondicion;
    } else {
        consulta = queryConCondicion;
        if ((req.query.idGenero !== undefined || req.query.idGenero !== "") && (req.query.orden === undefined || req.query.orden === "")) {
            condicion = " AND c.idGenero = ? ";
            parametros.push(genero);
        }
        if ((req.query.idGenero === undefined || req.query.idGenero === "") && (req.query.orden !== undefined || req.query.orden !== "")) {
            condicion = "";
            orden = "ORDER BY a.titulo DESC";
            // parametros.push(orden);
        }
        if ((req.query.idGenero !== undefined || req.query.idGenero !== "") && (req.query.orden !== undefined || req.query.orden !== "")) {
            condicion = "AND c.idGenero = ? ";
            parametros.push(genero);
            orden = "ORDER BY a.titulo DESC";
            // parametros.push(orden);
        }
    }
    let consultaFinal = consulta + condicion + order;
    let response = await query(consultaFinal, parametros);
    console.log(consultaFinal);
    console.log(response);
    res.send(response);

})

router.post('/crearPelicula', [multer.single('imagen')], (req, res) => {
    let file = req.file;
    let pelicula = req.body;
    let titulo = pelicula.titulo;
    let calificacion = pelicula.calificacion;
    let genero = pelicula.genero;
    let arrayPersonajes = pelicula.personajes;
    let personajesCargar = [];
    let personajesCargados = [];
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
                    //console.log(req.file);
                } else {
                    let path = file.path;
                    console.log(arrayPersonajes);
                    try {
                        for (let i = 0; i < arrayPersonajes.length; i++) {
                            let personaje = "";
                            let consulta = 'SELECT idPersonaje, nombre FROM personajes WHERE nombre =' + JSON.stringify(arrayPersonajes[i]);
                            //console.log(consulta);
                            personaje = await query(consulta);
                            console.log(consulta);
                            console.log(personaje[0]);
                            if (personaje[0] === undefined) {
                                personajesCargar.push(arrayPersonajes[i]);
                                console.log(personajesCargar);
                            }
                            if (personaje[0] !== undefined) {
                                // personajesCargados.push(JSON.stringify(personaje));
                                personajesCargados.push(personaje);
                            }
                        }
                        if (personajesCargar.length === 0) {
                            let insertPelicula = `INSERT INTO peliculasseries (imagen, titulo, fechaCreacion,
                                calificacion, idGenero) VALUES (?, ?, NOW(), ?, ?)`
                            let pelicula = await query(insertPelicula, [path, titulo, calificacion, genero]);
                            let id = await pelicula.insertId;
                            let insertAsociacion = `INSERT INTO peliculaspersonajes (idPersonaje, idPeliculaSerie) VALUES (?, ?)`

                            for (let i = 0; i < personajesCargados.length; i++) {
                                let item = personajesCargados[i];
                                await query(insertAsociacion, [item[0].idPersonaje, id]);
                            }
                            res.send("Se ha insertado la pelicula con sus personajes");
                        } else {
                            res.send('Se deden cargar los siguientes personajes para asociar: ' + personajesCargar + ' para asociar a la pelicula');
                            console.log('Se deden cargar los siguientes personajes para asociar: ' + personajesCargar + ' para asociar a la pelicula');
                            // console.log("A Cargar");
                            // console.log(personajesCargar);
                            // console.log("Cargados");
                            // console.log(personajesCargados);
                        }
                    } catch (error) {
                        res.send(error);
                    }

                }
            }
        })
    }
})

router.get('/detallePelicula/:id', async (req, res) => {
    let id = req.params.id;
    const token = req.headers['x-access-token'];
    if (!token) {
        res.status(401).send({ error: "Es necesario el token de autenticación" })
    } else {
        JWT.verify(token, secret, async (error, user) => {
            if (error) {
                return res.json({ message: "token invalido" });
            } else {
                try {
                    let consultaDetalle = `SELECT a.idPeliculaSerie, a.imagen, a.titulo, a.fechaCreacion, a.calificacion, c.nombre AS genero, d.nombre AS personaje
                        FROM peliculasseries a 
                        JOIN generos c ON a.idGenero = c.idGenero
                        JOIN peliculaspersonajes b ON a.idPeliculaSerie = b.idPeliculaSerie
                        JOIN personajes d ON b.idPersonaje = d.idPersonaje
                        WHERE a.idPeliculaSerie = ?;`
                    let personajes = [];
                    let detalle = await query(consultaDetalle, [id]);
                    for (let i = 0; i < detalle.length; i++) {
                        let personaje = detalle[i].personaje
                        personajes.push(personaje);
                    }
                    let response = {
                        "titulo": detalle[0].titulo,
                        "fechaCreacion": detalle[0].fechaCreacion,
                        "calificacion": detalle[0].calificacion,
                        "genero": detalle[0].genero,
                        "personajes": personajes
                    };
                    console.log(response);
                    res.send(response);
                } catch (error) {
                    res.send(error);
                }
            }
        })
    }
})

router.put('/modificarPelicula/:id', (req, res) => {
    let id = req.params.id;
    const token = req.headers['x-access-token'];
    if (!token) {
        res.status(401).send({ error: "Es necesario es token de autencación" });
    } else {
        JWT.verify(token, secret, async (error, user) => {
            if (error) {
                return res.json({ message: "token invalido" });
            } else {
                try {
                    let consulta = 'SELECT * FROM peliculasseries WHERE idPeliculaSerie = ?';
                    let pelicula = await query(consulta, [id]);
                    let nvaInformacion = req.body;
                    let nvaInfoArray = [
                        titulo = nvaInformacion.titulo === undefined ? pelicula[0].titulo : nvaInformacion.titulo,
                        fechaCreacion = pelicula[0].fechaCreacion,
                        calificacion = nvaInformacion.calificacion === undefined ? pelicula[0].calificacion : nvaInformacion.calificacion,
                        idGenero = nvaInformacion.idGenero === undefined ? pelicula[0].idGenero : nvaInformacion.idGenero,
                        id = id
                    ];
                    let consultaModif = `UPDATE peliculasseries SET titulo = ?, fechaCreacion = ?,
                        calificacion = ?, idGenero = ? WHERE idPeliculaSerie = ?`;
                    let response = await query(consultaModif, nvaInfoArray);
                    res.send(response);
                    console.log(response);
                } catch (error) {
                    res.send(error);
                }
            }
        })
    }
})

router.delete('/eliminarPelicula/:id', async (req, res) => {
    let id = req.params.id;
    const token = req.headers['x-access-token'];
    if (!token) {
        res.status(401).send({ error: "Es necesario el token de autencación" });
    } else {
        JWT.verify(token, secret, async (error, user) => {
            if (error) {
                return res.json({ message: 'token invalido' });
            } else {
                try {
                    let consultaDelAsoc = 'DELETE FROM peliculaspersonajes WHERE idPeliculaSerie = ?';
                    let consultaPelicula = 'DELETE FROM peliculasseries WHERE idPeliculaSerie = ?';
                    let queryTabla1 = await query(consultaDelAsoc, [id]);
                    let queryTabla2 = await query(consultaPelicula, [id]);
                    if (queryTabla1 && queryTabla2) {
                        res.status(200).send({ message: "La pelicula fue eliminada con éxito" });
                    } else {
                        res.status(400).send({ message: "A ocurrido un error al eliminar la pelicula" });
                    }
                } catch (error) {
                    res.send(error);
                }
            }
        })
    }
})

module.exports = router;
