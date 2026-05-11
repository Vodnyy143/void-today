import {useState} from "react";
import LoginForm from "../../widgets/LoginForm";
import RegisterForm from "../../widgets/RegisterForm";
import * as React from "react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

type AuthMode = 'login' | 'register';

const AuthModal = ({isOpen, onClose}: Props) => {
    const [mode, setMode] = useState<AuthMode>('login');

    if(!isOpen) return null;

    const handleOverClick = (e: React.MouseEvent) => {
        if(e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className='modal-overlay' onClick={handleOverClick}>
            <div className='modal auth-modal'>
                <button className='modal__close' onClick={onClose}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                </button>

                <div className='auth-modal__header'>
                    <h2 className='auth-modal__title'>
                        {mode === 'login' ? 'Вход в систему' : 'Регистрация'}
                    </h2>
                    <p className='auth-modal__subtitle'>
                        {mode === 'login'
                            ? 'Введите свои данные для входа'
                            : 'Создайте аккаунт для начала работы'}
                    </p>
                </div>

                {mode === 'login' ? (
                    <LoginForm />
                ) : (
                    <RegisterForm/>
                )}

                <div className='auth-modal__footer'>
                    {mode === 'login' ? (
                        <p className='auth-modal__switch'>
                            Нет аккаунта?{' '}
                            <button
                                className='auth-modal__link'
                                onClick={() => setMode('register')}
                            >
                                Зарегистироваться
                            </button>
                        </p>
                    ) : (
                        <p className='auth-modal__switch'>
                            Уже есть аккаунт?{' '}
                            <button
                                className='auth-modal__link'
                                onClick={() => setMode('login')}
                            >
                                Войти
                            </button>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;