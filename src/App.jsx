import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TiffinProvider } from './context/TiffinContext';
import Layout from './components/Layout/Layout';
import Home from './pages/Home/Home';
import CalendarPage from './pages/CalendarPage/CalendarPage';
import Reports from './pages/Reports/Reports';
import History from './pages/History/History';
import Settings from './pages/Settings/Settings';
import Login from './pages/Login/Login';

function App() {
  return (
    <AuthProvider>
      <TiffinProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="reports" element={<Reports />} />
              <Route path="history" element={<History />} />
              <Route path="settings" element={<Settings />} />
              <Route path="login" element={<Login />} />
            </Route>
          </Routes>
        </Router>
      </TiffinProvider>
    </AuthProvider>
  );
}

export default App;
