import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import db from "../firebase";
import Header from "../components/Header";
import Button from "../components/Button";
import "../styles/ScheduleMatches.css";

const ScheduleMatches = () => {
  const [championships, setChampionships] = useState([]);
  const [selectedChampionship, setSelectedChampionship] = useState("");
  const [players, setPlayers] = useState([]);
  const [existingMatches, setExistingMatches] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);

  // Cargar campeonatos
  useEffect(() => {
    const fetchChampionships = async () => {
      try {
        const snapshot = await getDocs(collection(db, "Campeonatos"));
        const champs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setChampionships(champs);
      } catch (error) {
        console.error("Error al cargar campeonatos:", error);
      }
    };

    fetchChampionships();
  }, []);

  // Cargar jugadores
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const snapshot = await getDocs(collection(db, "Jugadores"));
        const playerList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setPlayers(playerList);
      } catch (error) {
        console.error("Error al cargar jugadores:", error);
      }
    };

    fetchPlayers();
  }, []);

  // Cargar partidos y calcular la ronda actual
  useEffect(() => {
    if (selectedChampionship) {
      fetchMatchesAndDates();
    } else {
      setExistingMatches([]);
      setCurrentRound(1);
    }
  }, [selectedChampionship]);

  const fetchMatchesAndDates = async () => {
    try {
      const matchesQuery = query(
        collection(db, "Partidos"),
        where("ID_Campeonato", "==", selectedChampionship)
      );
      const snapshot = await getDocs(matchesQuery);
      const fetchedMatches = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setExistingMatches(fetchedMatches);

      determineCurrentRound(fetchedMatches);
    } catch (error) {
      console.error("Error al cargar partidos:", error);
    }
  };

  const determineCurrentRound = (matches) => {
    const rounds = matches.reduce((acc, match) => {
      if (match.Ronda) acc.add(match.Ronda);
      return acc;
    }, new Set());
    setCurrentRound(rounds.size + 1);
  };

  const generateMatchesForRound = async () => {
    try {
      const previousRoundMatches = existingMatches.filter(
        (match) => match.Ronda === currentRound - 1
      );

      if (currentRound > 1 && previousRoundMatches.some((match) => !match.Ganador)) {
        alert(
          "Todos los partidos de la ronda anterior deben tener un ganador antes de generar la siguiente ronda."
        );
        return;
      }

      if (currentRound === 1 || previousRoundMatches.length === 0) {
        const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
        const newMatches = [];

        for (let i = 0; i < shuffledPlayers.length; i += 2) {
          if (i + 1 < shuffledPlayers.length) {
            newMatches.push({
              player1: `${shuffledPlayers[i].Nombre} ${shuffledPlayers[i].Apellido}`,
              player2: `${shuffledPlayers[i + 1].Nombre} ${shuffledPlayers[i + 1].Apellido}`,
              Jugadores: [shuffledPlayers[i].id, shuffledPlayers[i + 1].id],
              date: "",
              time: "",
              observation: "",
              ID_Campeonato: selectedChampionship,
              Resultado: "",
              Ronda: 1,
            });
          }
        }

        for (const match of newMatches) {
          await addDoc(collection(db, "Partidos"), match);
        }

        alert("Partidos de la primera ronda generados exitosamente.");
        fetchMatchesAndDates();
        return;
      }

      const winners = previousRoundMatches.map((match) => {
        const winner = players.find((player) => player.id === match.Ganador);
        return winner;
      });

      if (winners.length < 2) {
        alert("No hay suficientes ganadores para generar una nueva ronda.");
        return;
      }

      const newMatches = [];

      for (let i = 0; i < winners.length; i += 2) {
        if (i + 1 < winners.length) {
          newMatches.push({
            player1: `${winners[i].Nombre} ${winners[i].Apellido}`,
            player2: `${winners[i + 1].Nombre} ${winners[i + 1].Apellido}`,
            Jugadores: [winners[i].id, winners[i + 1].id],
            date: "",
            time: "",
            observation: "",
            ID_Campeonato: selectedChampionship,
            Resultado: "",
            Ronda: currentRound,
          });
        }
      }

      for (const match of newMatches) {
        await addDoc(collection(db, "Partidos"), match);
      }

      alert(`Partidos de la ronda ${currentRound} generados exitosamente.`);
      fetchMatchesAndDates();
    } catch (error) {
      console.error("Error al generar los partidos:", error);
      alert("Hubo un error al generar los partidos.");
    }
  };

  return (
    <div className="schedule-matches-container">
      <Header />
      <h1>Programar Partidos</h1>
      <div className="form-group">
        <label>Selecciona un Campeonato:</label>
        <select
          value={selectedChampionship}
          onChange={(e) => setSelectedChampionship(e.target.value)}
        >
          <option value="">-- Seleccionar --</option>
          {championships.map((champ) => (
            <option key={champ.id} value={champ.id}>
              {champ.name}
            </option>
          ))}
        </select>
      </div>
      <Button
        text={`Generar Partidos para Ronda ${currentRound}`}
        onClick={generateMatchesForRound}
        className="primary-button"
      />
      <ul className="match-list">
        {existingMatches.map((match, index) => (
          <li key={index} className="match-item">
            <p>
              <strong>{match.player1}</strong> vs <strong>{match.player2}</strong> (Ronda {match.Ronda})
            </p>
            <p>Fecha: {match.date || "Por definir"}</p>
            <p>Hora: {match.time || "Por definir"}</p>
            <p>Observación: {match.observation || "Ninguna"}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ScheduleMatches;
