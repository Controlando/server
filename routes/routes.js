const express = require("express");
const api = require("../api/api")
const app = express.Router();

app.get("/", function(req, res) {
    console.log("Rota incial de get");
    res.sendStatus(200);
});

module.exports = app;