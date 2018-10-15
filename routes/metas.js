const express = require("express");
const api = require("../api/api")
const app = express.Router();
const verificacao = require("../api/token/autorizacao");


app.post("/inserirMeta", verificacao, function(req, res) {
    api.inserirMeta(req, res);
})



module.exports = app;
