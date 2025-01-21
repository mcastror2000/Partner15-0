import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import '../styles/Home.css';

function Home() {
  const navigate = useNavigate();

  const handleNavigation = (role) => {
    if (role === 'Jugador') {
      navigate('/player-login'); // Redirige al inicio de sesión de jugador
    } else if (role === 'Administrador') {
      navigate('/admin-login'); // Redirige al inicio de sesión del administrador
    }
  };

  return (
    <div className="home-container">
      <h1>Bienvenido a Partner 15-0</h1>
      <p>Selecciona una opción para continuar: Administrador o Jugador</p>
      <div className="home-buttons">
        <Button text="Administrador" onClick={() => handleNavigation('Administrador')} />
        <Button text="Jugador" onClick={() => handleNavigation('Jugador')} />
      </div>
    </div>
  );
}

export default Home;
