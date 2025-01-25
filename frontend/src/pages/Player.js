import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import db from "../firebase";
import Header from "../components/Header";
import Button from "../components/Button";
import "../styles/Player.css";

const Player = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const player = location.state?.player;

  const [globalRanking, setGlobalRanking] = useState("Sin datos");
  const [nextMatch, setNextMatch] = useState({
    date: "Sin datos",
    tournament: "Sin datos",
    location: "Sin datos",
    time: "Sin datos",
  });

  useEffect(() => {
    if (!player || !player.Nombre || !player.Apellido) {
      console.error(
        "El nombre o apellido del jugador no están definidos. Verifica los datos proporcionados."
      );
      return;
    }

    const playerName = `${player.Nombre} ${player.Apellido}`;
    console.log("Buscando datos para el jugador:", playerName);

    // Cargar Ranking Global
    const fetchGlobalRanking = async () => {
      try {
        const rankingSnapshot = await getDocs(
          query(collection(db, "Ranking_Global"), where("name", "==", playerName))
        );

        if (!rankingSnapshot.empty) {
          const rankingData = rankingSnapshot.docs[0].data();
          setGlobalRanking(`#${rankingData.ranking || "Sin Ranking"}`);
        } else {
          console.warn("No se encontraron datos en Ranking_Global para este jugador.");
          setGlobalRanking("Sin ranking disponible");
        }
      } catch (error) {
        console.error("Error al cargar el ranking global:", error);
        setGlobalRanking("Error al cargar datos");
      }
    };

    // Cargar fecha del próximo partido
    const fetchNextMatch = async () => {
      try {
        const matchesQuery = query(
          collection(db, "Partidos"),
          where("Jugadores", "array-contains", playerName) // Busca por nombre completo del jugador
        );
        const snapshot = await getDocs(matchesQuery);

        if (!snapshot.empty) {
          const upcomingMatches = snapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .filter((match) => !match.Finalizado && match.Fecha) // Filtrar partidos no finalizados y con fecha definida
            .sort((a, b) => new Date(a.Fecha) - new Date(b.Fecha)); // Ordenar por fecha más próxima

          if (upcomingMatches.length > 0) {
            const nextMatch = upcomingMatches[0];
            setNextMatch({
              date: new Date(nextMatch.Fecha).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              }),
              tournament: nextMatch.Nombre_Torneo || "Sin datos",
              location: nextMatch.Ubicacion || "Sin datos",
              time: nextMatch.Hora || "Sin datos",
            });
          } else {
            setNextMatch({
              date: "Sin partidos próximos",
              tournament: "N/A",
              location: "N/A",
              time: "N/A",
            });
          }
        } else {
          console.warn("No se encontraron partidos próximos para este jugador.");
          setNextMatch({
            date: "Sin partidos registrados",
            tournament: "N/A",
            location: "N/A",
            time: "N/A",
          });
        }
      } catch (error) {
        console.error("Error al cargar el próximo partido:", error);
        setNextMatch({
          date: "Error al cargar datos",
          tournament: "Error",
          location: "Error",
          time: "Error",
        });
      }
    };

    fetchGlobalRanking();
    fetchNextMatch();
  }, [player]);

  if (!player) {
    return (
      <div>
        <Header />
        <div className="player-container">
          <h2>Error</h2>
          <p>No se encontraron datos del jugador. Por favor, inicia sesión nuevamente.</p>
          <Button
            text="Volver a Iniciar Sesión"
            onClick={() => navigate("/player-login")}
            className="primary-button"
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="player-container">
        <h1>Hola {player.Nombre}</h1>
        <p>Esta es tu información:</p>
        <div className="player-info">
          <p>
            <strong>Nombre:</strong> {player.Nombre}
          </p>
          <p>
            <strong>Apellido:</strong> {player.Apellido}
          </p>
          <p>
            <strong>Correo:</strong> {player.Correo}
          </p>
          <p>
            <strong>Edad:</strong> {player.Edad}
          </p>
          <p>
            <strong>Ranking Global:</strong> {globalRanking}
          </p>
          <p>
            <strong>Próximo Partido:</strong>
          </p>
          <ul>
            <li>
              <strong>Fecha:</strong> {nextMatch.date}
            </li>
            <li>
              <strong>Torneo:</strong> {nextMatch.tournament}
            </li>
            <li>
              <strong>Ubicación:</strong> {nextMatch.location}
            </li>
            <li>
              <strong>Hora:</strong> {nextMatch.time}
            </li>
          </ul>
        </div>
        <div className="button-container">
          <Button
            text="Cambiar Contraseña"
            onClick={() => navigate("/change-password")}
            className="primary-button"
          />
          <Button
            text="Tabla de Posiciones Torneo"
            onClick={() => navigate("/ranking")}
            className="primary-button"
          />
          <Button
            text="Volver a Inicio"
            onClick={() => navigate("/")}
            className="primary-button"
          />
        </div>
      </div>
    </div>
  );
};

export default Player;
