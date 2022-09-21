const docsModel = require('../models/docsModel');
const express = require('express');
const router = express.Router();

router.get("/", async (request, response) => {
    await docsModel.getDocs(response);
});

router.post("/", async (request, response) => {
    await docsModel.newDoc(request, response);
});

router.delete("/", async (request, response) => {
    await docsModel.deleteDoc(request, response);
});

module.exports = router;
