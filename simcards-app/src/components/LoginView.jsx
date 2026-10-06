import { useEffect, useRef, useState } from 'react';
import { Lock, LogIn, Mail } from 'lucide-react';

export default function LoginView({ handleLogin, loginError }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const simCardRef = useRef(null);

  useEffect(() => {
    const card = simCardRef.current;

    if (!card || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    const handleMouseMove = (event) => {
      const xOffset = (event.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      const yOffset = (event.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
      const rotateY = xOffset * 6.5;
      const rotateX = -yOffset * 4.5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
    };

    const resetTilt = () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', resetTilt);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', resetTilt);
    };
  }, []);

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
          <div className="login-sim-card" id="sim-card" ref={simCardRef}>
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
