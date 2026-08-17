
import { Route, Routes } from 'react-router-dom';
import Layout from '@/components/global/layout.jsx';
import { appRoutes } from './routes';



export default function AppRoutes() {
    return (
        <Routes>

            {appRoutes.map((route, index) => {
                const basePath = `/${group.role}`;
                const isIndex = route.path === basePath || route.path === `${basePath}/`;
                return (
                    <Route
                        key={index}
                        {...(isIndex ? { index: true } : { path: getRelativePath(route.path, basePath) })}
                        element={
                            <ProtectedRoute allowedRoles={[group.role]}>
                                {route.element}
                            </ProtectedRoute>
                        }
                    />
                );
            })}

        </Routes>
    );
}