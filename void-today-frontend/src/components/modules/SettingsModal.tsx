import {useAppSelector} from "../../store/hooks.ts";
import {useEffect, useRef, useState} from "react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}
type Tab = 'account' | 'general' | 'appearance' | 'about';
const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'account', label: 'Учётная запись', icon: 'ti-user' },
    { id: 'general', label: 'Общие', icon: 'ti-adjustments-horizontal' },
    { id: 'appearance', label: 'Оформление', icon: 'ti-palette' },
    { id: 'about', label: 'Сведения', icon: 'ti-info-circle' },
];

const SettingsModal = ({isOpen, onClose}: Props) => {
    const { user } = useAppSelector((state) => state.auth);
    const [activeTab, setActiveTab] = useState<Tab>('account');
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            ref={overlayRef}
            className='settings-overlay'
            onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
        >
            <div className='settings-modal'>
                <div className='settings-modal__header'>
                    <span className='settings-modal__title'>Настройки</span>
                    <button className='settings-modal__close' onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </button>
                </div>

                <div className='settings-modal__body'>
                    <nav className='settings-modal__nav'>
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                className={`settings-modal__nav-item ${activeTab === tab.id ? 'settings-modal__nav-item--active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <i className={`ti ${tab.icon}`} />
                                {tab.label}
                            </button>
                        ))}
                    </nav>

                    <div className='settings-modal__content'>
                        {activeTab === 'account' && (
                            <div className='settings-modal__section'>
                                <div className='settings-modal__row'>
                                    <span className='settings-modal__label'>Email</span>
                                    <span className='settings-modal__value'>{user?.email}</span>
                                </div>
                                <div className='settings-modal__row'>
                                    <span className='settings-modal__label'>Пароль</span>
                                    <button className='settings-modal__btn'>Изменить пароль</button>
                                </div>
                                <div className='settings-modal__row settings-modal__row--danger'>
                                    <button className='settings-modal__btn settings-modal__btn--danger'>
                                        Удалить аккаунт
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'general' && (
                            <div className='settings-modal__section'>
                                <div className='settings-modal__row'>
                                    <span className='settings-modal__label'>Язык</span>
                                    <select className='settings-modal__select'>
                                        <option>Русский</option>
                                        <option>English</option>
                                    </select>
                                </div>
                                <div className='settings-modal__row'>
                                    <span className='settings-modal__label'>Начало недели</span>
                                    <select className='settings-modal__select'>
                                        <option>Понедельник</option>
                                        <option>Воскресенье</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {activeTab === 'appearance' && (
                            <div className='settings-modal__section'>
                                <div className='settings-modal__row'>
                                    <span className='settings-modal__label'>Тема</span>
                                    <select className='settings-modal__select'>
                                        <option>Тёмная</option>
                                        <option>Светлая</option>
                                        <option>Системная</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {activeTab === 'about' && (
                            <div className='settings-modal__section'>
                                <div className='settings-modal__row'>
                                    <span className='settings-modal__label'>Версия</span>
                                    <span className='settings-modal__value'>1.0.0</span>
                                </div>
                                <div className='settings-modal__row'>
                                    <span className='settings-modal__label'>Поддержка</span>
                                    <span className='settings-modal__value'>support@east-calendar.ru</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;