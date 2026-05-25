import {useState} from "react";
import * as React from "react";
import LoginForm from "../widgets/LoginForm";
import RegisterForm from "../widgets/RegisterForm";
import {useTranslation} from "../../i18n/useTranslation.ts";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

type AuthMode = 'login' | 'register';

const AuthModal = ({isOpen, onClose}: Props) => {
    const [mode, setMode] = useState<AuthMode>('login');
    const { t } = useTranslation();

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

                {mode === 'login' ? (
                    <LoginForm onSuccess={onClose} />
                ) : (
                    <RegisterForm onSuccess={onClose} />
                )}

                <div className='auth-modal__footer'>
                    {mode === 'login' ? (
                        <p className='auth-modal__switch'>
                            <button
                                className='auth-modal__link'
                                onClick={() => setMode('register')}
                            >
                                {t('auth.register')}
                            </button>
                        </p>
                    ) : (
                        <p className='auth-modal__switch'>
                            <button
                                className='auth-modal__link'
                                onClick={() => setMode('login')}
                            >
                                {t('auth.login')}
                            </button>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
