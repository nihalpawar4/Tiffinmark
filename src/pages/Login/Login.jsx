import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2, ArrowLeft, Shield, Check, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import './Login.css';

// Google Icon SVG
const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

const Login = () => {
    const {
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        continueAsGuest,
        isAuthenticated,
        isGuest,
        isLoading,
        isFirebaseConfigured
    } = useAuth();
    const navigate = useNavigate();

    const [isSignUp, setIsSignUp] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    // Redirect if already authenticated (but NOT if guest - guests can upgrade)
    useEffect(() => {
        if (isAuthenticated && !isGuest && !isLoading) {
            navigate('/');
        }
    }, [isAuthenticated, isGuest, isLoading, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleGoogleSignIn = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        setError('');

        const { error } = await signInWithGoogle();
        if (error) {
            setError(error.message);
        } else {
            navigate('/');
        }
        setIsSubmitting(false);
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        setError('');
        setSuccess('');

        try {
            if (isSignUp) {
                if (!formData.name.trim()) {
                    setError('Please enter your name');
                    setIsSubmitting(false);
                    return;
                }
                if (formData.password.length < 6) {
                    setError('Password must be at least 6 characters');
                    setIsSubmitting(false);
                    return;
                }

                const { error } = await signUpWithEmail(formData.email, formData.password, formData.name);
                if (error) {
                    setError(error.message);
                } else {
                    navigate('/');
                }
            } else {
                const { error } = await signInWithEmail(formData.email, formData.password);
                if (error) {
                    setError(error.message);
                } else {
                    navigate('/');
                }
            }
        } catch {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleContinueAsGuest = () => {
        continueAsGuest();
        navigate('/');
    };

    if (isLoading) {
        return (
            <div className="login-page">
                <div className="login-loading">
                    <Loader2 size={32} className="spinning" />
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="login-page">
            <div className="login-container">
                {/* Left Panel - Branding */}
                <div className="login-branding">
                    <div className="branding-content">
                        <div className="brand-logo">
                            <span className="brand-icon">🍱</span>
                            <span className="brand-name">TiffinTrack</span>
                        </div>

                        <h1>Track Your Daily Tiffin</h1>
                        <p>Simple, elegant tracking for your tiffin subscription. Stay organized and never miss tracking a day.</p>

                        <div className="brand-features">
                            <div className="brand-feature">
                                <Check size={18} />
                                <span>Visual Calendar View</span>
                            </div>
                            <div className="brand-feature">
                                <Check size={18} />
                                <span>Add Notes & Filters</span>
                            </div>
                            <div className="brand-feature">
                                <Check size={18} />
                                <span>Detailed Reports & Charts</span>
                            </div>
                            <div className="brand-feature">
                                <Check size={18} />
                                <span>Monthly History</span>
                            </div>
                            <div className="brand-feature">
                                <Check size={18} />
                                <span>Export & Share</span>
                            </div>
                        </div>

                        <div className="brand-creator">
                            Created by <span>Nihal Pawar</span>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Auth */}
                <div className="login-form-panel">
                    <Link to="/" className="back-link">
                        <ArrowLeft size={18} />
                        Back to Home
                    </Link>

                    <div className="login-form-content">
                        <div className="login-header">
                            <h2>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
                            <p>{isSignUp ? 'Sign up to save your tracking data' : 'Sign in to continue tracking'}</p>
                        </div>

                        {error && (
                            <div className="login-error">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="login-success">
                                {success}
                            </div>
                        )}

                        {/* Google Sign In Button */}
                        {isFirebaseConfigured && (
                            <>
                                <button
                                    className="btn-google-signin"
                                    onClick={handleGoogleSignIn}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <Loader2 size={20} className="spinning" />
                                    ) : (
                                        <GoogleIcon />
                                    )}
                                    <span>Continue with Google</span>
                                </button>

                                <div className="login-divider">
                                    <span>or</span>
                                </div>
                            </>
                        )}

                        {/* Email/Password Form */}
                        <form onSubmit={handleEmailSubmit} className="email-form">
                            {isSignUp && (
                                <div className="form-group">
                                    <label htmlFor="name">
                                        <User size={16} />
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Your name"
                                        required
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="email">
                                    <Mail size={16} />
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">
                                    <Lock size={16} />
                                    Password
                                </label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder={isSignUp ? 'Min 6 characters' : 'Your password'}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn-email-submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <Loader2 size={20} className="spinning" />
                                ) : (
                                    isSignUp ? 'Create Account' : 'Sign In'
                                )}
                            </button>
                        </form>

                        {/* Toggle Sign Up / Sign In */}
                        <p className="auth-toggle">
                            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                            <button
                                type="button"
                                className="toggle-btn"
                                onClick={() => {
                                    setIsSignUp(!isSignUp);
                                    setError('');
                                    setSuccess('');
                                }}
                            >
                                {isSignUp ? 'Sign In' : 'Sign Up'}
                            </button>
                        </p>

                        <div className="login-divider">
                            <span>or</span>
                        </div>

                        {/* Continue as Guest */}
                        <button
                            className="btn-guest"
                            onClick={handleContinueAsGuest}
                        >
                            Continue as Guest
                        </button>

                        <p className="guest-note">
                            Guest data is stored locally on this device.
                        </p>

                        {/* Security Note */}
                        <div className="security-note">
                            <Shield size={16} />
                            <span>Your data is stored securely and only accessible by you.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
