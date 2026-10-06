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
import SimActionDialog from './components/SimActionDialog';

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
  const [simDialog, setSimDialog] = useState(null);

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

  const notifySimInventory = (message) => {
    setSimDialog({
      type: 'notice',
      title: 'Inventario de SIMCards',
      messagePrefix: message
    });
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
      return true;
    } catch (err) {
      setSimDialog({
        type: 'notice',
        title: 'No se pudo crear la SIMCard',
        messagePrefix: err.response?.data?.error || 'Ocurrió un error al crear la línea. Revisá los datos e intentá nuevamente.'
      });
      return false;
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
      return true;
    } catch (err) {
      setSimDialog({
        type: 'notice',
        title: 'No se pudo guardar la SIMCard',
        messagePrefix: err.response?.data?.error || 'Ocurrió un error al actualizar la línea. Intentá nuevamente.'
      });
      return false;
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
      setSimDialog({
        type: 'notice',
        title: 'No se pudo cargar el historial',
        messagePrefix: err.response?.data?.error || 'Ocurrió un error al cargar los movimientos de esta línea. Intentá nuevamente.'
      });
    }
  };

  const executeDeleteSim = async (sim) => {
    try {
      await axios.delete(`${API_URL}/simcards/${sim.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSimcards();
      return true;
    } catch (err) {
      setSimDialog({
        type: 'notice',
        title: 'No se pudo eliminar la SIMCard',
        messagePrefix: err.response?.data?.error || 'Ocurrió un error al eliminar la línea. Intentá nuevamente.'
      });
      return false;
    }
  };

  const executeStatusChange = async (simId, newStatus, observation = '') => {
    if (newStatus === 'Repuesto') {
      try {
        await axios.put(
          `${API_URL}/simcards/${simId}`,
          { new_status: 'Repuesto', observation: 'Línea reemplazada por la empresa' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchSimcards();
        return true;
      } catch (err) {
        setSimDialog({
          type: 'notice',
          title: 'No se pudo actualizar el estado',
          messagePrefix: err.response?.data?.error || 'Ocurrió un error al actualizar la línea. Intentá nuevamente.'
        });
        return false;
      }
      return;
    }

    try {
      await axios.put(
        `${API_URL}/simcards/${simId}`,
        { new_status: newStatus, observation },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchSimcards();
      return true;
    } catch (err) {
      setSimDialog({
        type: 'notice',
        title: 'No se pudo actualizar el estado',
        messagePrefix: err.response?.data?.error || 'Ocurrió un error al actualizar la línea. Intentá nuevamente.'
      });
      return false;
    }
  };

  const handleDeleteSim = (sim) => {
    setSimDialog({
      type: 'confirm',
      action: 'delete',
      sim,
      title: '¿Eliminar SIMCard?',
      messagePrefix: 'Se eliminará la línea ',
      highlighted: sim.phone_number,
      messageSuffix: '. Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar SIMCard',
      tone: 'danger'
    });
  };

  const handleStatusChange = (simId, newStatus) => {
    setSimDialog({
      type: newStatus === 'Repuesto' ? 'confirm' : 'prompt',
      action: 'status',
      simId,
      newStatus,
      title: newStatus === 'Repuesto' ? 'Confirmar reposición' : `Cambiar estado a ${newStatus}`,
      messagePrefix: newStatus === 'Repuesto'
        ? '¿El chip fue repuesto y está listo para actualizar su estado?'
        : 'Podés agregar una observación para dejar constancia del cambio.',
      confirmLabel: newStatus === 'Repuesto' ? 'Confirmar reposición' : 'Actualizar estado'
    });
  };

  const handleSimDialogConfirm = async (observation) => {
    const dialog = simDialog;
    if (!dialog) return;

    if (dialog.action === 'delete') {
      const succeeded = await executeDeleteSim(dialog.sim);
      if (succeeded) setSimDialog(null);
      return;
    }

    const succeeded = await executeStatusChange(
      dialog.simId,
      dialog.newStatus,
      dialog.newStatus === 'Repuesto' ? 'Línea reemplazada por la empresa' : observation
    );
    if (succeeded) setSimDialog(null);
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
      <main className="app-main-content">

        <div key={activeTab} className="app-view-shell view-animated">

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
              notify={notifySimInventory}
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
        teamsList={teamsList}
      />

      <HistoryModal
        selectedLogs={selectedLogs}
        selectedPhone={selectedPhone}
        setSelectedLogs={setSelectedLogs}
        getBadgeClass={getBadgeClass}
      />

      <SimActionDialog
        dialog={simDialog}
        onConfirm={handleSimDialogConfirm}
        onClose={() => setSimDialog(null)}
      />
    </div>
  );
}