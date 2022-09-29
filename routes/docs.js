const docsModel = require('../models/docsModel');
const authModel = require('../models/authModel');

const express = require('express');
const router = express.Router();

router.get("/",
    (request, response, next) => authModel.checkToken(request, response, next),
    (request, response) => docsModel.getDocs(request, response)
);

router.post("/",
    (request, response, next) => authModel.checkToken(request, response, next),
    (request, response) => docsModel.newDoc(request, response)
);

router.put("/allow",
    (request, response, next) => authModel.checkToken(request, response, next),
    (request, response) => docsModel.allowUser(request, response)
);

router.delete("/",
    (request, response, next) => authModel.checkToken(request, response, next),
    (request, response) => docsModel.deleteDoc(request, response)
);

module.exports = router;
