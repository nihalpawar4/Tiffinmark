import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import MigrationModal from '../MigrationModal/MigrationModal';
import InstallPrompt from '../InstallPrompt/InstallPrompt';
import './Layout.css';

const Layout = () => {
    return (
        <div className="layout">
            <Navbar />
            <main className="main-content">
                <Outlet />
            </main>
            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <span className="footer-logo">🍱</span>
                            <span className="footer-name">TiffinTrack</span>
                        </div>
                        <p className="footer-text">
                            Track your daily tiffin subscription with ease.
                        </p>
                        <p className="footer-credits">
                            Created with ❤️ by <span className="creator-name">Nihal Pawar</span>
                        </p>
                        <p className="footer-copyright">
                            © {new Date().getFullYear()} TiffinTrack. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
            <MigrationModal />
            <InstallPrompt />
        </div>
    );
};

export default Layout;
