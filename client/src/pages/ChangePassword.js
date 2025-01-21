import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import db from "../firebase";
import "../styles/ChangePassword.css";

const ChangePassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const admin = location.state?.admin;

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Las claves no coinciden.");
      return;
    }

    if (formData.currentPassword !== admin.Clave) {
      setError("La clave actual es incorrecta.");
      return;
    }

    try {
      const adminRef = doc(db, "Administradores", admin.id); // Asume que el id está disponible
      await updateDoc(adminRef, { Clave: formData.newPassword });
      setSuccess("Clave actualizada correctamente.");
    } catch (err) {
      console.error("Error al cambiar la clave:", err);
      setError("No se pudo cambiar la clave. Inténtalo más tarde.");
    }
  };

  return (
    <div className="change-password-container">
      <h2>Cambiar Clave</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Clave Actual:</label>
          <input
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Nueva Clave:</label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Confirmar Nueva Clave:</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <button type="submit" className="btn-submit">Actualizar Clave</button>
        <button onClick={() => navigate("/admin-dashboard")} className="btn-back">
          Volver al Panel
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
