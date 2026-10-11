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
    const [resetUser, setResetUser] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [resetError, setResetError] = useState('');

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data.items || []);
        } catch {
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
            } catch {
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

    const closeReset = () => {
        if (resetLoading) return;
        setResetUser(null);
        setNewPassword('');
        setConfirmation('');
        setResetError('');
    };

    const handleResetPassword = async (event) => {
        event.preventDefault();
        if (resetLoading) return;
        setResetError('');
        if (newPassword.length < 6 || new TextEncoder().encode(newPassword).length > 72) {
            setResetError('Use pelo menos 6 caracteres e no máximo 72 bytes. Caracteres acentuados podem ocupar mais de um byte.');
            return;
        }
        if (newPassword !== confirmation) {
            setResetError('A confirmação deve ser igual à nova senha.');
            return;
        }
        setResetLoading(true);
        try {
            await api.post(`/users/${resetUser.id}/reset-password`, { nova_senha: newPassword });
            setResetUser(null);
            setNewPassword('');
            setConfirmation('');
            toast.success('Senha redefinida com sucesso');
        } catch {
            setResetError('Não foi possível redefinir a senha. Verifique sua conexão e tente novamente.');
        } finally {
            setResetLoading(false);
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Usuários</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
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
                        type="search"
                        aria-label="Buscar usuários por nome ou e-mail"
                        className="glass-input block w-full pl-10 pr-3 py-2.5 rounded-xl sm:text-sm"
                        placeholder="Buscar por nome ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead>
                            <tr>
                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nome</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tipo</th>
                                <th scope="col" className="relative py-3.5 pl-3 pr-4">
                                    <span className="sr-only">Ações</span>
                                </th>
                            </tr>
                        </thead>
                        <motion.tbody
                            variants={container}
                            initial="hidden"
                            animate="show"
                            className="divide-y divide-gray-100 bg-white/50 dark:divide-gray-700 dark:bg-gray-900"
                        >
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-8 text-gray-500 dark:text-gray-300">Carregando...</td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-8 text-gray-500 dark:text-gray-300">Nenhum usuário encontrado</td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <motion.tr
                                        key={user.id}
                                        variants={item}
                                        className="hover:bg-primary-50/50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-gray-100">{user.nome}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">{user.email}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300 capitalize">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.tipo === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
                                                }`}>
                                                {user.tipo}
                                            </span>
                                        </td>
                                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                                            <button
                                                onClick={() => setResetUser(user)}
                                                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-amber-700 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-gray-700 transition-colors"
                                                title="Redefinir senha"
                                                aria-label={`Redefinir senha de ${user.nome}`}
                                            >
                                                <KeyRound className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(user)}
                                                aria-label={`Editar usuário ${user.nome}`}
                                                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-primary-700 hover:bg-primary-50 dark:text-primary-300 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                aria-label={`Excluir usuário ${user.nome}`}
                                                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-gray-700 transition-colors"
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
            <Modal isOpen={!!resetUser} onClose={closeReset} title="Redefinir senha">
                <form onSubmit={handleResetPassword} className="space-y-5" aria-busy={resetLoading}>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Defina uma nova senha para <strong>{resetUser?.nome}</strong>.</p>
                    <fieldset disabled={resetLoading} className="space-y-4">
                        <div>
                            <label htmlFor="reset-new-password" className="block text-sm font-medium">Nova senha</label>
                            <input id="reset-new-password" type="password" autoComplete="new-password" required minLength={6} value={newPassword} onChange={event => { setNewPassword(event.target.value); setResetError(''); }} aria-describedby={`reset-password-help${resetError ? ' reset-password-error' : ''}`} aria-invalid={!!resetError} className="glass-input mt-2 block w-full rounded-lg px-3 py-2.5" />
                            <p id="reset-password-help" className="mt-2 text-sm text-slate-600 dark:text-slate-300">Use pelo menos 6 caracteres. Limite: 72 bytes em UTF-8.</p>
                        </div>
                        <div>
                            <label htmlFor="reset-confirm-password" className="block text-sm font-medium">Confirme a nova senha</label>
                            <input id="reset-confirm-password" type="password" autoComplete="new-password" required value={confirmation} onChange={event => { setConfirmation(event.target.value); setResetError(''); }} aria-describedby={resetError ? 'reset-password-error' : undefined} aria-invalid={!!resetError} className="glass-input mt-2 block w-full rounded-lg px-3 py-2.5" />
                        </div>
                    </fieldset>
                    {resetError && <p id="reset-password-error" role="alert" className="text-sm text-red-700 dark:text-red-300">{resetError}</p>}
                    <div className="flex flex-wrap justify-end gap-3">
                        <button type="button" onClick={closeReset} disabled={resetLoading} className="min-h-11 rounded-lg border border-slate-300 px-4 py-2 dark:border-slate-600">Cancelar</button>
                        <button type="submit" disabled={resetLoading} className="btn-primary min-h-11 rounded-lg px-4 py-2">{resetLoading ? 'Redefinindo…' : 'Redefinir senha'}</button>
                    </div>
                </form>
            </Modal>
        </motion.div>
    );
}
