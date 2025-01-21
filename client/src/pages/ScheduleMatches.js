import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";
import db from "../firebase";
import "../styles/ScheduleMatches.css";

const ScheduleMatches = () => {
  const [championships, setChampionships] = useState([]);
  const [selectedChampionship, setSelectedChampionship] = useState("");
  const [championshipDates, setChampionshipDates] = useState({ start: "", end: "" });
  const [players, setPlayers] = useState([]);
  const [existingMatches, setExistingMatches] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [editingMatch, setEditingMatch] = useState(null);
  const [matchDetails, setMatchDetails] = useState({
    date: "",
    time: "",
    observation: "",
  });
  const navigate = useNavigate();

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

          const championship = championships.find(
            (champ) => champ.id === selectedChampionship
          );
          if (championship) {
            setChampionshipDates({ start: championship.date, end: championship.endDate });
          }

          determineCurrentRound(fetchedMatches);
        } catch (error) {
          console.error("Error al cargar partidos o fechas del campeonato:", error);
        }
      };
      fetchMatchesAndDates();
    } else {
      setExistingMatches([]);
      setCurrentRound(1);
    }
  }, [selectedChampionship, championships]);

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

        setExistingMatches([...existingMatches, ...newMatches]);
        alert("Partidos de la primera ronda generados exitosamente.");
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

      setExistingMatches([...existingMatches, ...newMatches]);
      alert(`Partidos de la ronda ${currentRound} generados exitosamente.`);
    } catch (error) {
      console.error("Error al generar los partidos:", error);
      alert("Hubo un error al generar los partidos.");
    }
  };

  const handleMatchDetailsChange = (e) => {
    const { name, value } = e.target;
    setMatchDetails({ ...matchDetails, [name]: value });
  };

  const handleSaveMatch = async (index) => {
    const match = existingMatches[index];
    const updatedMatch = { ...match, ...matchDetails };

    // Validación de fecha
    if (
      new Date(updatedMatch.date) < new Date(championshipDates.start) ||
      new Date(updatedMatch.date) > new Date(championshipDates.end)
    ) {
      alert(
        `La fecha debe estar entre ${championshipDates.start} y ${championshipDates.end}.`
      );
      return;
    }

    try {
      await updateDoc(doc(db, "Partidos", match.id), {
        date: updatedMatch.date,
        time: updatedMatch.time,
        observation: updatedMatch.observation,
      });

      const updatedMatches = [...existingMatches];
      updatedMatches[index] = updatedMatch;
      setExistingMatches(updatedMatches);

      setEditingMatch(null);
      setMatchDetails({ date: "", time: "", observation: "" });
      alert("Partido actualizado exitosamente.");
    } catch (error) {
      console.error("Error al actualizar el partido:", error);
    }
  };

  const handleEditMatch = (index) => {
    const match = existingMatches[index];
    if (match.Ganador) {
      alert("No se puede editar un partido con resultado ya ingresado.");
      return;
    }
    setEditingMatch(index);
    setMatchDetails(match);
  };

  const handleBackToDashboard = () => {
    navigate("/admin-dashboard");
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <div className="schedule-matches-container">
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
      <div className="round-indicator">
        <h2>Ronda Actual: {currentRound}</h2>
      </div>
      <button
        onClick={generateMatchesForRound}
        disabled={
          currentRound > 1 &&
          existingMatches.some(
            (match) => match.Ronda === currentRound - 1 && !match.Ganador
          )
        }
        className={`btn-generate ${
          currentRound > 1 &&
          existingMatches.some(
            (match) => match.Ronda === currentRound - 1 && !match.Ganador
          )
            ? "btn-disabled"
            : ""
        }`}
      >
        Generar Partidos para Ronda {currentRound}
      </button>
      <ul className="match-list">
        {existingMatches.map((match, index) => (
          <li key={index} className="match-item">
            <p>
              <strong>{match.player1}</strong> vs <strong>{match.player2}</strong> (Ronda {match.Ronda})
            </p>
            {editingMatch === index ? (
              <div className="edit-form">
                <input
                  type="date"
                  name="date"
                  value={matchDetails.date}
                  onChange={handleMatchDetailsChange}
                />
                <input
                  type="time"
                  name="time"
                  value={matchDetails.time}
                  onChange={handleMatchDetailsChange}
                />
                <input
                  type="text"
                  name="observation"
                  placeholder="Observaciones"
                  value={matchDetails.observation}
                  onChange={handleMatchDetailsChange}
                />
                <button
                  onClick={() => handleSaveMatch(index)}
                  className="btn-save"
                >
                  Guardar
                </button>
              </div>
            ) : (
              <div>
                <p>Fecha: {match.date || "Por definir"}</p>
                <p>Hora: {match.time || "Por definir"}</p>
                <p>Observación: {match.observation || "Ninguna"}</p>
                <button
                  onClick={() => handleEditMatch(index)}
                  className={`btn-edit ${match.Ganador ? "btn-disabled" : ""}`}
                  disabled={match.Ganador}
                >
                  Editar
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
      <div className="navigation-buttons">
        <button onClick={handleBackToDashboard} className="btn-dashboard">
          Volver al Panel de Administración
        </button>
        <button onClick={handleBackToHome} className="btn-home">
          Volver a la Página de Inicio
        </button>
      </div>
    </div>
  );
};

export default ScheduleMatches;
