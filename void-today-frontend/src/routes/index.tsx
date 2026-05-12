import {Route, Routes} from "react-router-dom";

import MainLayout from "../components/templates/MainLayout";
import HomePage from "../pages/HomePage.tsx";
import PublicRoute from "../components/templates/PublicRoute.tsx";
import ProtectedRoute from "../components/templates/ProtectedRoute.tsx";
import TodosPage from "../pages/TodosPage";

const AppRoutes = () => {
    return (
        <MainLayout>
            <Routes>
                <Route
                    path="/"
                    element={
                        <PublicRoute>
                            <HomePage/>
                        </PublicRoute>
                    }
                />

                <Route
                    path="/todos"
                    element={
                        <ProtectedRoute>
                            <TodosPage/>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </MainLayout>
    );
};

export default AppRoutes;