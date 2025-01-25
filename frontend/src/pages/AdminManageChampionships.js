import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import db from "../firebase";
import Header from "../components/Header";
import Button from "../components/Button";
import "../styles/AdminManageChampionships.css";

const AdminManageChampionships = () => {
  const [championshipDetails, setChampionshipDetails] = useState({
    name: "",
    startDate: "",
    endDate: "",
    location: "",
    requiredPlayers: 8,
  });
  const [registeredPlayers, setRegisteredPlayers] = useState([]);
  const [missingPlayers, setMissingPlayers] = useState(0);
  const [championships, setChampionships] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [editing, setEditing] = useState(false);
  const [currentChampionshipId, setCurrentChampionshipId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
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

    const fetchPlayers = async () => {
      try {
        const playersCollection = collection(db, "Jugadores");
        const snapshot = await getDocs(playersCollection);
        const players = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setRegisteredPlayers(players);
      } catch (error) {
        console.error("Error al obtener jugadores:", error);
      }
    };

    fetchChampionships();
    fetchPlayers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setChampionshipDetails({ ...championshipDetails, [name]: value });

    if (name === "requiredPlayers") {
      const required = parseInt(value);
      setMissingPlayers(required > registeredPlayers.length ? required - registeredPlayers.length : 0);
    }
  };

  const handleSubmit = async () => {
    const { name, startDate, endDate, location, requiredPlayers } = championshipDetails;

    if (!name || !startDate || !endDate || !location) {
      alert("Por favor, completa todos los campos del campeonato.");
      return;
    }

    if (requiredPlayers > registeredPlayers.length) {
      alert(
        `No se puede programar el campeonato. Faltan ${missingPlayers} jugadores para alcanzar el mínimo requerido.`
      );
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    if (new Date(startDate) < new Date(today)) {
      alert("La fecha de inicio no puede ser anterior a la fecha actual.");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      alert("La fecha de término no puede ser anterior a la fecha de inicio.");
      return;
    }

    try {
      if (editing) {
        const championshipDoc = doc(db, "Campeonatos", currentChampionshipId);
        await updateDoc(championshipDoc, { name, startDate, endDate, location, requiredPlayers });
        setSuccessMessage(`Campeonato "${name}" actualizado exitosamente.`);
        setEditing(false);
        setCurrentChampionshipId(null);
      } else {
        const newChampionship = { name, startDate, endDate, location, requiredPlayers };
        const docRef = await addDoc(collection(db, "Campeonatos"), newChampionship);
        setSuccessMessage(`Campeonato "${name}" programado exitosamente con ID: ${docRef.id}`);
      }

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      setChampionshipDetails({ name: "", startDate: "", endDate: "", location: "", requiredPlayers: 8 });
      const championshipsSnapshot = await getDocs(collection(db, "Campeonatos"));
      setChampionships(
        championshipsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    } catch (error) {
      console.error("Error al guardar el campeonato:", error);
      alert("Ocurrió un error al guardar el campeonato.");
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
        const championshipDoc = doc(db, "Campeonatos", id);
        await deleteDoc(championshipDoc);

        setChampionships((prev) =>
          prev.filter((championship) => championship.id !== id)
        );
        alert("Campeonato eliminado con éxito.");
      } catch (error) {
        console.error("Error al eliminar el campeonato:", error);
        alert("Ocurrió un error al intentar eliminar el campeonato.");
      }
    }
  };

  return (
    <div>
      <Header />
      <div className="manage-championships-container">
        <h1>Programar Campeonato</h1>
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
              name="startDate"
              value={championshipDetails.startDate}
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
            <label>Número de Jugadores Requeridos:</label>
            <select
              name="requiredPlayers"
              value={championshipDetails.requiredPlayers}
              onChange={handleChange}
            >
              <option value={8}>8 Jugadores</option>
              <option value={16}>16 Jugadores</option>
              <option value={32}>32 Jugadores</option>
            </select>
          </div>
          <div className="form-group">
            <p>Jugadores Inscritos: {registeredPlayers.length}</p>
            {missingPlayers > 0 && (
              <p className="warning">Faltan {missingPlayers} jugadores para completar el mínimo requerido.</p>
            )}
          </div>
          <div className="form-group-center">
            <Button
              text={editing ? "Actualizar" : "Programar"}
              onClick={handleSubmit}
              className="primary-button"
            />
          </div>
        </form>
        {successMessage && (
          <div className="success-message">
            <p>{successMessage}</p>
          </div>
        )}
        <h2>Campeonatos Programados</h2>
        <ul className="championship-list">
          {championships.map((championship) => (
            <li key={championship.id}>
              <p>
                <strong>Nombre:</strong> {championship.name}
              </p>
              <p>
                <strong>Inicio:</strong> {championship.startDate}
              </p>
              <p>
                <strong>Término:</strong> {championship.endDate}
              </p>
              <p>
                <strong>Ubicación:</strong> {championship.location}
              </p>
              <p>
                <strong>Jugadores Requeridos:</strong> {championship.requiredPlayers}
              </p>
              <div className="buttons-row">
                <Button
                  text="Editar"
                  onClick={() => handleEdit(championship)}
                  className="primary-button"
                />
                <Button
                  text="Eliminar"
                  onClick={() => handleDelete(championship.id)}
                  className="primary-button"
                />
              </div>
            </li>
          ))}
        </ul>
        <div className="buttons-container">
          <Button
            text="Panel de Administración"
            onClick={() => navigate("/admin-dashboard")}
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

export default AdminManageChampionships;
