const express = require("express");
const api = require("../api/api")
const app = express.Router();
const verificacao = require("../api/token/autorizacao");
app.post("/login", function(req, res) {
    console.log("Rota incial de get");
    api.login(req, res);
});
app.post("/Cadastro", function(req, res) {
    api.cadastroUsuario(req, res);
});
module.exports = app;