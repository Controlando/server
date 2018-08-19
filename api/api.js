const jwt = require("jsonwebtoken");
const mysql = require("mysql");
const serverError = {success: false, message: "Erro interno de servidor"},
        notFound = {success: false, message: "Usuario nao encontrado no servidor"};
const config = require("../secretKey/config");
const servicoEmail = require("./email/email");
const bcrypts = require("bcryptjs");
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
        let user = {email: req.body.email, senha: req.body.senha};
        const sql = "SELECT id, senha FROM usuario WHERE email = ?"
        con.query(sql, [user.email], function(err, row) {
            if (err) {
                res.status(500).json(serverError);
            } else {
                if (row.length == 0) {
                    res.status(404).json(notFound);
                } else {
                    if (row.length == 1) {
                        let compara = bcrypts.compareSync(user.senha, row[0].senha);
                        if (compara == true) {
                            let userLogin = {nome: row[0].nome, id: row[0].id, token: undefined};
                            userLogin.token = jwt.sign({nome: userLogin.nome, id: userLogin.id}, config.secret, {
                                expiresIn: 86400//um dia 
                            });
                            res.status(200).json(userLogin);
                    
                        } else {
                            res.status(404).json(notFound);
                        }
                    }
                }
            }
        });
    }, 
    cadastroUsuario(req, res) {
        let user = {email: req.body.email, senha: req.body.senha, nome : req.body.nome}
        const sql = "SELECT id FROM usuario WHERE email = ?"
        let senhaHash = bcrypts.hashSync(user.senha, 8);
        con.query(sql, [user.email], function(err, row) {
            if (err) {
                res.status(500).json(serverError);
            } else {
                if (row.length == 1) {
                    res.status(409).json({success: false, message: "Usuario ja cadastrado no banco"});
                } else {
                    if (row.length == 0) {
                        sql = "INSERT INTO usuario(nome, email, senha) VALUES(?, ?, ?)";
                        con.query(sql, [user.nome, user.email, senhaHash], function(err, row) {
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