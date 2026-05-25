import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks.ts";
import { fetchOrganizations } from "../../store/slices/organizationSlice.ts";
import {useTranslation} from "../../i18n/useTranslation.ts";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        name: string;
        color: string;
        orgId?: string;
        departmentId?: string;
    }) => void;
}

const COLORS = [
    '#9ca3af', '#3b82f6', '#06b6d4', '#f59e0b', '#ec4899',
    '#ef4444', '#eab308', '#22c55e', '#f97316', '#a855f7',
    '#0ea5e9', '#14b8a6', '#8b5cf6', '#6366f1', '#d946ef',
    '#f43f5e', '#64748b', '#78716c', '#2dd4bf',
];

const CreateProjectModal = ({ isOpen, onClose, onSubmit }: Props) => {
    const dispatch = useAppDispatch();
    const { organizations } = useAppSelector((state) => state.organizations);
    const { t } = useTranslation();

    const [name, setName] = useState('');
    const [selectedColor, setSelectedColor] = useState('#3b82f6');
    const [selectedOrgId, setSelectedOrgId] = useState('');
    const [selectedDeptId, setSelectedDeptId] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) dispatch(fetchOrganizations());
    }, [isOpen, dispatch]);

    const departments = organizations.find(o => o.id === selectedOrgId)?.departments ?? [];

    if (!isOpen) return null;

    const handleClose = () => {
        setName('');
        setSelectedColor('#3b82f6');
        setSelectedOrgId('');
        setSelectedDeptId('');
        setError('');
        onClose();
    };

    const handleOrgChange = (orgId: string) => {
        setSelectedOrgId(orgId);
        setSelectedDeptId('');
    };

    const handleSubmit = () => {
        if (!name.trim()) {
            setError(t('createProject.nameRequired'));
            return;
        }
        onSubmit({
            name: name.trim(),
            color: selectedColor,
            orgId: selectedOrgId || undefined,
            departmentId: selectedDeptId || undefined,
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
        <div className='modal-overlay' onClick={(e) => e.target === e.currentTarget && handleClose()}>
            <div className='modal create-project-modal'>
                <h2 className='create-project-modal__title'>{t('createProject.title')}</h2>

                <div className='create-project-modal__content'>
                    <input
                        type='text'
                        className='create-project-modal__input'
                        placeholder={t('createProject.namePlaceholder')}
                        value={name}
                        onChange={(e) => { setName(e.target.value); if (error) setError(''); }}
                        onKeyDown={handleKeyDown}
                        autoFocus
                    />

                    {error && <p className='create-project-modal__error'>{error}</p>}

                    <div className='create-project-modal__colors'>
                        {COLORS.map((color) => (
                            <button
                                key={color}
                                className={`create-project-modal__color ${selectedColor === color ? 'create-project-modal__color--active' : ''}`}
                                style={{ backgroundColor: color }}
                                onClick={() => setSelectedColor(color)}
                                type='button'
                            />
                        ))}
                    </div>

                    {organizations.length > 0 && (
                        <div className='create-project-modal__field'>
                            <label className='create-project-modal__label'>
                                {t('createProject.orgLabel')}
                                <span className='create-project-modal__label-hint'>{t('createProject.optional')}</span>
                            </label>
                            <select
                                className='create-project-modal__select'
                                value={selectedOrgId}
                                onChange={(e) => handleOrgChange(e.target.value)}
                            >
                                <option value=''>{t('createProject.personalProject')}</option>
                                {organizations.map(org => (
                                    <option key={org.id} value={org.id}>{org.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {selectedOrgId && departments.length > 0 && (
                        <div className='create-project-modal__field'>
                            <label className='create-project-modal__label'>
                                {t('createProject.deptLabel')}
                                <span className='create-project-modal__label-hint'>{t('createProject.optional')}</span>
                            </label>
                            <select
                                className='create-project-modal__select'
                                value={selectedDeptId}
                                onChange={(e) => setSelectedDeptId(e.target.value)}
                            >
                                <option value=''>{t('createProject.noDept')}</option>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <div className='create-project-modal__actions'>
                    <button
                        className='create-project-modal__btn create-project-modal__btn--cancel'
                        onClick={handleClose}
                    >
                        {t('createProject.cancel')}
                    </button>
                    <button
                        className='create-project-modal__btn create-project-modal__btn--submit'
                        onClick={handleSubmit}
                        disabled={!name.trim()}
                    >
                        {t('createProject.ok')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateProjectModal;
