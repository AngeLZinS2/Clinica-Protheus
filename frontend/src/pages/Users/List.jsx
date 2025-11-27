import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Search, Edit2, Trash2, KeyRound } from 'lucide-react';
import Modal from '../../components/Modal';
import UserForm from './Form';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function UserList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data.items || []);
        } catch (error) {
            toast.error('Erro ao carregar usuários');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
            try {
                await api.delete(`/users/${id}`);
                toast.success('Usuário excluído com sucesso');
                fetchUsers();
            } catch (error) {
                toast.error('Erro ao excluir usuário');
            }
        }
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    const handleResetPassword = async (id) => {
        if (window.confirm('Deseja resetar a senha deste usuário para "123456"?')) {
            try {
                await api.post(`/users/${id}/reset-password`);
                toast.success('Senha resetada com sucesso');
            } catch (error) {
                toast.error('Erro ao resetar senha');
            }
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    const handleSuccess = () => {
        handleCloseModal();
        fetchUsers();
    };

    const filteredUsers = users.filter(user =>
        user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
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
                    <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Gerencie os usuários do sistema
                    </p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <button
                        onClick={handleCreate}
                        className="btn-primary inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Usuário
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
                        placeholder="Buscar por nome ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nome</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                                <th scope="col" className="relative py-3.5 pl-3 pr-4">
                                    <span className="sr-only">Ações</span>
                                </th>
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
                                    <td colSpan="4" className="text-center py-8 text-gray-500">Carregando...</td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-8 text-gray-500">Nenhum usuário encontrado</td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <motion.tr
                                        key={user.id}
                                        variants={item}
                                        className="hover:bg-primary-50/50 transition-colors"
                                    >
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{user.nome}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.email}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 capitalize">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.tipo === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {user.tipo}
                                            </span>
                                        </td>
                                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleResetPassword(user.id)}
                                                className="text-yellow-500 hover:text-yellow-700 mr-4 transition-colors"
                                                title="Resetar Senha"
                                            >
                                                <KeyRound className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="text-primary-600 hover:text-primary-900 mr-4 transition-colors"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="text-red-400 hover:text-red-600 transition-colors"
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
                title={selectedUser ? 'Editar Usuário' : 'Novo Usuário'}
            >
                <UserForm
                    user={selectedUser}
                    onSuccess={handleSuccess}
                    onCancel={handleCloseModal}
                />
            </Modal>
        </motion.div>
    );
}
