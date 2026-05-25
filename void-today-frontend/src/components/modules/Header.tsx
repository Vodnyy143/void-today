import {useEffect, useRef, useState} from "react";
import AuthModal from "./AuthModal.tsx";
import {useAppDispatch, useAppSelector} from "../../store/hooks.ts";
import ProfileModal from "./ProfileModal.tsx";
import SettingsModal from "./SettingsModal.tsx";
import ReportModal from "./ReportModal.tsx";
import NotificationsPanel from "./NotificationsPanel.tsx";
import {fetchUnreadCount} from "../../store/slices/notificationsSlice.ts";
import {useTranslation} from "../../i18n/useTranslation.ts";

const Header = () => {
    const dispatch = useAppDispatch();
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);
    const { unreadCount } = useAppSelector((state) => state.notifications);
    const { t } = useTranslation();

    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [settingsInitialTab, setSettingsInitialTab] = useState<'account' | 'premium' | 'general' | 'appearance' | 'about'>('account');
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const avatarButtonRef = useRef<HTMLButtonElement>(null);
    const notifButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchUnreadCount());

            const interval = setInterval(() => {
                dispatch(fetchUnreadCount());
            }, 60_000);

            return () => clearInterval(interval);
        }
    }, [isAuthenticated, dispatch]);

    return (
        <>
            <header className='header'>
                <div className='header__content'>
                    <div className='header__left'>
                        {isAuthenticated
                            ? (
                                <button
                                    ref={avatarButtonRef}
                                    className='header__account-btn'
                                    onClick={() => setIsProfileModalOpen(true)}
                                >
                                    <div className='header__account-avatar'>
                                        {user?.email[0].toUpperCase()}
                                    </div>
                                    <span className='header__account-email'>{user?.email}</span>
                                    <svg className='header__account-arrow' width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                            )
                            : (
                                <button
                                    className='header__auth-link'
                                    onClick={() => setIsAuthOpen(true)}
                                >
                                    {t('header.loginRegister')}
                                </button>
                            )
                        }

                        {user && (
                            <ProfileModal
                                isOpen={isProfileModalOpen}
                                onClose={() => setIsProfileModalOpen(false)}
                                anchorRef={avatarButtonRef}
                            />
                        )}
                    </div>

                    {isAuthenticated && (
                        <div className='header__right'>
                            <button
                                className='header__icon-btn'
                                title={t('header.premium')}
                                onClick={() => {
                                    setSettingsInitialTab('premium');
                                    setIsSettingsModalOpen(true);
                                }}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>

                            <button
                                className='header__icon-btn'
                                title={t('header.report')}
                                onClick={() => setIsReportOpen(true)}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>

                            {/* Кнопка уведомлений с бейджем */}
                            <button
                                ref={notifButtonRef}
                                className={`header__icon-btn header__icon-btn--notif ${isNotificationsOpen ? 'header__icon-btn--active' : ''}`}
                                title={t('header.notifications')}
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"
                                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                {unreadCount > 0 && (
                                    <span className='header__notif-badge'>
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            <button
                                className='header__icon-btn'
                                title={t('header.settings')}
                                onClick={() => {
                                    setSettingsInitialTab('account');
                                    setIsSettingsModalOpen(true);
                                }}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
                                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

            <ReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />

            <NotificationsPanel
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
                anchorRef={notifButtonRef}
            />

            <SettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
                initialTab={settingsInitialTab}
            />
        </>
    );
};

export default Header;