import { Github, Linkedin } from 'lucide-react';

const socialLinks = [
    { label: 'GitHub', href: 'https://github.com/AngeLZinS2', Icon: Github },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/angelo-neri-3921a72b9/', Icon: Linkedin },
];

export default function Footer({ className = '', highContrast = false }) {
    const footerColors = highContrast
        ? 'border-slate-400 bg-white/80 text-slate-900'
        : 'border-slate-300 text-slate-700 dark:border-gray-700 dark:text-gray-300';
    const linkColors = highContrast
        ? 'text-slate-950 hover:bg-slate-100 hover:text-sky-950'
        : 'text-slate-800 hover:bg-sky-50 hover:text-sky-900 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-sky-300';

    return (
        <footer className={`flex flex-col items-center justify-between gap-3 border-t px-4 py-5 text-sm font-semibold sm:flex-row ${footerColors} ${className}`}>
            <p>© {new Date().getFullYear()} Angelo Neri</p>
            <nav aria-label="Redes profissionais" className="flex items-center gap-2">
                {socialLinks.map(({ label, href, Icon }) => (
                    <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label={`Abrir ${label} de Angelo Neri em uma nova aba`}
                        className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 ${linkColors}`}
                    >
                        <Icon size={17} aria-hidden="true" />
                        {label}
                    </a>
                ))}
            </nav>
        </footer>
    );
}
