const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 
const { jwtSecret } = require('../config/secrets.js')
const Users = require('../users/users-model.js');

router.post('/register', (req, res) => {
  let user = req.body;
  const hash = bcrypt.hashSync(user.password, 10); // 2 ^ n
  user.password = hash;

  Users.add(user)
    .then(saved => {
      res.status(201).json(saved);
    })
    .catch(({name, code, message, stack}) => {
      res.status(500).json({name, code, message, stack});
    });
});

router.post('/login', (req, res) => {
  let { username, password } = req.body;

  Users.findBy({ username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        const token = genToken(user);

        res.status(200).json({
          message: `Welcome ${user.username}!`,
          token
        });
      } else {
        res.status(401).json({ message: 'Invalid Credentials' });
      }
    })
    .catch(({name, code, message, stack}) => {
      res.status(500).json({name, code, message, stack}); // helps troubleshoot errors
    });
});

function genToken(user) {
  const payload ={
    sub: user.id,
    username: user.username,
    department: user.department || undefined,
    role: user.role || 'user'
  };
  const options = {
    expiresIn: '1h',
  };

  return jwt.sign(payload, jwtSecret, options);
}

module.exports = router;