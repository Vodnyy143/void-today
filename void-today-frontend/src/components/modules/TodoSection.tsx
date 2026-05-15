import {useAppDispatch, useAppSelector} from "../../store/hooks.ts";
import {useEffect, useMemo, useState} from "react";
import {useSearchParams} from "react-router-dom";
import {
    clearError,
    createTask,
    deleteTask, getTask,
    getTasks,
    setFilters,
    toggleTaskStatus
} from "../../store/slices/taskSlice.ts";
import ProjectMembersSidebar from "./ProjectMembersSidebar.tsx";
import {getProject} from "../../store/slices/projectSlice.ts";

type SortMode = 'project' | 'priority' | 'none';

const TodoSection = () => {
    const dispatch = useAppDispatch();
    const { tasks, isLoading, error, filters } = useAppSelector((state) => state.tasks);
    const { projects } = useAppSelector((state) => state.projects);
    const [assigneeId, setAssigneeId] = useState('');
    const { currentProject } = useAppSelector((state) => state.projects);

    const [searchParams] = useSearchParams();
    const [value, setValue] = useState('');
    const [sortMode, setSortMode] = useState<SortMode>('none');
    const [isMembersSidebarOpen, setIsMembersSidebarOpen] = useState(false);

    const currentView = searchParams.get('view') || 'all';
    const currentStatus = searchParams.get('status');
    const currentProjectId = searchParams.get('project');

    useEffect(() => {
        if (currentProjectId) {
            dispatch(getProject(currentProjectId));
        }
    }, [currentProjectId, dispatch]);

    const getViewTitle = () => {
        if (currentProjectId) {
            const project = projects.find(p => p.id === currentProjectId);
            return project?.name || 'Проект';
        }
        if (currentStatus === 'DONE') return 'Завершённые';
        switch (currentView) {
            case 'today': return 'Сегодня';
            case 'tomorrow': return 'Завтра';
            case 'week': return 'На этой неделе';
            default: return 'Задачи';
        }
    };

    const formatDueDate = (dueDate: string | undefined) => {
        if (!dueDate) return null;

        const date = new Date(dueDate);
        const day = date.getDate();
        const month = date.toLocaleString('en', { month: 'short' });

        return `${day} ${month}`;
    };

    const stats = useMemo(() => {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'DONE').length;
        const todoTasks = totalTasks - completedTasks;

        const estimatedTime = todoTasks * 5;
        const elapsedTime = completedTasks * 5;

        return {
            estimatedTime,
            todoTasks,
            elapsedTime,
            completedTasks,
        };
    }, [tasks]);

    useEffect(() => {
        const newFilters: any = {};

        if (currentView !== 'all') {
            newFilters.view = currentView as 'today' | 'tomorrow' | 'week';
        }

        if (currentStatus) {
            newFilters.status = currentStatus;
        }

        if (currentProjectId) {
            newFilters.projectId = currentProjectId;
        }

        dispatch(setFilters(newFilters));
    }, [currentView, currentStatus, currentProjectId, dispatch]);

    useEffect(() => {
        dispatch(getTasks(filters));
    }, [dispatch, filters]);

    useEffect(() => {
        if(error) {
            setTimeout(() => dispatch(clearError()), 3000);
        }
    }, [error, dispatch]);

    const handleAddTask = async () => {
        if (!value.trim()) return;

        const taskData: any = {
            title: value,
            type: 'MICRO' as const,
            priority: 'MEDIUM' as const,
        };

        if (currentView === 'today') {
            const today = new Date();
            today.setHours(23, 59, 59, 999);
            taskData.dueDate = today.toISOString();
        } else if (currentView === 'tomorrow') {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(23, 59, 59, 999);
            taskData.dueDate = tomorrow.toISOString();
        } else if (currentView === 'week') {
            const weekEnd = new Date();
            weekEnd.setDate(weekEnd.getDate() + 7);
            weekEnd.setHours(23, 59, 59, 999);
            taskData.dueDate = weekEnd.toISOString();
        }

        if (currentProjectId) {
            taskData.projectId = currentProjectId;
        }

        if (assigneeId) {
            taskData.assigneeId = assigneeId;
        }

        await dispatch(createTask(taskData));
        setValue('');
        setAssigneeId('');
    };

    const handleToggleTask = (taskId: string) => {
        dispatch(toggleTaskStatus(taskId));
    };

    const handleDeleteTask = (taskId: string) => {
        dispatch(deleteTask(taskId));
    };

    const groupedTasks = useMemo(() => {
        const sorted = [...tasks];

        if (sortMode === 'priority') {
            const groups: Record<string, typeof tasks> = {
                HIGH: [],
                MEDIUM: [],
                LOW: [],
            };

            sorted.forEach(task => {
                groups[task.priority].push(task);
            });

            return [
                { label: 'Высокий приоритет', key: 'HIGH', tasks: groups.HIGH, time: '0m' },
                { label: 'Средний приоритет', key: 'MEDIUM', tasks: groups.MEDIUM, time: '0m' },
                { label: 'Низкий приоритет', key: 'LOW', tasks: groups.LOW, time: '0m' },
            ].filter(g => g.tasks.length > 0);

        } else if (sortMode === 'project') {
            const groups: Record<string, typeof tasks> = {};
            const noProject: typeof tasks = [];

            sorted.forEach(task => {
                if (task.projectId) {
                    if (!groups[task.projectId]) {
                        groups[task.projectId] = [];
                    }
                    groups[task.projectId].push(task);
                } else {
                    noProject.push(task);
                }
            });

            const result = Object.entries(groups).map(([projectId, tasks]) => {
                const project = projects.find(p => p.id === projectId);
                return {
                    label: project?.name || 'Неизвестный проект',
                    key: projectId,
                    tasks,
                    time: '0m',
                };
            });

            if (noProject.length > 0) {
                result.push({
                    label: 'Задачи',
                    key: 'no-project',
                    tasks: noProject,
                    time: '0m',
                });
            }

            return result;
        }

        return null;
    }, [tasks, sortMode, projects]);

    const TaskCard = ({ task }: { task: any }) => {
        const dueDate = formatDueDate(task.dueDate);

        const handleCardClick = () => {
            dispatch(getTask(task.id));
        };

        return (
            <div
                className={`todo-card ${task.status === 'DONE' ? 'todo-card--done' : ''}`}
                onClick={handleCardClick}
            >
                <button
                    className='todo-card__checkbox'
                    onClick={(e) => {
                        e.stopPropagation();
                        handleToggleTask(task.id);
                    }}
                >
                    {task.status === 'DONE' && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M5 13l4 4L19 7"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"/>
                        </svg>
                    )}
                </button>

                <div className='todo-card__content'>
                    <div className='todo-card__header'>
                        <p className='todo-card__title'>{task.title}</p>
                        {dueDate && (
                            <span className='todo-card__date'>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                                <path d="M3 10h18M8 2v4m8-4v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                                {dueDate}
                        </span>
                        )}
                    </div>
                </div>

                <button
                    className='todo-card__delete'
                    onClick={(e) => {
                        e.stopPropagation(); // Предотвращаем открытие детального окна
                        handleDeleteTask(task.id);
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"/>
                    </svg>
                </button>
            </div>
        );
    };

    return (
        <section className='todo-section'>
            <div className='todo-section__header'>
                <p className='todo-section__view-btn'>{getViewTitle()}</p>
                <div className='todo-section__sort'>
                    <button
                        className={`todo-section__sort-btn ${sortMode === 'project' ? 'todo-section__sort-btn--active' : ''}`}
                        onClick={() => setSortMode(sortMode === 'project' ? 'none' : 'project')}
                        title="Сортировать по проектам"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"/>
                        </svg>
                    </button>
                    <button
                        className={`todo-section__sort-btn ${sortMode === 'priority' ? 'todo-section__sort-btn--active' : ''}`}
                        onClick={() => setSortMode(sortMode === 'priority' ? 'none' : 'priority')}
                        title="Сортировать по приоритету"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"/>
                        </svg>
                    </button>
                    {currentProjectId && (
                        <button
                            className={`todo-section__header-btn ${isMembersSidebarOpen ? 'todo-section__header-btn--active' : ''}`}
                            onClick={() => setIsMembersSidebarOpen(!isMembersSidebarOpen)}
                            title="Участники проекта"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            <div className='todo-section__stats'>
                <div className='todo-section__stat'>
                    <p className='todo-section__stat-value'>{stats.estimatedTime}<span className='todo-section__stat-unit'>m</span></p>
                    <p className='todo-section__stat-label'>Оценочное время</p>
                </div>
                <div className='todo-section__stat'>
                    <p className='todo-section__stat-value'>{stats.todoTasks}</p>
                    <p className='todo-section__stat-label'>Задач к выполнению</p>
                </div>
                <div className='todo-section__stat'>
                    <p className='todo-section__stat-value'>{stats.elapsedTime}<span className='todo-section__stat-unit'>m</span></p>
                    <p className='todo-section__stat-label'>Затраченное время</p>
                </div>
                <div className='todo-section__stat'>
                    <p className='todo-section__stat-value'>{stats.completedTasks}</p>
                    <p className='todo-section__stat-label'>Выполненные задачи</p>
                </div>
            </div>

            <div className='todo-section__create'>
                <div className='todo-section__input-wrapper'>
                    <svg className='todo-section__input-icon' width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <input
                        className='todo-section__input'
                        placeholder={`Добавить задачу в "${getViewTitle()}", нажмите Enter для сохранения`}
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleAddTask();
                            }
                        }}
                        disabled={isLoading}
                    />

                    {/* Исполнитель — показываем только в проекте с участниками */}
                    {currentProjectId && currentProject?.members && currentProject.members.length > 1 && (
                        <div className='todo-section__assignee'>
                            <select
                                className='todo-section__assignee-select'
                                value={assigneeId}
                                onChange={(e) => setAssigneeId(e.target.value)}
                                title="Исполнитель"
                            >
                                <option value=''>Без исполнителя</option>
                                {currentProject.members.map(member => (
                                    <option key={member.userId} value={member.userId}>
                                        {member.user.name || member.user.email}
                                    </option>
                                ))}
                            </select>

                            {/* Аватар выбранного исполнителя */}
                            {assigneeId && (() => {
                                const member = currentProject.members?.find(m => m.userId === assigneeId);
                                return member ? (
                                    <div className='todo-section__assignee-avatar' title={member.user.name || member.user.email}>
                                        {member.user.avatar
                                            ? <img src={member.user.avatar} alt="" />
                                            : <span>{(member.user.name || member.user.email)[0].toUpperCase()}</span>
                                        }
                                    </div>
                                ) : null;
                            })()}
                        </div>
                    )}
                </div>
            </div>

            {error && (
                <div className='todo-section__error'>{error}</div>
            )}

            <div className='todo-section__list'>
                {isLoading && tasks.length === 0 ? (
                    <div className='todo-section__loading'>Загрузка...</div>
                ) : tasks.length === 0 ? (
                    <div className='todo-section__empty'>
                        <p>Пока нет задач. Добавьте первую задачу выше!</p>
                    </div>
                ) : groupedTasks ? (
                    groupedTasks.map((group) => (
                        <div key={group.key} className='todo-section__group'>
                            <div className='todo-section__group-header'>
                                <h3 className='todo-section__group-title'>{group.label}</h3>
                                <span className='todo-section__group-time'>{group.time}</span>
                            </div>
                            <div className='todo-section__group-tasks'>
                                {group.tasks.map((task) => (
                                    <TaskCard key={task.id} task={task} />
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    tasks.map((task) => (
                        <TaskCard key={task.id} task={task} />
                    ))
                )}
            </div>
            {currentProjectId && (
                <ProjectMembersSidebar
                    isOpen={isMembersSidebarOpen}
                    onClose={() => setIsMembersSidebarOpen(false)}
                    projectId={currentProjectId}
                />
            )}
        </section>
    );
};

export default TodoSection;