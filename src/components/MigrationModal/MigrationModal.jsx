import { useAuth } from '../../context/AuthContext';
import { Download, X, Cloud, Smartphone } from 'lucide-react';
import './MigrationModal.css';

const MigrationModal = () => {
    const { showMigrationModal, migrateGuestData, user } = useAuth();

    if (!showMigrationModal) return null;

    return (
        <div className="migration-modal-overlay">
            <div className="migration-modal">
                <div className="migration-header">
                    <div className="migration-icon">
                        <Download size={28} />
                    </div>
                    <h2>Import Guest Data?</h2>
                    <p>
                        Welcome, <strong>{user?.name}</strong>! We found tiffin data from your
                        guest session. Would you like to import it to your account?
                    </p>
                </div>

                <div className="migration-options">
                    <button
                        className="migration-option-btn primary"
                        onClick={() => migrateGuestData(true)}
                    >
                        <Cloud size={20} />
                        <div className="option-content">
                            <span className="option-title">Yes, Import Data</span>
                            <span className="option-desc">Merge guest data with your account</span>
                        </div>
                    </button>

                    <button
                        className="migration-option-btn secondary"
                        onClick={() => migrateGuestData(false)}
                    >
                        <Smartphone size={20} />
                        <div className="option-content">
                            <span className="option-title">No, Start Fresh</span>
                            <span className="option-desc">Discard guest data and start new</span>
                        </div>
                    </button>
                </div>

                <p className="migration-note">
                    This action cannot be undone. Choose wisely!
                </p>
            </div>
        </div>
    );
};

export default MigrationModal;
