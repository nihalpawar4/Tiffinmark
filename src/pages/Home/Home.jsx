import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTiffin } from '../../context/TiffinContext';
import Stats from '../../components/Stats/Stats';
import {
    Calendar,
    BarChart3,
    ArrowRight,
    Sparkles,
    Shield,
    StickyNote,
    History,
    UserPlus,
    Download,
    Lock
} from 'lucide-react';
import { format } from 'date-fns';
import './Home.css';

const Home = () => {
    const { isAuthenticated, isGuest, user } = useAuth();
    const { getMonthStats, currentMonth, getHistoryData } = useTiffin();
    const stats = getMonthStats();
    const historyData = getHistoryData();

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-badge">
                            <Sparkles size={14} />
                            <span>Personal Tiffin Tracker</span>
                        </div>

                        <h1 className="hero-title">
                            Track Your Daily <span className="text-accent">Tiffin</span> Effortlessly
                        </h1>

                        <p className="hero-subtitle">
                            A simple, elegant way to manage your daily tiffin subscription.
                            Track what you received, add notes, generate reports, and stay organized.
                        </p>

                        <div className="hero-actions">
                            <Link to="/calendar" className="btn btn-primary btn-lg">
                                <Calendar size={20} />
                                Open Calendar
                            </Link>
                            <Link to="/reports" className="btn btn-secondary btn-lg">
                                <BarChart3 size={20} />
                                View Reports
                            </Link>
                        </div>

                        {isAuthenticated && !isGuest ? (
                            <p className="hero-welcome">
                                Welcome back, <strong>{user?.name}</strong>! 👋
                            </p>
                        ) : isGuest ? (
                            <p className="hero-welcome">
                                Welcome! You're tracking as a guest 👋
                            </p>
                        ) : (
                            <div className="hero-auth">
                                <Link to="/login" className="hero-login-link">
                                    <UserPlus size={16} />
                                    Create an account to save your data
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Quick Stats Preview */}
                    <div className="hero-stats">
                        <div className="quick-stat">
                            <span className="quick-stat-value">{stats.taken}</span>
                            <span className="quick-stat-label">Tiffins Taken</span>
                        </div>
                        <div className="quick-stat-divider"></div>
                        <div className="quick-stat">
                            <span className="quick-stat-value">{stats.notTaken}</span>
                            <span className="quick-stat-label">Missed</span>
                        </div>
                        <div className="quick-stat-divider"></div>
                        <div className="quick-stat">
                            <span className="quick-stat-value">{stats.attendanceRate}%</span>
                            <span className="quick-stat-label">Attendance</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Current Month Stats */}
            <section className="current-stats">
                <div className="container">
                    <div className="section-header">
                        <div>
                            <h2 className="section-title">This Month's Overview</h2>
                            <p className="section-subtitle">{format(currentMonth, 'MMMM yyyy')}</p>
                        </div>
                        <Link to="/calendar" className="btn btn-outline">
                            Go to Calendar
                            <ArrowRight size={16} />
                        </Link>
                    </div>

                    <Stats />
                </div>
            </section>

            {/* Quick History */}
            {historyData.length > 1 && (
                <section className="quick-history">
                    <div className="container">
                        <div className="section-header">
                            <div>
                                <h2 className="section-title">Recent History</h2>
                                <p className="section-subtitle">Your past months at a glance</p>
                            </div>
                            {isAuthenticated && (
                                <Link to="/history" className="btn btn-outline">
                                    View All
                                    <ArrowRight size={16} />
                                </Link>
                            )}
                        </div>

                        <div className="history-preview">
                            {historyData.slice(0, 3).map((month) => (
                                <Link
                                    to={isAuthenticated ? "/history" : "/calendar"}
                                    key={month.monthKey}
                                    className="history-preview-card"
                                >
                                    <div className="preview-month">{format(month.monthDate, 'MMM yyyy')}</div>
                                    <div className="preview-stats">
                                        <span className="taken">{month.taken} taken</span>
                                        <span className="missed">{month.notTaken} missed</span>
                                    </div>
                                    <div className="preview-rate">{month.attendanceRate}%</div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Features Section */}
            <section className="features">
                <div className="container">
                    <div className="section-header center">
                        <h2 className="section-title">Why TiffinTrack?</h2>
                        <p className="section-subtitle">Powerful tools for your daily tracking needs</p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">
                                <Calendar size={28} />
                            </div>
                            <h3>Visual Calendar</h3>
                            <p>Beautiful month-view calendar with easy status marking for each day</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">
                                <StickyNote size={28} />
                            </div>
                            <h3>Add Notes</h3>
                            <p>Add notes to any day explaining why you missed or any special events</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">
                                <BarChart3 size={28} />
                            </div>
                            <h3>Visual Reports</h3>
                            <p>Charts, graphs, and detailed statistics with export options</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">
                                <History size={28} />
                            </div>
                            <h3>Full History</h3>
                            <p>Browse through all your past months with summary cards</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">
                                <Download size={28} />
                            </div>
                            <h3>Export Data</h3>
                            <p>Download your data as CSV or share reports easily</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">
                                <Lock size={28} />
                            </div>
                            <h3>Lock Months</h3>
                            <p>Lock past months to prevent accidental changes</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            {!isAuthenticated && (
                <section className="cta">
                    <div className="container">
                        <div className="cta-content">
                            <h2>Ready to Start Tracking?</h2>
                            <p>
                                Start using TiffinTrack today. No account required to begin!
                            </p>
                            <div className="cta-actions">
                                <Link to="/calendar" className="btn btn-primary btn-lg">
                                    Start Tracking Now
                                </Link>
                                <Link to="/login" className="btn btn-outline btn-lg">
                                    <UserPlus size={18} />
                                    Create Account
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default Home;
