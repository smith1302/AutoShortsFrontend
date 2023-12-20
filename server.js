require('module-alias/register');

const next = require('next');
const express = require('express');
const path = require('path');
const dotenv = require('dotenv').config();
const cors = require("cors");

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = express()
    server.use(cors());
    
    server.all('*', (req, res) => {
        return handle(req, res)
    });
    
    server.listen(port, (err) => {
        if (err) throw err
        console.log('> Ready on http://localhost:'+port);
    });
    
    return app;
})
.catch((ex) => {
    console.error(ex.stack)
    process.exit(1)
})