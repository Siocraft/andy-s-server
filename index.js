const express = require('express');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
require('dotenv').config();

const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://restaurant-siocraft-default-rtdb.firebaseio.com'
});

const app = express();
const port = 3000;

app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post('/sendPasswordResetEmail', (req, res) => {
  const email = req.body.email;

  admin.auth().generatePasswordResetLink(email)
    .then((link) => {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Restablecimiento de contraseña',
        html: `
          <p>Hola!,</p>
          <p>Sigue este link para reestablecer tu contraseña en restaurant para tu cuenta %EMAIL%.</p>
          <p><a href="${link}">Restablecer contraseña</a></p>
          <p>Si no has solicitado cambiar tu contraseña, puedes ignorar este email</p>
          <p>Gracias!</p>
          <p>Tu equipo de restaurant :D</p>
        `,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(500).send(`Error al enviar el correo electrónico: ${error.message}`);
        }
        res.send(`Correo de restablecimiento de contraseña enviado a ${email}`);
      });
    })
    .catch((error) => {
      res.status(400).send(`Error al generar el enlace de restablecimiento de contraseña: ${error.message}`);
    });
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
