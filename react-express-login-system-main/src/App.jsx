import { useEffect } from 'react';
import { useAuth } from './components/AuthContext';
import axios from 'axios';
import Login from './components/Login';
import Protected from './components/Protected';
import './App.css';

let hasFetched = false; // Prevents unnecessary duplicate requests.

function App() {
  const { user, setUser } = useAuth();

  async function fetchProfile() {
    if (hasFetched) return;
    hasFetched = true;

    try {
      const response = await axios.get(
  `${import.meta.env.VITE_API_URL}/profile`,
  { withCredentials: true }
);
   // Continue with your existing code here
} catch (error) {
    console.error("Profile error:", error);
}

      if (response.data && response.data.email) {
        setUser(response.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('There has been an Error', error);
      setUser(null);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, [setUser]);

  return user ? <Protected /> : <Login />;
}

export default App;