import React, {useState} from "react";
import {useAppDispatch} from "../../store/hooks.ts";
import {inviteMember} from "../../store/slices/organizationSlice.ts";
import {useTranslation} from "../../i18n/useTranslation.ts";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    orgId: string;
}

const InviteMemberModal = ({ isOpen, onClose, orgId }: Props) => {
    const dispatch = useAppDispatch();
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        setLoading(true);
        setError('');
        try {
            await dispatch(inviteMember({ orgId, email: email.trim(), role })).unwrap();
            setEmail('');
            setRole('MEMBER');
            onClose();
        } catch (e: any) {
            setError(typeof e === 'string' ? e : t('inviteMember.error'));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className='invite-modal-overlay' onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className='invite-modal'>
                <div className='invite-modal__header'>
                    <h2 className='invite-modal__title'>{t('inviteMember.title')}</h2>
                    <button className='invite-modal__close' onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </button>
                </div>

                <form className='invite-modal__body' onSubmit={handleSubmit}>
                    <div className='invite-modal__field'>
                        <label className='invite-modal__label'>{t('inviteMember.emailLabel')}</label>
                        <input
                            className='invite-modal__input'
                            type='email'
                            placeholder='user@example.com'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className='invite-modal__field'>
                        <label className='invite-modal__label'>{t('inviteMember.roleLabel')}</label>
                        <select
                            className='invite-modal__select'
                            value={role}
                            onChange={(e) => setRole(e.target.value as 'ADMIN' | 'MEMBER')}
                        >
                            <option value='MEMBER'>{t('inviteMember.roleMember')}</option>
                            <option value='ADMIN'>{t('inviteMember.roleAdmin')}</option>
                        </select>
                    </div>

                    {error && <p className='invite-modal__error'>{error}</p>}

                    <div className='invite-modal__footer'>
                        <button type='button' className='invite-modal__btn invite-modal__btn--cancel' onClick={onClose}>
                            {t('inviteMember.cancel')}
                        </button>
                        <button
                            type='submit'
                            className='invite-modal__btn invite-modal__btn--primary'
                            disabled={loading || !email.trim()}
                        >
                            {loading ? t('inviteMember.inviting') : t('inviteMember.invite')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InviteMemberModal;
