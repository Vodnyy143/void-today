import Button from "../../elements/Button";
import LoginForm from "../../widgets/LoginForm";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const LoginModal = ({isOpen, onClose}: Props) => {
    if(!isOpen) return null;

    return (
        <div className={'modal-overlay'}>
            <div className={'modal'}>
                <LoginForm/>

                <div className={'modal-actions'}>
                    <Button onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;