import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import db from "../firebase";
import Header from "../components/Header"; // Usar Header común
import Button from "../components/Button"; // Botones reutilizables
import "../styles/Ranking.css";

const Ranking = () => {
  const { idCampeonato } = useParams();
  const [selectedChampionship, setSelectedChampionship] = useState(idCampeonato || "");
  const [championships, setChampionships] = useState([]);
  const [rankingData, setRankingData] = useState([]);
  const [players, setPlayers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // Estado para manejar errores
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChampionships = async () => {
      try {
        setError(""); // Reinicia el estado de error
        const snapshot = await getDocs(collection(db, "Campeonatos"));
        const champs = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }));
        setChampionships(champs);
        if (!idCampeonato && champs.length > 0) {
          setSelectedChampionship(champs[0].id);
        }
      } catch (error) {
        console.error("Error al cargar campeonatos:", error);
        setError("Error al cargar los campeonatos. Intenta nuevamente.");
      }
    };

    fetchChampionships();
  }, [idCampeonato]);

  useEffect(() => {
    if (selectedChampionship) {
      const fetchPlayersAndRanking = async () => {
        try {
          setLoading(true);
          setError(""); // Reinicia el estado de error

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
          let ranking = rankingSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Ordenar los datos por puntos de mayor a menor
          ranking.sort((a, b) => Number(b.Puntos || 0) - Number(a.Puntos || 0));
          console.log("Ranking ordenado:", ranking); // Verificar datos ordenados en consola

          // Actualizar el estado
          setRankingData([]); // Limpia el estado previo
          setRankingData(ranking); // Establece el nuevo ranking
        } catch (error) {
          console.error("Error al cargar jugadores o ranking:", error);
          setError("Error al cargar los datos. Intenta nuevamente.");
        } finally {
          setLoading(false);
        }
      };

      fetchPlayersAndRanking();
    }
  }, [selectedChampionship]);

  return (
    <div className="ranking-container">
      <Header />
      <h1>Tabla de Posiciones</h1>

      {/* Mostrar errores */}
      {error && <p className="error-message">{error}</p>}

      {/* Selección de campeonato */}
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

      {/* Mostrar datos de ranking */}
      {loading ? (
        <p>Cargando datos...</p>
      ) : rankingData.length > 0 ? (
        <table className="ranking-table">
          <thead>
            <tr>
              <th>Jugador</th>
              <th>Puntos</th>
              <th>PG</th>
              <th>PP</th>
              <th>PJ</th>
            </tr>
          </thead>
          <tbody>
            {rankingData.map((data) => (
              <tr key={data.id}>
                <td>{players[data.ID_Jugador] || "Jugador no encontrado"}</td>
                <td>{data.Puntos || 0}</td>
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

      {/* Botón genérico para volver */}
      <div className="button-container">
        <Button text="Volver" onClick={() => navigate(-1)} className="primary-button" />
      </div>
    </div>
  );
};

export default Ranking;
