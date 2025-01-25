import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, setDoc, doc } from "firebase/firestore";
import db from "../firebase";
import Header from "../components/Header"; // Header común
import Button from "../components/Button"; // Botones reutilizables
import "../styles/UpdateStandings.css";

const UpdateStandings = () => {
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlayersAndMatches = async () => {
      try {
        setLoading(true);
        setError("");

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
        setError("Hubo un error al cargar los datos. Intenta nuevamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayersAndMatches();
  }, []);

  const calculateRanking = () => {
    const playerScores = {};
    const championshipWins = {}; // Almacena el número de campeonatos ganados por jugador

    // Agrupar partidos por campeonato
    const matchesByChampionship = matches.reduce((acc, match) => {
      if (!acc[match.ID_Campeonato]) acc[match.ID_Campeonato] = [];
      acc[match.ID_Campeonato].push(match);
      return acc;
    }, {});

    // Calcular puntajes y campeonatos ganados
    Object.values(matchesByChampionship).forEach((championshipMatches) => {
      const winners = {}; // Almacena las victorias por jugador en este campeonato

      championshipMatches.forEach((match) => {
        if (match.Ganador) {
          playerScores[match.Ganador] = (playerScores[match.Ganador] || 0) + 1;
          winners[match.Ganador] = (winners[match.Ganador] || 0) + 1;
        }
      });

      // Verificar si algún jugador ganó más partidos que otros en este campeonato
      const maxWins = Math.max(...Object.values(winners));
      for (const [playerId, wins] of Object.entries(winners)) {
        if (wins === maxWins && wins > 0) {
          championshipWins[playerId] = (championshipWins[playerId] || 0) + 1;
        }
      }
    });

    // Crear un arreglo con los jugadores y sus puntajes
    const rankingList = players.map((player) => ({
      id: player.id,
      name: `${player.Nombre} ${player.Apellido}`,
      score: playerScores[player.id] || 0,
      championshipsWon: championshipWins[player.id] || 0, // Número de campeonatos ganados
    }));

    // Ordenar por puntaje en orden descendente
    rankingList.sort((a, b) => b.score - a.score);

    // Agregar el número de ranking
    rankingList.forEach((player, index) => {
      player.ranking = index + 1;
    });

    setRanking(rankingList);
  };

  const saveRanking = async () => {
    try {
      for (const player of ranking) {
        await setDoc(doc(db, "Ranking_Global", player.id), {
          name: player.name,
          score: player.score,
          championshipsWon: player.championshipsWon,
          ranking: player.ranking,
        });
      }
      alert("Ranking guardado exitosamente.");
    } catch (error) {
      console.error("Error al guardar el ranking:", error);
      alert("Hubo un error al guardar el ranking. Intenta nuevamente.");
    }
  };

  return (
    <div className="update-standings-container">
      <Header />
      <h1>Ranking Global de Jugadores</h1>

      {error && <p className="error-message">{error}</p>}

      <Button text="Calcular Ranking" onClick={calculateRanking} className="primary-button" />

      {loading ? (
        <p>Cargando datos...</p>
      ) : (
        <table className="ranking-table">
          <thead>
            <tr>
              <th>Ranking</th>
              <th>Jugador</th>
              <th>Puntos</th>
              <th>Campeonatos Ganados</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((player) => (
              <tr key={player.id}>
                <td>{player.ranking}</td>
                <td>{player.name}</td>
                <td>{player.score}</td>
                <td>{player.championshipsWon}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Button text="Guardar Ranking" onClick={saveRanking} className="primary-button" />

      <div className="navigation-buttons">
        <Button text="Panel de Administración" onClick={() => navigate("/admin-dashboard")} className="primary-button" />
        <Button text="Volver a Inicio" onClick={() => navigate("/")} className="primary-button" />
      </div>
    </div>
  );
};

export default UpdateStandings;
