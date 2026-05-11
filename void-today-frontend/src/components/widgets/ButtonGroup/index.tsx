import Button from "../../elements/Button";

const ButtonGroup = () => {
    return (
        <div className={'button-group'}>
            <Button>Home</Button>
            <Button>Todos</Button>
            <Button>Profile</Button>
        </div>
    );
};

export default ButtonGroup;