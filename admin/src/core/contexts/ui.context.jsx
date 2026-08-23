import { useContext, createContext, useState, useCallback, useRef } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { uiRef } from '@/core/bridge/ui.ref';

const UIContext = createContext();

export const useUI = () => {
    const ctx = useContext(UIContext);

    if (!ctx) {
        if (import.meta.env.DEV) {
            console.warn('[useUI] context missing — HMR boundary, ignoring');

            return {
                setCommandOpen: () => {},
                sidebarOpen: false,
                setSidebarOpen: () => {},
                commandOpen: false,
                commands: [],
                openModal: () => {},
                closeModal: () => {},
                closeModalById: () => {},
                clearModals: () => {},
            };
        }

        throw new Error('useUI must be used inside <UIProvider>');
    }

    return ctx;
};

export const UIProvider = ({ children }) => {
    const [commandOpen, setCommandOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [modalStack, setModalStack] = useState([]);

    const idCounter = useRef(0);

    const openModal = useCallback((type, props = {}) => {
        let component;

        if (typeof type === 'function') {
            component = type;
        } else if (typeof type === 'object' && type?.component) {
            component = type.component;
        } else {
            toast.error('Invalid modal type: expected a component.');
            return;
        }

        const id = ++idCounter.current;

        setModalStack((prev) => [
            ...prev,
            {
                id,
                component,
                props,
            },
        ]);

        return id;
    }, []);

    const closeModalById = useCallback((id) => {
        setModalStack((prev) => {
            const target = prev.find((modal) => modal.id === id);

            if (target?.props?.onClose) {
                target.props.onClose();
            }

            return prev.filter((modal) => modal.id !== id);
        });
    }, []);

    const closeModal = useCallback(() => {
        setModalStack((prev) => {
            if (!prev.length) return prev;

            const top = prev[prev.length - 1];

            if (top.props?.onClose) {
                top.props.onClose();
            }

            return prev.slice(0, -1);
        });
    }, []);

    const clearModals = useCallback(() => {
        setModalStack((prev) => {
            prev.forEach((modal) => {
                if (modal.props?.onClose) {
                    modal.props.onClose();
                }
            });

            return [];
        });
    }, []);

    // Expose modal controls outside React when needed
    uiRef.clearModals = clearModals;

    const ModalStackRenderer = () => {
        return modalStack.map((modal) => {
            const ModalContent = modal.component;

            const safeProps =
                modal.props && typeof modal.props === 'object'
                    ? modal.props
                    : {};

            // Fullscreen modal
            if (ModalContent.fullscreen) {
                return (
                    <ModalContent
                        key={modal.id}
                        {...safeProps}
                        closeModal={() => closeModalById(modal.id)}
                    />
                );
            }

            // Regular dialog modal
            return (
                <Dialog
                    key={modal.id}
                    open
                    onOpenChange={(open) => {
                        if (!open) {
                            closeModalById(modal.id);
                        }
                    }}
                >
                    <ScrollArea>
                        <ModalContent
                            {...safeProps}
                            closeModal={() => closeModalById(modal.id)}
                        />
                    </ScrollArea>
                </Dialog>
            );
        });
    };

    const value = {
        // Command menu
        commandOpen,
        setCommandOpen,

        // Sidebar
        sidebarOpen,
        setSidebarOpen,

        // Commands
        commands: [],

        // Modals
        openModal,
        closeModal,
        closeModalById,
        clearModals,

        // Optional state access
        modalStack,
    };

    return (
        <UIContext.Provider value={value}>
            {children}

            <ModalStackRenderer />
        </UIContext.Provider>
    );
};