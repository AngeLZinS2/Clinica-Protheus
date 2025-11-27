import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import Modal from '../../components/Modal';
import PatientForm from './Form';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function PatientList() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);

    const fetchPatients = async () => {
        try {
            const response = await api.get('/patients');
            setPatients(response.data.items || []);
        } catch (error) {
            toast.error('Erro ao carregar pacientes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este paciente?')) {
            try {
                await api.delete(`/patients/${id}`);
                toast.success('Paciente excluído com sucesso');
                fetchPatients();
            } catch (error) {
                const msg = error.response?.data?.error || 'Erro ao excluir paciente';
                toast.error(msg);
            }
        }
    };

    const handleEdit = (patient) => {
        setSelectedPatient(patient);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedPatient(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedPatient(null);
    };

    const handleSuccess = () => {
        handleCloseModal();
        fetchPatients();
    };

    const filteredPatients = patients.filter(patient =>
        patient.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.cpf.includes(searchTerm)
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="sm:flex sm:items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pacientes</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Gerencie os pacientes da clínica
                    </p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <button
                        onClick={handleCreate}
                        className="btn-primary inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Paciente
                    </button>
                </div>
            </div>

            <div className="glass-panel rounded-2xl p-4">
                <div className="mb-6 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="glass-input block w-full pl-10 pr-3 py-2.5 rounded-xl sm:text-sm"
                        placeholder="Buscar por nome ou CPF..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead>
                            <tr>
                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nome</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">CPF</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Telefone</th>
                                <th scope="col" className="relative py-3.5 pl-3 pr-4">
                                    <span className="sr-only">Ações</span>
                                </th>
                            </tr>
                        </thead>
                        <motion.tbody
                            variants={container}
                            initial="hidden"
                            animate="show"
                            className="divide-y divide-gray-100 dark:divide-gray-800 bg-white/50 dark:bg-gray-800/50"
                        >
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-gray-500 dark:text-gray-400">Carregando...</td>
                                </tr>
                            ) : filteredPatients.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-gray-500 dark:text-gray-400">Nenhum paciente encontrado</td>
                                </tr>
                            ) : (
                                filteredPatients.map((patient) => (
                                    <motion.tr
                                        key={patient.id}
                                        variants={item}
                                        className="hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-colors"
                                    >
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white">{patient.nome}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{patient.cpf}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{patient.email}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{patient.telefone}</td>
                                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(patient)}
                                                className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-4 transition-colors"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(patient.id)}
                                                className="text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </motion.tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={selectedPatient ? 'Editar Paciente' : 'Novo Paciente'}
            >
                <PatientForm
                    patient={selectedPatient}
                    onSuccess={handleSuccess}
                    onCancel={handleCloseModal}
                />
            </Modal>
        </motion.div>
    );
}
