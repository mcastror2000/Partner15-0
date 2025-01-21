import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Register.css";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
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

  const generateID = async () => {
    const playersRef = collection(db, "Jugadores");
    const querySnapshot = await getDocs(playersRef);
    const totalPlayers = querySnapshot.size + 1;
    return `JUG${String(totalPlayers).padStart(3, "0")}`;
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
      // Verificar si el correo ya está registrado
      const playersRef = collection(db, "Jugadores");
      const q = query(playersRef, where("Correo", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setError("Este correo electrónico ya está registrado.");
        return;
      }

      // Generar un ID único para el jugador
      const playerID = await generateID();

      // Guardar el jugador en la base de datos
      await addDoc(playersRef, {
        Nombre: name,
        Apellido: lastName,
        Correo: email,
        Teléfono: phone || "No proporcionado",
        Edad: parseInt(age),
        ID_Jugador: playerID,
        Ranking: 0,
      });

      setMessage(`Registro exitoso. Tu ID es ${playerID}`);
      setFormData({ name: "", lastName: "", email: "", phone: "", age: "" });
    } catch (err) {
      console.error("Error al registrar:", err);
      setError("Ocurrió un error al registrar. Inténtalo nuevamente más tarde.");
    }
  };

  const handleBack = () => {
    navigate("/"); // Navega a la página inicial
  };

  return (
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

        <button type="submit" className="btn-register">
          Registrar
        </button>
      </form>

      <button onClick={handleBack} className="btn-back">
        Volver a inicio
      </button>
    </div>
  );
};

export default Register;
