import { useNavigate } from 'react-router-dom';
import {useAppSelector} from "../store/hooks.ts";

const features = [
    {
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M12 3v1M12 20v1M3 12H2M22 12h-1M5.5 5.5l-.7-.7M19.2 5.5l.7-.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
        ),
        title: 'Pomodoro',
        desc: 'Работайте сфокусированно и без отвлечений с помощью таймера Pomodoro',
    },
    {
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
        ),
        title: 'Статистика',
        desc: 'Анализируйте продуктивность, стрики и активность за 90 дней',
    },
    {
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M3 10h18M8 2v4m8-4v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
        ),
        title: 'Дедлайны',
        desc: 'Планируйте задачи на сегодня, завтра или эту неделю',
    },
    {
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
        ),
        title: 'Напоминания',
        desc: 'Никогда не пропускайте важные задачи благодаря уведомлениям',
    },
    {
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
        ),
        title: 'Подзадачи',
        desc: 'Разбивайте сложные задачи на выполнимые шаги',
    },
    {
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 11l-4 4m0-4l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
        ),
        title: 'Команды',
        desc: 'Создавайте организации, назначайте задачи участникам',
    },
    {
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="5" height="18" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="10" y="3" width="5" height="12" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="17" y="3" width="5" height="15" rx="1" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
        ),
        title: 'Канбан',
        desc: 'Визуализируйте рабочий процесс с помощью канбан-досок',
    },
    {
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
        ),
        title: 'Спринты',
        desc: 'Планируйте и завершайте спринты с burndown-графиком',
    },
];

const stats = [
    { value: '∞', label: 'задач без ограничений' },
    { value: '3', label: 'тарифных плана' },
    { value: '90', label: 'дней статистики' },
    { value: '24/7', label: 'доступ с любого устройства' },
];

