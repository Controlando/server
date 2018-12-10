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
app.get("/listaReceita", verificacao, function (req, res) {
    console.log(req.headers["token"])
    api.listarReceita(req, res);
});
app.get("/getReceita", verificacao, function (req, res) {
    api.getReceita(req, res);
});
app.get("/getSaldo", verificacao, function (req, res) {
    api.getSaldo(req, res);
});
app.put("/alterarReceita", verificacao, function (req, res) {
    console.log('a')
    api.alterarReceita(req, res);
});
app.delete("/deletarReceita", verificacao, function (req, res) {
    api.deletarReceita(req, res);
})
module.exports = app;
