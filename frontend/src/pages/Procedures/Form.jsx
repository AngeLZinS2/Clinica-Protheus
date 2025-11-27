import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export default function ProcedureForm({ procedure, onSuccess, onCancel }) {
    const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            nome: '',
            valor_plano: '',
            valor_particular: ''
        }
    });

    useEffect(() => {
        if (procedure) {
            setValue('nome', procedure.nome);
            setValue('valor_plano', procedure.valor_plano);
            setValue('valor_particular', procedure.valor_particular);
        }
    }, [procedure, setValue]);

    const onSubmit = async (data) => {
        try {
            data.valor_plano = parseFloat(data.valor_plano);
            data.valor_particular = parseFloat(data.valor_particular);

            if (procedure) {
                await api.put(`/procedures/${procedure.id}`, data);
                toast.success('Procedimento atualizado com sucesso');
            } else {
                await api.post('/procedures', data);
                toast.success('Procedimento criado com sucesso');
            }
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error('Erro ao salvar procedimento. Verifique os dados.');
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valor Particular (R$)</label>
                    <input
                        type="number"
                        step="0.01"
                        {...register('valor_particular', { required: 'Valor particular é obrigatório', min: { value: 0, message: 'Valor deve ser positivo' } })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    />
                    {errors.valor_particular && <span className="text-red-500 text-xs">{errors.valor_particular.message}</span>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valor Plano (R$)</label>
                    <input
                        type="number"
                        step="0.01"
                        {...register('valor_plano', { required: 'Valor plano é obrigatório', min: { value: 0, message: 'Valor deve ser positivo' } })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    />
                    {errors.valor_plano && <span className="text-red-500 text-xs">{errors.valor_plano.message}</span>}
                </div>
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
