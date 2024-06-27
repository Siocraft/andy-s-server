import express from 'express';
import admin from 'firebase-admin';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import serviceAccount from './restaurant-siocraft-firebase-adminsdk-qhc1j-14c23fe95f.json' assert { type: "json" };

dotenv.config();

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

transporter.verify((error, success) => {
  if (error) {
    console.error(`Error al verificar la configuración de nodemailer: ${error.message}`);
  } else {
    console.log('Servidor de correo listo para enviar mensajes');
  }
});

app.post('/sendPasswordResetEmail', (req, res) => {
  const email = req.body.email;
  console.log(`Solicitud recibida para enviar correo de restablecimiento a: ${email}`);

  if (!email) {
    console.error('Error: No se proporcionó un correo electrónico');
    return res.status(400).send('Error: No se proporcionó un correo electrónico');
  }

  admin.auth().generatePasswordResetLink(email)
    .then((link) => {
      console.log(`Enlace de restablecimiento generado: ${link}`);
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Restablecimiento de contraseña',
        html: `
          <p>Hola!,</p>
          <p>Sigue este link para reestablecer tu contraseña en restaurant para tu cuenta ${email}.</p>
          <p><a href="${link}">Restablecer contraseña</a></p>
          <p>Si no has solicitado cambiar tu contraseña, puedes ignorar este email</p>
          <p>Gracias!</p>
          <p>Tu equipo de restaurant :D</p>
        `,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(`Error al enviar el correo electrónico: ${error.message}`);
          return res.status(500).send(`Error al enviar el correo electrónico: ${error.message}`);
        }
        console.log(`Correo enviado: ${info.response}`);
        res.send(`Correo de restablecimiento de contraseña enviado a ${email}`);
      });
    })
    .catch((error) => {
      console.error(`Error al generar el enlace de restablecimiento de contraseña: ${error.message}`);
      res.status(400).send(`Error al generar el enlace de restablecimiento de contraseña: ${error.message}`);
    });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
