import {type FormEvent, useState} from "react";
import {useAppDispatch} from "../../store/hooks.ts";
import {createOrganization} from "../../store/slices/organizationSlice.ts";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}


const CreateOrganizationModal = ({ isOpen, onClose }: Props) => {
    const dispatch = useAppDispatch();
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        setLoading(true);
        setError('');
        try {
            await dispatch(createOrganization({ name: name.trim() })).unwrap();
            setName('');
            onClose();
        } catch (e: any) {
            setError(typeof e === 'string' ? e : 'Ошибка создания');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className='create-org-modal-overlay' onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className='create-org-modal'>
                <div className='create-org-modal__header'>
                    <h2 className='create-org-modal__title'>Новая организация</h2>
                    <button className='create-org-modal__close' onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </button>
                </div>

                <form className='create-org-modal__body' onSubmit={handleSubmit}>
                    <div className='create-org-modal__field'>
                        <label className='create-org-modal__label'>Название</label>
                        <input
                            className='create-org-modal__input'
                            placeholder='Например: Моя компания'
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {error && <p className='create-org-modal__error'>{error}</p>}

                    <div className='create-org-modal__footer'>
                        <button type='button' className='create-org-modal__btn create-org-modal__btn--cancel' onClick={onClose}>
                            Отмена
                        </button>
                        <button
                            type='submit'
                            className='create-org-modal__btn create-org-modal__btn--primary'
                            disabled={loading || !name.trim()}
                        >
                            {loading ? 'Создание...' : 'Создать'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateOrganizationModal;