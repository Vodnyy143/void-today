import  {type InputHTMLAttributes} from 'react';

const Input = (props: InputHTMLAttributes<HTMLInputElement>) => {
    return (
        <input className={'input'} {...props}/>
    );
};

export default Input;