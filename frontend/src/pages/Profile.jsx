import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Loader2, User, Lock } from 'lucide-react';

export default function Profile() {
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, setValue, formState: { errors } } = useForm({
        defaultValues: {
            nome: '',
            email: '',
            senha_atual: '',
            senha: ''
        }
    });

    useEffect(() => {
        if (user) {
            setValue('nome', user.nome);
            setValue('email', user.email);
        }
    }, [user, setValue]);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            // 1. Update Profile Info
            const payload = {
                nome: data.nome,
                email: data.email
            };

            let response;
            if (user.role === 'patient') {
                response = await api.put(`/patients/${user.id}`, payload);
            } else {
                response = await api.put(`/users/${user.id}`, payload);
            }

            // 2. Update Password (if provided)
            if (data.senha) {
                if (!data.senha_atual && user.role !== 'patient') {
                    // Admin/User might need current password check if enforced by backend, 
                    // but for now let's use the new auth endpoint for everyone or just patients?
                    // The /auth/change-password endpoint requires logged in user.
                }

                // Use the specific change-password endpoint we created
                await api.post('/auth/change-password', {
                    new_password: data.senha
                });
            }

            // Update local user state
            const updatedUser = { ...user, ...response.data };
            // Ideally update context/localStorage here

            toast.success('Perfil atualizado com sucesso');

            // Clear password fields
            setValue('senha', '');
            setValue('senha_atual', '');

        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.error || 'Erro ao atualizar perfil';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-white sm:text-3xl sm:truncate">
                        Meu Perfil
                    </h2>
                </div>
            </div>

            <div className="glass-panel overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        <div className="bg-gray-800/50 p-4 rounded-md mb-6 border border-gray-700">
                            <h3 className="text-lg font-medium leading-6 text-white flex items-center mb-4">
                                <User className="h-5 w-5 mr-2 text-primary-400" />
                                Informações Pessoais
                            </h3>

                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                <div className="sm:col-span-3">
                                    <label className="block text-sm font-medium text-gray-300">Nome</label>
                                    <input
                                        type="text"
                                        {...register('nome', { required: 'Nome é obrigatório' })}
                                        className="glass-input mt-1 block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm"
                                    />
                                    {errors.nome && <span className="text-red-400 text-xs">{errors.nome.message}</span>}
                                </div>

                                <div className="sm:col-span-3">
                                    <label className="block text-sm font-medium text-gray-300">Email</label>
                                    <input
                                        type="email"
                                        {...register('email', { required: 'Email é obrigatório' })}
                                        className="glass-input mt-1 block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm"
                                    />
                                    {errors.email && <span className="text-red-400 text-xs">{errors.email.message}</span>}
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-800/50 p-4 rounded-md border border-gray-700">
                            <h3 className="text-lg font-medium leading-6 text-white flex items-center mb-4">
                                <Lock className="h-5 w-5 mr-2 text-primary-400" />
                                Alterar Senha
                            </h3>

                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                <div className="sm:col-span-3">
                                    <label className="block text-sm font-medium text-gray-300">Senha Atual</label>
                                    <input
                                        type="password"
                                        {...register('senha_atual')}
                                        className="glass-input mt-1 block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm"
                                        placeholder="Necessário para alterar senha"
                                    />
                                </div>

                                <div className="sm:col-span-3">
                                    <label className="block text-sm font-medium text-gray-300">Nova Senha</label>
                                    <input
                                        type="password"
                                        {...register('senha', { minLength: { value: 6, message: 'Mínimo de 6 caracteres' } })}
                                        className="glass-input mt-1 block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm"
                                        placeholder="Deixe em branco para manter"
                                    />
                                    {errors.senha && <span className="text-red-400 text-xs">{errors.senha.message}</span>}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Salvar Alterações
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
