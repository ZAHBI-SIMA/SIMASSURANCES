import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, Lock, User, AlertCircle } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase';
import { useAuth } from '../context/AuthContext';
import logo from '@/assets/logo.png';

const Login = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  useEffect(() => {
    if (user) {
      if (redirectUrl) {
        navigate(redirectUrl);
      } else if (user.role === 'partner') {
        if (user.type === 'Distributeur') {
          navigate('/distributor');
        } else if (user.type === 'Prestataire') {
          navigate('/provider');
        } else {
          // Fallback
          navigate('/distributor');
        }
      } else if (user.role === 'client') {
        navigate('/client');
      } else {
        navigate('/admin'); // Default for admin/staff
      }
    }
  }, [user, navigate, redirectUrl]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // The useEffect will handle redirection once the AuthContext updates 'user'
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
        setError('Identifiant ou mot de passe incorrect.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Trop de tentatives. Veuillez réessayer plus tard.');
      } else {
        setError('Une erreur est survenue lors de la connexion.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="glass-panel login-card">
          <div className="login-header">
            <div className="logo-area cursor-pointer" onClick={() => navigate('/')}>
              <img src={logo} alt="SIMAS Logo" className="logo-img" />
              <div className="logo-text-group">
                <span className="brand-text">SIM</span>
                <span className="brand-subtext">ASSURANCES</span>
              </div>
            </div>
            <p className="subtitle">Connectez-vous à votre espace</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            {error && (
              <div className="error-alert">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Identifiant</label>
              <div className="input-wrapper">
                <User className="input-icon" size={20} />
                <input
                  type="email"
                  id="email"
                  placeholder="admin@simas.com"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={20} />
                <input
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading || authLoading}>
              {loading || authLoading ? 'Connexion en cours...' : 'Se Connecter'}
            </button>
          </form>

          <div className="login-footer-links">
            <p>Nouveau client ? <a href="/register" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>Créer un compte</a></p>
          </div>



          <div className="login-footer">
            <p>© 2025 SIMAS ASSURANCES. Tous droits réservés.</p>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="bg-circles">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
      </div>

      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 2rem 1rem;
        }

        .login-content {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 440px;
          padding: 1rem;
        }

        .login-card {
          padding: 3rem 2rem;
          background: rgb(239 246 255 / 90%);
        }

        .login-header {
          text-align: center;
          margin-bottom: 2.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .logo-area {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            margin-bottom: 1rem;
        }

        .logo-img {
            height: 60px; /* Slightly larger for login page */
            width: auto;
        }

        .logo-text-group {
            display: flex;
            flex-direction: column;
            line-height: 1;
            text-align: left;
        }

        .brand-text {
          font-family: var(--font-display);
          font-size: 2rem;
          font-weight: 800;
          color: var(--color-primary);
          letter-spacing: -0.5px;
        }

        .brand-subtext {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 3px;
        }
        
        /* Removed .logo-icon and .login-header h1 styles */

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: var(--color-text);
          font-size: 0.9rem;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-text-muted);
        }

        .form-input {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 3rem;
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          font-family: var(--font-sans);
          font-size: 1rem;
          background: rgba(255, 255, 255, 0.5);
          transition: all 0.2s;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--color-primary);
          background: white;
          box-shadow: 0 0 0 4px rgba(var(--primary-h), var(--primary-s), var(--primary-l), 0.1);
        }

        .w-full { width: 100%; justify-content: center; }

        .error-alert {
           background: hsla(0, 70%, 60%, 0.1);
           color: var(--color-danger);
           padding: 0.75rem;
           border-radius: var(--radius-md);
           margin-bottom: 1.5rem;
           display: flex;
           align-items: center;
           gap: 0.5rem;
           font-size: 0.9rem;
        }

        .login-footer-links {
          margin-top: 1rem;
          text-align: center;
          font-size: 0.9rem;
        }
        .login-footer-links a {
            color: var(--color-primary);
            font-weight: 600;
            text-decoration: none;
        }
        .login-footer-links a:hover {
            text-decoration: underline;
        }

        .login-footer {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 0.8rem;
          color: var(--color-text-muted);
        }

        .bg-circles {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          z-index: 1;
        }

        .circle {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.5;
        }

        .circle-1 {
          background: var(--color-accent);
          width: 400px;
          height: 400px;
          top: -100px;
          right: -100px;
        }

        .circle-2 {
          background: var(--color-primary-light);
          width: 500px;
          height: 500px;
          bottom: -150px;
          left: -150px;
        }
      `}</style>
    </div>
  );
};

export default Login;
