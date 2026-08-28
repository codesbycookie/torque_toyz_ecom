'use client';

import { useEffect } from 'react';
import {
    Sidebar,
    SidebarBody,
    SidebarLink,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { CommandMenu } from './globalcommand';
import { LogOut, Search } from 'lucide-react';
import { useUI } from '@/core/contexts/ui.context';
import { useAuth } from '@/core/contexts/auth.context';
import { camelToTitle } from '@/core/utils/helper.utils';
import { appRoutes } from '@/core/router/routes';

export default function Layout() {
    const { logout } = useAuth();
    const {
        setCommandOpen,
        sidebarOpen,
        setSidebarOpen,
        commandOpen,
        commands,
    } = useUI();

    const location = useLocation();

    /*
     * Use routes directly from your route configuration.
     * No auth / role required.
     */
    const routes = appRoutes;

    const currentRoute =
        routes.find((route) => route.path === location.pathname) || null;

    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname, setSidebarOpen]);

    return (
        <div
            className={cn(
                'mx-auto flex w-full flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-gray-100 md:flex-row dark:border-neutral-700 dark:bg-neutral-800 h-[100vh]'
            )}
        >
            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
                <SidebarBody className="justify-between gap-10">
                    <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto scrollbar-none">

                        {/* Logo */}
                        {sidebarOpen ? <Logo /> : <LogoIcon />}

                        {/* Navigation */}
                        <div className="mt-8 flex flex-col gap-2">
                            {routes.map((route) => (
                                <SidebarLink
                                    key={route.path}
                                    link={{
                                        label: route.title || camelToTitle(
                                            route.path
                                                ?.replace(/^\/+/, '')
                                                .split('/')
                                                .pop() || ''
                                        ),
                                        path: route.path,
                                        icon: route.icon,
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={logout}
                        className="flex items-center justify-start gap-2 py-2 text-sm text-neutral-700 transition duration-150 hover:text-destructive dark:text-neutral-200"
                        aria-label="Logout"
                    >
                        <LogOut className="h-5 w-5 shrink-0" />
                        <span
                            className={cn(
                                'whitespace-pre transition duration-150',
                                sidebarOpen ? 'opacity-100' : 'hidden',
                            )}
                        >
                            Logout
                        </span>
                    </button>
                </SidebarBody>
            </Sidebar>

            {/* Command Menu */}
            <CommandMenu
                open={commandOpen}
                setOpen={setCommandOpen}
                commands={
                    commands?.length > 0
                        ? commands
                        : routes
                }
            />

            {/* Main Content */}
            <div
                className={
                    currentRoute?.title
                        ? 'relative w-full min-h-screen md:p-6 p-4 bg-gray-50 dark:bg-gray-900 overflow-auto scrollbar-none'
                        : 'relative w-full bg-gray-50 dark:bg-gray-900 overflow-auto scrollbar-none'
                }
            >
                {/* Page Header */}
                {currentRoute?.title && (
                    <div className="flex justify-between items-center md:m-[20px] mb-[40px]">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                {currentRoute.title}
                            </h1>

                            {currentRoute.description && (
                                <p className="text-gray-600 dark:text-gray-400 mt-2">
                                    {currentRoute.description}
                                </p>
                            )}
                        </div>

                        <button
                            onClick={() =>
                                setCommandOpen((prev) => !prev)
                            }
                            className="hidden lg:flex p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition"
                            aria-label="Open command menu"
                        >
                            <Search className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Page */}
                <div className="m-1 md:m-10 overflow-auto">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

export const Logo = () => (
    <SidebarLink
        link={{
            label: 'Menu',
            path: '#',
            icon: (
                <img
                    src="/logo.png"
                    className="h-10 w-10 me-3 transition-all shrink-0 rounded-full object-cover"
                    width={15}
                    height={15}
                    alt="Logo"
                />
            ),
        }}
    />
);

export const LogoIcon = () => (
    <Link
        to="#"
        className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
        <img
            src="/logo.png"
            className="h-6 w-6 shrink-0 rounded-full object-cover"
            width={6}
            height={6}
            alt="Logo"
        />
    </Link>
);