import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTiffin } from '../../context/TiffinContext';
import {
    User,
    Mail,
    Trash2,
    LogOut,
    AlertTriangle,
    Check,
    Bell,
    Clock,
    Settings as SettingsIcon,
    Info,
    Database,
    Shield,
    Camera,
    Calendar
} from 'lucide-react';
import './Settings.css';

const Settings = () => {
    const { user, signOut, isAuthenticated, isGuest, isFirebaseConfigured } = useAuth();
    const { clearAllData, tiffinData, reminderSettings, saveReminderSettings } = useTiffin();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteSuccess, setDeleteSuccess] = useState(false);
    const [localReminders, setLocalReminders] = useState(reminderSettings);
    const [customPhoto, setCustomPhoto] = useState(() => {
        const saved = localStorage.getItem('tiffin_user_photo');
        return saved || null;
    });
    const [notificationStatus, setNotificationStatus] = useState('default');

    useEffect(() => {
        setLocalReminders(reminderSettings);
    }, [reminderSettings]);

    useEffect(() => {
        if ('Notification' in window) {
            setNotificationStatus(Notification.permission);
        }
    }, []);

    if (!isAuthenticated) {
        return (
            <div className="settings-page">
                <div className="container">
                    <div className="not-authenticated">
                        <div className="lock-icon">
                            <Shield size={48} />
                        </div>
                        <h2>Sign In Required</h2>
                        <p>Please sign in to access your settings.</p>
                    </div>
                </div>
            </div>
        );
    }

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    const handleDeleteData = () => {
        clearAllData();
        setShowDeleteConfirm(false);
        setDeleteSuccess(true);
        setTimeout(() => setDeleteSuccess(false), 3000);
    };

    const handleReminderToggle = async () => {
        const newEnabled = !localReminders.enabled;

        // Request notification permission if enabling (but don't block if denied)
        if (newEnabled && 'Notification' in window && Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            setNotificationStatus(permission);
        }

        // Always enable reminders - popup will work even if notifications blocked
        const newSettings = {
            ...localReminders,
            enabled: newEnabled
        };
        setLocalReminders(newSettings);
        saveReminderSettings(newSettings);
    };

    const handleReminderTimeChange = (e) => {
        const newSettings = {
            ...localReminders,
            time: e.target.value
        };
        setLocalReminders(newSettings);
        saveReminderSettings(newSettings);
    };

    const handleDefaultActionChange = (action) => {
        const newSettings = {
            ...localReminders,
            defaultAction: action
        };
        setLocalReminders(newSettings);
        saveReminderSettings(newSettings);
    };

    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const dataUrl = event.target?.result;
                setCustomPhoto(dataUrl);
                localStorage.setItem('tiffin_user_photo', dataUrl);
            };
            reader.readAsDataURL(file);
        }
    };

    const removePhoto = () => {
        setCustomPhoto(null);
        localStorage.removeItem('tiffin_user_photo');
    };

    const totalRecords = Object.keys(tiffinData).length;

    // Get proper date - use current date for guests, or account creation date estimate
    const getMemberSinceDate = () => {
        if (isGuest) {
            return 'Guest Mode';
        }
        // Firebase doesn't provide createdAt, so use first tracked date or now
        const dates = Object.keys(tiffinData).sort();
        if (dates.length > 0) {
            return `First tracked: ${new Date(dates[0]).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            })}`;
        }
        return new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Get display photo
    const displayPhoto = customPhoto || user?.photoURL;

    return (
        <div className="settings-page">
            <div className="container">
                {/* Page Header */}
                <div className="page-header">
                    <h1 className="page-title">
                        <SettingsIcon size={28} />
                        Settings
                    </h1>
                    <p className="page-subtitle">Manage your account, preferences, and data</p>
                </div>

                {/* Success Message */}
                {deleteSuccess && (
                    <div className="success-message">
                        <Check size={18} />
                        <span>All your tiffin data has been deleted</span>
                    </div>
                )}

                {/* Account Section */}
                <section className="settings-section">
                    <h2 className="settings-section-title">Account</h2>

                    <div className="settings-card">
                        <div className="user-profile">
                            <div className="user-avatar-container" onClick={handlePhotoClick}>
                                {displayPhoto ? (
                                    <img src={displayPhoto} alt={user?.name} className="user-avatar-large" />
                                ) : (
                                    <div className="user-avatar-large-placeholder">
                                        <User size={32} />
                                    </div>
                                )}
                                <div className="avatar-overlay">
                                    <Camera size={20} />
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    style={{ display: 'none' }}
                                />
                            </div>
                            <div className="user-details">
                                <h3>{user?.name || 'User'}</h3>
                                {user?.email && (
                                    <p>
                                        <Mail size={14} />
                                        {user.email}
                                    </p>
                                )}
                                <span className="member-since">
                                    <Calendar size={12} />
                                    {getMemberSinceDate()}
                                </span>
                            </div>
                        </div>

                        <div className="profile-actions">
                            {customPhoto && (
                                <button className="btn btn-secondary btn-sm" onClick={removePhoto}>
                                    Remove Photo
                                </button>
                            )}
                            <button className="btn btn-secondary" onClick={handleLogout}>
                                <LogOut size={18} />
                                Sign Out
                            </button>
                        </div>
                    </div>

                    {/* Storage Status */}
                    <div className="settings-card storage-status">
                        <div className="storage-info-row">
                            <div className="storage-icon">
                                <Database size={20} />
                            </div>
                            <div className="storage-text">
                                <span className="storage-title">
                                    {isFirebaseConfigured && !isGuest ? 'Firebase Connected' : 'Local Storage'}
                                </span>
                                <span className="storage-desc">
                                    {isFirebaseConfigured && !isGuest
                                        ? 'Your account is linked with Firebase'
                                        : 'Data is stored on this device'}
                                </span>
                            </div>
                            <span className={`storage-badge ${isFirebaseConfigured && !isGuest ? 'cloud' : 'local'}`}>
                                {isFirebaseConfigured && !isGuest ? 'Connected' : 'Offline'}
                            </span>
                        </div>
                    </div>
                </section>

                {/* Reminders Section */}
                <section className="settings-section">
                    <h2 className="settings-section-title">
                        <Bell size={16} />
                        Daily Reminder
                    </h2>

                    <div className="settings-card reminder-card">
                        <div className="reminder-header">
                            <div className="reminder-info">
                                <h3>Enable Notifications</h3>
                                <p>Get reminded to mark your tiffin at a specific time</p>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={localReminders.enabled}
                                    onChange={handleReminderToggle}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        {notificationStatus === 'denied' && localReminders.enabled && (
                            <div className="notification-info">
                                <Info size={16} />
                                <span>Browser notifications blocked. You'll still see the in-app reminder popup.</span>
                            </div>
                        )}

                        {localReminders.enabled && (
                            <div className="reminder-options">
                                <div className="reminder-option">
                                    <label>
                                        <Clock size={16} />
                                        Reminder Time
                                    </label>
                                    <input
                                        type="time"
                                        className="time-input"
                                        value={localReminders.time}
                                        onChange={handleReminderTimeChange}
                                    />
                                </div>

                                <div className="reminder-option">
                                    <label>
                                        <SettingsIcon size={16} />
                                        Auto-mark if no response
                                    </label>
                                    <div className="default-actions">
                                        <button
                                            className={`default-btn ${localReminders.defaultAction === 'none' ? 'active' : ''}`}
                                            onClick={() => handleDefaultActionChange('none')}
                                        >
                                            No Auto
                                        </button>
                                        <button
                                            className={`default-btn taken ${localReminders.defaultAction === 'taken' ? 'active' : ''}`}
                                            onClick={() => handleDefaultActionChange('taken')}
                                        >
                                            Taken
                                        </button>
                                        <button
                                            className={`default-btn missed ${localReminders.defaultAction === 'not_taken' ? 'active' : ''}`}
                                            onClick={() => handleDefaultActionChange('not_taken')}
                                        >
                                            Missed
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="reminder-note">
                            <Info size={14} />
                            <span>Reminders work when the app is open. For reliable notifications, install the app!</span>
                        </div>
                    </div>
                </section>

                {/* Data Section */}
                <section className="settings-section">
                    <h2 className="settings-section-title">Data Management</h2>

                    <div className="settings-card">
                        <div className="data-info">
                            <h3>Your Tiffin Records</h3>
                            <p>
                                You have <strong>{totalRecords}</strong> day{totalRecords !== 1 ? 's' : ''} tracked
                            </p>
                        </div>
                    </div>

                    <div className="settings-card danger">
                        <div className="danger-info">
                            <div className="danger-icon">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h3>Delete All Data</h3>
                                <p>Permanently delete all your tiffin tracking data. This action cannot be undone.</p>
                            </div>
                        </div>

                        {!showDeleteConfirm ? (
                            <button
                                className="btn btn-danger"
                                onClick={() => setShowDeleteConfirm(true)}
                            >
                                <Trash2 size={18} />
                                Delete All Data
                            </button>
                        ) : (
                            <div className="confirm-delete">
                                <p>Are you sure? This cannot be undone.</p>
                                <div className="confirm-actions">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => setShowDeleteConfirm(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        onClick={handleDeleteData}
                                    >
                                        Yes, Delete Everything
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* About Section */}
                <section className="settings-section">
                    <h2 className="settings-section-title">About</h2>

                    <div className="settings-card about">
                        <div className="about-info">
                            <h3>TiffinTrack</h3>
                            <p className="version">Version 2.0.0</p>
                            <p className="about-description">
                                A simple, elegant tiffin tracking application to manage your daily subscription.
                                Track your meals, view statistics, and maintain a complete history.
                            </p>
                            <div className="about-features">
                                <span>✓ Calendar View</span>
                                <span>✓ Notes</span>
                                <span>✓ Filters</span>
                                <span>✓ Charts</span>
                                <span>✓ History</span>
                                <span>✓ Export</span>
                            </div>
                            <div className="about-creator">
                                <span>Created with ❤️ by</span>
                                <span className="creator-name">Nihal Pawar</span>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Settings;
