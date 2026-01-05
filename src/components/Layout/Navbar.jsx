import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTiffin } from '../../context/TiffinContext';
import {
    Home,
    Calendar,
    BarChart3,
    Settings,
    LogOut,
    User,
    Menu,
    X,
    History,
    ChevronDown,
    Loader2,
    UserPlus,
    Bell,
    BellRing,
    Check,
    XCircle,
    Trash2
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import './Navbar.css';

// Notification sound
const playNotificationSound = () => {
    try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQouVrPY3K1vFAQ4odrhlXQPJlW74dWgdBQONKHg4o5sECla0+KldxMPO6vn4oVkDyta1+emeA8RP7Lq4n1bDy5g2eqqeQ0TQrbr4XVTDzBj2+2qeQoVRrru4W1LDzFm3O+qeQcXSb3w4WREDzNo3fCqeQQZTMDy4VtBDzVq3/GqeQEbT8Tz4VI+DjZr4PKqeP4cU8f04Uk7Djds4fOqeP0eVsr24UE4Djlu4vSqePofy834EzU5Djpv4/WqePggWND54TIyDjxx5PWqePchW9H640/Djxx5PfqePciXNL74008Dj1y5fjqePUjX9X94kY7Dj5z5vnqePMlYtj+4j84Dj905/rqePEnZdr/4jQ1Dj925/vqeO8paNwA4jAyDkB46PzqeO0ra94B4iwvDkF56f3qeOwtbt8B4iguDkJ66v7qeOov');
        audio.volume = 0.4;
        audio.play().catch(() => { });
    } catch {
        // Ignore audio errors
    }
};

