const axios = require('axios');
const bcrypt = require ('bcryptjs');
const Users = require('../users/users-model.js');
const secret = require('./secrets.js');
const jwt = require('jsonwebtoken');

const { authenticate } = require('../auth/authenticate');

module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};

function generateToken(user) {
  const payload = {
    subject: user.id, // subject in payload
    username: user.username
  };

  const options = {
    expiresIn: '1d'
  };
  return jwt.sign(payload, secret.jwtSecret, options);
}
//
function register(req, res) {
  // implement user registration
  let user = req.body;
  const hash = bcrypt.hashSync(user.password, 10);
  user.password = hash

  Users.add(user)
    .then(saved => {
      res.status(201).json(saved);
    })
    .catch(error => {
      res.status(500).json(error)
    });
}

function login(req, res) {
  // implement user login
  let {username, password} = req.body;

  Users.findBy({username})
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)){
        const token = generateToken(user);
        res.status(200).json({
          message: `Welcome ${user.username} to the FunHouse`,
          token
        });
      }else{
        res.status(401).json({message: `Credentiales No Bueno`})
      }
    })
    .catch(error =>{
      res.status(500).json(error);
    })
}

function getJokes(req, res) {
  const requestOptions = {
    headers: { accept: 'application/json' },
  };

  axios
    .get('https://icanhazdadjoke.com/search', requestOptions)
    .then(response => {
      res.status(200).json(response.data.results);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
}
