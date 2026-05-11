import profileImage from '../../../assets/profile.jpg';
import Button from "../../elements/Button";
import {useState} from "react";
import LoginModal from "../LoginModal";

const Header = () => {
    const [isLoginOpen, setIsLoginOpen] = useState(false);

    return (
      <>
          <header className={'header'}>
              <div className={'header-image-container'}>
                  <img src={profileImage} alt="Профиль" className={'header-logo'}/>

                  <Button className={'header-open-modal'} onClick={() => setIsLoginOpen(true)}>
                      Войти|Регистрация
                  </Button>
              </div>
          </header>

          <LoginModal
              isOpen={isLoginOpen}
              onClose={() => setIsLoginOpen(false)}
          />
      </>
    );
};

export default Header;