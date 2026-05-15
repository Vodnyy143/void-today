import {useEffect, useState} from 'react';
import {
    addTasksToSprint,
    completeSprint, deleteSprint,
    fetchBacklog,
    fetchSprint,
    fetchSprints,
    fetchSprintStats, removeTaskFromSprint,
    type Sprint,
    startSprint
} from "../store/slices/sprintsSlice.ts";
import {useAppDispatch, useAppSelector} from "../store/hooks.ts";
import {useSearchParams} from "react-router-dom";
import CreateSprintModal from "../components/modules/CreateSprintModal.tsx";

const STATUS_LABEL: Record<string, string> = {
    PLANNED: 'Запланирован',
    ACTIVE: 'Активный',
    COMPLETED: 'Завершён',
};

const STATUS_COLOR: Record<string, string> = {
    PLANNED: '#6b7280',
    ACTIVE: '#22c55e',
    COMPLETED: '#3b82f6',
};

const PRIORITY_COLOR: Record<string, string> = {
    HIGH: '#ef4444',
    MEDIUM: '#eab308',
    LOW: '#22c55e',
};

// ─── BurndownChart ────────────────────────────────────────────────────────────

const BurndownChart = ({ data, total }: { data: { date: string; remaining: number }[]; total: number }) => {
    if (!data.length) return null;

    const maxVal = total;
    const w = 400;
    const h = 120;
    const padL = 30;
    const padB = 20;
    const chartW = w - padL;
    const chartH = h - padB;

    const points = data.map((d, i) => {
        const x = padL + (i / Math.max(data.length - 1, 1)) * chartW;
        const y = chartH - (d.remaining / Math.max(maxVal, 1)) * chartH;
        return `${x},${y}`;
    });

    // Идеальная линия
    const idealPoints = [
        `${padL},0`,
        `${w},${chartH}`,
    ];

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className='sprint-burndown'>
            {/* Ideal line */}
            <polyline
                points={idealPoints.join(' ')}
                fill="none"
                stroke="rgba(59,130,246,0.3)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
            />
            {/* Actual line */}
            <polyline
                points={points.join(' ')}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeLinejoin="round"
            />
            {/* Area */}
            <polygon
                points={`${padL},${chartH} ${points.join(' ')} ${w},${chartH}`}
                fill="rgba(59,130,246,0.08)"
            />
        </svg>
    );
};

// ─── SprintCard ───────────────────────────────────────────────────────────────

