import {useRef, useState} from "react";
import AuthModal from "./AuthModal.tsx";
import {useAppSelector} from "../../store/hooks.ts";
import ProfileModal from "./ProfileModal.tsx";

const Header = () => {
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);

    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    const avatarButtonRef = useRef<HTMLButtonElement>(null);

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
                                  Войти | Регистрация
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
                            <button className='header__icon-btn' title="Премиум">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"/>
                                </svg>
                            </button>

                            <button className='header__icon-btn' title="Уведомления">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>

                            <button
                                className='header__icon-btn'
                                onClick={() => setIsSettingsModalOpen(true)}
                                title="Настройки"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M12 1v6m0 6v6M23 12h-6m-6 0H1"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"/>
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />


        </>
    );
};

export default Header;