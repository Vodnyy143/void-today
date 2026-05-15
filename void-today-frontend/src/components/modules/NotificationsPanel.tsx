import React, {type JSX, useEffect, useRef, useState} from 'react';
import {useAppDispatch, useAppSelector} from "../../store/hooks.ts";
import {
    fetchNotifications,
    markRead,
    markAllRead,
    deleteNotification,
    deleteAllNotifications,
    type Notification,
    type NotificationType,
} from '../../store/slices/notificationsSlice';


const TYPE_ICON: Record<NotificationType, JSX.Element> = {
    TASK_ASSIGNED: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
    ),
    TASK_DUE: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
    ),
    TASK_DONE: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
    ),
    SPRINT_START: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
    ),
    SPRINT_END: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
    ),
    INVITE: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 11l-4 4m0-4l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
    ),
    MENITION: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
            <path d="M16 8v5a3 3 0 006 0v-1a10 10 0 10-3.92 7.94" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
    ),
};

const TYPE_COLOR: Record<NotificationType, string> = {
    TASK_ASSIGNED: '#3b82f6',
    TASK_DUE: '#f97316',
    TASK_DONE: '#22c55e',
    SPRINT_START: '#8b5cf6',
    SPRINT_END: '#6b7280',
    INVITE: '#06b6d4',
    MENITION: '#ec4899',
};

// ─── Форматирование даты ──────────────────────────────────────────────────────

const formatTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'только что';
    if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} дн назад`;

    return date.toLocaleDateString('ru', { day: 'numeric', month: 'short' });
};

// ─── Notification Item ────────────────────────────────────────────────────────

const NotificationItem = ({
                              notification,
                              onRead,
                              onDelete,
                          }: {
    notification: Notification;
    onRead: (id: string) => void;
    onDelete: (id: string) => void;
}) => {
    return (
        <div
            className={`notif-item ${!notification.read ? 'notif-item--unread' : ''}`}
            onClick={() => !notification.read && onRead(notification.id)}
        >
            <div
                className='notif-item__icon'
                style={{ background: `${TYPE_COLOR[notification.type]}18`, color: TYPE_COLOR[notification.type] }}
            >
                {TYPE_ICON[notification.type]}
            </div>

            <div className='notif-item__body'>
                <p className='notif-item__text'>{notification.text}</p>
                <span className='notif-item__time'>{formatTime(notification.createdAt)}</span>
            </div>

            {!notification.read && <div className='notif-item__dot' />}

            <button
                className='notif-item__delete'
                onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}
                title="Удалить"
            >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
            </button>
        </div>
    );
};

interface Props {
    isOpen: boolean;
    onClose: () => void;
    anchorRef: React.RefObject<HTMLButtonElement | null>;
}

const NotificationsPanel = ({ isOpen, onClose, anchorRef }: Props) => {
    const dispatch = useAppDispatch();
    const { items, unreadCount, status } = useAppSelector(s => s.notifications);
    const [unreadOnly, setUnreadOnly] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            dispatch(fetchNotifications({ unreadOnly, limit: 30 }));
        }
    }, [isOpen, unreadOnly, dispatch]);

    useEffect(() => {
        if (!isOpen) return;
        const handleClick = (e: MouseEvent) => {
            if (
                panelRef.current &&
                !panelRef.current.contains(e.target as Node) &&
                anchorRef.current &&
                !anchorRef.current.contains(e.target as Node)
            ) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [isOpen, onClose, anchorRef]);

    // Закрытие по Escape
    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleRead = (id: string) => dispatch(markRead([id]));
    const handleMarkAllRead = () => dispatch(markAllRead());
    const handleDelete = (id: string) => dispatch(deleteNotification(id));
    const handleDeleteAll = () => {
        if (confirm('Удалить все уведомления?')) dispatch(deleteAllNotifications());
    };

    const filtered = unreadOnly ? items.filter(n => !n.read) : items;

    return (
        <div className='notif-panel' ref={panelRef}>
            <div className='notif-panel__header'>
                <h3 className='notif-panel__title'>
                    Уведомления
                    {unreadCount > 0 && (
                        <span className='notif-panel__badge'>{unreadCount}</span>
                    )}
                </h3>
                <div className='notif-panel__header-actions'>
                    {unreadCount > 0 && (
                        <button className='notif-panel__text-btn' onClick={handleMarkAllRead}>
                            Прочитать все
                        </button>
                    )}
                    {items.length > 0 && (
                        <button className='notif-panel__text-btn notif-panel__text-btn--danger' onClick={handleDeleteAll}>
                            Очистить
                        </button>
                    )}
                </div>
            </div>

            <div className='notif-panel__filters'>
                <button
                    className={`notif-panel__filter-btn ${!unreadOnly ? 'notif-panel__filter-btn--active' : ''}`}
                    onClick={() => setUnreadOnly(false)}
                >
                    Все
                </button>
                <button
                    className={`notif-panel__filter-btn ${unreadOnly ? 'notif-panel__filter-btn--active' : ''}`}
                    onClick={() => setUnreadOnly(true)}
                >
                    Непрочитанные {unreadCount > 0 && `(${unreadCount})`}
                </button>
            </div>

            <div className='notif-panel__list'>
                {status === 'loading' && items.length === 0 && (
                    <div className='notif-panel__loading'>Загрузка...</div>
                )}

                {status !== 'loading' && filtered.length === 0 && (
                    <div className='notif-panel__empty'>
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"
                                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        <p>{unreadOnly ? 'Нет непрочитанных' : 'Нет уведомлений'}</p>
                    </div>
                )}

                {filtered.map(notification => (
                    <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onRead={handleRead}
                        onDelete={handleDelete}
                    />
                ))}
            </div>
        </div>
    );
};

export default NotificationsPanel;