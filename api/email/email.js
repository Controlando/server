var nodemailer = require('nodemailer');

var transporte = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'danielfigueira31@gmail.com',
    pass: '36563807dan'
  }
});

var Destino = {
  from: 'danielfigueira31@gmail.com',
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