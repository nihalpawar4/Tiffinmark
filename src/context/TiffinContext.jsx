import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, isBefore, startOfToday } from 'date-fns';

const TiffinContext = createContext(null);

// Tiffin status types - Simplified to just Taken and Not Taken
export const TIFFIN_STATUS = {
    TAKEN: 'taken',
    NOT_TAKEN: 'not_taken',
    NONE: 'none'
};

export const useTiffin = () => {
    const context = useContext(TiffinContext);
    if (!context) {
        throw new Error('useTiffin must be used within a TiffinProvider');
    }
    return context;
};

export const TiffinProvider = ({ children }) => {
    const { user, isLoading: authLoading } = useAuth();
    const [tiffinData, setTiffinData] = useState({});
    const [lockedMonths, setLockedMonths] = useState({});
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedDate, setSelectedDate] = useState(null);
    const [reminderSettings, setReminderSettings] = useState({
        enabled: true,
        time: '18:00',
        defaultAction: 'none'
    });

    // Get storage key based on user
    const getStorageKey = useCallback(() => {
        if (user?.uid && user.uid !== 'guest') {
            return `tiffin_data_${user.uid}`;
        }
        return 'tiffin_data_guest';
    }, [user]);

    // Load data from localStorage
    const loadData = useCallback(() => {
        if (authLoading) return;

        const storageKey = getStorageKey();
        const stored = localStorage.getItem(storageKey);
        const lockedKey = `${storageKey}_locked`;
        const storedLocked = localStorage.getItem(lockedKey);
        const reminderKey = `${storageKey}_reminders`;
        const storedReminders = localStorage.getItem(reminderKey);

        if (stored) {
            try {
                setTiffinData(JSON.parse(stored));
            } catch {
                setTiffinData({});
            }
        } else {
            setTiffinData({});
        }

        if (storedLocked) {
            try {
                setLockedMonths(JSON.parse(storedLocked));
            } catch {
                setLockedMonths({});
            }
        } else {
            setLockedMonths({});
        }

        if (storedReminders) {
            try {
                setReminderSettings(JSON.parse(storedReminders));
            } catch {
                // Keep defaults
            }
        }

        setIsLoading(false);
    }, [authLoading, getStorageKey]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Save data to localStorage
    const saveToLocalStorage = useCallback((data) => {
        const storageKey = getStorageKey();
        localStorage.setItem(storageKey, JSON.stringify(data));
    }, [getStorageKey]);

    // Save locked months
    const saveLockedMonths = useCallback((data) => {
        const storageKey = getStorageKey();
        localStorage.setItem(`${storageKey}_locked`, JSON.stringify(data));
    }, [getStorageKey]);

    // Save reminder settings
    const saveReminderSettingsToStorage = useCallback((settings) => {
        setReminderSettings(settings);
        const storageKey = getStorageKey();
        localStorage.setItem(`${storageKey}_reminders`, JSON.stringify(settings));
    }, [getStorageKey]);

    // Check if month is locked
    const isMonthLocked = (month) => {
        const monthKey = format(month, 'yyyy-MM');
        return lockedMonths[monthKey] || false;
    };

    // Toggle month lock
    const toggleMonthLock = (month) => {
        const monthKey = format(month, 'yyyy-MM');
        const newLocked = !lockedMonths[monthKey];

        const newLockedMonths = {
            ...lockedMonths,
            [monthKey]: newLocked
        };

        if (!newLocked) {
            delete newLockedMonths[monthKey];
        }

        setLockedMonths(newLockedMonths);
        saveLockedMonths(newLockedMonths);
    };

    // Get entry for a specific date
    const getEntryForDate = (date) => {
        const dateKey = format(date, 'yyyy-MM-dd');
        const entry = tiffinData[dateKey];
        if (!entry) {
            return { status: TIFFIN_STATUS.NONE, note: '' };
        }
        if (typeof entry === 'string') {
            return { status: entry, note: '' };
        }
        return entry;
    };

    const getStatusForDate = (date) => getEntryForDate(date).status;
    const getNoteForDate = (date) => getEntryForDate(date).note || '';

    // Set status for a specific date
    const setStatusForDate = (date, status, note = null) => {
        const dateKey = format(date, 'yyyy-MM-dd');
        const monthKey = format(date, 'yyyy-MM');

        if (lockedMonths[monthKey]) return false;

        const currentEntry = getEntryForDate(date);
        const newNote = note !== null ? note : currentEntry.note;

        const newData = { ...tiffinData };

        if (status === TIFFIN_STATUS.NONE && !newNote) {
            delete newData[dateKey];
        } else {
            newData[dateKey] = {
                status: status,
                note: newNote,
                updatedAt: new Date().toISOString()
            };
        }

        setTiffinData(newData);
        saveToLocalStorage(newData);
        return true;
    };

    const setNoteForDate = (date, note) => {
        const entry = getEntryForDate(date);
        return setStatusForDate(date, entry.status, note);
    };

    // Get month days
    const getMonthDays = (month = currentMonth) => {
        const start = startOfMonth(month);
        const end = endOfMonth(month);
        const days = eachDayOfInterval({ start, end });
        const today = startOfToday();

        return days.map(day => {
            const entry = getEntryForDate(day);
            return {
                date: day,
                status: entry.status,
                note: entry.note,
                isToday: isSameDay(day, new Date()),
                isPast: isBefore(day, today) || isSameDay(day, today),
                isFuture: !isBefore(day, today) && !isSameDay(day, today)
            };
        });
    };

    const getFilteredMonthDays = (month = currentMonth) => {
        const days = getMonthDays(month);
        if (filter === 'all') return days;
        return days.filter(day => {
            if (filter === 'taken') return day.status === TIFFIN_STATUS.TAKEN;
            if (filter === 'not_taken') return day.status === TIFFIN_STATUS.NOT_TAKEN;
            return true;
        });
    };

    // Get monthly statistics
    const getMonthStats = (month = currentMonth) => {
        const days = getMonthDays(month);

        const stats = {
            totalDays: days.length,
            daysUpToToday: days.filter(d => d.isPast).length,
            taken: 0,
            notTaken: 0,
            unmarked: 0,
            attendanceRate: 0
        };

        days.forEach(day => {
            if (day.isPast) {
                switch (day.status) {
                    case TIFFIN_STATUS.TAKEN:
                        stats.taken++;
                        break;
                    case TIFFIN_STATUS.NOT_TAKEN:
                        stats.notTaken++;
                        break;
                    default:
                        stats.unmarked++;
                }
            }
        });

        const markedDays = stats.taken + stats.notTaken;
        stats.attendanceRate = markedDays > 0 ? Math.round((stats.taken / markedDays) * 100) : 0;

        return stats;
    };

    // Get available months
    const getAvailableMonths = () => {
        const months = new Set();
        Object.keys(tiffinData).forEach(dateKey => {
            const date = parseISO(dateKey);
            months.add(format(date, 'yyyy-MM'));
        });
        months.add(format(new Date(), 'yyyy-MM'));
        return Array.from(months).sort().reverse();
    };

    // Get history data
    const getHistoryData = () => {
        const months = getAvailableMonths();
        return months.map(monthStr => {
            const [year, month] = monthStr.split('-').map(Number);
            const monthDate = new Date(year, month - 1, 1);
            const stats = getMonthStats(monthDate);

            return {
                monthKey: monthStr,
                monthDate,
                monthLabel: format(monthDate, 'MMMM yyyy'),
                ...stats,
                isLocked: lockedMonths[monthStr] || false
            };
        });
    };

    // Navigation
    const goToPreviousMonth = () => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const goToMonth = (monthString) => {
        const [year, month] = monthString.split('-').map(Number);
        setCurrentMonth(new Date(year, month - 1, 1));
    };

    // Clear all data
    const clearAllData = () => {
        const storageKey = getStorageKey();
        localStorage.removeItem(storageKey);
        localStorage.removeItem(`${storageKey}_locked`);
        localStorage.removeItem(`${storageKey}_reminders`);
        setTiffinData({});
        setLockedMonths({});
    };

    const value = {
        tiffinData,
        currentMonth,
        isLoading: isLoading || authLoading,
        filter,
        setFilter,
        selectedDate,
        setSelectedDate,
        reminderSettings,
        saveReminderSettings: saveReminderSettingsToStorage,
        getEntryForDate,
        getStatusForDate,
        getNoteForDate,
        setStatusForDate,
        setNoteForDate,
        getMonthDays,
        getFilteredMonthDays,
        getMonthStats,
        getAvailableMonths,
        getHistoryData,
        isMonthLocked,
        toggleMonthLock,
        goToPreviousMonth,
        goToNextMonth,
        goToMonth,
        clearAllData,
        TIFFIN_STATUS
    };

    return (
        <TiffinContext.Provider value={value}>
            {children}
        </TiffinContext.Provider>
    );
};

export default TiffinContext;
