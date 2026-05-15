import {Route, Routes} from "react-router-dom";

import MainLayout from "../components/templates/MainLayout";
import HomePage from "../pages/HomePage.tsx";
import PublicRoute from "../components/templates/PublicRoute.tsx";
import ProtectedRoute from "../components/templates/ProtectedRoute.tsx";
import TodosPage from "../pages/TodosPage";
import EventsPage from "../pages/EventsPage.tsx";
import OrganizationsPage from "../pages/OrganizationsPage.tsx";
import OrganizationDetailPage from "../pages/OrganizationDetailPage.tsx";
import KanbanPage from "../pages/KanbanPage.tsx";
import SprintsPage from "../pages/SprintsPage.tsx";

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

                <Route
                    path="/events"
                    element={
                        <ProtectedRoute>
                            <EventsPage/>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/organizations"
                    element={
                        <ProtectedRoute>
                            <OrganizationsPage/>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/organizations/:id"
                    element={
                        <ProtectedRoute>
                            <OrganizationDetailPage/>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/kanban"
                    element={
                        <ProtectedRoute>
                            <KanbanPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/sprints"
                    element={
                        <ProtectedRoute>
                            <SprintsPage />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </MainLayout>
    );
};

export default AppRoutes;