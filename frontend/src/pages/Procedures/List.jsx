import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import Modal from '../../components/Modal';
import ProcedureForm from './Form';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

export default function ProcedureList() {
    const [procedures, setProcedures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProcedure, setSelectedProcedure] = useState(null);
    const { user } = useAuth();
    const isAdmin = user?.tipo === 'admin';

    const fetchProcedures = async () => {
        try {
            const response = await api.get('/procedures');
            setProcedures(response.data.items || []);
        } catch (error) {
            toast.error('Erro ao carregar procedimentos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProcedures();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este procedimento?')) {
            try {
                await api.delete(`/procedures/${id}`);
                toast.success('Procedimento excluído com sucesso');
                fetchProcedures();
            } catch (error) {
                toast.error('Erro ao excluir procedimento');
            }
        }
    };

    const handleEdit = (procedure) => {
        setSelectedProcedure(procedure);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedProcedure(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProcedure(null);
    };

    const handleSuccess = () => {
        handleCloseModal();
        fetchProcedures();
    };

    const filteredProcedures = procedures.filter(procedure =>
        procedure.nome.toLowerCase().includes(searchTerm.toLowerCase())
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
                    <h1 className="text-2xl font-bold text-gray-900">Procedimentos</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Gerencie os procedimentos médicos disponíveis
                    </p>
                </div>
                {isAdmin && (
                    <div className="mt-4 sm:mt-0">
                        <button
                            onClick={handleCreate}
                            className="btn-primary inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Novo Procedimento
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
                        placeholder="Buscar por nome..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nome</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Valor (Part.)</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Valor (Plano)</th>
                                {isAdmin && (
                                    <th scope="col" className="relative py-3.5 pl-3 pr-4">
                                        <span className="sr-only">Ações</span>
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <motion.tbody
                            variants={container}
                            initial="hidden"
                            animate="show"
                            className="divide-y divide-gray-100 bg-white/50"
                        >
                            {loading ? (
                                <tr>
                                    <td colSpan={isAdmin ? 4 : 3} className="text-center py-8 text-gray-500">Carregando...</td>
                                </tr>
                            ) : filteredProcedures.length === 0 ? (
                                <tr>
                                    <td colSpan={isAdmin ? 4 : 3} className="text-center py-8 text-gray-500">Nenhum procedimento encontrado</td>
                                </tr>
                            ) : (
                                filteredProcedures.map((procedure) => (
                                    <motion.tr
                                        key={procedure.id}
                                        variants={item}
                                        className="hover:bg-primary-50/50 transition-colors"
                                    >
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{procedure.nome}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(procedure.valor_particular)}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(procedure.valor_plano)}
                                        </td>
                                        {isAdmin && (
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleEdit(procedure)}
                                                    className="text-primary-600 hover:text-primary-900 mr-4 transition-colors"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(procedure.id)}
                                                    className="text-red-400 hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        )}
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
                title={selectedProcedure ? 'Editar Procedimento' : 'Novo Procedimento'}
            >
                <ProcedureForm
                    procedure={selectedProcedure}
                    onSuccess={handleSuccess}
                    onCancel={handleCloseModal}
                />
            </Modal>
        </motion.div>
    );
}
