import {useAppDispatch, useAppSelector} from "../../store/hooks.ts";
import {useEffect} from "react";
import {fetchDashboard, fetchHeatmap, fetchWeeklyStats} from "../../store/slices/statsSlice.ts";
import {useTranslation} from "../../i18n/useTranslation.ts";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const ReportModal = ({ isOpen, onClose }: Props) => {
    const dispatch = useAppDispatch();
    const { dashboard, weekly, heatmap } = useAppSelector((state) => state.stats);
    const { t, language } = useTranslation();

    useEffect(() => {
        if (isOpen) {
            dispatch(fetchDashboard());
            dispatch(fetchWeeklyStats());
            dispatch(fetchHeatmap());
        }
    }, [isOpen, dispatch]);

    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const getHeatmapColor = (count: number) => {
        if (count === 0) return 'var(--bg-tertiary)';
        if (count <= 2) return 'rgba(59, 130, 246, 0.3)';
        if (count <= 4) return 'rgba(59, 130, 246, 0.6)';
        return 'rgba(59, 130, 246, 1)';
    };

    const heatmapMap = new Map(heatmap.map((h: any) => [h.date, h.count]));

    const heatmapDays = Array.from({ length: 90 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (89 - i));
        const dateStr = date.toISOString().split('T')[0];
        return {
            date: dateStr,
            count: (heatmapMap.get(dateStr) as number) || 0,
            day: date.getDate(),
            month: date.toLocaleString(language, { month: 'short' }),
        };
    });

    return (
        <div className='report-overlay' onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className='report-modal'>
                <div className='report-modal__header'>
                    <h2 className='report-modal__title'>{t('report.title')}</h2>
                    <button className='report-modal__close' onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </button>
                </div>

                <div className='report-modal__body'>
                    <div className='report-modal__cards'>
                        <div className='report-card'>
                            <span className='report-card__label'>{t('report.tasksToday')}</span>
                            <span className='report-card__value report-card__value--red'>
                                {dashboard?.tasksToday ?? 0}
                            </span>
                        </div>
                        <div className='report-card'>
                            <span className='report-card__label'>{t('report.doneToday')}</span>
                            <span className='report-card__value report-card__value--red'>
                                {dashboard?.doneToday ?? 0}
                            </span>
                        </div>
                        <div className='report-card'>
                            <span className='report-card__label'>{t('report.doneWeek')}</span>
                            <span className='report-card__value report-card__value--blue'>
                                {weekly?.totalCompleted ?? 0}
                            </span>
                        </div>
                        <div className='report-card'>
                            <span className='report-card__label'>{t('report.completion')}</span>
                            <span className='report-card__value report-card__value--blue'>
                                {dashboard?.completionRate ?? 0}%
                            </span>
                        </div>
                        <div className='report-card'>
                            <span className='report-card__label'>{t('report.streak')}</span>
                            <span className='report-card__value report-card__value--blue'>
                                {dashboard?.streak ?? 0}
                            </span>
                        </div>
                    </div>

                    <div className='report-modal__section'>
                        <h3 className='report-modal__section-title'>{t('report.thisWeek')}</h3>
                        <div className='report-week'>
                            {weekly?.dailyStats?.map((day: any) => (
                                <div key={day.date} className='report-week__day'>
                                    <div className='report-week__bar-wrap'>
                                        <div
                                            className='report-week__bar'
                                            style={{
                                                height: `${day.total > 0 ? Math.max((day.completed / Math.max(weekly.totalTasks, 1)) * 100, 4) : 0}%`
                                            }}
                                        />
                                    </div>
                                    <span className='report-week__count'>{day.completed}</span>
                                    <span className='report-week__label'>{day.day}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className='report-modal__section'>
                        <h3 className='report-modal__section-title'>{t('report.activity90')}</h3>
                        <div className='report-heatmap'>
                            {heatmapDays.map((day, i) => (
                                <div
                                    key={i}
                                    className='report-heatmap__cell'
                                    style={{ background: getHeatmapColor(day.count) }}
                                    title={`${day.date}: ${day.count} ${t('report.tasks')}`}
                                />
                            ))}
                        </div>
                        <div className='report-heatmap__legend'>
                            <span>{t('report.less')}</span>
                            {[0, 1, 3, 5].map(v => (
                                <div key={v} className='report-heatmap__legend-cell'
                                     style={{ background: getHeatmapColor(v) }} />
                            ))}
                            <span>{t('report.more')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportModal;
