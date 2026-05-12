import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import type {ReactNode} from "react";

interface Props {
    children: ReactNode;
}

const PublicRoute = ({ children }: Props) => {
    const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (isAuthenticated) {
        return <Navigate to="/todos" replace />;
    }

    return <>{children}</>;
};

export default PublicRoute;