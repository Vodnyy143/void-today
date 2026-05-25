import {useAppDispatch, useAppSelector} from "../../store/hooks.ts";
import {useEffect, useRef, useState} from "react";
import {fetchSubscription, upgradePlan} from "../../store/slices/subscriptionSlice.ts";
import {setTheme, setLanguage, type Theme, type Language} from "../../store/slices/settingsSlice.ts";
import {useTranslation} from "../../i18n/useTranslation.ts";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    initialTab?: Tab;
}

type Tab = 'account' | 'premium' | 'general' | 'appearance' | 'about';

const TABS: { id: Tab; icon: string }[] = [
    { id: 'account', icon: 'ti-user' },
    { id: 'premium', icon: 'ti-crown' },
    { id: 'general', icon: 'ti-adjustments-horizontal' },
    { id: 'appearance', icon: 'ti-palette' },
    { id: 'about', icon: 'ti-info-circle' },
];

const PRO_FEATURES: Record<Language, string[]> = {
    ru: [
        'Создание организаций и команд',
        'Назначение задач участникам',
        'Неограниченное количество проектов',
        'Совместная работа над проектами',
        'Расширенная статистика',
        'Повторяющиеся задачи',
    ],
    en: [
        'Create organizations and teams',
        'Assign tasks to members',
        'Unlimited projects',
        'Collaborative work on projects',
        'Advanced statistics',
        'Recurring tasks',
    ],
};

const BUSINESS_FEATURES: Record<Language, string[]> = {
    ru: [
        'Всё из PRO',
        'Создание отделов внутри организации',
        'Управление ролями и правами',
        'Приоритетная поддержка',
        'Аналитика по команде',
        'Кастомные интеграции',
    ],
    en: [
        'Everything in PRO',
        'Departments within organization',
        'Role and permission management',
        'Priority support',
        'Team analytics',
        'Custom integrations',
    ],
};

