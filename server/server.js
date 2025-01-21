const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

app.post('/send-email', (req, res) => {
    const { name, email, phone, birthdate } = req.body;

    // Configuración del transportador con nodemailer
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true para el puerto 465, false para otros puertos como 587
        auth: {
            user: 'admtenis2025@gmail.com', // Correo del administrador
            pass: 'tenis150', // Contraseña de aplicación de Gmail
        },
    });

    // Opciones del correo
    const mailOptions = {
        from: 'admtenis2025@gmail.com', // Correo del remitente
        to: 'admtenis2025@gmail.com',   // Correo del administrador (destinatario)
        subject: 'Nuevo registro de jugador',
        text: `Nombre: ${name}\nCorreo Electrónico: ${email}\nTeléfono: ${phone || 'No especificado'}\nFecha de Nacimiento: ${birthdate || 'No especificada'}`,
    };

    // Enviar el correo
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error enviando el correo:', error);
            res.status(500).send('Error enviando el correo');
        } else {
            console.log('Correo enviado: ' + info.response);
            res.status(200).send('Correo enviado con éxito');
        }
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
