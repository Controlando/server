const express = require("express");
const app = express();
const routes = require("./routes/routes");
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(routes);
app.listen(3000, "200.0.0.5", function() {
    console.log("Servidor funcionando na porta"+ this.address().port);
});