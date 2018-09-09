const express = require("express");
const api = require("../api/api")
const app = express.Router();
const verificacao = require("../api/token/autorizacao");
app.post("/loginArray", function(req, res) {
    console.log("Rota incial de get");
    api.loginArray(req, res);
});
app.post("/Cadastro", function(req, res) {
    api.cadastroUsuario(req, res);
});
app.post('/teste', function(req, res) {
    console.log('Rota de teste para', JSON.stringify(req.body))
    res.status(200).json({email: req.body.email, senha: req.body.senha, token: "TOKEN PARA DESCRIPTOGRAFAR"});
});
app.post('/cadastroArray', function(req, res) {
    console.log(JSON.stringify("Body: "+req.body));
    api.cadastroArray(req, res);
});

module.exports = app;