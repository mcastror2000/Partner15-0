import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import db from "../firebase";
import Header from "../components/Header"; // Usamos el Header
import Button from "../components/Button"; // Botón genérico
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
    <div>
      <Header /> {/* Header común */}
      <div className="admin-dashboard-container">
        <h1>Panel de Administración</h1>
        <p>Selecciona una opción para continuar:</p>
        <div className="admin-options">
          <Button
            text="Gestionar Campeonatos"
            onClick={() => handleNavigation("/manage-tournaments")}
            className="default-button"
          />
          <Button
            text="Programar Partidos"
            onClick={() => handleNavigation("/schedule-matches")}
            className="default-button"
          />
          <Button
            text="Actualizar Resultados"
            onClick={() => handleNavigation("/update-results")}
            className="default-button"
          />
          <Button
            text="Tabla de Posiciones Torneo"
            onClick={() => handleNavigation("/ranking")}
            className="default-button"
          />
          <Button
            text="Actualizar Ranking"
            onClick={() => handleNavigation("/update-standings")}
            className="default-button"
          />
          <Button
            text="Cambiar Contraseña"
            onClick={() => handleNavigation("/change-password")}
            className="default-button"
          />
          <Button
            text="Volver a Inicio"
            onClick={() => handleNavigation("/")}
            className="default-button"
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
