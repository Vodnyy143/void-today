import {Route, Routes} from "react-router-dom";
import TodosPage from "../pages/TodosPage";

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/todos" element={<TodosPage/>} />
        </Routes>
    );
};

export default AppRoutes;