const express = require("express");
const api = require("../api/api")
const app = express.Router();
const verificacao = require("../api/token/autorizacao");
app.post("/login", function(req, res) {
    console.log(JSON.stringify(req.body));
    api.login(req, res);
});
app.post("/Cadastro", function(req, res) {
    console.log(JSON.stringify("sem email:" +JSON.stringify(req.body)));
    api.cadastroUsuarioNoEmail(req, res);
});
app.post('/teste', function(req, res) {
    console.log('Rota de teste para', JSON.stringify(req.body))
    res.status(200).json({email: req.body.email, senha: req.body.senha, token: "TOKEN PARA DESCRIPTOGRAFAR"});
});
app.post('/cadastroArray', function(req, res) {
    console.log(JSON.stringify("Body: "+req.body));
    api.cadastroArray(req, res);
});

app.put("/updateNome", verificacao, function(req, res) {
    api.updateName(req, res);
});

app.put("/updateSenha", verificacao, function(req, res) {
    api.updateSenha(req, res);
});
module.exports = app;