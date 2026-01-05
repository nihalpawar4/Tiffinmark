import { useNavigate } from 'react-router-dom';
import { useTiffin } from '../../context/TiffinContext';
import {
    Calendar,
    Lock,
    Unlock,
    ChevronRight,
    Check,
    X,
    TrendingUp,
    Archive,
    Eye
} from 'lucide-react';
import './History.css';

const History = () => {
    const { getHistoryData, goToMonth, toggleMonthLock } = useTiffin();
    const navigate = useNavigate();

    const historyData = getHistoryData();

    const handleViewMonth = (monthKey) => {
        goToMonth(monthKey);
        navigate('/calendar');
    };

    const handleViewReport = (monthKey) => {
        goToMonth(monthKey);
        navigate('/reports');
    };

    const getAttendanceColor = (rate) => {
        if (rate >= 80) return 'success';
        if (rate >= 50) return 'warning';
        return 'error';
    };

    return (
        <div className="history-page">
            <div className="container">
                {/* Page Header */}
                <div className="page-header">
                    <div>
                        <h1 className="page-title">
                            <Archive size={28} />
                            History
                        </h1>
                        <p className="page-subtitle">Browse your monthly tiffin archives</p>
                    </div>
                </div>

                {/* History List */}
                <div className="history-list">
                    {historyData.length === 0 ? (
                        <div className="empty-history">
                            <div className="empty-icon">
                                <Calendar size={48} />
                            </div>
                            <h3>No history yet</h3>
                            <p>Start tracking your tiffins to build your history</p>
                        </div>
                    ) : (
                        historyData.map((month) => (
                            <div key={month.monthKey} className="history-card">
                                <div className="history-card-header">
                                    <div className="month-info">
                                        <h3>{month.monthLabel}</h3>
                                        <div className="month-badges">
                                            {month.isLocked && (
                                                <span className="locked-badge">
                                                    <Lock size={12} />
                                                    Locked
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className={`attendance-badge ${getAttendanceColor(month.attendanceRate)}`}>
                                        <TrendingUp size={14} />
                                        {month.attendanceRate}%
                                    </div>
                                </div>

                                <div className="history-stats">
                                    <div className="history-stat taken">
                                        <Check size={16} />
                                        <span className="stat-value">{month.taken}</span>
                                        <span className="stat-label">Taken</span>
                                    </div>
                                    <div className="history-stat missed">
                                        <X size={16} />
                                        <span className="stat-value">{month.notTaken}</span>
                                        <span className="stat-label">Missed</span>
                                    </div>
                                    <div className="history-stat total">
                                        <Calendar size={16} />
                                        <span className="stat-value">{month.daysUpToToday}</span>
                                        <span className="stat-label">Days</span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="history-progress">
                                    <div
                                        className="progress-fill taken"
                                        style={{ width: `${month.daysUpToToday > 0 ? (month.taken / month.daysUpToToday) * 100 : 0}%` }}
                                    />
                                    <div
                                        className="progress-fill missed"
                                        style={{ width: `${month.daysUpToToday > 0 ? (month.notTaken / month.daysUpToToday) * 100 : 0}%` }}
                                    />
                                </div>

                                <div className="history-card-actions">
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => toggleMonthLock(month.monthDate)}
                                        title={month.isLocked ? 'Unlock month' : 'Lock month'}
                                    >
                                        {month.isLocked ? <Unlock size={14} /> : <Lock size={14} />}
                                        {month.isLocked ? 'Unlock' : 'Lock'}
                                    </button>
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => handleViewMonth(month.monthKey)}
                                    >
                                        <Calendar size={14} />
                                        Calendar
                                    </button>
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => handleViewReport(month.monthKey)}
                                    >
                                        <Eye size={14} />
                                        Report
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Storage Info */}
                <div className="storage-info">
                    <p>
                        📱 Your data is stored locally on this device.
                        {historyData.length > 0 && ` You have ${historyData.length} month(s) of history.`}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default History;
