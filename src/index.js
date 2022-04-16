const express = require('express');
const router = require('./router');
const cors = require('cors');

const app = express();

const port = 3004;

app.use(cors());

router(app);

app.listen(port, () => {
    console.log("Server running on port " + port);
})