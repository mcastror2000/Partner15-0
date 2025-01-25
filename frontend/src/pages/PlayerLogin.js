import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/PlayerLogin.css"; // Estilos generales
import Header from "../components/Header"; // Header común
import Button from "../components/Button"; // Botón genérico
import { collection, query, where, getDocs } from "firebase/firestore";
import db from "../firebase";

const PlayerLogin = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const { email, password } = formData;

    try {
      // Buscar el jugador por correo
      const playersRef = collection(db, "Jugadores");
      const q = query(playersRef, where("Correo", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const playerData = querySnapshot.docs[0].data();
        console.log("Datos obtenidos de Firebase:", playerData);

        // Validar la contraseña
        if (playerData.pass === password) {
          console.log("Inicio de sesión exitoso");
          navigate("/player", { state: { player: playerData } });
        } else {
          console.warn("Contraseña incorrecta para el jugador:", playerData.Nombre);
          setError("Contraseña incorrecta. Inténtalo de nuevo.");
        }
      } else {
        console.warn("Correo no encontrado en la base de datos.");
        setError("Correo no encontrado. Inténtalo de nuevo.");
      }
    } catch (err) {
      console.error("Error iniciando sesión:", err);
      setError("Ocurrió un error al iniciar sesión. Inténtalo más tarde.");
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  const handleRegister = () => {
    navigate("/register");
  };

  return (
    <div>
      <Header /> {/* Header común en todas las páginas */}
      <div className="login-container">
        <h2>Inicio de Sesión - Jugador</h2>
        <form onSubmit={handleLogin}>
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
            <label>Contraseña:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && <p className="error">{error}</p>}

          <Button text="Iniciar Sesión" type="submit" className="primary-button" />
        </form>

        {/* Botones  */}
        <Button text="Volver a Inicio" onClick={handleBack} className="primary-button" />
        <Button text="Registro de Jugador" onClick={handleRegister} className="primary-button" />
      </div>
    </div>
  );
};

export default PlayerLogin;
