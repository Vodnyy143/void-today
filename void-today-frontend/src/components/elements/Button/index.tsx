import type {ButtonHTMLAttributes, ReactNode} from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
}

const Button = ({children, ...props}: Props) => {
    return (
        <button className={'button'} {...props}>
            {children}
        </button>
    );
};

export default Button;