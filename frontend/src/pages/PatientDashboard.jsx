import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Calendar, User, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function PatientDashboard() {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const response = await api.get('/appointments');
                setAppointments(response.data.items || []);
            } catch (error) {
                console.error('Erro ao buscar consultas:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, []);

    const upcomingAppointments = appointments.filter(apt => new Date(apt.data_hora) >= new Date());
    const pastAppointments = appointments.filter(apt => new Date(apt.data_hora) < new Date());

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Meu Portal</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Bem-vindo, <span className="font-semibold text-primary-600 dark:text-primary-400">{user?.nome}</span>.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <motion.div variants={item} className="glass-panel p-6 rounded-2xl">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                            <User className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Meus Dados</h3>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <p><span className="font-medium text-gray-900 dark:text-gray-200">CPF:</span> {user?.cpf}</p>
                        <p><span className="font-medium text-gray-900 dark:text-gray-200">Email:</span> {user?.email}</p>
                        <p><span className="font-medium text-gray-900 dark:text-gray-200">Telefone:</span> {user?.telefone}</p>
                    </div>
                </motion.div>

                <motion.div variants={item} className="glass-panel p-6 rounded-2xl">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl">
                            <Calendar className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Próximas Consultas</h3>
                    </div>
                    {loading ? (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Carregando...</p>
                    ) : upcomingAppointments.length > 0 ? (
                        <div className="space-y-3">
                            {upcomingAppointments.map((apt) => (
                                <div key={apt.id} className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                                    <p className="font-medium text-green-900 dark:text-green-100">
                                        {format(new Date(apt.data_hora), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                                    </p>
                                    <p className="text-sm text-green-700 dark:text-green-300">{apt.tipo}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhuma consulta agendada.</p>
                    )}
                </motion.div>

                <motion.div variants={item} className="glass-panel p-6 rounded-2xl">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
                            <Clock className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Histórico</h3>
                    </div>
                    {loading ? (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Carregando...</p>
                    ) : pastAppointments.length > 0 ? (
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                            {pastAppointments.map((apt) => (
                                <div key={apt.id} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {format(new Date(apt.data_hora), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{apt.tipo}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhum histórico disponível.</p>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
}
