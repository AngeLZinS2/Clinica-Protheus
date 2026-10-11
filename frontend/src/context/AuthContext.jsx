import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStorageData = () => {
            const storedUser = localStorage.getItem('user');
            const storedToken = localStorage.getItem('token');

            try {
                if (storedUser && storedToken) setUser(JSON.parse(storedUser));
            } catch {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
            setLoading(false);
        };

        loadStorageData();
    }, []);

    const updateUser = (changes) => {
        setUser(current => {
            const updated = { ...current, ...changes };
            localStorage.setItem('user', JSON.stringify(updated));
            return updated;
        });
    };

    const login = async (email, senha, { silent = false } = {}) => {
        try {
            const response = await api.post('/auth/login', { email, senha });
            const { user, access_token, role, first_access } = response.data;

            const userData = { ...user, role, first_access };

            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', access_token);

            setUser(userData);

            if (first_access) {
                toast('Por favor, altere sua senha para continuar.', { icon: '🔒' });
            } else {
                toast.success('Login realizado com sucesso!');
            }
            return true;
        } catch {
            if (!silent) toast.error('Erro ao fazer login. Verifique suas credenciais.');
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        toast.success('Logout realizado.');
    };

    return (
        <AuthContext.Provider value={{ signed: !!user, user, updateUser, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
