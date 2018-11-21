const express = require("express");
const api = require("../api/api")
const app = express.Router();
const verificacao = require("../api/token/autorizacao");

app.post("/cadastroDespesa", verificacao, function(req, res) {
    console.log(req.body)
    api.inserirDespesa(req, res);
});


module.exports = app;
