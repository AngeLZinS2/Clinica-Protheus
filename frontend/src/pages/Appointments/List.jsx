import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Plus, Search, Edit2, Trash2, Calendar, Clock, User } from 'lucide-react';
import Modal from '../../components/Modal';
import AppointmentForm from './Form';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function AppointmentList() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    const fetchAppointments = async () => {
        try {
            const response = await api.get('/appointments');
            setAppointments(response.data.items || []);
        } catch (error) {
            toast.error('Erro ao carregar atendimentos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este atendimento?')) {
            try {
                await api.delete(`/appointments/${id}`);
                toast.success('Atendimento excluído com sucesso');
                fetchAppointments();
            } catch (error) {
                toast.error('Erro ao excluir atendimento');
            }
        }
    };

    const handleEdit = (appointment) => {
        setSelectedAppointment(appointment);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedAppointment(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedAppointment(null);
    };

    const handleSuccess = () => {
        handleCloseModal();
        fetchAppointments();
    };

    const filteredAppointments = appointments.filter(appointment =>
        (appointment.patient?.nome || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    const { user } = useAuth();
    const isPatient = user?.role === 'patient';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="sm:flex sm:items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{isPatient ? 'Minhas Consultas' : 'Atendimentos'}</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {isPatient ? 'Visualize seu histórico de consultas' : 'Gerencie os agendamentos e consultas'}
                    </p>
                </div>
                {!isPatient && (
                    <div className="mt-4 sm:mt-0">
                        <button
                            onClick={handleCreate}
                            className="btn-primary inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Novo Atendimento
                        </button>
                    </div>
                )}
            </div>

            <div className="glass-panel rounded-2xl p-4">
                <div className="mb-6 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="glass-input block w-full pl-10 pr-3 py-2.5 rounded-xl sm:text-sm"
                        placeholder="Buscar por paciente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {loading ? (
                        <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">Carregando...</div>
                    ) : filteredAppointments.length === 0 ? (
                        <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">Nenhum atendimento encontrado</div>
                    ) : (
                        <motion.div
                            variants={container}
                            initial="hidden"
                            animate="show"
                            className="contents"
                        >
                            {filteredAppointments.map((appointment) => (
                                <motion.div
                                    key={appointment.id}
                                    variants={item}
                                    className="glass-panel p-6 rounded-xl hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-800"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                                                <User className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{appointment.patient?.nome}</h3>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                    {appointment.patient?.cpf} • {appointment.patient?.telefone}
                                                </div>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${appointment.tipo === 'particular' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                                    }`}>
                                                    {appointment.tipo}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button onClick={() => handleEdit(appointment)} className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleDelete(appointment.id)} className="text-gray-400 hover:text-red-600 dark:hover:text-red-400">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-4 space-y-2">
                                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                            {new Date(appointment.data_hora).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                            <Clock className="h-4 w-4 mr-2 text-gray-400" />
                                            {new Date(appointment.data_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-50">
                                        <p className="text-xs text-gray-500 mb-2 font-medium">Procedimentos:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {appointment.procedures?.map(proc => (
                                                <span key={proc.id} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                                                    {proc.nome}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={selectedAppointment ? 'Editar Atendimento' : 'Novo Atendimento'}
            >
                <AppointmentForm
                    appointment={selectedAppointment}
                    onSuccess={handleSuccess}
                    onCancel={handleCloseModal}
                />
            </Modal>
        </motion.div>
    );
}
