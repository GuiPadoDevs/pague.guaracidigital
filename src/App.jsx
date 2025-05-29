import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminPanel from './components/AdminPanel';
import PaymentForm from './components/PaymentForm';
import Login from './components/Login';

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
    };

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/admin" />} />
                <Route
                    path="/admin"
                    element={
                        isAuthenticated ? (
                            <AdminPanel onLogout={handleLogout} />
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />
                <Route
                    path="/login"
                    element={<Login onLogin={() => setIsAuthenticated(true)} />}
                />
                <Route
                    path="/pagamento/:id"
                    element={
                        <div style={{ textAlign: 'center' }}>
                            <PaymentForm />
                        </div>
                    }
                />
            </Routes>
        </Router>
    );
}
