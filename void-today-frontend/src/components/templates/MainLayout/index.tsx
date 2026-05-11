import type {ReactNode} from "react";
import Header from "../../modules/Header";

interface Props {
    children: ReactNode;
}

const MainLayout = ({children}: Props) => {
    return (
        <div className={'layout'}>
            <Header/>

            <main>
                {children}
            </main>
        </div>
    );
};

export default MainLayout;