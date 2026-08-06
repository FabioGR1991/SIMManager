import { useState } from 'react';

export default function LoginView({ handleLogin, loginError }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    handleLogin(email, password);
  };

  return (
    <div className="login-page">
      <div className="simcard-container">
        <div className="login-panel">
          <h2 className="login-title">Gestión de SIMCards</h2>
          <p className="login-subtitle">Inicia sesión para acceder al sistema</p>

          {loginError && <div className="error-alert">{loginError}</div>}

          <form onSubmit={onSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@tandemtech.com.ar"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required
              />
            </div>

            <button type="submit" className="btn-submit">
              Ingresar al Sistema
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}