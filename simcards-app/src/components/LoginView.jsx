import { useEffect, useRef, useState } from 'react';
import { Lock, LogIn, Mail } from 'lucide-react';

export default function LoginView({ handleLogin, loginError }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const cardRef = useRef(null);
  const orbRefs = useRef([]);

  const resetCardTilt = (card) => {
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  };

  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionPreference.matches) return undefined;

    const scene = document.querySelector('.login-scene');
    const orbs = orbRefs.current.filter(Boolean);
    if (!scene || orbs.length === 0) return undefined;

    const magnetRadius = 950;
    const magnetStrength = 1050;
    const maxSpeed = 500;
    const restitution = 0.88;
    const particles = orbs.map((element, index) => {
      const bounds = element.getBoundingClientRect();
      const radius = Math.min(bounds.width, bounds.height) * 0.36;
      return {
        element,
        radius,
        x: bounds.left + bounds.width / 2,
        y: bounds.top + bounds.height / 2,
        baseX: bounds.left + bounds.width / 2,
        baseY: bounds.top + bounds.height / 2,
        vx: Math.cos(index * 1.7) * 105,
        vy: Math.sin(index * 1.7) * 105,
        index,
        nearCursor: false,
      };
    });

    let animationFrame = null;
    let pointerPosition = null;
    let previousFrameTime = 0;

    const drawOrb = (particle) => {
      const offsetX = particle.x - particle.baseX;
      const offsetY = particle.y - particle.baseY;
      const nearCursor = pointerPosition
        && Math.hypot(particle.x - pointerPosition.x, particle.y - pointerPosition.y) < magnetRadius;
      const scale = nearCursor ? 1.22 : 1;

      particle.element.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0) scale(${scale})`;
      if (Boolean(nearCursor) !== particle.nearCursor) {
        particle.element.style.filter = nearCursor ? 'blur(42px) brightness(1.45)' : 'blur(56px) brightness(1)';
        particle.nearCursor = Boolean(nearCursor);
      }
    };

    const updateOrbs = (time) => {
      const deltaTime = previousFrameTime
        ? Math.min((time - previousFrameTime) / 1000, 0.032)
        : 1 / 60;
      previousFrameTime = time;
      const sceneBounds = scene.getBoundingClientRect();
      const damping = Math.exp(-0.28 * deltaTime);

      particles.forEach((particle) => {
        const driftPhase = time * 0.00035 + particle.index * 1.7;
        particle.vx += Math.cos(driftPhase) * 34 * deltaTime;
        particle.vy += Math.sin(driftPhase * 0.83) * 28 * deltaTime;

        if (pointerPosition) {
          const deltaX = pointerPosition.x - particle.x;
          const deltaY = pointerPosition.y - particle.y;
          const distance = Math.hypot(deltaX, deltaY);

          if (distance > 1 && distance < magnetRadius) {
            const force = magnetStrength * (1 - distance / magnetRadius);
            particle.vx += (deltaX / distance) * force * deltaTime;
            particle.vy += (deltaY / distance) * force * deltaTime;
          }
        }

        particle.vx *= damping;
        particle.vy *= damping;
        const speed = Math.hypot(particle.vx, particle.vy);
        if (speed > maxSpeed) {
          particle.vx = (particle.vx / speed) * maxSpeed;
          particle.vy = (particle.vy / speed) * maxSpeed;
        }

        particle.x += particle.vx * deltaTime;
        particle.y += particle.vy * deltaTime;
      });

      for (let first = 0; first < particles.length; first += 1) {
        for (let second = first + 1; second < particles.length; second += 1) {
          const a = particles[first];
          const b = particles[second];
          let dx = b.x - a.x;
          let dy = b.y - a.y;
          let distance = Math.hypot(dx, dy);
          const minimumDistance = a.radius + b.radius;

          if (distance >= minimumDistance) continue;
          if (distance === 0) {
            dx = 1;
            distance = 1;
          }

          const normalX = dx / distance;
          const normalY = dy / distance;
          const overlap = minimumDistance - distance;
          a.x -= normalX * overlap * 0.5;
          a.y -= normalY * overlap * 0.5;
          b.x += normalX * overlap * 0.5;
          b.y += normalY * overlap * 0.5;

          const relativeVelocity = (b.vx - a.vx) * normalX + (b.vy - a.vy) * normalY;
          if (relativeVelocity < 0) {
            const impulse = -((1 + restitution) * relativeVelocity) / 2;
            a.vx -= impulse * normalX;
            a.vy -= impulse * normalY;
            b.vx += impulse * normalX;
            b.vy += impulse * normalY;
          }
        }
      }

      particles.forEach((particle) => {
        const minX = sceneBounds.left + particle.radius;
        const maxX = sceneBounds.right - particle.radius;
        const minY = sceneBounds.top + particle.radius;
        const maxY = sceneBounds.bottom - particle.radius;

        if (particle.x < minX) {
          particle.x = minX;
          particle.vx = Math.abs(particle.vx) * restitution;
        } else if (particle.x > maxX) {
          particle.x = maxX;
          particle.vx = -Math.abs(particle.vx) * restitution;
        }

        if (particle.y < minY) {
          particle.y = minY;
          particle.vy = Math.abs(particle.vy) * restitution;
        } else if (particle.y > maxY) {
          particle.y = maxY;
          particle.vy = -Math.abs(particle.vy) * restitution;
        }

        drawOrb(particle);
      });

      animationFrame = window.requestAnimationFrame(updateOrbs);
    };

    const handleMouseMove = (event) => {
      pointerPosition = { x: event.clientX, y: event.clientY };
    };

    const handleMouseLeave = () => {
      pointerPosition = null;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
        animationFrame = null;
        previousFrameTime = 0;
        return;
      }

      if (animationFrame === null) {
        animationFrame = window.requestAnimationFrame(updateOrbs);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    if (!document.hidden) animationFrame = window.requestAnimationFrame(updateOrbs);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  const handleCardMouseMove = (event) => {
    const card = cardRef.current;
    if (!card) return;

    if (event.target.closest('.login-auth')) {
      resetCardTilt(card);
      return;
    }

    const bounds = card.getBoundingClientRect();
    const xOffset = (event.clientX - bounds.left - bounds.width / 2) / (bounds.width / 2);
    const yOffset = (event.clientY - bounds.top - bounds.height / 2) / (bounds.height / 2);
    const rotateY = xOffset * 2.5;
    const rotateX = -yOffset * 2;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.002, 1.002, 1.002)`;
  };

  const handleCardMouseLeave = () => {
    if (cardRef.current) resetCardTilt(cardRef.current);
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
        <div className="login-orb login-orb-cyan" ref={(element) => { orbRefs.current[0] = element; }}>
          <div className="login-orb-plasma login-orb-plasma-cyan" />
        </div>
        <div className="login-orb login-orb-gold" ref={(element) => { orbRefs.current[1] = element; }}>
          <div className="login-orb-plasma login-orb-plasma-gold" />
        </div>
        <div className="login-orb login-orb-blue" ref={(element) => { orbRefs.current[2] = element; }}>
          <div className="login-orb-plasma login-orb-plasma-blue" />
        </div>
        <div className="login-orb login-orb-amber" ref={(element) => { orbRefs.current[3] = element; }}>
          <div className="login-orb-plasma login-orb-plasma-amber" />
        </div>
        <div className="login-floor" />
      </div>

      <main className="login-stage">
        <div className="login-card-viewport">
          <div
            className="login-sim-card"
            id="sim-card"
            ref={cardRef}
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
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

                <form className="login-form login-interactive-lift" onSubmit={onSubmit}>
                  <div className="login-field">
                    <label htmlFor="email">Correo Electrónico</label>
                    <div className="login-input-wrap">
                      <Mail size={18} aria-hidden="true" />
                      <input
                        className="login-input"
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
                        className="login-input"
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
