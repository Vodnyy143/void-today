import {useNavigate} from "react-router-dom";
import {useState} from "react";

import Input from "../elements/Input.tsx";
import Button from "../elements/Button.tsx";
import {clearError, signUp} from "../../store/slices/authSlice.ts";
import {useAppDispatch, useAppSelector} from "../../store/hooks.ts";


interface Props {
    onSuccess?: () => void;
}

const RegisterForm = ({ onSuccess }: Props) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { isLoading, error: reduxError } = useAppSelector((state) => state.auth);


    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [localError, setLocalError] = useState('');

    const error = localError || reduxError;


    const handleRegister = async () => {
        setLocalError('');
        dispatch(clearError());

        if (!name || !email || !password ) {
            setLocalError('Заполните все поля');
            return;
        }

        if (password.length < 6) {
            setLocalError('Пароль должен быть не менее 6 символов');
            return;
        }

        const result = await dispatch(signUp({ name, email, password }));

        if (signUp.fulfilled.match(result)) {
            onSuccess?.();
            navigate('/todos');
        }
    };

    const handleChange = () => {
        if (error) {
            setLocalError('');
            dispatch(clearError());
        }
    };

    return (
        <div className='register-form'>
            <div className='register-form__inputs'>
                <Input
                    type='text'
                    placeholder='Имя'
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        handleChange();
                    }}
                    disabled={isLoading}
                />

                <Input
                    type='email'
                    placeholder='Почта'
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        handleChange();
                    }}
                    disabled={isLoading}
                />

                <Input
                    type='password'
                    placeholder='Пароль'
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        handleChange();
                    }}
                    disabled={isLoading}
                />
            </div>

            {error && (<div className='register-form__error'>{error}</div>)}

            <Button onClick={handleRegister} disabled={isLoading}>
                {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
            </Button>
        </div>
    );
};

export default RegisterForm;