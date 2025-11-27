import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { motion } from 'framer-motion';
import { LogIn, Loader2, Stethoscope } from 'lucide-react';
import toast from 'react-hot-toast';
import DNAHelix from '../components/3D/DNAHelix';
import ChangePasswordModal from '../components/ChangePasswordModal';

const Typewriter = ({ text }) => {
    const [displayText, setDisplayText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);
    const [typingSpeed, setTypingSpeed] = useState(150);

    useEffect(() => {
        const handleTyping = () => {
            const i = loopNum % 1;
            const fullText = text;

            setDisplayText(isDeleting
                ? fullText.substring(0, displayText.length - 1)
                : fullText.substring(0, displayText.length + 1)
            );

            setTypingSpeed(isDeleting ? 30 : 150);

            if (!isDeleting && displayText === fullText) {
                setTimeout(() => setIsDeleting(true), 2000);
            } else if (isDeleting && displayText === '') {
                setIsDeleting(false);
                setLoopNum(loopNum + 1);
            }
        };

        const timer = setTimeout(handleTyping, typingSpeed);
        return () => clearTimeout(timer);
    }, [displayText, isDeleting, loopNum, typingSpeed, text]);

    return (
        <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-primary-100 to-secondary-200 bg-clip-text text-transparent animate-pulse">
            {displayText}
            <span className="border-r-4 border-white ml-1 animate-blink"></span>
        </h1>
    );
};

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const success = await login(email, password);
            if (success) {
                const storedUser = JSON.parse(localStorage.getItem('user'));
                if (storedUser?.first_access) {
                    setShowChangePassword(true);
                } else {
                    navigate('/');
                }
            }
        } catch (error) {
            toast.error('Falha no login. Verifique suas credenciais.');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChanged = () => {
        setShowChangePassword(false);
        const updatedUser = { ...JSON.parse(localStorage.getItem('user')), first_access: false };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.location.reload();
    };

    return (
        <div className="min-h-screen flex overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
            <ChangePasswordModal
                isOpen={showChangePassword}
                onClose={() => { }}
                onSuccess={handlePasswordChanged}
            />

            {/* Left Side - 3D Scene */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary-600 to-secondary-500 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-start pt-20 text-white z-10 pointer-events-none">
                    <div className="text-center">
                        <div className="h-20 flex items-center justify-center mb-4">
                            <Typewriter text="Clínica Protheus" />
                        </div>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.5, duration: 1 }}
                            className="text-xl text-white/80"
                        >
                            Gestão Inteligente e Moderna
                        </motion.p>
                    </div>
                </div>

                <div className="absolute inset-0 z-0">
                    <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
                        <ambientLight intensity={0.5} />
                        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
                        <pointLight position={[-10, -10, -10]} intensity={0.5} />
                        <DNAHelix position={[0, -1.5, 0]} scale={0.8} />
                        <Environment preset="city" />
                        <ContactShadows position={[0, -4, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />
                        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
                    </Canvas>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 relative">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] rounded-full bg-primary-200/30 blur-3xl"></div>
                    <div className="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-secondary-200/30 blur-3xl"></div>
                </div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md space-y-8 glass-panel p-8 rounded-2xl relative z-10"
                >
                    <div className="text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                            className="mx-auto h-16 w-16 bg-gradient-to-tr from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg mb-4"
                        >
                            <Stethoscope className="h-8 w-8 text-white" />
                        </motion.div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Bem-vindo de volta</h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Acesse sua conta para gerenciar a clínica
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 ml-1 mb-1">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="glass-input block w-full px-4 py-3 rounded-lg border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:text-sm"
                                    placeholder="seu@email.com"
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 ml-1 mb-1">
                                    Senha
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="glass-input block w-full px-4 py-3 rounded-lg border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                            <LogIn className="h-5 w-5 text-primary-200 group-hover:text-white transition-colors" aria-hidden="true" />
                                        </span>
                                        Entrar
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
