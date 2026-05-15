import {useAppDispatch} from "../../store/hooks.ts";
import {type FormEvent, useState} from "react";
import {createSprint} from "../../store/slices/sprintsSlice.ts";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
}

const CreateSprintModal = ({ isOpen, onClose, projectId }: Props) => {
    const dispatch = useAppDispatch();
    const [name, setName] = useState('');
    const [goal, setGoal] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        setLoading(true);
        setError('');
        try {
            await dispatch(createSprint({
                name: name.trim(),
                projectId,
                goal: goal.trim() || undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
            })).unwrap();
            setName('');
            setGoal('');
            setStartDate('');
            setEndDate('');
            onClose();
        } catch (e: any) {
            setError(typeof e === 'string' ? e : 'Ошибка создания спринта');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className='sprint-modal-overlay' onClick={e => e.target === e.currentTarget && onClose()}>
            <div className='sprint-modal'>
                <div className='sprint-modal__header'>
                    <h2 className='sprint-modal__title'>Новый спринт</h2>
                    <button className='sprint-modal__close' onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </button>
                </div>

                <form className='sprint-modal__body' onSubmit={handleSubmit}>
                    <div className='sprint-modal__field'>
                        <label className='sprint-modal__label'>Название *</label>
                        <input
                            className='sprint-modal__input'
                            placeholder='Например: Sprint 1'
                            value={name}
                            onChange={e => setName(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className='sprint-modal__field'>
                        <label className='sprint-modal__label'>Цель спринта</label>
                        <textarea
                            className='sprint-modal__textarea'
                            placeholder='Что планируете завершить в этом спринте?'
                            value={goal}
                            onChange={e => setGoal(e.target.value)}
                            rows={2}
                        />
                    </div>

                    <div className='sprint-modal__dates'>
                        <div className='sprint-modal__field'>
                            <label className='sprint-modal__label'>Дата начала</label>
                            <input
                                className='sprint-modal__input'
                                type='date'
                                value={startDate}
                                onChange={e => setStartDate(e.target.value ? new Date(e.target.value).toISOString() : '')}
                            />
                        </div>
                        <div className='sprint-modal__field'>
                            <label className='sprint-modal__label'>Дата окончания</label>
                            <input
                                className='sprint-modal__input'
                                type='date'
                                value={endDate}
                                onChange={e => setEndDate(e.target.value ? new Date(e.target.value).toISOString() : '')}
                            />
                        </div>
                    </div>

                    {error && <p className='sprint-modal__error'>{error}</p>}

                    <div className='sprint-modal__footer'>
                        <button
                            type='button'
                            className='sprint-modal__btn sprint-modal__btn--cancel'
                            onClick={onClose}
                        >
                            Отмена
                        </button>
                        <button
                            type='submit'
                            className='sprint-modal__btn sprint-modal__btn--primary'
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

export default CreateSprintModal;