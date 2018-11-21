
var con = mysql.createConnection({
    user: "root",
    password: "root",
    database: 'controlando'
});

con.connect(function(err) {
    if (err) {
        console.log((err))
        console.log("Erro de conexao");
    } else {
        console.log("Connected!");
    }

});

module.exports = con;