const SprintCard = ({
                        sprint,
                        onSelect,
                        onStart,
                        onComplete,
                        onDelete,
                        isSelected,
                    }: {
    sprint: Sprint;
    onSelect: () => void;
    onStart: () => void;
    onComplete: () => void;
    onDelete: () => void;
    isSelected: boolean;
}) => {
    const taskCount = sprint._count?.tasks ?? sprint.tasks?.length ?? 0;
    const doneTasks = sprint.tasks?.filter((t: any) => t.status === 'DONE').length ?? 0;
    const progress = taskCount > 0 ? Math.round((doneTasks / taskCount) * 100) : 0;

    return (
        <div
            className={`sprint-card ${isSelected ? 'sprint-card--selected' : ''}`}
            onClick={onSelect}
        >
            <div className='sprint-card__header'>
                <span className='sprint-card__name'>{sprint.name}</span>
                <span
                    className='sprint-card__status'
                    style={{ color: STATUS_COLOR[sprint.status] }}
                >
                    {STATUS_LABEL[sprint.status]}
                </span>
            </div>

            {sprint.goal && (
                <p className='sprint-card__goal'>{sprint.goal}</p>
            )}

            {sprint.startDate && (
                <div className='sprint-card__dates'>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                        <path d="M3 10h18M8 2v4m8-4v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    {new Date(sprint.startDate).toLocaleDateString('ru', { day: 'numeric', month: 'short' })}
                    {sprint.endDate && ` — ${new Date(sprint.endDate).toLocaleDateString('ru', { day: 'numeric', month: 'short' })}`}
                </div>
            )}

            {taskCount > 0 && (
                <div className='sprint-card__progress'>
                    <div className='sprint-card__progress-bar'>
                        <div
                            className='sprint-card__progress-fill'
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <span className='sprint-card__progress-text'>{doneTasks}/{taskCount} задач</span>
                </div>
            )}

            <div className='sprint-card__actions' onClick={e => e.stopPropagation()}>
                {sprint.status === 'PLANNED' && (
                    <button className='sprint-card__btn sprint-card__btn--start' onClick={onStart}>
                        Запустить
                    </button>
                )}
                {sprint.status === 'ACTIVE' && (
                    <button className='sprint-card__btn sprint-card__btn--complete' onClick={onComplete}>
                        Завершить
                    </button>
                )}
                {sprint.status !== 'ACTIVE' && (
                    <button className='sprint-card__btn sprint-card__btn--delete' onClick={onDelete}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
                                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
};


const SprintsPage = () => {
    const dispatch = useAppDispatch();
    const [searchParams] = useSearchParams();
    const projectId = searchParams.get('project') ?? '';

    const { sprints, currentSprint, currentStats, backlog, status } = useAppSelector(s => s.sprints);
    // const { projects } = useAppSelector(s => s.projects);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'tasks' | 'stats' | 'backlog'>('tasks');
    const [selectedBacklogTasks, setSelectedBacklogTasks] = useState<Set<string>>(new Set());

    // const project = projects.find(p => p.id === projectId);

    useEffect(() => {
        if (projectId) {
            dispatch(fetchSprints(projectId));
            dispatch(fetchBacklog(projectId));
        }
    }, [projectId, dispatch]);

    const handleSelectSprint = (sprintId: string) => {
        dispatch(fetchSprint(sprintId));
        dispatch(fetchSprintStats(sprintId));
        setActiveTab('tasks');
    };

    const handleStart = async (sprintId: string) => {
        try {
            await dispatch(startSprint(sprintId)).unwrap();
        } catch (e: any) {
            alert(e);
        }
    };

    const handleComplete = async (sprintId: string) => {
        if (!confirm('Завершить спринт? Незавершённые задачи вернутся в бэклог.')) return;
        try {
            const result = await dispatch(completeSprint(sprintId)).unwrap();
            alert(`Спринт завершён! Выполнено ${result.summary.completionRate}% задач. В бэклог перенесено ${result.summary.movedToBacklog} задач.`);
            dispatch(fetchBacklog(projectId));
        } catch (e: any) {
            alert(e);
        }
    };

    const handleDelete = async (sprintId: string) => {
        if (!confirm('Удалить спринт?')) return;
        dispatch(deleteSprint(sprintId));
        if (currentSprint?.id === sprintId) {
            dispatch({ type: 'sprints/clearCurrentSprint' });
        }
    };

    const handleAddToSprint = async () => {
        if (!currentSprint || selectedBacklogTasks.size === 0) return;
        try {
            await dispatch(addTasksToSprint({
                sprintId: currentSprint.id,
                taskIds: Array.from(selectedBacklogTasks),
            })).unwrap();
            setSelectedBacklogTasks(new Set());
            dispatch(fetchBacklog(projectId));
            setActiveTab('tasks');
        } catch (e: any) {
            alert(e);
        }
    };

    const toggleBacklogTask = (taskId: string) => {
        const next = new Set(selectedBacklogTasks);
        next.has(taskId) ? next.delete(taskId) : next.add(taskId);
        setSelectedBacklogTasks(next);
    };

    if (!projectId) {
        return (
            <div className='sprints-page sprints-page--empty'>
                <p>Выберите проект в боковой панели для работы со спринтами</p>
            </div>
        );
    }

    return (
        <div className='sprints-page'>
            <div className='sprints-page__layout'>
                {/* ── Левая панель: список спринтов ── */}
                <div className='sprints-sidebar'>
                    <div className='sprints-sidebar__header'>
                        <h2 className='sprints-sidebar__title'>Спринты</h2>
                        <button
                            className='sprints-sidebar__create-btn'
                            onClick={() => setIsCreateOpen(true)}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                        </button>
                    </div>

                    {status === 'loading' && sprints.length === 0 && (
                        <div className='sprints-sidebar__loading'>Загрузка...</div>
                    )}

                    {sprints.length === 0 && status === 'idle' && (
                        <div className='sprints-sidebar__empty'>
                            Спринтов пока нет
                        </div>
                    )}

                    <div className='sprints-sidebar__list'>
                        {sprints.map(sprint => (
                            <SprintCard
                                key={sprint.id}
                                sprint={sprint}
                                isSelected={currentSprint?.id === sprint.id}
                                onSelect={() => handleSelectSprint(sprint.id)}
                                onStart={() => handleStart(sprint.id)}
                                onComplete={() => handleComplete(sprint.id)}
                                onDelete={() => handleDelete(sprint.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* ── Правая панель: детали спринта ── */}
                <div className='sprints-detail'>
                    {!currentSprint ? (
                        <div className='sprints-detail__empty'>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                            <p>Выберите спринт для просмотра деталей</p>
                        </div>
                    ) : (
                        <>
                            <div className='sprints-detail__header'>
                                <div>
                                    <h2 className='sprints-detail__name'>{currentSprint.name}</h2>
                                    {currentSprint.goal && (
                                        <p className='sprints-detail__goal'>{currentSprint.goal}</p>
                                    )}
                                </div>
                                <span
                                    className='sprints-detail__status'
                                    style={{ background: `${STATUS_COLOR[currentSprint.status]}22`, color: STATUS_COLOR[currentSprint.status] }}
                                >
                                    {STATUS_LABEL[currentSprint.status]}
                                </span>
                            </div>

                            {/* Вкладки */}
                            <div className='sprints-detail__tabs'>
                                {(['tasks', 'stats', 'backlog'] as const).map(tab => (
                                    <button
                                        key={tab}
                                        className={`sprints-detail__tab ${activeTab === tab ? 'sprints-detail__tab--active' : ''}`}
                                        onClick={() => setActiveTab(tab)}
                                    >
                                        {tab === 'tasks' && 'Задачи'}
                                        {tab === 'stats' && 'Статистика'}
                                        {tab === 'backlog' && `Бэклог (${backlog.length})`}
                                    </button>
                                ))}
                            </div>

                            {/* Задачи */}
                            {activeTab === 'tasks' && (
                                <div className='sprints-detail__tasks'>
                                    {currentSprint.tasks?.length === 0 && (
                                        <div className='sprints-detail__no-tasks'>
                                            Нет задач. Добавьте из бэклога.
                                        </div>
                                    )}
                                    {currentSprint.tasks?.map((task: any) => (
                                        <div key={task.id} className='sprint-task-row'>
                                            <span
                                                className='sprint-task-row__priority'
                                                style={{ background: PRIORITY_COLOR[task.priority] }}
                                            />
                                            <span className='sprint-task-row__title'>{task.title}</span>
                                            <span className={`sprint-task-row__status sprint-task-row__status--${task.status.toLowerCase()}`}>
                                                {task.status}
                                            </span>
                                            {task.assignee && (
                                                <div className='sprint-task-row__assignee' title={task.assignee.name ?? task.assignee.email}>
                                                    {task.assignee.avatar
                                                        ? <img src={task.assignee.avatar} alt="" />
                                                        : <span>{(task.assignee.name ?? task.assignee.email)[0].toUpperCase()}</span>
                                                    }
                                                </div>
                                            )}
                                            {currentSprint.status !== 'COMPLETED' && (
                                                <button
                                                    className='sprint-task-row__remove'
                                                    onClick={() => dispatch(removeTaskFromSprint({ sprintId: currentSprint.id, taskId: task.id }))}
                                                    title="Убрать из спринта"
                                                >
                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Статистика */}
                            {activeTab === 'stats' && currentStats && (
                                <div className='sprints-stats'>
                                    <div className='sprints-stats__cards'>
                                        <div className='sprints-stat-card'>
                                            <span className='sprints-stat-card__value' style={{ color: '#3b82f6' }}>
                                                {currentStats.completionRate}%
                                            </span>
                                            <span className='sprints-stat-card__label'>Выполнено</span>
                                        </div>
                                        <div className='sprints-stat-card'>
                                            <span className='sprints-stat-card__value'>{currentStats.total}</span>
                                            <span className='sprints-stat-card__label'>Всего задач</span>
                                        </div>
                                        <div className='sprints-stat-card'>
                                            <span className='sprints-stat-card__value' style={{ color: '#22c55e' }}>{currentStats.done}</span>
                                            <span className='sprints-stat-card__label'>Выполнено</span>
                                        </div>
                                        <div className='sprints-stat-card'>
                                            <span className='sprints-stat-card__value' style={{ color: '#f97316' }}>{currentStats.inProgress}</span>
                                            <span className='sprints-stat-card__label'>В работе</span>
                                        </div>
                                    </div>

                                    {currentStats.burndown.length > 0 && (
                                        <div className='sprints-stats__burndown'>
                                            <h4 className='sprints-stats__section-title'>Burndown chart</h4>
                                            <BurndownChart data={currentStats.burndown} total={currentStats.total} />
                                        </div>
                                    )}

                                    {currentStats.byAssignee.length > 0 && (
                                        <div className='sprints-stats__team'>
                                            <h4 className='sprints-stats__section-title'>По исполнителям</h4>
                                            {currentStats.byAssignee.map((a, i) => (
                                                <div key={i} className='sprints-assignee-row'>
                                                    <span className='sprints-assignee-row__name'>{a.name}</span>
                                                    <div className='sprints-assignee-row__bar-wrap'>
                                                        <div
                                                            className='sprints-assignee-row__bar'
                                                            style={{ width: `${a.total > 0 ? (a.done / a.total) * 100 : 0}%` }}
                                                        />
                                                    </div>
                                                    <span className='sprints-assignee-row__count'>{a.done}/{a.total}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Бэклог */}
                            {activeTab === 'backlog' && (
                                <div className='sprints-backlog'>
                                    {selectedBacklogTasks.size > 0 && (
                                        <div className='sprints-backlog__actions'>
                                            <button
                                                className='sprints-backlog__add-btn'
                                                onClick={handleAddToSprint}
                                            >
                                                Добавить в спринт ({selectedBacklogTasks.size})
                                            </button>
                                            <button
                                                className='sprints-backlog__clear-btn'
                                                onClick={() => setSelectedBacklogTasks(new Set())}
                                            >
                                                Сбросить
                                            </button>
                                        </div>
                                    )}

                                    {backlog.length === 0 && (
                                        <div className='sprints-backlog__empty'>
                                            Бэклог пуст — все задачи находятся в спринтах
                                        </div>
                                    )}

                                    {backlog.map((task: any) => (
                                        <div
                                            key={task.id}
                                            className={`sprint-task-row sprint-task-row--selectable ${selectedBacklogTasks.has(task.id) ? 'sprint-task-row--selected' : ''}`}
                                            onClick={() => toggleBacklogTask(task.id)}
                                        >
                                            <div className='sprint-task-row__checkbox'>
                                                {selectedBacklogTasks.has(task.id) && (
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                                                    </svg>
                                                )}
                                            </div>
                                            <span
                                                className='sprint-task-row__priority'
                                                style={{ background: PRIORITY_COLOR[task.priority] }}
                                            />
                                            <span className='sprint-task-row__title'>{task.title}</span>
                                            {task.assignee && (
                                                <div className='sprint-task-row__assignee'>
                                                    <span>{(task.assignee.name ?? task.assignee.email)[0].toUpperCase()}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <CreateSprintModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                projectId={projectId}
            />
        </div>
    );
};

export default SprintsPage;