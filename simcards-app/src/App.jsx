import { useState, useEffect } from 'react';
import axios from 'axios';

// Componente Sidebar importado
import Sidebar from './components/Sidebar';

// Vistas
import LoginView from './components/LoginView';
import DashboardView from './components/DashboardView';
import DevicesView from './components/DevicesView';
import UsersView from './components/UsersView';
import SyncView from './components/SyncView';
import TeamsView from './components/TeamsView';
import OperatorsView from './components/OperatorsView';
import PanelControlView from './components/PanelControlView';

// Modales
import UserEditModal from './components/UserEditModal';
import HistoryModal from './components/HistoryModal';
import SimEditModal from './components/SimEditModal';

import './App.css';

// URL relativa unificada para producción
const API_URL = '/api';

const getInitialUser = () => {
  try {
    const item = localStorage.getItem('user');
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
};

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(getInitialUser());
  const [activeTab, setActiveTab] = useState('panel'); // 'panel' por defecto al iniciar
  const [loginError, setLoginError] = useState('');

  const [simcards, setSimcards] = useState([]);
  const [devices, setDevices] = useState([]);
  const [operators, setOperators] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [teamsList, setTeamsList] = useState([]);
  const [targetDeviceId, setTargetDeviceId] = useState(null);

  const [editingUser, setEditingUser] = useState(null);
  const [editingSim, setEditingSim] = useState(null);
  const [selectedLogs, setSelectedLogs] = useState(null);
  const [selectedPhone, setSelectedPhone] = useState('');

  // Helper para verificar si es administrador sin importar minúsculas/mayúsculas
  const isAdmin = user?.role === 'admin' || user?.role === 'Administrador';

  useEffect(() => {
    if (token) {
      fetchAllData();

      const interval = setInterval(() => {
        fetchSimcards();
        fetchDevices();
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [token, user?.role]);

  const fetchAllData = () => {
    fetchSimcards();
    fetchDevices();
    fetchOperators();
    fetchTeams();
    if (isAdmin) {
      fetchUsers();
    }
  };

  const fetchSimcards = async () => {
    try {
      const res = await axios.get(`${API_URL}/simcards`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSimcards(res.data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleLogout();
      }
    }
  };

  const fetchDevices = async () => {
    try {
      const res = await axios.get(`${API_URL}/devices`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDevices(res.data);
    } catch (err) {
      console.error('Error al cargar dispositivos:', err);
    }
  };

  const fetchOperators = async () => {
    try {
      const res = await axios.get(`${API_URL}/operators`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOperators(res.data);
    } catch (err) {
      console.error('Error al cargar operadores:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsersList(res.data);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await axios.get(`${API_URL}/teams`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeamsList(res.data);
    } catch (err) {
      console.error('Error al cargar equipos:', err);
    }
  };

  const handleLogin = async (email, password) => {
    setLoginError('');
    try {
      const res = await axios.post(`${API_URL}/login`, { email, password });
      const { token: newToken, user: userData } = res.data;

      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));

      if (userData.role === 'admin' || userData.role === 'Administrador') fetchUsers();
      fetchTeams();
    } catch (err) {
      setLoginError(err.response?.data?.error || 'Error al iniciar sesión. Verifique sus credenciales.');
    }
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const navigateToDevice = (deviceId) => {
    setTargetDeviceId(deviceId);
    setActiveTab('devices');
  };

  const handleCreateUser = async (userData, resetCallback) => {
    try {
      await axios.post(
        `${API_URL}/users`,
        userData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Usuario creado con éxito');
      resetCallback();
      fetchUsers();
      fetchTeams();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al crear usuario');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${API_URL}/users/${editingUser.id}`,
        editingUser,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Usuario actualizado correctamente');
      setEditingUser(null);
      fetchUsers();
      fetchTeams();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al actualizar usuario');
    }
  };

  const handleDeleteUser = async (u) => {
    if (u.id === user?.id) {
      alert('No podés eliminar tu propio usuario actual.');
      return;
    }

    const confirmDelete = window.confirm(`¿Estás seguro que deseas eliminar al usuario ${u.name}?`);
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_URL}/users/${u.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
      fetchTeams();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar usuario');
    }
  };

  const handleCreateSim = async (newPhone, newCampaign, waType = '', waLink = '') => {
    try {
      await axios.post(
        `${API_URL}/simcards`,
        {
          phone_number: newPhone,
          campaign: newCampaign || user?.campaign || 'General',
          wa_type: waType,
          wa_link: waLink
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchSimcards();
    } catch (err) {
      alert('Error al crear SIMCard');
    }
  };

  const handleEditPhone = (sim) => {
    setEditingSim(sim);
  };

  const handleSaveSimEdit = async (simData) => {
    try {
      await axios.put(
        `${API_URL}/simcards/edit/${simData.id}`,
        {
          phone_number: simData.phoneNumber,
          campaign: simData.campaign,
          team: simData.team,
          wa_type: simData.waType,
          wa_link: simData.waLink
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchSimcards();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al actualizar la SIMCard.');
    }
  };

  const handleViewHistory = async (sim) => {
    try {
      const res = await axios.get(`${API_URL}/simcards/${sim.id}/logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedPhone(sim.phone_number);
      setSelectedLogs(res.data);
    } catch (err) {
      alert('Error al cargar el historial.');
    }
  };

  const handleDeleteSim = async (sim) => {
    const confirmDelete = window.confirm(`¿Estás seguro que deseas eliminar el número ${sim.phone_number}?`);
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_URL}/simcards/${sim.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSimcards();
    } catch (err) {
      alert('Error al eliminar la línea.');
    }
  };

  const handleStatusChange = async (simId, newStatus) => {
    if (newStatus === 'Repuesto') {
      const confirmRepuesto = window.confirm('¿El Chip ha sido repuesto?');
      if (!confirmRepuesto) return;

      try {
        await axios.put(
          `${API_URL}/simcards/${simId}`,
          { new_status: 'Repuesto', observation: 'Línea reemplazada por la empresa' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchSimcards();
      } catch (err) {
        alert('Error al actualizar el estado.');
      }
      return;
    }

    const observation = prompt(`Cambiar estado a "${newStatus}". Ingresa una observación (opcional):`);
    if (observation === null) return;

    try {
      await axios.put(
        `${API_URL}/simcards/${simId}`,
        { new_status: newStatus, observation },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchSimcards();
    } catch (err) {
      alert('Error al actualizar el estado');
    }
  };

  const getBadgeClass = (status) => {
    if (status === 'Activo') return 'badge-activo';
    if (status === 'En stock/Sin uso') return 'badge-stock';
    if (status?.includes('Bloqueado')) return 'badge-bloqueado';
    if (status === 'Quemado') return 'badge-quemado';
    if (status === 'Repuesto') return 'badge-repuesto';
    return '';
  };

  if (!token) {
    return <LoginView handleLogin={handleLogin} loginError={loginError} />;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: 'transparent' }}>

      {/* Sidebar Aislado */}
      <Sidebar
        user={user}
        isAdmin={isAdmin}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setTargetDeviceId={setTargetDeviceId}
        handleLogout={handleLogout}
      />

      {/* Contenido Principal */}
      <main style={{ flex: 1, padding: '30px', overflowY: 'auto', height: '100vh', boxSizing: 'border-box' }}>

        <div key={activeTab} className="view-animated">

          {/* VISTA PANEL DE CONTROL */}
          {activeTab === 'panel' && (
            <PanelControlView
              user={user}
              devices={devices}
              simcards={simcards}
              operators={operators}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {/* VISTA INVENTARIO SIMS */}
          {activeTab === 'dashboard' && (
            <DashboardView
              simcards={simcards}
              user={user}
              handleCreateSim={handleCreateSim}
              handleEditPhone={handleEditPhone}
              handleViewHistory={handleViewHistory}
              handleDeleteSim={handleDeleteSim}
              handleStatusChange={handleStatusChange}
              getBadgeClass={getBadgeClass}
              navigateToDevice={navigateToDevice}
            />
          )}

          {/* VISTA DISPOSITIVOS */}
          {activeTab === 'devices' && (
            <DevicesView
              API_URL={API_URL}
              token={token}
              user={user}
              simcards={simcards}
              fetchSimcards={fetchSimcards}
              targetDeviceId={targetDeviceId}
            />
          )}

          {/* VISTA OPERADORES */}
          {activeTab === 'operators' && (
            <OperatorsView
              API_URL={API_URL}
              token={token}
              user={user}
            />
          )}

          {/* VISTA EQUIPOS */}
          {activeTab === 'teams' && isAdmin && (
            <TeamsView API_URL={API_URL} token={token} onTeamsChange={fetchTeams} />
          )}

          {/* VISTA USUARIOS */}
          {activeTab === 'users' && isAdmin && (
            <UsersView
              usersList={usersList}
              teamsList={teamsList}
              handleCreateUser={handleCreateUser}
              setEditingUser={setEditingUser}
              handleDeleteUser={handleDeleteUser}
            />
          )}

          {/* VISTA CONCILIACIÓN */}
          {activeTab === 'sync' && isAdmin && (
            <SyncView API_URL={API_URL} token={token} />
          )}

        </div>

      </main>

      {/* Modales */}
      <UserEditModal
        editingUser={editingUser}
        teamsList={teamsList}
        setEditingUser={setEditingUser}
        handleUpdateUser={handleUpdateUser}
      />

      <SimEditModal
        editingSim={editingSim}
        setEditingSim={setEditingSim}
        handleSaveSimEdit={handleSaveSimEdit}
      />

      <HistoryModal
        selectedLogs={selectedLogs}
        selectedPhone={selectedPhone}
        setSelectedLogs={setSelectedLogs}
        getBadgeClass={getBadgeClass}
      />
    </div>
  );
}