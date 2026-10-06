import { useState } from 'react';
import { Lock, LogIn, Mail } from 'lucide-react';

export default function LoginView({ handleLogin, loginError }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleCardMouseMove = (event) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const card = event.currentTarget;
    const bounds = card.getBoundingClientRect();
    const xOffset = (event.clientX - bounds.left) / bounds.width - 0.5;
    const yOffset = (event.clientY - bounds.top) / bounds.height - 0.5;
    const rotateY = xOffset * 13;
    const rotateX = yOffset * -9;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
  };

  const resetCardTilt = (event) => {
    event.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  };

  const onSubmit = (event) => {
    event.preventDefault();
    handleLogin(email, password);
  };

  return (
    <div className="login-page">
      <div className="login-scene" aria-hidden="true">
        <div className="login-scene-glow" />
        <div className="login-grid" />
        <div className="login-orb login-orb-cyan" />
        <div className="login-orb login-orb-gold" />
        <div className="login-orb login-orb-blue" />
        <div className="login-orb login-orb-amber" />
        <div className="login-floor" />
      </div>

      <main className="login-stage">
        <div className="login-card-viewport">
          <div
            className="login-sim-card"
            id="sim-card"
            onMouseMove={handleCardMouseMove}
            onMouseLeave={resetCardTilt}
          >
            <div className="login-sim-card-inner">
              <div className="login-card-highlight" aria-hidden="true" />
              <div className="login-card-glow login-card-glow-cyan" aria-hidden="true" />
              <div className="login-card-glow login-card-glow-gold" aria-hidden="true" />

              <header className="login-brand">
                <div className="login-chip" aria-hidden="true">
                  <div className="login-chip-grid">
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="login-chip-center"><span /></div>
                  <div className="login-chip-grid">
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
                <h1 className="login-brand-title">
                  <span>SIM</span><span>finity</span>
                </h1>
                <p className="login-tagline">Conectividad sin límites.</p>
                <div className="login-card-id">
                  <span>[ SIM CARD IDENTIFIER ]</span>
                  <strong>SIMFINITY · ENTERPRISE</strong>
                </div>
              </header>

              <section className="login-auth" aria-labelledby="login-form-title">
                <h2 className="login-section-label" id="login-form-title">[ SERVICE CREDENTIALS ]</h2>

                {loginError && (
                  <div className="login-error" role="alert" aria-live="polite">
                    {loginError}
                  </div>
                )}

                <form className="login-form" onSubmit={onSubmit}>
                  <div className="login-field">
                    <label htmlFor="email">Correo Electrónico</label>
                    <div className="login-input-wrap">
                      <Mail size={18} aria-hidden="true" />
                      <input
                        autoComplete="username"
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="usuario@tandemtech.com.ar"
                        required
                      />
                    </div>
                  </div>

                  <div className="login-field">
                    <label htmlFor="password">Contraseña</label>
                    <div className="login-input-wrap">
                      <Lock size={18} aria-hidden="true" />
                      <input
                        autoComplete="current-password"
                        id="password"
                        name="password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  <div className="login-submit-area">
                    <span className="login-section-label">[ SERVICE ACCESS ]</span>
                    <button className="login-submit" type="submit">
                      <LogIn size={17} aria-hidden="true" />
                      <span>Ingresar al Sistema</span>
                    </button>
                  </div>
                </form>
              </section>

              <div className="login-card-status" aria-label="Estado del servicio">
                <span className="login-status-label">[ STATUS ]</span>
                <strong><i /> Conexión segura</strong>
                <span className="login-status-label">[ NETWORK ]</span>
                <strong>SIMFINITY ENTERPRISE</strong>
              </div>
            </div>
          </div>
          <div className="login-card-shadow" aria-hidden="true" />
          <div className="login-card-reflection" aria-hidden="true" />
        </div>
      </main>

      <footer className="login-footer">
        SIMFINITY™ ENTERPRISE CLOUD · SECURE TELECOM NODE · ENCRYPTED
      </footer>
    </div>
  );
}
