
import { useEffect } from 'react';
import { useAuth } from './components/AuthContext';
import axios from 'axios';
import Login from './components/Login';
import Protected from './components/Protected';
import './App.css';

function App() {
    const { user, setUser } = useAuth();

    useEffect(() => {
        let cancelled = false;

        async function fetchProfile() {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/profile`,
                    { withCredentials: true }
                );

                if (!cancelled) {
                    if (response.data && response.data.email) {
                        setUser(response.data);
                    } else {
                        setUser(null);
                    }
                }
            } catch (error) {
                console.error('Profile error:', error);

                if (!cancelled) {
                    setUser(null);
                }
            }
        }

        fetchProfile();

        return () => {
            cancelled = true;
        };
    }, [setUser]);

    return (
        <div className="app-container">
            <main className="app-content">
                {user ? <Protected /> : <Login />}
            </main>

            <footer className="site-footer">
                <p><p>Developed by Aine Enid,
                      Ssozi Derrick
                </p>
                
      
            </footer>
        </div>
    );
}

export default App;
