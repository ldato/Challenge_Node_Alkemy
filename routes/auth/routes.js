const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const bodyParser = require('body-parser');
const dbConfig = require('../../dbConfig');
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');
const secret = require('../../config');
const nodemailer = require('nodemailer');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'challengealkemy1@gmail.com',
        pass: 'luciano.2022'
    },
    tls: { rejectUnauthorized: false }
});


router.post('/register', async (req, res) => {
    const user = req.body;
    let username = user.nombre;
    let pass = await bcrypt.hash(user.password, 10);
    let email = user.email;
    let userArray = [
        username,
        pass,
        email
    ]

    const connection = mysql.createConnection(dbConfig);
    connection.connect(async function (error, result) {
        if (error) {
            throw error;
        } else {
            connection.query('INSERT INTO usuarios (nombre, pass, email) VALUES (?, ?, ?)', userArray,
                function (error, result) {
                    if (error) throw error;
                    //res.send(result);
                    console.log(result);
                    if (result.insertId) {
                        res.send("El usuario fue creado con éxito con el id: " + result.insertId)
                        console.log(user.email)
                        let mailOptions = {
                            from: "challengealkemy@gmail.com",
                            to: user.email,
                            subject: "Bienvenido a Alkemy",
                            text: "Con este email te damos la bienvenida al challenge de Alkemy."
                        }

                        transporter.sendMail(mailOptions, function (error, info) {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log('Email enviado: ' + info.response);
                            }

                        })
                    }
                })
        }

    })
})

router.post('/login', async (req, res) => {
    const user = req.body;
    let username = user.nombre;
    let pass = user.password;
    let tokenId;
    const connection = mysql.createConnection(dbConfig);
    connection.connect(async function (error, result) {
        if (error) {
            throw error;
        } else {
            await connection.query('SELECT * FROM usuarios WHERE nombre = ?', [username],
            async function (error, result) {
                console.log(result.length)
                if (result.length>0) {
                    const match = await bcrypt.compare(pass, result[0].pass);
                    if (match) {
                        const token = JWT.sign({id: tokenId}, secret, {
                            expiresIn: 86400 //expira en 24 horas
                        });
                        res.send({auth: true, token: token});
                        console.log("El usuario se ha logeado con éxito")
                    } else {
                        res.send("Usuario o password incorrecto");
                    }
                } else {
                    res.send("Usuario o password incorrecto");
                }
            })
        }
    })
})

module.exports = router;