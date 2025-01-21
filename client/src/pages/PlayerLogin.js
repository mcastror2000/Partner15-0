import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/PlayerLogin.css"; // Estilos correspondientes
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
      // Referencia a la colección "Jugadores" en Firestore
      const playersRef = collection(db, "Jugadores");
      // Consulta para buscar por correo e ID
      const q = query(
        playersRef,
        where("Correo", "==", email),
        where("ID_Jugador", "==", password)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const playerData = querySnapshot.docs[0].data(); // Obtiene los datos del jugador
        navigate("/player", { state: { player: playerData } }); // Redirige con los datos del jugador
      } else {
        setError("Correo o contraseña incorrectos. Inténtalo de nuevo.");
      }
    } catch (err) {
      console.error("Error iniciando sesión:", err);
      setError("Ocurrió un error al iniciar sesión. Inténtalo más tarde.");
    }
  };

  const handleBack = () => {
    navigate("/"); // Navega a la página inicial
  };

  const handleRegister = () => {
    navigate("/register"); // Navega a la página de registro
  };

  return (
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

        <button type="submit" className="btn-login">
          Iniciar Sesión
        </button>
      </form>

      <button onClick={handleBack} className="btn-back">
        Volver a inicio
      </button>

      <button onClick={handleRegister} className="btn-register">
        Inscripción nuevo jugador
      </button>
    </div>
  );
};

export default PlayerLogin;
