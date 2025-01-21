import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminLogin.css";
import { collection, query, where, getDocs } from "firebase/firestore";
import db from "../firebase";

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const { email, password } = formData;

    try {
      const adminsRef = collection(db, "Administradores");
      const q = query(adminsRef, where("Correo", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const adminData = querySnapshot.docs[0].data();
        if (adminData.Clave === password) {
          navigate("/admin-dashboard", { state: { admin: adminData } });
        } else {
          setError("Clave incorrecta. Inténtalo de nuevo.");
        }
      } else {
        setError("Correo no encontrado.");
      }
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      setError("Ocurrió un error. Inténtalo más tarde.");
    }
  };

  return (
    <div className="admin-login-container">
      <h2>Inicio de Sesión - Administrador</h2>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label>Correo Electrónico:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Clave:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn-login">Iniciar Sesión</button>
      </form>
    </div>
  );
};

export default AdminLogin;
