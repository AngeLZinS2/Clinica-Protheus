import { X } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
    const dialogRef = useRef(null);
    const titleId = useId();

    useEffect(() => {
        const dialog = dialogRef.current;
        if (isOpen && !dialog.open) dialog.showModal();
        if (!isOpen && dialog.open) dialog.close();
        return () => { if (dialog.open) dialog.close(); };
    }, [isOpen]);

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby={titleId}
            onCancel={(event) => { event.preventDefault(); onClose(); }}
            onClick={(event) => {
                if (event.target !== event.currentTarget) return;
                const bounds = event.currentTarget.getBoundingClientRect();
                if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
            }}
            className="m-auto w-[calc(100%_-_2rem)] max-w-lg max-h-[calc(100dvh_-_2rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/50 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        >
            {isOpen && <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                    <h2 className="text-lg font-semibold" id={titleId}>{title}</h2>
                    <button type="button" onClick={onClose} aria-label="Fechar janela" className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white">
                        <X className="h-5 w-5" aria-hidden="true" />
                    </button>
                </div>
                <div className="mt-4">{children}</div>
            </div>}
        </dialog>
    );
}
