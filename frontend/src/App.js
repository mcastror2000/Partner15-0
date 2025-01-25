import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import PlayerLogin from "./pages/PlayerLogin";
import PlayerDashboard from "./pages/PlayerDashboard"; // Panel del jugador
import Register from "./pages/Register";
import Player from "./pages/Player"; // Componente de jugador
import AdminLogin from "./pages/AdminLogin"; // Página de inicio de sesión del administrador
import AdminDashboard from "./pages/AdminDashboard"; // Panel de administrador
import AdminManageChampionships from "./pages/AdminManageChampionships"; // Nueva página para gestionar campeonatos
import ScheduleMatches from "./pages/ScheduleMatches"; // Nueva página para programar partidos
import UpdateResults from "./pages/UpdateResults"; // Nueva página para actualizar resultados
import UpdateStandings from "./pages/UpdateStandings"; // Nueva página para actualizar el ranking
import Ranking from "./pages/Ranking"; // Nueva página para mostrar la tabla de posiciones

function App() {
  return (
    <Router>
      <Routes>
        {/* Página de inicio */}
        <Route path="/" element={<Home />} />

        {/* Inicio de sesión del jugador */}
        <Route path="/player-login" element={<PlayerLogin />} />

        {/* Panel del jugador */}
        <Route path="/player-dashboard" element={<PlayerDashboard />} />

        {/* Página de registro */}
        <Route path="/register" element={<Register />} />

        {/* Información del jugador */}
        <Route path="/player" element={<Player />} />

        {/* Inicio de sesión del administrador */}
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* Panel del administrador */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />

        {/* Gestión de campeonatos */}
        <Route path="/manage-tournaments" element={<AdminManageChampionships />} />

        {/* Programar partidos */}
        <Route path="/schedule-matches" element={<ScheduleMatches />} />

        {/* Actualizar resultados */}
        <Route path="/update-results" element={<UpdateResults />} />

        {/* Actualizar ranking */}
        <Route path="/update-standings" element={<UpdateStandings />} />

        {/* Tabla de posiciones */}
        
        <Route path="/ranking" element={<Ranking />} />
<Route path="/ranking/:idCampeonato" element={<Ranking />} />

    
      </Routes>
    </Router>
  );
}

export default App;
