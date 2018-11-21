const express = require("express");
const api = require("../api/api")
const app = express.Router();
const verificacao = require("../api/token/autorizacao");


app.post("/cadastroReceita", verificacao, function (req, res) {
    console.log(req.body);
    api.inserirReceita(req, res);
});
app.get("/listar", verificacao, function (req, res) {
    api.listarDados(req, res);
});
module.exports = app;
