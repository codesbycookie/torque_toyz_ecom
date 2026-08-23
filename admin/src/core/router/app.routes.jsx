import { Route, Routes } from 'react-router-dom';
import Layout from '@/components/global/layout.jsx';
import { appRoutes } from './routes';

export default function AppRoutes() {
    return (
        <Routes>
            <Route element={<Layout />}>
                {appRoutes.map((route, index) => (
                    <Route
                        key={route.path || index}
                        path={route.path}
                        element={route.element}
                    />
                ))}
            </Route>
        </Routes>
    );
}