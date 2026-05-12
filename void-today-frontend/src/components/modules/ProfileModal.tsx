import {useAppDispatch} from "../../store/hooks.ts";
import {signOut} from "../../store/slices/authSlice.ts";
import {useEffect, useRef} from "react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    anchorRef: React.RefObject<HTMLButtonElement | null>;
}


const ProfileModal = ({isOpen, onClose, anchorRef }: Props) => {
    const dispatch = useAppDispatch();
    const dropdownRef = useRef<HTMLDivElement>(null);


    const handleLogout = async () => {
        await dispatch(signOut());
        onClose();
    };

    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                anchorRef.current &&
                !anchorRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose, anchorRef]);

    if(!isOpen) return null;

    return (
        <div className='profile-dropdown' ref={dropdownRef}>
            <div className='profile-dropdown__section'>
                <p className='profile-dropdown__text'>Last synced: 2 minutes ago</p>
                <button className='profile-dropdown__link'>Sync Now</button>
            </div>

            <div className='profile-dropdown__section'>
                <p className='profile-dropdown__text'>Premium period remaining: 0 days</p>
                <button className='profile-dropdown__link'>Upgrade to Premium</button>
            </div>

            <div className='profile-dropdown__divider'></div>

            <div className='profile-dropdown__actions'>
                <button className='profile-dropdown__action'>
                    Account Settings
                </button>
                <button
                    className='profile-dropdown__action profile-dropdown__action--logout'
                    onClick={handleLogout}
                >
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default ProfileModal;