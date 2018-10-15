const express = require("express");
const api = require("../api/api")
const app = express.Router();
const verificacao = require("../api/token/autorizacao");


app.post("/inserirReceita", verificacao, function(req, res) {
    api.inserirReceita(req, res);
});

module.exports = app;