const Navbar = () => {
    const { user, isAuthenticated, isGuest, signOut, isLoading } = useAuth();
    const { reminderSettings, getStatusForDate, setStatusForDate, TIFFIN_STATUS, saveReminderSettings } = useTiffin();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [bellMenuOpen, setBellMenuOpen] = useState(false);
    const [reminderActive, setReminderActive] = useState(false);
    const [showReminderPopup, setShowReminderPopup] = useState(false);
    const profileMenuRef = useRef(null);
    const bellMenuRef = useRef(null);
    const hasCheckedOnLoad = useRef(false);

    // Check if should show reminder popup
    // Logic: Show popup if current time >= reminder time AND today unmarked AND not dismissed for this reminder period
    useEffect(() => {
        if (!isAuthenticated || hasCheckedOnLoad.current) return;

        const checkReminderOnLoad = () => {
            if (!reminderSettings?.enabled) return;

            const now = new Date();
            const [hours, minutes] = reminderSettings.time.split(':').map(Number);
            const reminderTime = new Date();
            reminderTime.setHours(hours, minutes, 0, 0);

            const todayStatus = getStatusForDate(now);

            // Generate a unique key for this reminder period (date + time)
            const todayKey = now.toISOString().split('T')[0];
            const reminderPeriodKey = `${todayKey}_${reminderSettings.time}`;

            // Check if already shown for this reminder period
            const lastShown = localStorage.getItem('tiffin_reminder_period');

            // Show popup if:
            // 1. Current time is after reminder time
            // 2. Today is not marked
            // 3. Haven't shown for this reminder period yet
            if (now >= reminderTime && todayStatus === TIFFIN_STATUS.NONE && lastShown !== reminderPeriodKey) {
                setReminderActive(true);
                setShowReminderPopup(true);
                playNotificationSound();

                // Mark as shown for this reminder period
                localStorage.setItem('tiffin_reminder_period', reminderPeriodKey);

                // Browser notification (if supported and permitted)
                if ('Notification' in window && Notification.permission === 'granted') {
                    try {
                        new Notification('🍱 TiffinTrack Reminder', {
                            body: "Don't forget to mark your tiffin status for today!",
                            icon: '/icon-192.png',
                            tag: 'tiffin-reminder'
                        });
                    } catch {
                        // Ignore notification errors
                    }
                }
            }
        };

        // Small delay to let context load
        const timer = setTimeout(() => {
            checkReminderOnLoad();
            hasCheckedOnLoad.current = true;
        }, 500);

        return () => clearTimeout(timer);
    }, [isAuthenticated, reminderSettings, getStatusForDate, TIFFIN_STATUS]);

    // Close menus on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setProfileMenuOpen(false);
            }
            if (bellMenuRef.current && !bellMenuRef.current.contains(event.target)) {
                setBellMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileMenuOpen]);

    const handleLogout = async () => {
        await signOut();
        navigate('/');
        setMobileMenuOpen(false);
        setProfileMenuOpen(false);
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    const handleSignUpClick = () => {
        setProfileMenuOpen(false);
        setMobileMenuOpen(false);
        navigate('/login');
    };

    const handleMarkTiffin = async (date, status) => {
        await setStatusForDate(date, status);

        // If marking today, close popup
        const today = new Date();
        if (date.toDateString() === today.toDateString()) {
            setShowReminderPopup(false);
            setReminderActive(false);
        }

        setBellMenuOpen(false);
    };

    const handleClearStatus = async (date) => {
        await setStatusForDate(date, TIFFIN_STATUS.NONE);
        setBellMenuOpen(false);
    };

    const handleBellClick = () => {
        setBellMenuOpen(!bellMenuOpen);
    };

    const handleDisableReminders = () => {
        saveReminderSettings({
            ...reminderSettings,
            enabled: false
        });
        setReminderActive(false);
        setBellMenuOpen(false);
    };

    // Get past days (last 7 days including today)
    const getPastDays = () => {
        const days = [];
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const status = getStatusForDate(date);
            days.push({
                date,
                status,
                label: i === 0 ? 'Today' : i === 1 ? 'Yesterday' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
            });
        }
        return days;
    };

    // Main nav links
    const navLinks = [
        { to: '/', icon: Home, label: 'Home' },
        { to: '/calendar', icon: Calendar, label: 'Calendar' },
        { to: '/reports', icon: BarChart3, label: 'Reports' },
    ];

    // Get ONLY first letter for avatar
    const getUserInitial = () => {
        if (isGuest) return 'G';
        if (!user?.name) return 'U';
        return user.name.charAt(0).toUpperCase();
    };

    // Get custom photo from localStorage
    const customPhoto = typeof window !== 'undefined' ? localStorage.getItem('tiffin_user_photo') : null;
    const displayPhoto = customPhoto || user?.photoURL;

    const pastDays = getPastDays();

    return (
        <>
            <nav className="navbar">
                <div className="navbar-container">
                    {/* Logo */}
                    <NavLink to="/" className="navbar-logo" onClick={closeMobileMenu}>
                        <div className="logo-icon">
                            <span>🍱</span>
                        </div>
                        <span className="logo-text">TiffinTrack</span>
                    </NavLink>

                    {/* Desktop Navigation */}
                    <div className="navbar-links">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
                            >
                                <link.icon size={18} />
                                <span>{link.label}</span>
                            </NavLink>
                        ))}
                    </div>

                    {/* User Section */}
                    <div className="navbar-user">
                        {/* Bell Icon with Dropdown */}
                        {isAuthenticated && (
                            <div className="bell-dropdown" ref={bellMenuRef}>
                                <button
                                    className={`bell-btn ${reminderActive ? 'active ringing' : ''}`}
                                    onClick={handleBellClick}
                                    title={reminderSettings?.enabled ? 'View recent days' : 'Enable reminders in Settings'}
                                >
                                    {reminderActive ? <BellRing size={20} /> : <Bell size={20} />}
                                    {reminderActive && <span className="bell-dot"></span>}
                                </button>

                                {bellMenuOpen && (
                                    <div className="bell-menu">
                                        <div className="bell-menu-header">
                                            <span>Recent Days</span>
                                            {reminderSettings?.enabled && (
                                                <span className="reminder-time-badge">
                                                    🔔 {reminderSettings.time}
                                                </span>
                                            )}
                                        </div>
                                        <div className="bell-menu-list">
                                            {pastDays.map((day, idx) => (
                                                <div key={idx} className="bell-day-item">
                                                    <span className="bell-day-label">{day.label}</span>
                                                    <div className="bell-day-actions">
                                                        {day.status === TIFFIN_STATUS.NONE ? (
                                                            <>
                                                                <button
                                                                    className="bell-action-btn taken"
                                                                    onClick={() => handleMarkTiffin(day.date, TIFFIN_STATUS.TAKEN)}
                                                                    title="Mark as Taken"
                                                                >
                                                                    <Check size={14} />
                                                                </button>
                                                                <button
                                                                    className="bell-action-btn missed"
                                                                    onClick={() => handleMarkTiffin(day.date, TIFFIN_STATUS.NOT_TAKEN)}
                                                                    title="Mark as Not Taken"
                                                                >
                                                                    <XCircle size={14} />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className={`bell-status ${day.status}`}>
                                                                    {day.status === TIFFIN_STATUS.TAKEN ? '✓ Taken' : '✗ Missed'}
                                                                </span>
                                                                <button
                                                                    className="bell-action-btn delete"
                                                                    onClick={() => handleClearStatus(day.date)}
                                                                    title="Clear status"
                                                                >
                                                                    <Trash2 size={12} />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="bell-menu-actions">
                                            <Link
                                                to="/settings"
                                                className="bell-menu-link"
                                                onClick={() => setBellMenuOpen(false)}
                                            >
                                                <Settings size={14} />
                                                Reminder Settings
                                            </Link>
                                            {reminderSettings?.enabled && (
                                                <button
                                                    className="bell-menu-disable"
                                                    onClick={handleDisableReminders}
                                                >
                                                    <Bell size={14} />
                                                    Disable Reminders
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {isLoading ? (
                            <div className="auth-loading">
                                <Loader2 size={20} className="spinning" />
                            </div>
                        ) : isAuthenticated ? (
                            <div className="profile-dropdown" ref={profileMenuRef}>
                                <button
                                    className="profile-trigger"
                                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                    aria-expanded={profileMenuOpen}
                                >
                                    {displayPhoto ? (
                                        <img src={displayPhoto} alt="" className="user-avatar-img" />
                                    ) : (
                                        <div className={`user-avatar-initials ${isGuest ? 'guest' : ''}`}>
                                            {getUserInitial()}
                                        </div>
                                    )}
                                    <ChevronDown size={16} className={profileMenuOpen ? 'rotated' : ''} />
                                </button>

                                {profileMenuOpen && (
                                    <div className="profile-menu">
                                        <div className="profile-menu-header">
                                            <div className="profile-info">
                                                <span className="profile-name">{user?.name || 'Guest User'}</span>
                                                {user?.email ? (
                                                    <span className="profile-email">{user.email}</span>
                                                ) : (
                                                    <span className="profile-email guest">Local storage only</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="profile-menu-divider"></div>
                                        <NavLink
                                            to="/history"
                                            className="profile-menu-item"
                                            onClick={() => setProfileMenuOpen(false)}
                                        >
                                            <History size={16} />
                                            History
                                        </NavLink>
                                        <NavLink
                                            to="/settings"
                                            className="profile-menu-item"
                                            onClick={() => setProfileMenuOpen(false)}
                                        >
                                            <Settings size={16} />
                                            Settings
                                        </NavLink>
                                        {isGuest ? (
                                            <>
                                                <div className="profile-menu-divider"></div>
                                                <button
                                                    className="profile-menu-item upgrade"
                                                    onClick={handleSignUpClick}
                                                >
                                                    <UserPlus size={16} />
                                                    Sign Up to Sync
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <div className="profile-menu-divider"></div>
                                                <button
                                                    className="profile-menu-item logout"
                                                    onClick={handleLogout}
                                                >
                                                    <LogOut size={16} />
                                                    Sign Out
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/login" className="btn btn-signup">
                                <UserPlus size={18} />
                                <span>Sign Up</span>
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="mobile-menu-toggle"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                        aria-expanded={mobileMenuOpen}
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Navigation Overlay */}
            <div
                className={`mobile-nav-overlay ${mobileMenuOpen ? 'open' : ''}`}
                onClick={closeMobileMenu}
            />

            {/* Mobile Navigation */}
            <div className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`}>
                <div className="mobile-nav-content">
                    <div className="mobile-nav-links">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                                onClick={closeMobileMenu}
                            >
                                <link.icon size={22} />
                                <span>{link.label}</span>
                            </NavLink>
                        ))}
                        {isAuthenticated && (
                            <>
                                <div className="mobile-nav-divider"></div>
                                <NavLink
                                    to="/history"
                                    className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                                    onClick={closeMobileMenu}
                                >
                                    <History size={22} />
                                    <span>History</span>
                                </NavLink>
                                <NavLink
                                    to="/settings"
                                    className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                                    onClick={closeMobileMenu}
                                >
                                    <Settings size={22} />
                                    <span>Settings</span>
                                </NavLink>
                            </>
                        )}
                    </div>

                    <div className="mobile-nav-footer">
                        {isAuthenticated ? (
                            <>
                                <div className="mobile-user-info">
                                    {displayPhoto ? (
                                        <img src={displayPhoto} alt="" className="user-avatar-img-mobile" />
                                    ) : (
                                        <div className={`user-avatar ${isGuest ? 'guest' : ''}`}>
                                            <User size={20} />
                                        </div>
                                    )}
                                    <div className="user-details">
                                        <span className="user-name">
                                            {user?.name || 'Guest User'}
                                            {isGuest && <span className="guest-tag">Guest</span>}
                                        </span>
                                        <span className="user-email">{user?.email || 'Local storage only'}</span>
                                    </div>
                                </div>
                                {isGuest ? (
                                    <button
                                        className="btn btn-primary mobile-upgrade-btn"
                                        onClick={handleSignUpClick}
                                    >
                                        <UserPlus size={20} />
                                        <span>Sign Up to Sync</span>
                                    </button>
                                ) : (
                                    <button className="mobile-nav-link logout" onClick={handleLogout}>
                                        <LogOut size={22} />
                                        <span>Sign Out</span>
                                    </button>
                                )}
                            </>
                        ) : (
                            <button
                                className="btn btn-primary mobile-signup-btn"
                                onClick={handleSignUpClick}
                            >
                                <UserPlus size={20} />
                                <span>Sign Up</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Reminder Popup - Shows after 6PM if today unmarked */}
            {showReminderPopup && (
                <div className="reminder-popup-overlay" onClick={() => setShowReminderPopup(false)}>
                    <div className="reminder-popup" onClick={(e) => e.stopPropagation()}>
                        <div className="reminder-popup-icon">
                            <BellRing size={32} />
                        </div>
                        <h3>Mark Today's Tiffin</h3>
                        <p>Did you have your tiffin today?</p>
                        <div className="reminder-popup-actions">
                            <button
                                className="reminder-btn taken"
                                onClick={() => handleMarkTiffin(new Date(), TIFFIN_STATUS.TAKEN)}
                            >
                                ✓ Yes, Taken
                            </button>
                            <button
                                className="reminder-btn missed"
                                onClick={() => handleMarkTiffin(new Date(), TIFFIN_STATUS.NOT_TAKEN)}
                            >
                                ✗ Not Taken
                            </button>
                        </div>
                        <button
                            className="reminder-skip"
                            onClick={() => setShowReminderPopup(false)}
                        >
                            Remind me later
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
