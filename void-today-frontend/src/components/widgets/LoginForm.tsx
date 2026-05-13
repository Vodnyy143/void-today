import {useState} from "react";

import Input from "../elements/Input.tsx";
import Button from "../elements/Button.tsx";
import {useAppDispatch, useAppSelector} from "../../store/hooks.ts";
import {clearError, signIn} from "../../store/slices/authSlice.ts";
import {useNavigate} from "react-router-dom";

interface Props {
    onSuccess?: () => void;
}

const LoginForm = ({ onSuccess }: Props) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { isLoading, error } = useAppSelector((state) => state.auth);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        if (!email || !password) {
            return;
        }

        const result = await dispatch(signIn({ email, password }));

        if (signIn.fulfilled.match(result)) {
            onSuccess?.();
            navigate('/todos');
        }
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        if (error) dispatch(clearError());
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        if (error) dispatch(clearError());
    };

    return (
        <div className={'login-form'}>
            <div className='login-form__inputs'>

                <Input
                    type='email'
                    placeholder='Email'
                    value={email}
                    onChange={handleEmailChange}
                />

                <Input
                    type='password'
                    placeholder='Password'
                    value={password}
                    onChange={handlePasswordChange}
                />
            </div>

            {error && (<div className='login-form__error'>{error}</div>)}

            <Button onClick={handleLogin} disabled={isLoading}>
                {isLoading ? 'Вход...' : 'Войти'}
            </Button>

            <a href="#" className='login-form__forgot'>
                Забыли пароль?
            </a>
        </div>
    );
};

export default LoginForm;
