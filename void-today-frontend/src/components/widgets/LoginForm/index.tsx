import Input from "../../elements/Input";
import {useNavigate} from "react-router-dom";
import {useState} from "react";
import {api} from "../../../services/api.ts";
import Button from "../../elements/Button";

const LoginForm = () => {
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
        <div className={'login-form'}>
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
                Login
            </Button>
        </div>
    );
};

export default LoginForm;