const SettingsModal = ({ isOpen, onClose, initialTab = 'account' }: Props) => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const { subscription } = useAppSelector((state) => state.subscriptions);
    const { theme, language } = useAppSelector((state) => state.settings);
    const { t } = useTranslation();

    const [activeTab, setActiveTab] = useState<Tab>(initialTab);
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
            dispatch(fetchSubscription());
        }
    }, [isOpen, initialTab, dispatch]);

    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    const handleUpgrade = async (plan: 'PRO' | 'BUSINESS') => {
        await dispatch(upgradePlan(plan));
    };

    if (!isOpen) return null;

    const currentPlan = subscription?.plan ?? 'FREE';
    const proFeatures = PRO_FEATURES[language];
    const businessFeatures = BUSINESS_FEATURES[language];

    return (
        <div
            ref={overlayRef}
            className='settings-overlay'
            onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
        >
            <div className='settings-modal'>
                <div className='settings-modal__header'>
                    <span className='settings-modal__title'>{t('settings.title')}</span>
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
                                {t(`settings.tabs.${tab.id}` as Parameters<typeof t>[0])}
                            </button>
                        ))}
                    </nav>

                    <div className='settings-modal__content'>
                        {activeTab === 'account' && (
                            <div className='settings-modal__section'>
                                <div className='settings-modal__row'>
                                    <span className='settings-modal__label'>{t('settings.account.email')}</span>
                                    <span className='settings-modal__value'>{user?.email}</span>
                                </div>
                                <div className='settings-modal__row'>
                                    <span className='settings-modal__label'>{t('settings.account.password')}</span>
                                    <button className='settings-modal__btn'>{t('settings.account.changePassword')}</button>
                                </div>
                                <div className='settings-modal__row settings-modal__row--danger'>
                                    <button className='settings-modal__btn settings-modal__btn--danger'>
                                        {t('settings.account.deleteAccount')}
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'premium' && (
                            <div className='settings-modal__premium'>
                                <div className='settings-modal__plan-badge'>
                                    {t('settings.premium.currentPlan')}: <strong>{currentPlan}</strong>
                                </div>

                                <div className='settings-modal__plans'>
                                    <div className={`settings-modal__plan ${currentPlan === 'PRO' ? 'settings-modal__plan--active' : ''}`}>
                                        <div className='settings-modal__plan-header'>
                                            <span className='settings-modal__plan-name'>PRO</span>
                                            <span className='settings-modal__plan-price'>$9.99<span>{t('settings.premium.perMonth')}</span></span>
                                        </div>
                                        <ul className='settings-modal__plan-features'>
                                            {proFeatures.map(f => (
                                                <li key={f}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                                        <path d="M20 6L9 17l-5-5" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                    {f}
                                                </li>
                                            ))}
                                        </ul>
                                        <button
                                            className='settings-modal__plan-btn settings-modal__plan-btn--pro'
                                            onClick={() => handleUpgrade('PRO')}
                                            disabled={currentPlan === 'PRO' || currentPlan === 'BUSINESS'}
                                        >
                                            {currentPlan === 'PRO'
                                                ? t('settings.premium.currentPlanActive')
                                                : currentPlan === 'BUSINESS'
                                                    ? t('settings.premium.alreadyActive')
                                                    : t('settings.premium.choosePro')}
                                        </button>
                                    </div>

                                    <div className={`settings-modal__plan settings-modal__plan--featured ${currentPlan === 'BUSINESS' ? 'settings-modal__plan--active' : ''}`}>
                                        <div className='settings-modal__plan-badge-top'>{t('settings.premium.popular')}</div>
                                        <div className='settings-modal__plan-header'>
                                            <span className='settings-modal__plan-name'>BUSINESS</span>
                                            <span className='settings-modal__plan-price'>$24.99<span>{t('settings.premium.perMonth')}</span></span>
                                        </div>
                                        <ul className='settings-modal__plan-features'>
                                            {businessFeatures.map(f => (
                                                <li key={f}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                                        <path d="M20 6L9 17l-5-5" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                    {f}
                                                </li>
                                            ))}
                                        </ul>
                                        <button
                                            className='settings-modal__plan-btn settings-modal__plan-btn--business'
                                            onClick={() => handleUpgrade('BUSINESS')}
                                            disabled={currentPlan === 'BUSINESS'}
                                        >
                                            {currentPlan === 'BUSINESS'
                                                ? t('settings.premium.currentPlanActive')
                                                : t('settings.premium.chooseBusiness')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'general' && (
                            <div className='settings-modal__section'>
                                <div className='settings-modal__row'>
                                    <span className='settings-modal__label'>{t('settings.general.language')}</span>
                                    <select
                                        className='settings-modal__select'
                                        value={language}
                                        onChange={e => dispatch(setLanguage(e.target.value as Language))}
                                    >
                                        <option value="ru">{t('settings.general.languageRu')}</option>
                                        <option value="en">{t('settings.general.languageEn')}</option>
                                    </select>
                                </div>
                                <div className='settings-modal__row'>
                                    <span className='settings-modal__label'>{t('settings.general.weekStart')}</span>
                                    <select className='settings-modal__select'>
                                        <option value="monday">{t('settings.general.monday')}</option>
                                        <option value="sunday">{t('settings.general.sunday')}</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {activeTab === 'appearance' && (
                            <div className='settings-modal__section'>
                                <div className='settings-modal__row'>
                                    <span className='settings-modal__label'>{t('settings.appearance.theme')}</span>
                                    <select
                                        className='settings-modal__select'
                                        value={theme}
                                        onChange={e => dispatch(setTheme(e.target.value as Theme))}
                                    >
                                        <option value="dark">{t('settings.appearance.dark')}</option>
                                        <option value="light">{t('settings.appearance.light')}</option>
                                        <option value="system">{t('settings.appearance.system')}</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {activeTab === 'about' && (
                            <div className='settings-modal__section'>
                                <div className='settings-modal__row'>
                                    <span className='settings-modal__label'>{t('settings.about.version')}</span>
                                    <span className='settings-modal__value'>1.0.0</span>
                                </div>
                                <div className='settings-modal__row'>
                                    <span className='settings-modal__label'>{t('settings.about.support')}</span>
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
