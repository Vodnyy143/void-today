import type {ReactNode} from "react";
import {useEffect, useState} from "react";
import Header from "../modules/Header.tsx";
import Sidebar from "../modules/Sidebar.tsx";
import {useAppSelector} from "../../store/hooks.ts";
import TaskDetailSidebar from "../modules/TaskDetailSidebar.tsx";

interface Props {
    children: ReactNode;
}

const MainLayout = ({children}: Props) => {
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    // Состояние для мобильного сайдбара
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    // Отслеживаем изменение размера окна
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            // Закрываем сайдбар если перешли на десктоп
            if (!mobile) {
                setIsSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Закрываем сайдбар при нажатии Escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isSidebarOpen && isMobile) {
                setIsSidebarOpen(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isSidebarOpen, isMobile]);

    return (
        <div className='layout'>
            <Header
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                isSidebarOpen={isSidebarOpen}
            />

            {/* Overlay для закрытия сайдбара на мобильном */}
            {isMobile && isSidebarOpen && (
                <div
                    className='layout__overlay'
                    onClick={() => setIsSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            <div className='layout__container'>
                {isAuthenticated && (
                    <Sidebar
                        isOpen={isMobile ? isSidebarOpen : true}
                        onClose={() => setIsSidebarOpen(false)}
                    />
                )}

                <main className='layout__main'>
                    {children}
                </main>

                {isAuthenticated && <TaskDetailSidebar />}
            </div>
        </div>
    );
};

export default MainLayout;