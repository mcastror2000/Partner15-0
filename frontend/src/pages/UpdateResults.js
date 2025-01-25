import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  updateDoc,
  query,
  where,
  doc,
  setDoc,
  increment,
} from "firebase/firestore";
import db from "../firebase";
import Header from "../components/Header";
import Button from "../components/Button";
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

          // Ordenar partidos: no finalizados primero
          const fetchedMatches = snapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => (a.Finalizado === b.Finalizado ? 0 : a.Finalizado ? 1 : -1));

          setMatches(fetchedMatches);
        } catch (error) {
          console.error("Error al cargar partidos:", error);
        }
      };
      fetchMatches();
    }
  }, [selectedChampionship]);

  const updateRanking = async (campeonatoId, ganadorId, perdedorId) => {
    try {
      const ganadorRef = doc(db, "Tabla_Posiciones", `${campeonatoId}_${ganadorId}`);
      await setDoc(
        ganadorRef,
        {
          ID_Campeonato: campeonatoId,
          ID_Jugador: ganadorId,
          Puntos: increment(3), // 3 puntos por victoria
          Partidos_Jugados: increment(1),
          Partidos_Ganados: increment(1),
        },
        { merge: true }
      );

      const perdedorRef = doc(db, "Tabla_Posiciones", `${campeonatoId}_${perdedorId}`);
      await setDoc(
        perdedorRef,
        {
          ID_Campeonato: campeonatoId,
          ID_Jugador: perdedorId,
          Partidos_Jugados: increment(1),
          Partidos_Perdidos: increment(1),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error al actualizar la tabla de posiciones:", error);
    }
  };

  const handleSaveResult = async (matchId, winnerId, result) => {
    try {
      const match = matches.find((m) => m.id === matchId);

      if (match.Finalizado) {
        alert("Este partido ya está finalizado. No se pueden realizar cambios.");
        return;
      }

      const loserId = match.Jugadores.find((id) => id !== winnerId);

      const matchDoc = doc(db, "Partidos", matchId);
      await updateDoc(matchDoc, {
        Ganador: winnerId,
        Resultado: result,
        Finalizado: true,
      });

      await updateRanking(selectedChampionship, winnerId, loserId);

      setMatches((prevMatches) =>
        prevMatches.map((match) =>
          match.id === matchId
            ? { ...match, Ganador: winnerId, Resultado: result, Finalizado: true }
            : match
        )
      );

      alert("Resultado guardado exitosamente.");
    } catch (error) {
      console.error("Error al guardar el resultado:", error);
      alert("Hubo un error al guardar el resultado. Intenta nuevamente.");
    }
  };

  const handleBackToDashboard = () => {
    navigate("/admin-dashboard");
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <div className="update-results-container">
      <Header />
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
            <Button
              text="Guardar"
              onClick={() => handleSaveResult(match.id, match.Ganador, match.Resultado)}
              className="primary-button"
              disabled={!match.Ganador || !match.Resultado || match.Finalizado}
            />
          </li>
        ))}
      </ul>
      <div className="button-container">
        <Button
          text="Panel de Administración"
          onClick={handleBackToDashboard}
          className="primary-button"
        />
        <Button
          text="Volver a Inicio"
          onClick={handleBackToHome}
          className="primary-button"
        />
      </div>
    </div>
  );
};

export default UpdateResults;
