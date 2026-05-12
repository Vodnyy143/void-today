import {useState} from "react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { name: string; color: string }) => void;
}


const COLORS = [
    '#9ca3af', // Gray
    '#3b82f6', // Blue
    '#06b6d4', // Cyan
    '#f59e0b', // Amber
    '#ec4899', // Pink
    '#ef4444', // Red
    '#eab308', // Yellow
    '#22c55e', // Green
    '#f97316', // Orange
    '#a855f7', // Purple
    '#0ea5e9', // Sky
    '#14b8a6', // Teal
    '#8b5cf6', // Violet
    '#6366f1', // Indigo
    '#d946ef', // Fuchsia
    '#f43f5e', // Rose
    '#64748b', // Slate
    '#78716c', // Stone
    '#2dd4bf', // Teal Light
];

const CreateProjectModal = ({ isOpen, onClose, onSubmit }: Props) => {
    const [name, setName] = useState('');
    const [selectedColor, setSelectedColor] = useState('#3b82f6');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    const handleClose = () => {
        setName('');
        setSelectedColor('#3b82f6');
        setError('');
        onClose();
    };

    const handleSubmit = () => {
        if (!name.trim()) {
            setError('Project name is required');
            return;
        }

        onSubmit({
            name: name.trim(),
            color: selectedColor,
        });

        handleClose();
    };


    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className='modal-overlay' onClick={handleOverlayClick}>
            <div className='modal create-project-modal'>
                <h2 className='create-project-modal__title'>Add Project</h2>

                <div className='create-project-modal__content'>
                    <input
                        type='text'
                        className='create-project-modal__input'
                        placeholder='New project name'
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            if (error) setError('');
                        }}
                        onKeyDown={handleKeyDown}
                        autoFocus
                    />

                    {error && (
                        <p className='create-project-modal__error'>{error}</p>
                    )}

                    <div className='create-project-modal__colors'>
                        {COLORS.map((color) => (
                            <button
                                key={color}
                                className={`create-project-modal__color ${
                                    selectedColor === color ? 'create-project-modal__color--active' : ''
                                }`}
                                style={{ backgroundColor: color }}
                                onClick={() => setSelectedColor(color)}
                                type='button'
                            />
                        ))}
                    </div>
                </div>

                <div className='create-project-modal__actions'>
                    <button
                        className='create-project-modal__btn create-project-modal__btn--cancel'
                        onClick={handleClose}
                    >
                        Cancel
                    </button>
                    <button
                        className='create-project-modal__btn create-project-modal__btn--submit'
                        onClick={handleSubmit}
                        disabled={!name.trim()}
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateProjectModal;