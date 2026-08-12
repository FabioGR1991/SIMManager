import { useState } from 'react';
import { Mail, Lock, LogIn } from 'lucide-react';

export default function LoginView({ handleLogin, loginError }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    handleLogin(email, password);
  };

  return (
    <div style={styles.pageBackground}>
      {/* Animaciones CSS inyectadas para esferas de luz y botón */}
      <style>{`
        @keyframes floatPulse1 {
          0% { transform: translate(0px, 0px) scale(1); opacity: 0.6; }
          50% { transform: translate(40px, -30px) scale(1.25); opacity: 0.9; }
          100% { transform: translate(0px, 0px) scale(1); opacity: 0.6; }
        }
        @keyframes floatPulse2 {
          0% { transform: translate(0px, 0px) scale(1); opacity: 0.5; }
          50% { transform: translate(-50px, 40px) scale(1.3); opacity: 0.85; }
          100% { transform: translate(0px, 0px) scale(1); opacity: 0.5; }
        }
        @keyframes floatPulse3 {
          0% { transform: translate(0px, 0px) scale(0.9); opacity: 0.4; }
          50% { transform: translate(30px, 50px) scale(1.2); opacity: 0.8; }
          100% { transform: translate(0px, 0px) scale(0.9); opacity: 0.4; }
        }
        @keyframes glowBtn {
          0%, 100% { box-shadow: 0 0 15px rgba(37, 99, 235, 0.4); }
          50% { box-shadow: 0 0 25px rgba(37, 99, 235, 0.85); }
        }
      `}</style>

      {/* Esferas de luz animadas en el fondo */}
      <div style={{ ...styles.orb, ...styles.orb1 }} />
      <div style={{ ...styles.orb, ...styles.orb2 }} />
      <div style={{ ...styles.orb, ...styles.orb3 }} />
      <div style={{ ...styles.orb, ...styles.orb4 }} />

      {/* Tarjeta SIM de Vidrio */}
      <div style={styles.simCardContainer}>
        
        {/* Chip SIM Dorado Vectorizado */}
        <div style={styles.chipHeader}>
          <div style={styles.simChip}>
            <div style={styles.chipLineHorizontal} />
            <div style={styles.chipLineVertical} />
            <div style={styles.chipInnerBox} />
          </div>
        </div>

        {/* Título y Subtítulo */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={styles.title}>Gestión de SIMCards</h2>
          <p style={styles.subtitle}>Inicia sesión para acceder al sistema</p>
        </div>

        {/* Alerta de Error original (mantiene la clase .error-alert con estilos adaptados) */}
        {loginError && (
          <div style={styles.errorAlert} className="error-alert">
            {loginError}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="email" style={styles.label}>Correo Electrónico</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} color="#94a3b8" style={styles.inputIcon} />
              <input
                type="email"
                id="email"
                style={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@tandemtech.com.ar"
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="password" style={styles.label}>Contraseña</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} color="#94a3b8" style={styles.inputIcon} />
              <input
                type="password"
                id="password"
                style={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required
              />
            </div>
          </div>

          <button type="submit" style={styles.submitButton}>
            <LogIn size={18} />
            <span>Ingresar al Sistema</span>
          </button>
        </form>

      </div>
    </div>
  );
}

// ESTILOS GLASSMORPHISM Y FONDO VIVO
const styles = {
  pageBackground: {
    position: 'relative',
    minHeight: '100vh',
    width: '100vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#070c1a',
    backgroundImage: `
      radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.5) 0%, rgba(7, 12, 26, 1) 100%),
      linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
    `,
    backgroundSize: '100% 100%, 40px 40px, 40px 40px',
    overflow: 'hidden',
    padding: '20px',
    boxSizing: 'border-box',
  },

  // Esferas Flotantes
  orb: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(50px)',
    pointerEvents: 'none',
  },
  orb1: {
    top: '20%',
    left: '18%',
    width: '180px',
    height: '180px',
    background: 'radial-gradient(circle, #38bdf8 0%, #0284c7 100%)',
    animation: 'floatPulse1 12s ease-in-out infinite',
  },
  orb2: {
    top: '15%',
    right: '20%',
    width: '160px',
    height: '160px',
    background: 'radial-gradient(circle, #fde047 0%, #ca8a04 100%)',
    animation: 'floatPulse2 10s ease-in-out infinite',
  },
  orb3: {
    bottom: '25%',
    right: '32%',
    width: '130px',
    height: '130px',
    background: 'radial-gradient(circle, #60a5fa 0%, #1d4ed8 100%)',
    animation: 'floatPulse3 14s ease-in-out infinite',
  },
  orb4: {
    bottom: '18%',
    left: '25%',
    width: '100px',
    height: '100px',
    background: 'radial-gradient(circle, #fef08a 0%, #eab308 100%)',
    animation: 'floatPulse1 9s ease-in-out infinite reverse',
  },

  // Contenedor SIM Card en Vidrio
  simCardContainer: {
    position: 'relative',
    zIndex: 10,
    width: '100%',
    maxWidth: '390px',
    padding: '40px 32px 36px 32px',
    borderRadius: '28px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    clipPath: 'polygon(0 0, calc(100% - 42px) 0, 100% 42px, 100% 100%, 0 100%)',
    boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.25)',
    boxSizing: 'border-box',
  },

  // Detalle Chip SIM
  chipHeader: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  simChip: {
    width: '54px',
    height: '42px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #fef08a 0%, #eab308 50%, #ca8a04 100%)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    position: 'relative',
    boxShadow: '0 4px 12px rgba(234, 179, 8, 0.35), inset 0 1px 2px rgba(255,255,255,0.8)',
  },
  chipLineHorizontal: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: '1px',
    backgroundColor: '#854d0e',
    opacity: 0.6,
  },
  chipLineVertical: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: '1px',
    backgroundColor: '#854d0e',
    opacity: 0.6,
  },
  chipInnerBox: {
    position: 'absolute',
    top: '20%',
    left: '20%',
    right: '20%',
    bottom: '20%',
    border: '1px solid #854d0e',
    borderRadius: '3px',
    opacity: 0.5,
  },

  title: {
    margin: 0,
    fontSize: '22px',
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    margin: '6px 0 0 0',
    fontSize: '13px',
    color: '#94a3b8',
  },

  // Alerta de Error
  errorAlert: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    border: '1px solid rgba(239, 68, 68, 0.4)',
    color: '#fca5a5',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '16px',
    textAlign: 'center',
    backdropFilter: 'blur(5px)',
  },

  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#cbd5e1',
  },

  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '12px 14px 12px 42px',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    backdropFilter: 'blur(5px)',
  },

  submitButton: {
    marginTop: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '13px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    animation: 'glowBtn 4s infinite ease-in-out',
  },
};