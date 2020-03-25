const express = require('express');
const session = require('express-session');
const KnexStore = require('connect-session-knex')(session);
const apiRouter = require('./api/api-router');
const usersRouter = require('./users/users-router.js')
const restricted = require('./auth/restricted-middleware.js');
const knex = require('./data/dbConfig.js');
const configureMiddleware = require('./config/configure-middleware.js');
const server = express();

configureMiddleware(server);

const sessionConfig = {
    name: 'monster',
    secret: 'secrets dont make friends',
    resave: false,
    saveUnitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 30,
        secure: false,
        httpOnly: true
    },
    store: new KnexStore ({
        knex,
        tablename: 'sessions',
        createtable: true,
        sidfieldname: 'sid',
        clearInterval: 1000 * 60 * 30
    })
};

server.use(session(sessionConfig))

server.use('/api', apiRouter)
server.use('/api/users', restricted, checkRole('hr'), usersRouter);

server.get('/', (req, res) => {
  res.send("It's alive!");
});

function checkRole(role) {
  return (req, res, next) => {
    req.decodedToken && 
    req.decodedToken.role &&
    req.decodedToken.role.toLowerCase() === role
    ? next()
    : res.status(403).json({ error: "you do not have the right credentials" });
  }
}

module.exports = server;