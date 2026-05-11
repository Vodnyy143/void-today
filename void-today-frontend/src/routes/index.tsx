import {Route, Routes} from "react-router-dom";

import TodosPage from "../pages/TodosPage";
import HomePage from "../pages/HomePage";
import MainLayout from "../components/templates/MainLayout";

const AppRoutes = () => {
    return (
        <MainLayout>
            <Routes>
                <Route path="/" element={<HomePage/>} />
                <Route path="/todos" element={<TodosPage/>} />
            </Routes>
        </MainLayout>
    );
};

export default AppRoutes;