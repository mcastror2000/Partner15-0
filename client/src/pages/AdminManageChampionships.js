import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import db from "../firebase";
import "../styles/AdminManageChampionships.css";

const AdminManageChampionships = () => {
  const [championshipDetails, setChampionshipDetails] = useState({
    name: "",
    date: "",
    endDate: "",
    location: "",
  });
  const [minPlayers, setMinPlayers] = useState(8);
  const [registeredPlayers, setRegisteredPlayers] = useState(0);
  const [missingPlayers, setMissingPlayers] = useState(0);
  const [message, setMessage] = useState("");
  const [championships, setChampionships] = useState([]);
  const [editing, setEditing] = useState(false);
  const [currentChampionshipId, setCurrentChampionshipId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const playersCollection = collection(db, "Jugadores");
        const snapshot = await getDocs(playersCollection);
        setRegisteredPlayers(snapshot.size);
      } catch (error) {
        console.error("Error al obtener jugadores:", error);
      }
    };

    const fetchChampionships = async () => {
      try {
        const championshipsCollection = collection(db, "Campeonatos");
        const snapshot = await getDocs(championshipsCollection);
        const fetchedChampionships = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setChampionships(fetchedChampionships);
      } catch (error) {
        console.error("Error al obtener campeonatos:", error);
      }
    };

    fetchPlayers();
    fetchChampionships();
  }, []);

  const initializeTablaPosiciones = async (idCampeonato, jugadores) => {
    try {
      for (const jugador of jugadores) {
        await addDoc(collection(db, "Tabla_Posiciones"), {
          ID_Administrador: "admin_123", // Cambia este valor por el ID real del administrador
          ID_Campeonato: idCampeonato,
          ID_Jugador: jugador.id,
          Partidos_Jugados: 0,
          Partidos_Ganados: 0,
          Puntos: 0,
        });
      }
      console.log("Tabla de posiciones inicializada.");
    } catch (error) {
      console.error("Error al inicializar la tabla de posiciones:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setChampionshipDetails({ ...championshipDetails, [name]: value });
  };

  const handleMinPlayersChange = (e) => {
    const selectedValue = parseInt(e.target.value);
    setMinPlayers(selectedValue);

    if (registeredPlayers < selectedValue) {
      setMissingPlayers(selectedValue - registeredPlayers);
      setMessage(
        `Faltan ${selectedValue - registeredPlayers} jugadores para alcanzar el mínimo necesario.`
      );
    } else {
      setMissingPlayers(0);
      setMessage("Hay suficientes jugadores inscritos para iniciar el campeonato.");
    }
  };

  const handleSubmit = async () => {
    const { name, date, endDate, location } = championshipDetails;

    if (registeredPlayers < minPlayers) {
      alert(
        `No se puede iniciar el campeonato. Faltan ${missingPlayers} jugadores.`
      );
      return;
    }

    if (!name || !date || !endDate || !location) {
      alert("Por favor, completa todos los campos del campeonato.");
      return;
    }

    const today = new Date().toISOString().split("T")[0]; // Fecha actual en formato YYYY-MM-DD
    if (new Date(date) < new Date(today)) {
      alert("La fecha de inicio no puede ser anterior a la fecha actual.");
      return;
    }

    if (new Date(endDate) <= new Date(date)) {
      alert("La fecha de término debe ser posterior a la fecha de inicio.");
      return;
    }

    try {
      const playersSnapshot = await getDocs(collection(db, "Jugadores"));
      const jugadores = playersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (editing) {
        const championshipDoc = doc(db, "Campeonatos", currentChampionshipId);
        await updateDoc(championshipDoc, championshipDetails);
        alert(`Campeonato "${name}" actualizado exitosamente.`);
        setEditing(false);
        setCurrentChampionshipId(null);
      } else {
        const newChampionship = {
          name,
          date,
          endDate,
          location,
        };
        const championshipDocRef = await addDoc(collection(db, "Campeonatos"), newChampionship);

        // Inicializar tabla de posiciones para el campeonato
        await initializeTablaPosiciones(championshipDocRef.id, jugadores);

        alert(
          `Campeonato "${name}" programado exitosamente con ID: ${championshipDocRef.id}`
        );
      }

      setChampionshipDetails({
        name: "",
        date: "",
        endDate: "",
        location: "",
      });
      setMinPlayers(8);

      const championshipsSnapshot = await getDocs(collection(db, "Campeonatos"));
      setChampionships(
        championshipsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    } catch (error) {
      console.error("Error al guardar el campeonato:", error);
    }
  };

  const handleEdit = (championship) => {
    setChampionshipDetails(championship);
    setEditing(true);
    setCurrentChampionshipId(championship.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este campeonato?")) {
      try {
        // Eliminar el documento del campeonato en Firebase
        const championshipDoc = doc(db, "Campeonatos", id);
        await deleteDoc(championshipDoc);

        // Eliminar los documentos relacionados en Tabla_Posiciones
        const posicionesQuery = query(
          collection(db, "Tabla_Posiciones"),
          where("ID_Campeonato", "==", id)
        );
        const posicionesSnapshot = await getDocs(posicionesQuery);
        const batchDeletions = posicionesSnapshot.docs.map((doc) => deleteDoc(doc.ref));
        await Promise.all(batchDeletions);

        // Actualizar el estado local para eliminar el campeonato de la lista
        setChampionships((prevChampionships) =>
          prevChampionships.filter((championship) => championship.id !== id)
        );

        alert("Campeonato y datos relacionados eliminados con éxito.");
      } catch (error) {
        console.error("Error al eliminar el campeonato:", error);
        alert("Ocurrió un error al intentar eliminar el campeonato.");
      }
    }
  };

  const handleBackToDashboard = () => {
    navigate("/admin-dashboard");
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <div className="manage-championships-container">
      <h1>Gestionar Campeonatos</h1>
      <form>
        <div className="form-group">
          <label>Nombre del Campeonato:</label>
          <input
            type="text"
            name="name"
            value={championshipDetails.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Fecha de Inicio:</label>
          <input
            type="date"
            name="date"
            value={championshipDetails.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Fecha de Término:</label>
          <input
            type="date"
            name="endDate"
            value={championshipDetails.endDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Ubicación:</label>
          <input
            type="text"
            name="location"
            value={championshipDetails.location}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Mínimo de Jugadores:</label>
          <select value={minPlayers} onChange={handleMinPlayersChange}>
            <option value={8}>8 Jugadores</option>
            <option value={16}>16 Jugadores</option>
            <option value={32}>32 Jugadores</option>
          </select>
        </div>

        <div className="info-container">
          <p>
            <strong>Jugadores inscritos:</strong> {registeredPlayers}
          </p>
          {message && <p className="message">{message}</p>}
        </div>

        <button
          type="button"
          className="btn-submit"
          onClick={handleSubmit}
        >
          {editing ? "Actualizar Campeonato" : "Programar Campeonato"}
        </button>
      </form>

      <h2>Campeonatos Programados</h2>
      <ul className="championship-list">
        {championships.map((championship) => (
          <li key={championship.id}>
            <p>
              <strong>ID:</strong> {championship.id}
            </p>
            <p>
              <strong>Nombre:</strong> {championship.name}
            </p>
            <p>
              <strong>Inicio:</strong> {championship.date}
            </p>
            <p>
              <strong>Término:</strong> {championship.endDate}
            </p>
            <p>
              <strong>Ubicación:</strong> {championship.location}
            </p>
            <button
              onClick={() => handleEdit(championship)}
              className="btn-edit"
            >
              Editar
            </button>
            <button
              onClick={() => handleDelete(championship.id)}
              className="btn-delete"
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>

      <div className="buttons-container">
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

export default AdminManageChampionships;
