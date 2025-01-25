import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Register.css";
import Header from "../components/Header"; // Header común
import Button from "../components/Button"; // Botones reutilizables
import { collection, addDoc, getDocs } from "firebase/firestore";
import db from "../firebase";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    email: "",
    phone: "",
    age: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Generar una contraseña única verificando todos los valores existentes en la base de datos
  const generateUniquePass = async () => {
    const playersRef = collection(db, "Jugadores");
    const querySnapshot = await getDocs(playersRef);
    const existingPasses = querySnapshot.docs.map((doc) => doc.data().pass); // Obtener todas las contraseñas actuales

    let passNumber = 1;
    let uniquePass = `JUG${String(passNumber).padStart(3, "0")}`;

    // Verificar si la contraseña ya existe; si es así, incrementar el número y probar de nuevo
    while (existingPasses.includes(uniquePass)) {
      passNumber++;
      uniquePass = `JUG${String(passNumber).padStart(3, "0")}`;
    }

    return uniquePass;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const { name, lastName, email, phone, age } = formData;

    if (!name || !lastName || !email || !age || age < 18) {
      setError("Todos los campos son obligatorios y la edad debe ser mayor o igual a 18 años.");
      return;
    }

    try {
      const playersRef = collection(db, "Jugadores");
      const querySnapshot = await getDocs(playersRef);
      const existingEmails = querySnapshot.docs.map((doc) => doc.data().Correo);

      if (existingEmails.includes(email)) {
        setError("Este correo electrónico ya está registrado.");
        return;
      }

      // Generar una contraseña única
      const uniquePass = await generateUniquePass();

      const newPlayer = {
        Nombre: name,
        Apellido: lastName,
        Correo: email,
        Teléfono: phone || "No proporcionado",
        Edad: parseInt(age),
        Ranking: 0,
        pass: uniquePass, // Contraseña inicial única
      };

      await addDoc(playersRef, newPlayer);

      setMessage(`Registro exitoso. Tu contraseña es ${newPlayer.pass}`);
      setFormData({ name: "", lastName: "", email: "", phone: "", age: "" });
    } catch (err) {
      console.error("Error al registrar:", err);
      setError("Ocurrió un error al registrar. Inténtalo nuevamente más tarde.");
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div>
      <Header />
      <div className="register-container">
        <h2>Formulario de Registro</h2>
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>Nombre:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Apellido:</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Correo Electrónico:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Teléfono (opcional):</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Edad:</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
            />
          </div>

          {error && <p className="error">{error}</p>}
          {message && <p className="success">{message}</p>}

          <Button text="Registrar" type="submit" className="primary-button" />
        </form>
        <Button text="Volver a Inicio" onClick={handleBack} className="primary-button" />
      </div>
    </div>
  );
};

export default Register;
