const authModel = require('../models/authModel');

const express = require('express');
const router = express.Router();

router.post('/login', (request, response) => {
    authModel.login(request, response);
});

router.post('/register', (request, response) => {
    authModel.register(request, response);
});

router.post('/logout', (request, response) => {
    authModel.logout(response);
});

module.exports = router;
