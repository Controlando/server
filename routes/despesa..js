const express = require("express");
const api = require("../api/api")
const app = express.Router();
const verificacao = require("../api/token/autorizacao");

app.post("/inserirDespesa", verificacao, function(req, res) {
    api.inserirDespesa(req, res);
});


module.exports = app;
