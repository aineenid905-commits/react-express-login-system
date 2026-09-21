import React from 'react';
import { useAuth } from './AuthContext';

function Protected() {
    const { user } = useAuth();
    const { logout } = useAuth();

    function handleLogout() {
        logout();
    }

    return (
    <div className="user-container">
        <div className="user-info">
            <h2>Welcome, {user.name}!</h2>
            <p>{user.email}</p>
             <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
    </div>    
    );
}

export default Protected;