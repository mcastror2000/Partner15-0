import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/Player.css';

const Player = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const player = location.state?.player; // Obtiene los datos del jugador

  if (!player) {
    return (
      <div className="player-container">
        <h2>Error</h2>
        <p>No se encontraron datos del jugador.</p>
        <button onClick={() => navigate("/player-login")} className="btn-back">
          Volver a Iniciar Sesión
        </button>
      </div>
    );
  }

  return (
    <div className="player-container">
      <h1>Hola, {player.Nombre}</h1>
      <p>Esta es tu información:</p>
      <div className="player-info">
        <p><strong>Nombre:</strong> {player.Nombre}</p>
        <p><strong>Apellido:</strong> {player.Apellido}</p>
        <p><strong>Correo:</strong> {player.Correo}</p>
        <p><strong>Edad:</strong> {player.Edad}</p>
        <p>
          <strong>Ranking:</strong>{' '}
          {player.Ranking === 0 ? 'Sin Ranking' : `#${player.Ranking}`}
        </p>
      </div>
      <button onClick={() => navigate("/")} className="btn-home">
        Volver a la Página Inicial
      </button>
    </div>
  );
};

export default Player;
