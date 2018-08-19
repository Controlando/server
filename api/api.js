const jwt = require("jsonwebtoken");
const mysql = require("mysql");
const serverError = {success: false, message: "Erro interno de servidor"},
        notFound = {success: false, message: "Usuario nao encontrado no servidor"};
const config = require("../secretKey/config");
const servicoEmail = require("./email/email");
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "controlando"
  });
  
  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
  });

const api = {
    login(req, res) {
        let user = {email: req.body.email, password: req.body.password};
        const sql = "SELECT id FROM usuario WHERE email = ? AND password = ?"
        con.query(sql, [user.email, user.password], function(err, row) {
            if (err) {
                res.status(500).json(serverError);
            } else {
                if (row.length == 0) {
                    res.status(404).json(notFound);
                } else {
                    if (row.length == 1) {
                        let userLogin = {nome: row[0].nome, id: row[0].id, token: undefined};
                        userLogin.token = jwt.sign({nome: userLogin.nome, id: userLogin.id}, config.secret, {
                            expiresIn: 86400//um dia 
                        });
                        res.status(200).json(userLogin);
                    }
                }
            }
        });
    }, 
    cadastroUsuario(req, res) {
        let user = {email: req.body.email, senha: req.body.senha, nome : req.body.nome}
        const sql = "SELECT id FROM usuario WHERE email = ? AND password = ?"
        con.query(sql, [user.email, user.senha], function(err, row) {
            if (err) {
                res.status(500).json(serverError);
            } else {
                if (row.length == 1) {
                    res.status(409).json({success: false, message: "Uusuario ja cadastrado no banco"});
                } else {
                    if (row.length == 0) {
                        sql = "INSERT INTO usuario(nome, email, senha) VALUES(?, ?, ?)";
                        con.query(sql, [user.nome, user.email, user.senha], function(err, row) {
                            if (err) {
                                res.status(500).json(serverError);
                            } else {
                                if (row.affectedRows == 1) {
                                    res.status(200).json({success: true, message: "Um email esta sendo enviado para voce, cheque seu email durante os proximos minutos"});
                                } else {
                                    servicoEmail.Destino.to = user.email;
                                    servicoEmail.Destino.text = "Bem vindo ao controlando";
                                    servicoEmail.Destino.subject = "Conta criadaaaaaaaa";
                                    servicoEmail.funcao.envioEmail(req, res, servicoEmail.Destino, function() {
                                        res.status(200).json({success: true, message: "Registro realizado"});
                                    });
                                }
                            }
                        });
                    }
                }
            }
        });
    }
}

module.exports = api;