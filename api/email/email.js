var nodemailer = require('nodemailer');

var transporte = nodemailer.createTransport({
  service: 'Hotmail',
  auth: {
    user: 'controlandoFinancas@outlook.com',
    pass: 'PocsLindas2018@'
  }
});

var Destino = {
  from: 'controlandoFinancas@outlook.com',
  to: '',
  subject: '',
  text: ''
}

const funcao = {
    envioEmail(req, res, Destino) {
        transporte.sendMail(Destino, function(error, informacao, next){
            if (error) {
                console.log(error);
                res.status(500).json({success: false, message: "erro no envio do email"});
            } else {
                next();
            }
        });
    }
}


module.exports = {transporte, Destino, funcao}