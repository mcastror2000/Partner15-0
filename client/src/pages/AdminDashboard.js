import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import db from "../firebase";
import "../styles/AdminDashboard.css";

const AdminDashboard = () => {
  const [championships, setChampionships] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChampionships = async () => {
      try {
        const snapshot = await getDocs(collection(db, "Campeonatos"));
        const champs = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }));
        setChampionships(champs);
      } catch (error) {
        console.error("Error al cargar campeonatos:", error);
      }
    };

    fetchChampionships();
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="admin-dashboard-container">
      <h1>Panel de Administración</h1>
      <p>Selecciona una opción para continuar:</p>
      <div className="admin-options">
        <button
          className="admin-button"
          onClick={() => handleNavigation("/schedule-matches")}
        >
          Programar Partidos
        </button>
        <button
          className="admin-button"
          onClick={() => handleNavigation("/manage-tournaments")}
        >
          Gestionar Campeonatos
        </button>
        <button
          className="admin-button"
          onClick={() => handleNavigation("/update-results")}
        >
          Actualizar Resultados
        </button>
        <button
          className="admin-button"
          onClick={() => handleNavigation("/update-standings")}
        >
          Actualizar Tabla de Posiciones
        </button>
        <button
          className="admin-button"
          onClick={() => handleNavigation("/ranking")}
        >
          Ver Tabla de Posiciones
        </button>
        <button
          className="admin-button logout-button"
          onClick={() => handleNavigation("/")}
        >
          Salir
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
