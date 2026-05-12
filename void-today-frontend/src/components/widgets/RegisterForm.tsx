import {useNavigate} from "react-router-dom";
import {useState} from "react";

import {api} from "../../services/api.ts";
import Input from "../elements/Input.tsx";
import Button from "../elements/Button.tsx";

const RegisterForm = () => {
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const login = async () => {
        try {
            await api.post('/auth/login', { email, password })
        } catch {
            console.log('fake backend 🌌')
        }

        navigate('/todos')
    }

    return (
        <div className={'register-form'}>
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

            <Button onClick={login}>
                Зарегистрироваться
            </Button>
        </div>
    );
};

export default RegisterForm;