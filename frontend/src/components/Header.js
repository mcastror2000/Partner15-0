import React from "react";
import "../styles/Header.css"; // Archivo CSS para estilos

function Header() {
  return (
    <div className="header-container">
      <img
        src={require("../images/pelota1.png")} // Ruta de la imagen
        alt="Tenis"
        className="header-image"
      />
      <h1>Sistema de Gestión de Campeonatos 15-0</h1>
    </div>
  );
}

export default Header;