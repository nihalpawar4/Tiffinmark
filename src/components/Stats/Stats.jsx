import { useTiffin, TIFFIN_STATUS } from '../../context/TiffinContext';
import { Check, X, Calendar, TrendingUp, Percent } from 'lucide-react';
import './Stats.css';

const Stats = ({ month, compact = false }) => {
    const { getMonthStats, currentMonth } = useTiffin();
    const stats = getMonthStats(month || currentMonth);

    const attendanceRate = stats.attendanceRate;
    const trackingRate = stats.daysUpToToday > 0
        ? Math.round(((stats.daysUpToToday - stats.unmarked) / stats.daysUpToToday) * 100)
        : 0;

    if (compact) {
        return (
            <div className="stats-compact">
                <div className="stat-compact taken">
                    <Check size={16} />
                    <span>{stats.taken}</span>
                </div>
                <div className="stat-compact not-taken">
                    <X size={16} />
                    <span>{stats.notTaken}</span>
                </div>
                <div className="stat-compact rate">
                    <span>{attendanceRate}%</span>
                </div>
            </div>
        );
    }

    return (
        <div className="stats-grid">
            {/* Taken */}
            <div className="stat-card taken">
                <div className="stat-icon">
                    <Check size={24} />
                </div>
                <div className="stat-content">
                    <span className="stat-value">{stats.taken}</span>
                    <span className="stat-label">Taken</span>
                </div>
            </div>

            {/* Not Taken */}
            <div className="stat-card not-taken">
                <div className="stat-icon">
                    <X size={24} />
                </div>
                <div className="stat-content">
                    <span className="stat-value">{stats.notTaken}</span>
                    <span className="stat-label">Missed</span>
                </div>
            </div>

            {/* Total Days */}
            <div className="stat-card neutral">
                <div className="stat-icon">
                    <Calendar size={24} />
                </div>
                <div className="stat-content">
                    <span className="stat-value">{stats.daysUpToToday}</span>
                    <span className="stat-label">Days So Far</span>
                </div>
            </div>

            {/* Attendance Rate */}
            <div className="stat-card accent">
                <div className="stat-icon">
                    <TrendingUp size={24} />
                </div>
                <div className="stat-content">
                    <span className="stat-value">{attendanceRate}%</span>
                    <span className="stat-label">Attendance</span>
                </div>
                <div className="stat-bar">
                    <div
                        className="stat-bar-fill success"
                        style={{ width: `${attendanceRate}%` }}
                    ></div>
                </div>
            </div>

            {/* Tracking Rate */}
            <div className="stat-card accent">
                <div className="stat-icon">
                    <Percent size={24} />
                </div>
                <div className="stat-content">
                    <span className="stat-value">{trackingRate}%</span>
                    <span className="stat-label">Tracked</span>
                </div>
                <div className="stat-bar">
                    <div
                        className="stat-bar-fill"
                        style={{ width: `${trackingRate}%` }}
                    ></div>
                </div>
            </div>

            {/* Unmarked */}
            <div className="stat-card neutral">
                <div className="stat-icon unmarked">
                    <span>?</span>
                </div>
                <div className="stat-content">
                    <span className="stat-value">{stats.unmarked}</span>
                    <span className="stat-label">Unmarked</span>
                </div>
            </div>
        </div>
    );
};

export default Stats;
