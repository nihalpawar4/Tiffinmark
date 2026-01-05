import { useState } from 'react';
import { format, isSameMonth } from 'date-fns';
import { useTiffin, TIFFIN_STATUS } from '../../context/TiffinContext';
import {
    ChevronLeft,
    ChevronRight,
    Check,
    X,
    Lock,
    Unlock,
    Filter,
    StickyNote,
    Calendar as CalendarIcon
} from 'lucide-react';
import './Calendar.css';

const Calendar = () => {
    const {
        currentMonth,
        getMonthDays,
        setStatusForDate,
        setNoteForDate,
        goToPreviousMonth,
        goToNextMonth,
        isMonthLocked,
        toggleMonthLock,
        filter,
        setFilter
    } = useTiffin();

    const [showStatusModal, setShowStatusModal] = useState(false);
    const [modalDate, setModalDate] = useState(null);
    const [noteInput, setNoteInput] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const monthDays = getMonthDays();
    const isLocked = isMonthLocked(currentMonth);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const firstDayOfMonth = monthDays[0]?.date.getDay() || 0;

    const handleDateClick = (dayInfo) => {
        if (dayInfo.isFuture) return;
        if (isLocked) return;

        setModalDate(dayInfo);
        setNoteInput(dayInfo.note || '');
        setShowStatusModal(true);
    };

    const handleStatusChange = (status) => {
        if (modalDate && !isLocked) {
            setStatusForDate(modalDate.date, status, noteInput);
            setShowStatusModal(false);
            setModalDate(null);
            setNoteInput('');
        }
    };

    const closeModal = () => {
        setShowStatusModal(false);
        setModalDate(null);
        setNoteInput('');
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case TIFFIN_STATUS.TAKEN:
                return <Check size={16} className="icon-taken" />;
            case TIFFIN_STATUS.NOT_TAKEN:
                return <X size={16} className="icon-not-taken" />;
            default:
                return null;
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case TIFFIN_STATUS.TAKEN:
                return 'status-taken';
            case TIFFIN_STATUS.NOT_TAKEN:
                return 'status-not-taken';
            default:
                return '';
        }
    };

    const canNavigateNext = !isSameMonth(currentMonth, new Date());

    // Filter visible days based on filter setting
    const getVisibleDays = () => {
        if (filter === 'all') return monthDays;
        return monthDays.filter(day => {
            if (filter === 'taken') return day.status === TIFFIN_STATUS.TAKEN;
            if (filter === 'not_taken') return day.status === TIFFIN_STATUS.NOT_TAKEN;
            return true;
        });
    };

    const filteredDays = getVisibleDays();
    const showingFiltered = filter !== 'all';

    return (
        <div className="calendar-wrapper">
            {/* Calendar Header */}
            <div className="calendar-header">
                <div className="calendar-nav">
                    <button
                        className="btn btn-icon btn-secondary"
                        onClick={goToPreviousMonth}
                        aria-label="Previous month"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <h2 className="calendar-title">
                        {format(currentMonth, 'MMMM yyyy')}
                    </h2>

                    <button
                        className="btn btn-icon btn-secondary"
                        onClick={goToNextMonth}
                        disabled={!canNavigateNext}
                        aria-label="Next month"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>

                <div className="calendar-actions">
                    {/* Filter Toggle */}
                    <div className="filter-dropdown">
                        <button
                            className={`btn btn-secondary btn-sm ${showFilters ? 'active' : ''}`}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter size={16} />
                            <span className="hide-mobile">Filter</span>
                        </button>

                        {showFilters && (
                            <div className="filter-menu">
                                <button
                                    className={`filter-option ${filter === 'all' ? 'active' : ''}`}
                                    onClick={() => { setFilter('all'); setShowFilters(false); }}
                                >
                                    All Days
                                </button>
                                <button
                                    className={`filter-option ${filter === 'taken' ? 'active' : ''}`}
                                    onClick={() => { setFilter('taken'); setShowFilters(false); }}
                                >
                                    <Check size={14} /> Taken Only
                                </button>
                                <button
                                    className={`filter-option ${filter === 'not_taken' ? 'active' : ''}`}
                                    onClick={() => { setFilter('not_taken'); setShowFilters(false); }}
                                >
                                    <X size={14} /> Missed Only
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Lock Toggle */}
                    <button
                        className={`btn btn-secondary btn-sm ${isLocked ? 'locked' : ''}`}
                        onClick={() => toggleMonthLock(currentMonth)}
                        title={isLocked ? 'Unlock month for editing' : 'Lock month to prevent editing'}
                    >
                        {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
                        <span className="hide-mobile">{isLocked ? 'Locked' : 'Lock'}</span>
                    </button>
                </div>
            </div>

            {/* Filter Active Badge */}
            {showingFiltered && (
                <div className="filter-badge">
                    <span>Showing: {filter === 'taken' ? 'Taken days' : 'Missed days'}</span>
                    <button onClick={() => setFilter('all')}>Clear filter</button>
                </div>
            )}

            {/* Week Days Header */}
            <div className="calendar-weekdays">
                {weekDays.map((day) => (
                    <div key={day} className="weekday">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            {!showingFiltered ? (
                <div className="calendar-grid">
                    {/* Empty cells for days before the first day of month */}
                    {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                        <div key={`empty-${index}`} className="calendar-day empty" />
                    ))}

                    {/* Actual days */}
                    {monthDays.map((dayInfo) => (
                        <button
                            key={format(dayInfo.date, 'yyyy-MM-dd')}
                            className={`calendar-day ${dayInfo.isToday ? 'today' : ''} ${getStatusClass(dayInfo.status)} ${dayInfo.isFuture ? 'future' : ''} ${isLocked ? 'locked' : ''}`}
                            onClick={() => handleDateClick(dayInfo)}
                            disabled={dayInfo.isFuture}
                        >
                            <span className="day-number">{format(dayInfo.date, 'd')}</span>
                            <span className="day-name-short">{format(dayInfo.date, 'EEE')}</span>
                            {dayInfo.status !== TIFFIN_STATUS.NONE && (
                                <span className="day-status">
                                    {getStatusIcon(dayInfo.status)}
                                </span>
                            )}
                            {dayInfo.note && (
                                <span className="day-has-note">
                                    <StickyNote size={10} />
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            ) : (
                /* Filtered List View */
                <div className="filtered-list">
                    {filteredDays.length === 0 ? (
                        <div className="empty-filter">
                            <p>No days match this filter</p>
                        </div>
                    ) : (
                        filteredDays.map((dayInfo) => (
                            <div
                                key={format(dayInfo.date, 'yyyy-MM-dd')}
                                className={`filtered-day ${getStatusClass(dayInfo.status)}`}
                                onClick={() => handleDateClick(dayInfo)}
                            >
                                <div className="filtered-day-info">
                                    <span className="filtered-day-date">
                                        {format(dayInfo.date, 'EEE, MMM d')}
                                    </span>
                                    {dayInfo.note && (
                                        <span className="filtered-day-note">{dayInfo.note}</span>
                                    )}
                                </div>
                                <span className="filtered-day-status">
                                    {getStatusIcon(dayInfo.status)}
                                    {dayInfo.status === TIFFIN_STATUS.TAKEN ? 'Taken' : 'Missed'}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Status Selection Modal */}
            {showStatusModal && modalDate && (
                <div className="status-modal-overlay" onClick={closeModal}>
                    <div className="status-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="status-modal-header">
                            <h3 className="status-modal-title">
                                {format(modalDate.date, 'EEEE, MMMM d, yyyy')}
                            </h3>
                            {isLocked && (
                                <span className="locked-badge">
                                    <Lock size={14} /> Month Locked
                                </span>
                            )}
                        </div>

                        {!isLocked ? (
                            <>
                                <p className="status-modal-subtitle">Select tiffin status for this day</p>

                                <div className="status-options-row">
                                    <button
                                        className={`status-option taken ${modalDate.status === TIFFIN_STATUS.TAKEN ? 'active' : ''}`}
                                        onClick={() => handleStatusChange(TIFFIN_STATUS.TAKEN)}
                                    >
                                        <div className="status-icon">
                                            <Check size={28} />
                                        </div>
                                        <span>Taken</span>
                                    </button>

                                    <button
                                        className={`status-option not-taken ${modalDate.status === TIFFIN_STATUS.NOT_TAKEN ? 'active' : ''}`}
                                        onClick={() => handleStatusChange(TIFFIN_STATUS.NOT_TAKEN)}
                                    >
                                        <div className="status-icon">
                                            <X size={28} />
                                        </div>
                                        <span>Not Taken</span>
                                    </button>
                                </div>

                                {/* Notes Section */}
                                <div className="note-section">
                                    <label className="note-label">
                                        <StickyNote size={14} />
                                        Add a note (optional)
                                    </label>
                                    <textarea
                                        className="note-input"
                                        placeholder="e.g., Auntie was on leave, Didn't feel well, Skipped intentionally..."
                                        value={noteInput}
                                        onChange={(e) => setNoteInput(e.target.value)}
                                        rows={3}
                                    />
                                    <div className="note-suggestions">
                                        <span className="suggestion-label">Quick:</span>
                                        {['Auntie on leave', "Didn't feel well", 'Skipped intentionally'].map((suggestion) => (
                                            <button
                                                key={suggestion}
                                                className="note-suggestion"
                                                onClick={() => setNoteInput(suggestion)}
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {modalDate.status !== TIFFIN_STATUS.NONE && (
                                    <button
                                        className="btn btn-secondary clear-status"
                                        onClick={() => handleStatusChange(TIFFIN_STATUS.NONE)}
                                    >
                                        Clear Status
                                    </button>
                                )}
                            </>
                        ) : (
                            <div className="locked-message">
                                <p>This month is locked. Unlock it to make changes.</p>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => toggleMonthLock(currentMonth)}
                                >
                                    <Unlock size={16} />
                                    Unlock Month
                                </button>
                            </div>
                        )}

                        <button
                            className="btn btn-secondary close-modal"
                            onClick={closeModal}
                        >
                            {isLocked ? 'Close' : 'Cancel'}
                        </button>
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="calendar-legend">
                <div className="legend-item">
                    <span className="legend-dot taken"></span>
                    <span>Taken</span>
                </div>
                <div className="legend-item">
                    <span className="legend-dot not-taken"></span>
                    <span>Not Taken</span>
                </div>
                <div className="legend-item">
                    <span className="legend-dot today"></span>
                    <span>Today</span>
                </div>
            </div>
        </div>
    );
};

export default Calendar;
