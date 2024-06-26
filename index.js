const express = require('express');
const admin = require('firebase-admin');
const serviceAccount = require("./restaurant-siocraft-firebase-adminsdk-qhc1j-14c23fe95f.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://restaurant-siocraft-default-rtdb.firebaseio.com'
});

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('¡Hola, mundo!');
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
