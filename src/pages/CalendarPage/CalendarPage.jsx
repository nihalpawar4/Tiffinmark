import Calendar from '../../components/Calendar/Calendar';
import Stats from '../../components/Stats/Stats';
import { useTiffin } from '../../context/TiffinContext';
import { format } from 'date-fns';
import { Lock, Unlock, Info } from 'lucide-react';
import './CalendarPage.css';

const CalendarPage = () => {
    const { currentMonth, isLoading, isMonthLocked, toggleMonthLock } = useTiffin();
    const isLocked = isMonthLocked(currentMonth);

    if (isLoading) {
        return (
            <div className="calendar-page">
                <div className="container">
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading your tiffin data...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="calendar-page">
            <div className="container">
                {/* Page Header */}
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Tiffin Calendar</h1>
                        <p className="page-subtitle">Click on any day to mark your tiffin status</p>
                    </div>
                </div>

                {/* Lock Status Banner */}
                {isLocked && (
                    <div className="lock-banner">
                        <div className="lock-banner-content">
                            <Lock size={16} />
                            <span>{format(currentMonth, 'MMMM yyyy')} is locked for editing</span>
                        </div>
                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => toggleMonthLock(currentMonth)}
                        >
                            <Unlock size={14} />
                            Unlock
                        </button>
                    </div>
                )}

                {/* Calendar */}
                <div className="calendar-section">
                    <Calendar />
                </div>

                {/* Monthly Stats */}
                <div className="month-stats-section">
                    <h2 className="section-title">{format(currentMonth, 'MMMM yyyy')} Summary</h2>
                    <Stats />
                </div>

                {/* Tips */}
                <div className="calendar-tips">
                    <Info size={16} />
                    <div>
                        <strong>Tips:</strong>
                        <ul>
                            <li>Click any past date to set its status</li>
                            <li>Add notes to explain why you missed a day</li>
                            <li>Use filters to see only taken or missed days</li>
                            <li>Lock months after completion to prevent accidental changes</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarPage;
