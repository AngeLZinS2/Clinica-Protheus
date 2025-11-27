import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export default function UserForm({ user, onSuccess, onCancel }) {
    const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            nome: '',
            email: '',
            senha: '',
            tipo: 'default'
        }
    });

    useEffect(() => {
        if (user) {
            setValue('nome', user.nome);
            setValue('email', user.email);
            setValue('tipo', user.tipo);
        }
    }, [user, setValue]);

    const onSubmit = async (data) => {
        try {
            if (user) {
                // If editing, don't send password if empty (or backend handles it)
                // Actually backend might expect password or not.
                // The API docs say PUT /users/<id> updates user.
                // Usually we don't update password here unless specific endpoint or logic.
                // Let's assume we can update other fields.
                delete data.senha; // Don't update password here
                await api.put(`/users/${user.id}`, data);
                toast.success('Usuário atualizado com sucesso');
            } else {
                await api.post('/users', data);
                toast.success('Usuário criado com sucesso');
            }
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error('Erro ao salvar usuário. Verifique os dados.');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome</label>
                <input
                    type="text"
                    {...register('nome', { required: 'Nome é obrigatório' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                />
                {errors.nome && <span className="text-red-500 text-xs">{errors.nome.message}</span>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input
                    type="email"
                    {...register('email', { required: 'Email é obrigatório' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                />
                {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
            </div>

            {!user && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Senha</label>
                    <input
                        type="password"
                        {...register('senha', { required: 'Senha é obrigatória' })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    />
                    {errors.senha && <span className="text-red-500 text-xs">{errors.senha.message}</span>}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo</label>
                <select
                    {...register('tipo', { required: 'Tipo é obrigatório' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                    <option value="default">Padrão</option>
                    <option value="admin">Administrador</option>
                </select>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70"
                >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
                </button>
            </div>
        </form>
    );
}
