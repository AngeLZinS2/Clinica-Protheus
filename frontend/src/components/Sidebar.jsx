import { useAuth } from '../context/AuthContext';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import {
    LayoutDashboard,
    Users,
    Calendar,
    Stethoscope,
    UserCog,
    LogOut,
    UserCircle,
    X,
    FileText
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
    const { user, logout } = useAuth();
    const location = useLocation();

    const navigation = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    ];

    if (user?.role !== 'patient') {
        navigation.push(
            { name: 'Pacientes', href: '/patients', icon: Users },
            { name: 'Atendimentos', href: '/appointments', icon: Calendar },
            { name: 'Procedimentos', href: '/procedures', icon: Stethoscope }
        );
    } else {
        navigation.push(
            { name: 'Minhas Consultas', href: '/appointments', icon: Calendar }
        );
    }

    if (user?.tipo === 'admin') {
        navigation.push({ name: 'Usuários', href: '/users', icon: UserCog });
        navigation.push({ name: 'Auditoria', href: '/audit', icon: FileText });
    }

    navigation.push({ name: 'Meu Perfil', href: '/profile', icon: UserCircle });


    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            <motion.div
                className={clsx(
                    "fixed inset-y-0 left-0 z-30 w-64 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-r border-white/20 dark:border-gray-800 shadow-xl transition-transform duration-300 md:translate-x-0 md:static md:inset-auto",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
                        Clínica Médica
                    </span>
                    <button
                        onClick={onClose}
                        className="md:hidden p-1 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto py-4">
                    <nav className="px-3 space-y-1">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className="relative group block"
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-primary-50 dark:bg-primary-900/20 rounded-xl"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                    <div className={clsx(
                                        isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200',
                                        'relative flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-colors z-10'
                                    )}>
                                        <item.icon
                                            className={clsx(
                                                isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-primary-500 dark:group-hover:text-primary-400',
                                                'mr-3 flex-shrink-0 h-5 w-5 transition-colors'
                                            )}
                                            aria-hidden="true"
                                        />
                                        {item.name}
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                <div className="flex-shrink-0 flex border-t border-gray-100 dark:border-gray-800 p-4 bg-gray-50/50 dark:bg-gray-900/50">
                    <div className="flex-shrink-0 w-full group block">
                        <div className="flex items-center">
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{user?.nome}</p>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                                    {user?.email}
                                </p>
                            </div>
                            <div className="ml-auto flex items-center space-x-2">

                                <button
                                    onClick={logout}
                                    className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 shadow-sm transition-all duration-200"
                                >
                                    <LogOut className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </>
    );
}
