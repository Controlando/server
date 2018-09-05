const jwt = require("jsonwebtoken");
const mysql = require("mysql");
const serverError = {success: false, message: "Erro interno de servidor"}, notFound = {success: false, message: "Usuario nao encontrado no servidor"};
const config = require("../secretKey/config");
const servicoEmail = require("./email/email");
const bcrypts = require("bcryptjs");
var nodemailer = require('nodemailer');
const User = require('../classes/user');


var transporte = nodemailer.createTransport({
  service: 'Hotmail',
  auth: {
    user: 'controlandoFinancas@hotmail.com',
    pass: 'PocsLindas2018@'
  }
});



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
        let user = {email: req.body.email};
        const sql = "SELECT id, senha FROM usuario WHERE email = ?"
        console.log(JSON.stringify(user));
        res.status(200).json({email: user.email});
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
        let sql = "SELECT id FROM usuario WHERE email = ?"
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
                                    
                                    var Destino = {
                                        from: 'daniel_dbz@hotmail.com',
                                        to: user.email,
                                        subject: 'Bem vindo ao controlando',
                                        text: 'Seja bem vindo ao controlando, sua vida financeira começa aqui !!'
                                    }
                                    transporte.sendMail(Destino, function(error, informacao){
                                            if (error) {
                                                console.log(error, informacao);
                                                res.status(500).json({success: false, message: "erro no envio do email"});
                                            } else {
                                                res.status(200).json({success: true, message: "Um email esta sendo enviado para voce, cheque seu email durante os proximos minutos"});
                                            }
                                        });
                                } else {
                                    
                                    res.status(200).json({success: true, message: "Registro nao realizado"});
                                
                                }
                            }
                        });
                    }
                }
            }
        });
    },
    cadastroUsuarioNoEmail(req, res) {
        let data = {nome: req.body.nome, email: req.body.email, senha: req.body.senha}
        let sql = 'SELECT id FROM user WHERE email = ?';
        let senhaHash = bcrypts.hashSync(data.senha, 8);
        if ((data.name == '') || (data.name == undefined) || (data.email == '') || (data.email == undefined) || (data.senha == '') || (data.senha == undefined) ) {
            res.status(200).json( {success: false, message: 'Dados incompletos'} );
        }
        con.query(sql, [data.email], function(err, row) {
            if (err) {
                res.status(500).json(serverError);
            } else {
                if (row.length == 1) {
                    res.status(200).json({success: true, message: 'Usuario já cadastrado no sistema'});
                } else {
                    if (row.length == 0) {
                        let user = new User(data.nome, data.senha, data.email);
                        sql = 'INSERT INTO user(nome, email, senha) VALUES(?, ?, ?)'
                        con.query(sql, [user.getNome, user.getEmail, user.getSenha], function(err, row) {
                            if (err) {
                                res.status(500).json(serverError);
                            } else {
                                if (row.affectedRows == 0) {
                                    res.status(404).json({ success: false, message: 'Cadastro nao efetuado'});
                                } else {
                                    if (row.affectedRows == 1) {
                                        res.status(404).json({ success: false, message: 'Cadastro efetuado efetuado'});
                                    }
                                }
                            }
                        });
                    }
                }
            }
        })
    }
}

module.exports = api;