import { useState, useRef } from 'react';
import { useTiffin, TIFFIN_STATUS } from '../../context/TiffinContext';
import Stats from '../../components/Stats/Stats';
import { format, parseISO } from 'date-fns';
import {
    FileDown,
    Printer,
    Calendar,
    ChevronDown,
    Check,
    X,
    TrendingUp,
    Filter,
    Share2,
    PieChart,
    BarChart3,
    StickyNote
} from 'lucide-react';
import './Reports.css';

const Reports = () => {
    const {
        currentMonth,
        getMonthDays,
        getMonthStats,
        getAvailableMonths,
        goToMonth
    } = useTiffin();

    const [selectedMonth, setSelectedMonth] = useState(format(currentMonth, 'yyyy-MM'));
    const [showDropdown, setShowDropdown] = useState(false);
    const [chartType, setChartType] = useState('bar'); // 'bar' or 'pie'
    const reportRef = useRef(null);

    const availableMonths = getAvailableMonths();
    const selectedDate = parseISO(`${selectedMonth}-01`);
    const monthDays = getMonthDays(selectedDate);
    const stats = getMonthStats(selectedDate);

    const handleMonthChange = (month) => {
        setSelectedMonth(month);
        goToMonth(month);
        setShowDropdown(false);
    };

    // Export as CSV
    const exportCSV = () => {
        const headers = ['Date', 'Day', 'Status', 'Note'];
        const rows = monthDays.map(day => [
            format(day.date, 'yyyy-MM-dd'),
            format(day.date, 'EEEE'),
            day.status === TIFFIN_STATUS.NONE ? 'Unmarked' :
                day.status === TIFFIN_STATUS.TAKEN ? 'Taken' : 'Not Taken',
            day.note || ''
        ]);

        // Add summary at the end
        rows.push([]);
        rows.push(['SUMMARY']);
        rows.push(['Total Days', stats.totalDays]);
        rows.push(['Days Tracked', stats.daysUpToToday]);
        rows.push(['Taken', stats.taken]);
        rows.push(['Missed', stats.notTaken]);
        rows.push(['Unmarked', stats.unmarked]);
        rows.push(['Attendance Rate', `${stats.attendanceRate}%`]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tiffin-report-${selectedMonth}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Print report
    const printReport = () => {
        window.print();
    };

    // Share report
    const shareReport = async () => {
        const shareText = `Tiffin Report - ${format(selectedDate, 'MMMM yyyy')}\n\nTaken: ${stats.taken}\nMissed: ${stats.notTaken}\nAttendance: ${stats.attendanceRate}%`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Tiffin Report - ${format(selectedDate, 'MMMM yyyy')}`,
                    text: shareText
                });
            } catch {
                // User cancelled
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(shareText);
            alert('Report copied to clipboard!');
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case TIFFIN_STATUS.TAKEN: return 'Taken';
            case TIFFIN_STATUS.NOT_TAKEN: return 'Missed';
            default: return 'Unmarked';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case TIFFIN_STATUS.TAKEN:
                return <Check size={16} className="icon-success" />;
            case TIFFIN_STATUS.NOT_TAKEN:
                return <X size={16} className="icon-error" />;
            default:
                return <span className="icon-empty">—</span>;
        }
    };

    // Calculate chart data
    const markedDays = stats.taken + stats.notTaken;
    const takenPercent = markedDays > 0 ? (stats.taken / markedDays) * 100 : 0;
    const missedPercent = markedDays > 0 ? (stats.notTaken / markedDays) * 100 : 0;

    return (
        <div className="reports-page">
            <div className="container">
                {/* Page Header */}
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Tiffin Reports</h1>
                        <p className="page-subtitle">View statistics and export your monthly data</p>
                    </div>

                    <div className="header-actions">
                        {/* Month Selector */}
                        <div className="month-selector">
                            <button
                                className="btn btn-secondary month-selector-btn"
                                onClick={() => setShowDropdown(!showDropdown)}
                            >
                                <Calendar size={18} />
                                <span>{format(selectedDate, 'MMM yyyy')}</span>
                                <ChevronDown size={18} className={showDropdown ? 'rotated' : ''} />
                            </button>

                            {showDropdown && (
                                <div className="month-dropdown">
                                    {availableMonths.map((month) => (
                                        <button
                                            key={month}
                                            className={`month-option ${month === selectedMonth ? 'active' : ''}`}
                                            onClick={() => handleMonthChange(month)}
                                        >
                                            {format(parseISO(`${month}-01`), 'MMMM yyyy')}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Report Content - Printable Area */}
                <div className="report-content" ref={reportRef}>
                    {/* Stats Summary */}
                    <section className="report-section">
                        <h2 className="section-title">
                            <TrendingUp size={20} />
                            Monthly Summary
                        </h2>
                        <Stats month={selectedDate} />
                    </section>

                    {/* Visual Chart */}
                    <section className="report-section">
                        <div className="section-header-with-actions">
                            <h2 className="section-title">
                                <PieChart size={20} />
                                Visual Overview
                            </h2>
                            <div className="chart-toggle no-print">
                                <button
                                    className={`toggle-btn ${chartType === 'bar' ? 'active' : ''}`}
                                    onClick={() => setChartType('bar')}
                                >
                                    <BarChart3 size={16} />
                                </button>
                                <button
                                    className={`toggle-btn ${chartType === 'pie' ? 'active' : ''}`}
                                    onClick={() => setChartType('pie')}
                                >
                                    <PieChart size={16} />
                                </button>
                            </div>
                        </div>

                        {chartType === 'bar' ? (
                            <div className="bar-chart">
                                <div className="bar-chart-row">
                                    <span className="bar-label">Taken</span>
                                    <div className="bar-track">
                                        <div
                                            className="bar-fill success"
                                            style={{ width: `${takenPercent}%` }}
                                        >
                                            <span className="bar-value">{stats.taken}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bar-chart-row">
                                    <span className="bar-label">Missed</span>
                                    <div className="bar-track">
                                        <div
                                            className="bar-fill error"
                                            style={{ width: `${missedPercent}%` }}
                                        >
                                            <span className="bar-value">{stats.notTaken}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bar-chart-row">
                                    <span className="bar-label">Unmarked</span>
                                    <div className="bar-track">
                                        <div
                                            className="bar-fill neutral"
                                            style={{ width: `${stats.unmarked > 0 ? ((stats.unmarked / stats.daysUpToToday) * 100) : 0}%` }}
                                        >
                                            <span className="bar-value">{stats.unmarked}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="pie-chart-container">
                                <div className="pie-chart">
                                    <svg viewBox="0 0 100 100" className="pie-svg">
                                        {/* Background circle */}
                                        <circle cx="50" cy="50" r="40" fill="var(--color-bg-tertiary)" />

                                        {/* Taken slice */}
                                        {markedDays > 0 && (
                                            <circle
                                                cx="50"
                                                cy="50"
                                                r="40"
                                                fill="transparent"
                                                stroke="var(--color-success)"
                                                strokeWidth="20"
                                                strokeDasharray={`${takenPercent * 2.51} ${251.2}`}
                                                strokeDashoffset="0"
                                                transform="rotate(-90 50 50)"
                                            />
                                        )}

                                        {/* Missed slice */}
                                        {markedDays > 0 && (
                                            <circle
                                                cx="50"
                                                cy="50"
                                                r="40"
                                                fill="transparent"
                                                stroke="var(--color-error)"
                                                strokeWidth="20"
                                                strokeDasharray={`${missedPercent * 2.51} ${251.2}`}
                                                strokeDashoffset={`${-takenPercent * 2.51}`}
                                                transform="rotate(-90 50 50)"
                                            />
                                        )}

                                        {/* Center circle */}
                                        <circle cx="50" cy="50" r="25" fill="var(--color-bg-card)" />

                                        {/* Center text */}
                                        <text x="50" y="47" textAnchor="middle" className="pie-percent">
                                            {stats.attendanceRate}%
                                        </text>
                                        <text x="50" y="58" textAnchor="middle" className="pie-label">
                                            Attendance
                                        </text>
                                    </svg>
                                </div>
                                <div className="pie-legend">
                                    <div className="legend-row">
                                        <span className="legend-color success"></span>
                                        <span>Taken ({stats.taken})</span>
                                    </div>
                                    <div className="legend-row">
                                        <span className="legend-color error"></span>
                                        <span>Missed ({stats.notTaken})</span>
                                    </div>
                                    <div className="legend-row">
                                        <span className="legend-color neutral"></span>
                                        <span>Unmarked ({stats.unmarked})</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Detailed Log */}
                    <section className="report-section">
                        <div className="section-header-with-actions">
                            <h2 className="section-title">
                                <Filter size={20} />
                                Daily Log
                            </h2>
                            <div className="export-actions no-print">
                                <button className="btn btn-secondary btn-sm" onClick={shareReport}>
                                    <Share2 size={16} />
                                    <span className="hide-mobile">Share</span>
                                </button>
                                <button className="btn btn-secondary btn-sm" onClick={exportCSV}>
                                    <FileDown size={16} />
                                    <span className="hide-mobile">CSV</span>
                                </button>
                                <button className="btn btn-secondary btn-sm" onClick={printReport}>
                                    <Printer size={16} />
                                    <span className="hide-mobile">Print</span>
                                </button>
                            </div>
                        </div>

                        <div className="daily-log">
                            <div className="log-header">
                                <span>Date</span>
                                <span>Day</span>
                                <span>Status</span>
                                <span className="hide-mobile">Note</span>
                            </div>

                            <div className="log-body">
                                {monthDays.filter(d => d.isPast).map((day) => (
                                    <div
                                        key={format(day.date, 'yyyy-MM-dd')}
                                        className={`log-row ${day.status !== TIFFIN_STATUS.NONE ? 'has-status' : ''}`}
                                    >
                                        <span className="log-date">
                                            {format(day.date, 'd MMM')}
                                            {day.isToday && <span className="today-badge">Today</span>}
                                        </span>
                                        <span className="log-day">{format(day.date, 'EEE')}</span>
                                        <span className={`log-status status-${day.status || 'none'}`}>
                                            {getStatusIcon(day.status)}
                                            <span>{getStatusLabel(day.status)}</span>
                                        </span>
                                        <span className="log-note hide-mobile">
                                            {day.note && (
                                                <>
                                                    <StickyNote size={12} />
                                                    {day.note}
                                                </>
                                            )}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Print Footer */}
                    <div className="print-footer print-only">
                        <p>TiffinTrack Report - Generated on {format(new Date(), 'PPP')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
