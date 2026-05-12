import type {ReactNode} from "react";
import Header from "../modules/Header.tsx";
import Sidebar from "../modules/Sidebar.tsx";
import {useAppSelector} from "../../store/hooks.ts";

interface Props {
    children: ReactNode;
}

const MainLayout = ({children}: Props) => {
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    return (
        <div className='layout'>
            <Header/>

            <div className='layout__container'>
                {isAuthenticated && <Sidebar />}

                <main className='layout__main'>
                    {children}
                </main>

            </div>
        </div>
    );
};

export default MainLayout;