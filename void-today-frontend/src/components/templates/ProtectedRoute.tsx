import {useAppSelector} from "../../store/hooks.ts";
import {Navigate} from "react-router-dom";
import type {ReactNode} from "react";

interface Props {
    children: ReactNode;
}

const ProtectedRoute = ({ children }: Props) => {
    const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;