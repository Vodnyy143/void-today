import {useNavigate} from "react-router-dom";
import {useState} from "react";

import {api} from "../../services/api.ts";
import Input from "../elements/Input.tsx";
import Button from "../elements/Button.tsx";

const LoginForm = () => {
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const login = async () => {
        try {
            await api.post('/auth/login', { email, password })
        } catch {
            console.log('fake backend 🌌')
        }

        navigate('/todos')
    }

    return (
        <div className={'login-form'}>
            <div className='login-form__inputs'>

                <Input
                    type='email'
                    placeholder='Email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <Input
                    type='password'
                    placeholder='Password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            {error && (<div className='login-form__error'>{error}</div>)}

            <Button
                onClick={login}
            >
                Войти
            </Button>

            <a href="#" className='login-form__forgot'>
                Забыли пароль?
            </a>
        </div>
    );
};

export default LoginForm;
