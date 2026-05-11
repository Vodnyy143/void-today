import profileImage from '../../../assets/profile.jpg';
import Button from "../../elements/Button";
import {useState} from "react";
import AuthModal from "../AuthModal";
import ProfileModal from "../ProfileModal";

const Header = () => {
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    const isAuthenticated = false;
    const userEmail  = 'user@gmail.com';

    return (
      <>
          <header className='header'>
              <div className='header__content'>
                  <img className='header__logo' src={profileImage} alt="Профиль" />
                  <span className='header__title'>VOID.TODAY</span>
              </div>

              {isAuthenticated ? (
                  <button
                    className='header__account-btn'
                    onClick={() => setIsProfileModalOpen(true)}
                  >
                      <div className='header__account-avatar'>
                          {userEmail[0].toUpperCase()}
                      </div>
                      <span className='header__account-email'>{userEmail}</span>
                  </button>
              ) : (
                  <Button
                      className={'header__auth-btn'}
                      onClick={() => setIsAuthOpen(true)}
                  >
                      Войти|Регистрация
                  </Button>
              )}

          </header>

          <AuthModal
              isOpen={isAuthOpen}
              onClose={() => setIsAuthOpen(false)}
          />


          <ProfileModal
              isOpen={isProfileModalOpen}
              onClose={() => setIsProfileModalOpen(false)}
              userEmail={userEmail}
          />
      </>
    );
};

export default Header;