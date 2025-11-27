import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Calendar, Stethoscope, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState([
        { name: 'Total de Pacientes', value: '...', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { name: 'Atendimentos Hoje', value: '...', icon: Calendar, color: 'text-green-500', bg: 'bg-green-500/10' },
        { name: 'Procedimentos', value: '...', icon: Stethoscope, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { name: 'Faturamento Mensal', value: '...', icon: Activity, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    ]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/dashboard/stats');
                const data = response.data;

                setStats([
                    { name: 'Total de Pacientes', value: data.total_patients.toString(), icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { name: 'Atendimentos Hoje', value: data.appointments_today.toString(), icon: Calendar, color: 'text-green-500', bg: 'bg-green-500/10' },
                    { name: 'Procedimentos', value: data.total_procedures.toString(), icon: Stethoscope, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                    { name: 'Faturamento Mensal', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.monthly_revenue), icon: Activity, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
                ]);
            } catch (error) {
                console.error('Erro ao carregar estatísticas:', error);
                toast.error('Erro ao carregar dados do dashboard');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8"
        >
            <motion.div variants={item}>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Bem-vindo ao sistema de gestão clínica.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <motion.div
                        key={stat.name}
                        variants={item}
                        className="glass-panel p-6 rounded-2xl relative overflow-hidden group"
                    >
                        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${stat.color.replace('text-', 'bg-')}`}>
                            <stat.icon className="h-24 w-24" />
                        </div>
                        <div className="relative">
                            <div className={`p-3 rounded-xl w-fit ${stat.bg} ${stat.color} mb-4`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-400">{stat.name}</p>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                {loading ? <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div> : stat.value}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div variants={item} className="glass-panel p-6 rounded-2xl">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Atendimentos Hoje</h3>
                    <div className="flex items-center justify-center h-48 text-gray-500 dark:text-gray-400">
                        Nenhum atendimento agendado para hoje.
                    </div>
                </motion.div>

                <motion.div variants={item} className="glass-panel p-6 rounded-2xl">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Avisos Recentes</h3>
                    <div className="flex items-center justify-center h-48 text-gray-500 dark:text-gray-400">
                        Nenhum aviso importante.
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
