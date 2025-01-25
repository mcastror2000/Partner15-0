import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Header from "../components/Header"; // Importa el Header esto lo tengo que pones ne todas las pag
import "../styles/Home.css";

function Home() {
  const navigate = useNavigate();

  const handleNavigation = (role) => {
    if (role === "Jugador") {
      navigate("/player-login");
    } else if (role === "Administrador") {
      navigate("/admin-login");
    }
  };

  return (
    <div className="home-container">
      <Header /> {/* Usa el Header */}
      <p>Bienvenido, por favor seleccione una opción para ingresar</p>
      <div className="home-buttons">
      <Button
  text="Administrador"
  onClick={() => handleNavigation("Administrador")}
  className="default-button" 
/>
<Button
  text="Jugador"
  onClick={() => handleNavigation("Jugador")}
  className="default-button" 
/>
      </div>
    </div>
  );
}

export default Home;