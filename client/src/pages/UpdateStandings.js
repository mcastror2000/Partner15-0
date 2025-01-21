import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import db from "../firebase";
import "../styles/UpdateStandings.css";

const UpdateStandings = () => {
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [ranking, setRanking] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlayersAndMatches = async () => {
      try {
        // Cargar jugadores
        const playerSnapshot = await getDocs(collection(db, "Jugadores"));
        const playerList = playerSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPlayers(playerList);

        // Cargar partidos
        const matchSnapshot = await getDocs(collection(db, "Partidos"));
        const matchList = matchSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMatches(matchList);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };

    fetchPlayersAndMatches();
  }, []);

  const calculateRanking = () => {
    const playerScores = {};

    // Calcular puntajes sumando 1 punto por partido ganado
    matches.forEach((match) => {
      if (match.Ganador) {
        playerScores[match.Ganador] = (playerScores[match.Ganador] || 0) + 1;
      }
    });

    // Crear un arreglo con los jugadores y sus puntajes
    const rankingList = players.map((player) => ({
      id: player.id,
      name: `${player.Nombre} ${player.Apellido}`,
      score: playerScores[player.id] || 0,
    }));

    // Ordenar por puntaje en orden descendente
    rankingList.sort((a, b) => b.score - a.score);

    // Asignar rankings (los jugadores con el mismo puntaje tienen el mismo ranking)
    let currentRank = 1;
    for (let i = 0; i < rankingList.length; i++) {
      if (i > 0 && rankingList[i].score < rankingList[i - 1].score) {
        currentRank = i + 1; // Actualizamos el ranking solo si el puntaje es menor
      }
      rankingList[i].ranking = currentRank; // Guardamos el ranking temporalmente
    }

    setRanking(rankingList);
  };

  const saveRanking = async () => {
    try {
      for (const player of ranking) {
        await updateDoc(doc(db, "Jugadores", player.id), {
          Ranking: player.ranking, // Guardamos el ranking en el campo existente
        });
      }
      alert("Ranking guardado exitosamente.");
    } catch (error) {
      console.error("Error al guardar el ranking:", error);
    }
  };

  const handleBackToAdmin = () => {
    navigate("/admin-dashboard");
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <div className="update-standings-container">
      <h1>Ranking de Jugadores</h1>
      <button onClick={calculateRanking} className="btn-calculate">
        Calcular Ranking
      </button>
      <ul className="ranking-list">
        {ranking.map((player) => (
          <li key={player.id} className="ranking-item">
            <p>
              <strong>Ranking #{player.ranking}</strong> {player.name} - {player.score} puntos
            </p>
          </li>
        ))}
      </ul>
      <button onClick={saveRanking} className="btn-save">
        Guardar Ranking
      </button>
      <div className="navigation-buttons">
        <button onClick={handleBackToAdmin} className="btn-back-admin">
          Volver al Panel de Administración
        </button>
        <button onClick={handleBackToHome} className="btn-back-home">
          Volver a la Página de Inicio
        </button>
      </div>
    </div>
  );
};

export default UpdateStandings;
