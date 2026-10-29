
import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    async function register(name, email, password, confirmPassword) {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/register`,
                { name, email, password, confirmPassword },
                { withCredentials: true }
            );

            if (response.data.success) {
                setUser(response.data.user);
            } else {
                alert(response.data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert(
                error.response?.data?.message ||
                error.message ||
                'Registration failed'
            );
        }
    }

    async function login(email, password) {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/login`,
                { email, password },
                { withCredentials: true }
            );

            if (response.data.success) {
                setUser(response.data.user);
            } else {
                alert(response.data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert(
                error.response?.data?.message ||
                error.message ||
                'Login failed'
            );
        }
    }

    async function logout() {
        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL}/logout`,
                {},
                { withCredentials: true }
            );

            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
            alert('Logout failed. Please try again.');
        }
    }

    return (
        <AuthContext.Provider
            value={{ user, setUser, register, login, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
}

function useAuth() {
    return useContext(AuthContext);
}

export { AuthProvider, useAuth };
