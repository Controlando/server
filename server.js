const express = require("express");
const app = express();
const routes = require("./routes/routes");
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(routes);
app.use("/despesa", require("./routes/despesa."))
app.use("/meta", require("./routes/metas"))
app.use("/receita", require("./routes/receita"))
app.use(function (req, res, next) {

    // Website you wish to allow to connect

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', '*');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
app.listen(3000, "200.0.0.9", function() {
    console.log("Servidor funcionando na porta"+ JSON.stringify(this.address()));
});
