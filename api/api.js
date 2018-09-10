const jwt = require("jsonwebtoken");
const mysql = require("mysql");
const dataError = {success: false, message: "Erro nos dados"}, serverError = {success: false, message: "Erro interno de servidor"}, notFound = {success: false, message: "Usuario nao encontrado no servidor"};
const config = require("../secretKey/config");
const servicoEmail = require("./email/email");
const bcrypts = require("bcryptjs");
var nodemailer = require('nodemailer');
const User = require('../classes/user');
const database = require('../database/database')

var transporte = nodemailer.createTransport({
  service: 'Hotmail',
  auth: {
    user: 'controlandoFinancas@hotmail.com',
    pass: 'PocsLindas2018@'
  }
});


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

const api = {
    login(req, res) {
        let user = {email: req.body.email, senha: req.body.senha};
        const sql = "SELECT id, senha, nome FROM usuario WHERE email = ?"
        console.log(JSON.stringify(user));
        con.query(sql, [user.email], function(err, row) {
            if (err) {
                console.log(err)
                res.status(500).json(serverError);
            } else {
                if (row.length == 0) {
                    console.log('ASJDHSJHAD')
                    res.status(404).json(notFound);
                } else {
                    if (row.length == 1) {
                        let compara = bcrypts.compareSync(user.senha, row[0].senha);
                        if (compara == true) {
                            console.log('oi')
                            let userLogin = {nome: row[0].nome, id: row[0].id, token: undefined};
                            userLogin.token = jwt.sign({nome: userLogin.nome, id: userLogin.id, email: user.email}, config.secret, {
                                expiresIn: 86400//um dia 
                            });
                            res.status(200).json({success: true, email: user.email, senha: user.senha, token: userLogin.token, nome: userLogin.nome})
                        } else {
                            res.status(404).json({success: false});
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
        let sql = 'SELECT id FROM usuario WHERE email = ?';
        let senhaHash = bcrypts.hashSync(data.senha, 8);
        if ((data.nome == '') || (data.nome == undefined) || (data.email == '') || (data.email == undefined) || (data.senha == '') || (data.senha == undefined) ) {
            console.log(JSON.stringify(data))
            res.status(401).json( {success: false, message: 'Dados incompletos'} );
        } else {
        con.query(sql, [data.email], function(err, row) {
            if (err) {
                res.status(500).json(serverError);
            } else {
                if (row.length == 1) {
                    res.status(409).json({success: true, message: 'Usuario já cadastrado no sistema'});
                } else {
                    if (row.length == 0) {
                        let user = new User(data.nome, data.senha, data.email);
                        sql = 'INSERT INTO usuario(nome, email, senha) VALUES(?, ?, ?)'
                        con.query(sql, [data.nome, data.email, senhaHash], function(err, row) {
                            if (err) {
                                res.status(500).json(serverError);
                            } else {
                                if (row.affectedRows == 0) {
                                    res.status(500).json({ success: false, message: 'Cadastro nao efetuado'});
                                } else {
                                    if (row.affectedRows == 1) {
                                        res.status(200).json({ success: false, message: 'Cadastro efetuado efetuado'});
                                    }
                                }
                            }
                        });
                    }
                }
            }
        })
    }
    },
    cadastroArray(req, res) {
        let data = {email: req.body.email, nome: req.body.nome, senha: req.body.senha}
        if ((data.email == undefined) || (data.email == '') || (data.nome == '') || (data.nome == undefined) || (data.senha == '') || (data.senha == undefined)) {
            res.status(401).json(dataError);
        }
        let status = 2;
        database.user.forEach(element => {
            if (element.email === data.email) {
                status=1;
            }
        });
        if (status === 1) {
            console.log("erro: "+ JSON.stringify(database.user))
            res.status(410).json({success: false, message: 'Usuario ja existente'});
        } else {
            database.user.push(data);
            console.log("200: "+JSON.stringify(database.user));
            res.status(200).json({success: true, message: "Usuario cadastrado"});
        }
    },
    loginArray(req, res) {
        let data = {email: req.body.email, senha: req.body.senha}
        let status =2;
        let user ={ email: "", nome: "", senha: ""};
        database.user.forEach(element => {
            if (element.email === data.email) {
                status=1;
                user.email = element.email;
                user.nome = element.nome;
                console.log("teste: "+ user.nome);
                user.senha = element.senha;
            }
        });
        if (status == 1) {
            let userLogin = {nome: user.nome, senha: user.senha, token: undefined, email: user.email};
            userLogin.token = jwt.sign({nome: userLogin.nome, senha: userLogin.senha, email: user.email}, config.secret, {
                expiresIn: 86400//um dia 
            });
            console.log(user.nome);
            res.status(200).json({success: true, email: userLogin.email, senha: userLogin.senha, token: userLogin.token, nome: userLogin.nome})
        } else {
            console.log('teste')
            res.status(404).json({success: false});
        }
    }

}

module.exports = api;