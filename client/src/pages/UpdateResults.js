import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  updateDoc,
  query,
  where,
  doc,
  increment,
  setDoc,
} from "firebase/firestore";
import db from "../firebase";
import "../styles/UpdateResults.css";

const UpdateResults = () => {
  const [championships, setChampionships] = useState([]);
  const [selectedChampionship, setSelectedChampionship] = useState("");
  const [matches, setMatches] = useState([]);
  const navigate = useNavigate();

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

  useEffect(() => {
    if (selectedChampionship) {
      const fetchMatches = async () => {
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
          setMatches(fetchedMatches);
        } catch (error) {
          console.error("Error al cargar partidos:", error);
        }
      };
      fetchMatches();
    }
  }, [selectedChampionship]);

  const handleSaveResult = async (matchId, winnerId, result) => {
    try {
      const match = matches.find((m) => m.id === matchId);

      // Determina el ID del perdedor
      const loserId = match.Jugadores.find((id) => id !== winnerId);

      // Actualiza el partido en la colección "Partidos"
      await updateDoc(doc(db, "Partidos", matchId), {
        Ganador: winnerId,
        Resultado: result,
        Finalizado: true,
      });

      // Actualiza la tabla de posiciones
      await updateTablaPosiciones(winnerId, loserId, selectedChampionship);

      // Actualiza el estado local
      setMatches((prevMatches) =>
        prevMatches.map((m) =>
          m.id === matchId
            ? { ...m, Ganador: winnerId, Resultado: result, Finalizado: true }
            : m
        )
      );

      alert("Resultado guardado exitosamente.");
    } catch (error) {
      console.error("Error al guardar el resultado:", error);
    }
  };

  const updateTablaPosiciones = async (winnerId, loserId, championshipId) => {
    try {
      // Actualiza o crea la entrada del ganador
      const winnerRef = doc(
        db,
        "Tabla_Posiciones",
        `${championshipId}_${winnerId}`
      );
      await setDoc(
        winnerRef,
        {
          ID_Campeonato: championshipId,
          ID_Jugador: winnerId,
          Partidos_Jugados: increment(1),
          Partidos_Ganados: increment(1),
          Puntos: increment(3),
        },
        { merge: true }
      );

      // Actualiza o crea la entrada del perdedor
      const loserRef = doc(db, "Tabla_Posiciones", `${championshipId}_${loserId}`);
      await setDoc(
        loserRef,
        {
          ID_Campeonato: championshipId,
          ID_Jugador: loserId,
          Partidos_Jugados: increment(1),
          Partidos_Ganados: increment(0),
          Puntos: increment(0),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error al actualizar la tabla de posiciones:", error);
    }
  };

  const handleBackToDashboard = () => {
    navigate("/admin-dashboard");
  };

  return (
    <div className="update-results-container">
      <h1>Actualizar Resultados</h1>
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
      <ul className="match-list">
        {matches.map((match) => (
          <li key={match.id} className="match-item">
            <p>
              <strong>{match.player1}</strong> vs <strong>{match.player2}</strong>
            </p>
            <div className="form-group">
              <label>Ganador:</label>
              <select
                value={match.Ganador || ""}
                onChange={(e) =>
                  setMatches((prevMatches) =>
                    prevMatches.map((m) =>
                      m.id === match.id ? { ...m, Ganador: e.target.value } : m
                    )
                  )
                }
                disabled={match.Finalizado}
              >
                <option value="">-- Seleccionar --</option>
                <option value={match.Jugadores[0]}>{match.player1}</option>
                <option value={match.Jugadores[1]}>{match.player2}</option>
              </select>
            </div>
            <div className="form-group">
              <label>Resultado:</label>
              <input
                type="text"
                value={match.Resultado || ""}
                onChange={(e) =>
                  setMatches((prevMatches) =>
                    prevMatches.map((m) =>
                      m.id === match.id ? { ...m, Resultado: e.target.value } : m
                    )
                  )
                }
                placeholder="Ejemplo: 6-3, 6-4"
                disabled={match.Finalizado}
              />
            </div>
            <button
              onClick={() => handleSaveResult(match.id, match.Ganador, match.Resultado)}
              disabled={match.Finalizado}
              className="btn-save"
            >
              Guardar
            </button>
          </li>
        ))}
      </ul>
      <button onClick={handleBackToDashboard} className="btn-dashboard">
        Volver al Panel de Administración
      </button>
    </div>
  );
};

export default UpdateResults;
