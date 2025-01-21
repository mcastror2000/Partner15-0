import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import db from "../firebase";
import "../styles/Ranking.css";

const Ranking = () => {
  const { idCampeonato } = useParams(); // Obtener el ID del campeonato desde la URL
  const [selectedChampionship, setSelectedChampionship] = useState(idCampeonato || ""); // Estado para el campeonato seleccionado
  const [championships, setChampionships] = useState([]); // Lista de campeonatos
  const [rankingData, setRankingData] = useState([]);
  const [players, setPlayers] = useState({});
  const [loading, setLoading] = useState(false); // Estado de carga
  const navigate = useNavigate();

  // Cargar lista de campeonatos
  useEffect(() => {
    const fetchChampionships = async () => {
      try {
        const snapshot = await getDocs(collection(db, "Campeonatos"));
        const champs = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }));
        setChampionships(champs);

        // Si no hay ID en la URL, selecciona el primero por defecto
        if (!idCampeonato && champs.length > 0) {
          setSelectedChampionship(champs[0].id);
        }
      } catch (error) {
        console.error("Error al cargar campeonatos:", error);
      }
    };

    fetchChampionships();
  }, [idCampeonato]);

  // Cargar jugadores y ranking del campeonato seleccionado
  useEffect(() => {
    if (selectedChampionship) {
      const fetchPlayersAndRanking = async () => {
        try {
          setLoading(true);

          // Cargar jugadores
          const playersSnapshot = await getDocs(collection(db, "Jugadores"));
          const playersData = playersSnapshot.docs.reduce((acc, doc) => {
            acc[doc.id] = `${doc.data().Nombre} ${doc.data().Apellido}`;
            return acc;
          }, {});
          setPlayers(playersData);

          // Cargar ranking
          const rankingQuery = query(
            collection(db, "Tabla_Posiciones"),
            where("ID_Campeonato", "==", selectedChampionship)
          );
          const rankingSnapshot = await getDocs(rankingQuery);
          const ranking = rankingSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setRankingData(ranking);
        } catch (error) {
          console.error("Error al cargar datos:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchPlayersAndRanking();
    }
  }, [selectedChampionship]);

  return (
    <div className="ranking-container">
      <h1>Tabla de Posiciones</h1>

      {/* Seleccionar campeonato */}
      <div className="form-group">
        <label>Selecciona un Campeonato:</label>
        <select
          value={selectedChampionship}
          onChange={(e) => setSelectedChampionship(e.target.value)}
        >
          <option value="" disabled>
            -- Seleccionar --
          </option>
          {championships.map((champ) => (
            <option key={champ.id} value={champ.id}>
              {champ.name}
            </option>
          ))}
        </select>
      </div>

      {/* Verificar si hay datos */}
      {loading ? (
        <p>Cargando datos...</p>
      ) : rankingData.length > 0 ? (
        <table className="ranking-table">
          <thead>
            <tr>
              <th>Jugador</th>
              <th>Puntos</th>
              <th>Partidos Ganados</th>
              <th>Partidos Perdidos</th>
              <th>Partidos Jugados</th>
            </tr>
          </thead>
          <tbody>
            {rankingData
              .sort((a, b) => b.Puntos - a.Puntos) // Ordenar por puntos
              .map((data) => (
                <tr key={data.id}>
                  <td>{players[data.ID_Jugador] || "Jugador no encontrado"}</td>
                  <td>{data.Puntos}</td>
                  <td>{data.Partidos_Ganados || 0}</td>
                  <td>{data.Partidos_Jugados - (data.Partidos_Ganados || 0)}</td>
                  <td>{data.Partidos_Jugados || 0}</td>
                </tr>
              ))}
          </tbody>
        </table>
      ) : (
        <p>No hay datos disponibles para este campeonato.</p>
      )}

      {/* Botón para volver */}
      <button className="btn-back" onClick={() => navigate(-1)}>
        Volver
      </button>
    </div>
  );
};

export default Ranking;
