import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const SocialLogin = ({ isLogin = true }) => {
    const { loginWithGoogle, loginWithFacebook, loading, error } = useAuth();

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
        } catch (error) {
            console.error('Error en login con Google:', error);
        }
    };

    const handleFacebookLogin = async () => {
        try {
            await loginWithFacebook();
        } catch (error) {
            console.error('Error en login con Facebook:', error);
        }
    };

    return (
        <div className="social-login">
            <div className="social-divider">
        <span className="social-divider-text">
          {isLogin ? 'O inicia sesión con' : 'O regístrate con'}
        </span>
            </div>

            <div className="social-buttons">
                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="social-btn google-btn"
                >
                    <svg className="social-icon" viewBox="0 0 24 24">
                        <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    {isLogin ? 'Continuar con Google' : 'Registrarse con Google'}
                </button>

                <button
                    type="button"
                    onClick={handleFacebookLogin}
                    disabled={loading}
                    className="social-btn facebook-btn"
                >
                    <svg className="social-icon" viewBox="0 0 24 24">
                        <path
                            fill="#1877F2"
                            d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                        />
                    </svg>
                    {isLogin ? 'Continuar con Facebook' : 'Registrarse con Facebook'}
                </button>
            </div>

            {error && (
                <div className="social-error">
                    <p>{error}</p>
                </div>
            )}

            <style jsx>{`
        .social-login {
          margin-top: 1.5rem;
        }

        .social-divider {
          position: relative;
          text-align: center;
          margin: 1.5rem 0;
        }

        .social-divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: var(--gray-medium);
        }

        .social-divider-text {
          background: white;
          padding: 0 1rem;
          color: var(--gray-dark);
          font-size: 0.875rem;
        }

        .social-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .social-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border: 2px solid var(--gray-medium);
          border-radius: 0.5rem;
          background: white;
          color: var(--gray-dark);
          font-weight: 500;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
        }

        .social-btn:hover:not(:disabled) {
          border-color: var(--primary-orange);
          background: var(--secondary-orange);
          transform: translateY(-1px);
        }

        .social-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .google-btn:hover:not(:disabled) {
          border-color: #4285F4;
          background: #f8f9ff;
        }

        .facebook-btn:hover:not(:disabled) {
          border-color: #1877F2;
          background: #f0f4ff;
        }

        .social-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        .social-error {
          margin-top: 1rem;
          padding: 0.75rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 0.5rem;
          color: #dc2626;
          font-size: 0.875rem;
          text-align: center;
        }

        @media (max-width: 768px) {
          .social-btn {
            font-size: 0.8rem;
            padding: 0.625rem 0.75rem;
          }
          
          .social-icon {
            width: 18px;
            height: 18px;
          }
        }
      `}</style>
        </div>
    );
};

export default SocialLogin;