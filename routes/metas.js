const express = require("express");
const api = require("../api/api")
const app = express.Router();
const verificacao = require("../api/token/autorizacao");


app.post("/cadastroMeta", verificacao, function(req, res) {
    console.log(req.body)
    api.inserirMeta(req, res);
})



module.exports = app;
