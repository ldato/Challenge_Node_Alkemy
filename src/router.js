const authRouter = require('../routes/auth/routes');
const generoRouter = require('../routes/genero/routes');
const charactersRouter = require('../routes/characters/routes');
const moviesRouter = require('../routes/movies/router');


function router (app) {
    app.use('/auth', authRouter);
    app.use('/genero', generoRouter);
    app.use('/characters', charactersRouter);
    app.use('/movies', moviesRouter);
}

module.exports = router;