const HomePage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAppSelector(s => s.auth);

    return (
        <div className="home-page">

            {/* ── HERO ─────────────────────────────────────────────── */}
            <section className="home-hero">
                <div className="home-hero__glow home-hero__glow--1" />
                <div className="home-hero__glow home-hero__glow--2" />
                <div className="home-hero__glow home-hero__glow--3" />

                <div className="home-hero__content">
                    <div className="home-hero__badge">
                        <span className="home-hero__badge-dot" />
                        Управление задачами нового уровня
                    </div>

                    <h1 className="home-hero__title">
                        VOID<br />
                        <span className="home-hero__title-accent">TODAY</span>
                    </h1>

                    <p className="home-hero__desc">
                        Планируйте задачи, работайте в команде,<br />
                        отслеживайте продуктивность — всё в одном месте.
                    </p>

                    <div className="home-hero__actions">
                        {isAuthenticated ? (
                            <button
                                className="home-btn home-btn--primary"
                                onClick={() => navigate('/todos?view=today')}
                            >
                                Открыть рабочее пространство
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                            </button>
                        ) : (
                            <>
                                <button
                                    className="home-btn home-btn--primary"
                                    onClick={() => navigate('/todos?view=today')}
                                >
                                    Начать бесплатно
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                    </svg>
                                </button>
                                <button
                                    className="home-btn home-btn--ghost"
                                    onClick={() => navigate('/todos?view=today')}
                                >
                                    Войти
                                </button>
                            </>
                        )}
                    </div>

                    {/* Превью интерфейса */}
                    <div className="home-hero__preview">
                        <div className="home-preview">
                            <div className="home-preview__bar">
                                <span /><span /><span />
                            </div>
                            <div className="home-preview__body">
                                <div className="home-preview__sidebar">
                                    {['Today', 'Tomorrow', 'This Week', 'Tasks'].map((item, i) => (
                                        <div key={item} className={`home-preview__nav-item ${i === 0 ? 'home-preview__nav-item--active' : ''}`}>
                                            <div className="home-preview__nav-dot" />
                                            {item}
                                        </div>
                                    ))}
                                    <div className="home-preview__divider" />
                                    {['Project Alpha', 'Design', 'College'].map((p, i) => (
                                        <div key={p} className="home-preview__project">
                                            <div className="home-preview__project-dot" style={{ background: ['#ef4444', '#3b82f6', '#8b5cf6'][i] }} />
                                            {p}
                                        </div>
                                    ))}
                                </div>
                                <div className="home-preview__main">
                                    <div className="home-preview__heading">Today</div>
                                    <div className="home-preview__input">
                                        <span>+ Add a task...</span>
                                    </div>
                                    {[
                                        { done: true, text: 'Проверить отчёт', date: '13 May' },
                                        { done: false, text: 'Встреча с командой', date: '14 May' },
                                        { done: false, text: 'Обновить дизайн', date: '' },
                                        { done: false, text: 'Написать документацию', date: '15 May' },
                                    ].map((task, i) => (
                                        <div key={i} className={`home-preview__task ${task.done ? 'home-preview__task--done' : ''}`}>
                                            <div className="home-preview__task-check">
                                                {task.done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>}
                                            </div>
                                            <span>{task.text}</span>
                                            {task.date && <span className="home-preview__task-date">{task.date}</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── STATS ────────────────────────────────────────────── */}
            <section className="home-stats">
                {stats.map((s, i) => (
                    <div key={i} className="home-stat">
                        <span className="home-stat__value">{s.value}</span>
                        <span className="home-stat__label">{s.label}</span>
                    </div>
                ))}
            </section>

            {/* ── FEATURES ─────────────────────────────────────────── */}
            <section className="home-features">
                <div className="home-section-header">
                    <p className="home-section-tag">Возможности</p>
                    <h2 className="home-section-title">Всё что нужно<br />для продуктивности</h2>
                </div>

                <div className="home-features__grid">
                    {features.map((f, i) => (
                        <div key={i} className="home-feature-card">
                            <div className="home-feature-card__icon">{f.icon}</div>
                            <h3 className="home-feature-card__title">{f.title}</h3>
                            <p className="home-feature-card__desc">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── PLANS ────────────────────────────────────────────── */}
            <section className="home-plans">
                <div className="home-section-header">
                    <p className="home-section-tag">Тарифы</p>
                    <h2 className="home-section-title">Выберите свой план</h2>
                </div>

                <div className="home-plans__grid">
                    <div className="home-plan-card">
                        <div className="home-plan-card__name">Free</div>
                        <div className="home-plan-card__price">
                            <span className="home-plan-card__amount">0₽</span>
                            <span className="home-plan-card__period">навсегда</span>
                        </div>
                        <ul className="home-plan-card__features">
                            <li>Неограниченные личные задачи</li>
                            <li>Проекты и категории</li>
                            <li>Статистика и отчёты</li>
                            <li>Канбан-доски</li>
                        </ul>
                        <button className="home-btn home-btn--outline home-plan-card__btn" onClick={() => navigate('/todos?view=today')}>
                            Начать бесплатно
                        </button>
                    </div>

                    <div className="home-plan-card home-plan-card--featured">
                        <div className="home-plan-card__badge">Популярный</div>
                        <div className="home-plan-card__name">PRO</div>
                        <div className="home-plan-card__price">
                            <span className="home-plan-card__amount">499₽</span>
                            <span className="home-plan-card__period">/ месяц</span>
                        </div>
                        <ul className="home-plan-card__features">
                            <li>Всё из Free</li>
                            <li>Создание организаций</li>
                            <li>Приглашение участников</li>
                            <li>Назначение исполнителей</li>
                            <li>Спринты и бэклог</li>
                        </ul>
                        <button className="home-btn home-btn--primary home-plan-card__btn" onClick={() => navigate('/todos?view=today')}>
                            Попробовать PRO
                        </button>
                    </div>

                    <div className="home-plan-card">
                        <div className="home-plan-card__name">Business</div>
                        <div className="home-plan-card__price">
                            <span className="home-plan-card__amount">999₽</span>
                            <span className="home-plan-card__period">/ месяц</span>
                        </div>
                        <ul className="home-plan-card__features">
                            <li>Всё из PRO</li>
                            <li>Отделы внутри организации</li>
                            <li>Расширенная аналитика</li>
                            <li>Приоритетная поддержка</li>
                            <li>Безлимитные проекты</li>
                        </ul>
                        <button className="home-btn home-btn--outline home-plan-card__btn" onClick={() => navigate('/todos?view=today')}>
                            Выбрать Business
                        </button>
                    </div>
                </div>
            </section>

            {/* ── CTA ──────────────────────────────────────────────── */}
            <section className="home-cta">
                <div className="home-cta__glow" />
                <h2 className="home-cta__title">Начните прямо сейчас</h2>
                <p className="home-cta__desc">Бесплатно, без кредитной карты</p>
                <button className="home-btn home-btn--primary home-btn--lg" onClick={() => navigate('/todos?view=today')}>
                    Попробовать VOID TODAY
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                </button>
            </section>

            {/* ── FOOTER ───────────────────────────────────────────── */}
            <footer className="home-footer">
                <span className="home-footer__logo">VOID TODAY</span>
                <span className="home-footer__copy">© 2026 · Все права защищены</span>
            </footer>
        </div>
    );
};

export default HomePage;
