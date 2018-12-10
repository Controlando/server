const jwt = require("jsonwebtoken");
const dataError = { success: false, message: "Erro nos dados" }, serverError = { success: false, message: "Erro interno de servidor" }, notFound = { success: false, message: "Usuario nao encontrado no servidor" };
const config = require("../secretKey/config");
const servicoEmail = require("./email/email");
const bcrypts = require("bcryptjs");
var nodemailer = require('nodemailer');
//const User = require('../classes/user');
const database = require('../database/database')
var transporte = nodemailer.createTransport({
    service: 'Hotmail',
    auth: {
        user: 'controlandoFinancas@hotmail.com',
        pass: 'PocsLindas2018@'
    }
});
const mysql = require("mysql");
var con = mysql.createConnection({
    user: "root",
    password: "root",
    database: 'controlando'
});
con.connect(function (err) {
    if (err) {
        console.log((err))
        console.log("Erro de conexao");
    } else {
        console.log("Connected!");
    }

});




const api = {
    login(req, res) {
        let user = { email: req.body.email, senha: req.body.senha };
        const sql = "SELECT id, senha, nome FROM usuario WHERE email = ?"
        console.log(JSON.stringify(user));
        con.query(sql, [user.email], function (err, row) {
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
                            let userLogin = { nome: row[0].nome, id: row[0].id, token: undefined };
                            userLogin.token = jwt.sign({ nome: userLogin.nome, id: userLogin.id, email: user.email }, config.secret, {
                                expiresIn: 86400//um dia
                            });
                            res.status(200).json({ success: true, email: user.email, senha: user.senha, token: userLogin.token, nome: userLogin.nome })
                        } else {
                            res.status(404).json({ success: false });
                        }
                    }
                }
            }
        });
    },
    cadastroUsuario(req, res) {
        let user = { email: req.body.email, senha: req.body.senha, nome: req.body.nome }
        let sql = "SELECT id FROM usuario WHERE email = ?"
        let senhaHash = bcrypts.hashSync(user.senha, 8);
        con.query(sql, [user.email], function (err, row) {
            if (err) {
                res.status(500).json(serverError);
            } else {
                if (row.length == 1) {
                    res.status(409).json({ success: false, message: "Usuario ja cadastrado no banco" });
                } else {
                    if (row.length == 0) {
                        sql = "INSERT INTO usuario(nome, email, senha) VALUES(?, ?, ?)";
                        con.query(sql, [user.nome, user.email, senhaHash], function (err, row) {
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
                                    transporte.sendMail(Destino, function (error, informacao) {
                                        if (error) {
                                            console.log(error, informacao);
                                            res.status(500).json({ success: false, message: "erro no envio do email" });
                                        } else {
                                            res.status(200).json({ success: true, message: "Um email esta sendo enviado para voce, cheque seu email durante os proximos minutos" });
                                        }
                                    });
                                } else {

                                    res.status(200).json({ success: true, message: "Registro nao realizado" });

                                }
                            }
                        });
                    }
                }
            }
        });
    },
    cadastroUsuarioNoEmail(req, res) {
        let data = { nome: req.body.nome, email: req.body.email, senha: req.body.senha }
        let sql = 'SELECT id FROM usuario WHERE email = ?';
        if ((data.nome == '') || (data.nome == undefined) || (data.email == '') || (data.email == undefined) || (data.senha == '') || (data.senha == undefined)) {
            console.log(JSON.stringify(data))
            res.status(401).json({ success: false, message: 'Dados incompletos' });
        } else {
            let senhaHash = bcrypts.hashSync(data.senha, 8);

            con.query(sql, [data.email], function (err, row) {
                if (err) {
                    res.status(500).json(serverError);
                } else {
                    if (row.length == 1) {
                        res.status(409).json({ success: false, message: 'Usuario já cadastrado no sistema' });
                    } else {
                        if (row.length == 0) {
//                            let user = new User(data.nome, data.senha, data.email);
                            sql = 'INSERT INTO usuario(nome, email, senha) VALUES(?, ?, ?)'
                            con.query(sql, [data.nome, data.email, senhaHash], function (err, row) {
                                if (err) {
                                    res.status(500).json(serverError);
                                } else {
                                    if (row.affectedRows == 0) {
                                        res.status(500).json({ success: false, message: 'Cadastro nao efetuado' });
                                    } else {
                                        if (row.affectedRows == 1) {
                                            res.status(200).json({ success: true, message: 'Cadastro efetuado efetuado' });
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
        let data = { email: req.body.email, nome: req.body.nome, senha: req.body.senha }
        if ((data.email == undefined) || (data.email == '') || (data.nome == '') || (data.nome == undefined) || (data.senha == '') || (data.senha == undefined)) {
            res.status(401).json(dataError);
        }
        let status = 2;
        database.user.forEach(element => {
            if (element.email === data.email) {
                status = 1;
            }
        });
        if (status === 1) {
            console.log("erro: " + JSON.stringify(database.user))
            res.status(410).json({ success: false, message: 'Usuario ja existente' });
        } else {
            database.user.push(data);
            console.log("200: " + JSON.stringify(database.user));
            res.status(200).json({ success: true, message: "Usuario cadastrado" });
        }
    },
    loginArray(req, res) {
        let data = { email: req.body.email, senha: req.body.senha }
        let status = 2;
        let user = { email: "", nome: "", senha: "" };
        database.user.forEach(element => {
            if (element.email === data.email) {
                status = 1;
                user.email = element.email;
                user.nome = element.nome;
                console.log("teste: " + user.nome);
                user.senha = element.senha;
            }
        });
        if (status == 1) {
            let userLogin = { nome: user.nome, senha: user.senha, token: undefined, email: user.email };
            userLogin.token = jwt.sign({ nome: userLogin.nome, senha: userLogin.senha, email: user.email }, config.secret, {
                expiresIn: 86400//um dia
            });
            console.log(user.nome);
            res.status(200).json({ success: true, email: userLogin.email, senha: userLogin.senha, token: userLogin.token, nome: userLogin.nome })
        } else {
            console.log('teste')
            res.status(404).json({ success: false });
        }
    },
    updateName(req, res) {
        const dataUser = { email: req.body.email, novoNome: req.body.nome };
        let sql = "SELECT id FROM usuario WHERE email = ?"
        let id = undefined;
        if ((dataUser.email === undefined) || (dataUser.email === "") || (dataUser.novoNome === undefined) || (dataUser.novoNome === "")) {
            res.status(400).json({ success: false, mensagem: "Campos nao inseridos" })
        } else {
            con.query(sql, dataUser.email, function consulta(err, rows) {
                if (err) {
                    res.status(500).json({ succes: false, mensagem: "erro de servidor" })
                } else {
                    if (rows.length == 1) {
                        id = rows[0].id;
                        sql = "UPDATE usuario SET nome = ? WHERE id = ?"
                        con.query(sql, [dataUser.novoNome, id], function alteracao(err, rows) {
                            if (err) {
                                res.status(500).json({ succes: false, mensagem: "erro de servidor" })
                            } else {
                                if (rows.affectedRows === 1) {
                                    res.status(200).json({ success: true });
                                } else {
                                    res.status(500).json({ success: false, mensagem: "Alteração não realizada" });
                                }
                            }
                        })
                    } else {
                        res.status(404).json({ success: false, mensagem: "Usuario nao encontrado" })
                    }
                }
            })
        }
    },
    getUser(req, res) {
        const email = req.body.email;
        const sql = "SELECT email, nome, token, senha FROM usuario WHERE email = ?"
        if ((email === "") || (email === undefined)) {
            res.status(400).json({ success: false, mensagem: "Os campos estão vazios" });
        } else {
            con.query(sql, email, function devolverDados(err, rows) {
                if (err) {
                    res.status(500).json({ succes: false, mensagem: "erro de servidor" })
                } else {
                    if (rows.length === 1) {
                        const user = { nome: rows[0].nome, email: rows[0].email, senha: rows[0].senha }
                        res.status(200).json({ success: true, email: user.email, senha: user.senha, nome: user.nome })
                    } else {
                        res.status(404).json({ success: false, mensagem: "Usuario não encontrado" });
                    }
                }
            });
        }
    },
    updateSenha(req, res) {
        let dataUser = { email: req.body.email, novaSenha: req.body.senha };
        let sql = "SELECT id FROM usuario WHERE email = ?"
        let id = undefined;
        if ((dataUser.email == undefined) || (dataUser.email == "")) {
            console.log(dataUser)
            res.status(400).json({ success: false, mensagem: "Campos nao inseridos" })
        } else {
            con.query(sql, dataUser.email, function consulta(err, rows) {
                if (err) {
                    res.status(500).json({ succes: false, mensagem: "erro de servidor" })
                } else {
                    if (rows.length == 1) {
                        id = rows[0].id;
                        let senhaNova = bcrypts.hashSync(dataUser.novaSenha, 8);
                        sql = "UPDATE usuario SET senha = ? WHERE id = ?"
                        con.query(sql, [senhaNova, id], function alteracao(err, rows) {
                            if (err) {
                                res.status(500).json({ succes: false, mensagem: "erro de servidor" })
                            } else {
                                if (rows.affectedRows === 1) {
                                    res.status(200).json({ success: true });
                                } else {
                                    res.status(500).json({ success: false, mensagem: "Alteração não realizada" });
                                }
                            }
                        })
                    } else {
                        res.status(404).json({ success: false, mensagem: "Usuario nao encontrado" })
                    }
                }
            })
        }
    },
    inserirReceita(req, res) {
        let data = { email: req.userId, nome: req.body.nome, valor: req.body.valor, data: req.body.data, descricao: req.body.descricao };
        let sql = "SELECT id FROM usuario WHERE id = ?";
        let DMA = [];
        let dataFormatada;
        if ((data.email == "" || data.email === undefined) || (data.nome == "" || data.nome === undefined) || (data.valor == "" || data.valor === undefined) || (data.data == "") || (data.data === undefined) || (data.descricao == undefined) || (data.descricao == "")) {
            res.status(400).json({ success: false, mensagem: "Dados errados" })
        } else {
            DMA = data.data.split('/');
            dataFormatada = `${DMA[2]}/${DMA[1]}/${DMA[0]}`;
            con.query(sql, [data.email], function recuperarId(err, rows) {
                if (err) {
                    console.log(err)
                    res.status(500).json({ succes: false, mensagem: "erro de servidor" })
                } else {
                    if (rows.length === 0) {
                        res.status(404).json({ success: false, mensage: "Usuario nao encontrado" });
                    } else {
                        if (rows.length === 1) {
                            //cadastrar receita:
                            data.usuarioId = rows[0].id;
                            sql = "INSERT INTO receita(usuarioId, nome, valor, data, descricao, status) VALUES(?, ?, ?, ?, ?, 1)"
                            con.query(sql, [data.usuarioId, data.nome, data.valor, dataFormatada, data.descricao], function cadastrarReceita(err, rows) {
                                if (err) {
                                    console.log(err)
                                    res.status(500).json({ succes: false, mensagem: "erro de servidor" })
                                } else {
                                    if (rows.affectedRows === 0) {
                                        res.status(500).json({ success: false, mensagem: "Receita nao cadastrada" });
                                    } else {
                                        res.status(200).json({ success: true, mensagem: "Receita cadastrada" })
                                    }
                                }
                            })
                        }
                    }
                }
            })
        }
    },
    inserirMeta(req, res) {
        let dados = { email: req.userId, nome: req.body.nome, data: req.body.data, valor: req.body.valor, descricao: req.body.descricao, juros: req.body.juros }
        let sql = "INSERT INTO meta(usuarioId, nome, data, valor, descricao, juros, status) VALUES(?, ?, ?, ?, ?, ?, 1)"
        let DMA = [];
        let dataFormatada;

        if (((dados.email === "") || (dados.email === undefined)) || ((dados.nome === "") || (dados.nome === undefined)) || ((dados.data === "") || (dados.data === undefined)) || ((dados.valor === ""))) {
            res.status(400).json({ success: false, mensagem: "Dados errados" })
        } else {

          DMA = dados.data.split('/');
          dataFormatada = `${DMA[2]}/${DMA[1]}/${DMA[0]}`;
            select(dados.email, function inserir(id) {
                con.query(sql, [id, dados.nome, dataFormatada, dados.valor, dados.descricao, dados.juros], function inserir(error, rows) {
                    if (error) {
                      console.log(error)
                        res.status(500).json({ succes: false, mensagem: "erro de servidor" })
                    } else {
                        if (rows.affectedRows === 0) {
                            res.status(500).json({ succes: false, mensagem: "Dados nao foram salvos com sucesso" });
                        } else {
                            if (rows.affectedRows === 1) {
                                res.status(200).json({ success: true, mensagem: "Dados salvos com sucesso" });
                            }
                        }
                    }
                })
            })

        }
    },
    inserirDespesa(req, res) {
        let dados = { email: req.userId, nome: req.body.nome, data: req.body.data, valor: req.body.valor, nivel: req.body.nivel, periodo: req.body.periodo, descricao: req.body.descricao }
        let sql = "INSERT INTO despesa(usuarioId, nome, valor, nivel, periodo, data, descricao, status) VALUES(?, ?, ?, ?, ?, ?, ?, 1)"
        let DMA = [];
        let dataFormatada;

        if (((dados.email === "") || (dados.email === undefined)) || ((dados.nome === "") || (dados.nome === undefined)) || ((dados.data === "") || (dados.data === undefined)) || ((dados.valor === ""))) {
            res.status(400).json({ success: false, mensagem: "Dados errados" })
        } else {
            DMA = dados.data.split('/');
            dataFormatada = `${DMA[2]}/${DMA[1]}/${DMA[0]}`;
            select(dados.email, function inserirDespesa(id) {
                con.query(sql, [id, dados.nome, dados.valor, dados.nivel, dados.periodo, dataFormatada, dados.descricao], function inserirDespesaSql(err, rows) {
                    if (err) {
                        console.log(err)
                        res.status(500).json({ succes: false, mensagem: "erro de servidor" })
                    } else {
                        if (rows.affectedRows === 0) {
                            res.status(500).json({ success: true, mensagem: "Erro durante o salvamento de dados" });
                        } else {
                            res.status(200).json({ success: true, mensagem: "Dados salvos com sucesso" });
                        }
                    }
                })
            })
        }
    },
    listarDados(req, res) {
        let dados = { email: req.headers['email'] };
        let response = {receita: [], despesa: []};
        let sql = "SELECT id FROM usuario WHERE email = ?";
        if ((dados.email === "") || (dados.email === undefined)) {
            res.status(500).json({ success: false });
        } else {
            con.query(sql, [dados.email], function (err, rows) {
                if (err) {
                    res.status(500).json({ succes: false, mensagem: "erro de servidor" })
                } else {
                    if (rows.length === 0) {
                        res.status(404).json({ success: false, mensagem: "Dados nao encontrados" })
                    } else {
                        if (rows.length > 0) {
                            let id = rows[0].id;
                            sql = "SELECT nome, valor, DATE_FORMAT(data,'%d-%m-%Y') as dataReceita, descricao FROM receita WHERE usuarioId = ?"
                            con.query(sql, [id], function(err, rows) {
                                if (err) {
                                    res.status(500).json({ succes: false, mensagem: "erro de servidor" })
                                } else {
                                    if ( rows.affectedRows == 0 ) {
                                        response.receita = [];
                                    } else {
                                        rows.forEach( position => {
                                            let receita = {};
                                            receita.nome = position.nome;
                                            receita.valor = position.valor;
                                            receita.dataReceita = position.dataReceita;
                                            receita.descricao = position.descricao;
                                            response.receita.push(receita)
                                        });
                                        //Despesa
                                        sql = "SELECT descricao, nome, valor, nivel, periodo, DATE_FORMAT(data,'%d-%m-%Y') as dataDespesa FROM despesa WHERE usuarioId = ?"
                                        con.query(sql, id, function(err, rows) {
                                            if (err) {
                                                console.log(err)
                                                res.status(500).json({ success: false, mensagem: "Erro durante a despesa" })
                                            } else {
                                                if ((rows.length == 0 ) || (rows.length > 0)) {
                                                    rows.forEach( position => {
                                                        let despesa = {};
                                                        despesa.nome = position.nome;
                                                        despesa.valor = position.valor;
                                                        despesa.dataDespesa = position.dataDespesa;
                                                        despesa.descricao = position.descricao;
                                                        despesa.nivel = position.nivel;
                                                        despesa.periodo = position.periodo;
                                                        response.despesa.push(despesa);
                                                    });
                                                    res.status(200).json(response);
                                                }
                                            }
                                        })

                                    }
                                }
                            });
                        }
                    }
                }
            });
        }
    },
    listarReceita(req, res) {
        let id = req.userId;
        let sql = "SELECT id, nome, valor, DATE_FORMAT(data,'%d-%m-%Y') as dataReceita, descricao FROM receita WHERE usuarioId = ? AND status = 1";
        let receita = [];
        if ((id == undefined) || (id == "")) {
            console.log("ENTROU AQ")
            res.status(500).json({ success: false, message: "Header não enviado" });
        } else {
            con.query(sql, [id], function (err, rows) {
                if (err) {
                    console.log(err)
                    res.status(500).json({ succes: false, mensagem: "erro de servidor" })
                } else {
                    if (rows.length == 0) {
                        receita = [];
                        console.log("ENTROU AQ")
            
                        res.status(200).json(receita);
                    } else {
            
                        rows.forEach(position => {
                            let obj = {};
                            obj.id = position.id;
                            obj.nome = position.nome;
                            obj.valor = position.valor;
                            obj.dataReceita = position.dataReceita;
                            obj.descricao = position.descricao;
                            receita.push(obj);
                        });
                        console.log("ENTROU AQ", receita)

                        res.status(200).json(receita);
                    }
                }
            })
        }
    },
    getReceita(req, res) {
        let id = req.headers["id"];
        let sql = "SELECT id, nome, valor, DATE_FORMAT(data,'%d-%m-%Y') as dataReceita, descricao FROM receita WHERE id = ? AND status = 1";
        let receita = {nome: undefined, id: undefined, valor: undefined, dataReceita: undefined, descricao: undefined}
        if ((id == undefined) || (id == "")) {
            res.status(500).json({ success: false, message: "Header não enviado" });
        } else {
            con.query(sql, [id], function (err, rows) {
                if (err) {
                    console.log(err)
                    res.status(500).json({ succes: false, mensagem: "erro de servidor" })
                } else {
                    if (rows.affectedRows == 0) {
                        receita = [];
                        res.status(200).json(receita);
                    } else {
                        receita.id = rows[0].id;
                        receita.nome = rows[0].nome;
                        receita.valor = rows[0].valor;
                        receita.dataReceita = rows[0].dataReceita;
                        receita.descricao = rows[0].descricao;
                        res.status(200).json(receita);
                    }
                }
            });
        }
    },
    alterarReceita(req, res) {
        let sql = "UPDATE receita SET nome = ?, valor = ?, data = ?, descricao = ?  WHERE id = ?";
        let body = { nome : req.body.nome, valor: req.body.valor, dataReceita: req.body.data, descricao: req.body.descricao, id: req.headers["id"] };
        let DMA = [];
        let dataFormatada;
        DMA = body.dataReceita.split('/');
        dataFormatada = `${DMA[2]}/${DMA[1]}/${DMA[0]}`;
        con.query(sql, [body.nome, body.valor, dataFormatada, body.descricao, body.id], function(err, rows) {
            if (err) {
                res.status(500).json(serverError);
            } else {
                if (rows.affectedRows == 1 ) {
                    res.status(200).json({ success: true, message: "OK"});
                } else {
                    res.status(500).json({ success: false, message: "Dados nao atualizados"});
                }
            }
        }) 
    },
    deletarReceita(req, res) {
        let sql = "UPDATE receita SET status = 0  WHERE id = ?";
        let body = { id: req.headers["id"] };
        con.query(sql, [body.id], function(err, rows) {
            if (err) {
                res.status(500).json(serverError);
            } else {
                if (rows.affectedRows == 1 ) {
                    res.status(200).json({ success: true, message: "OK"});
                } else {
                    res.status(500).json({ success: false, message: "Dados nao deletados"});
                }
            }
        }) 
    },
    //Despesa
    alterarDespesa(req, res) {
        let sql = "UPDATE despesa SET nome = ?, valor = ?, data = ?, descricao = ? WHERE id = ?";
        let body = { nome : req.body.nome, valor: req.body.valor, dataReceita: req.body.data, descricao: req.body.descricao, id: req.headers["id"] };
        let DMA = [];
        let dataFormatada;
        DMA = body.dataReceita.split('/');
        dataFormatada = `${DMA[2]}/${DMA[1]}/${DMA[0]}`;
        con.query(sql, [body.nome, body.valor, dataFormatada, body.descricao, body.id], function(err, rows) {
            if (err) {
                res.status(500).json(serverError);
            } else {
                if (rows.affectedRows == 1 ) {
                    res.status(200).json({ success: true, message: "OK"});
                } else {
                    res.status(500).json({ success: false, message: "Dados nao atualizados"});
                }
            }
        }) 
    },
    deletarDespesa(req, res) {
        let sql = "UPDATE despesa SET status = 0  WHERE id = ?";
        let body = { id: req.headers["id"] };
        con.query(sql, [body.id], function(err, rows) {
            if (err) {
                res.status(500).json(serverError);
            } else {
                if (rows.affectedRows == 1 ) {
                    res.status(200).json({ success: true, message: "OK"});
                } else {
                    res.status(500).json({ success: false, message: "Dados nao deletados"});
                }
            }
        }) 
    },
    //metas
    alterarMetas(req, res) {
        let sql = "UPDATE meta SET nome = ?, valor = ?, data = ?, descricao = ?  WHERE id = ?";
        let body = { nome : req.body.nome, valor: req.body.valor, dataReceita: req.body.data, descricao: req.body.descricao, id: req.headers["id"] };
        let DMA = [];
        let dataFormatada;
        DMA = body.dataReceita.split('/');
        dataFormatada = `${DMA[2]}/${DMA[1]}/${DMA[0]}`;
        con.query(sql, [body.nome, body.valor, dataFormatada, body.descricao, body.id], function(err, rows) {
            if (err) {
                res.status(500).json(serverError);
            } else {
                if (rows.affectedRows == 1 ) {
                    res.status(200).json({ success: true, message: "OK"});
                } else {
                    res.status(500).json({ success: false, message: "Dados nao atualizados"});
                }
            }
        }) 
    },
    deletarMetas(req, res) {

    }
}
const select = function selectUsuario(id, next) {
    const sql = "SELECT id FROM usuario WHERE id = ?";
    con.query(sql, [id], function selectId(err, rows) {
        if (err) {
            console.log(err)
            res.status(500).json({ succes: false, mensagem: "erro de servidor" })
        } else {
            if (rows.length === 0) {
                res.status(404).json({ success: true, mensagem: "Usuario nao encontrado" });
            } else {
                next(rows[0].id);
            }
        }
    });
}
const erro = function mysqlError(err) {
    if (err) {
        res.status(500).json({ success: false, mensagem: "erro durante a consulta" });
    }
}
module.exports = api;
