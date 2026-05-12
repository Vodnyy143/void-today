import {useAppDispatch, useAppSelector} from "../../store/hooks.ts";
import {useEffect, useMemo, useState} from "react";
import {useSearchParams} from "react-router-dom";
import {
    clearError,
    createTask,
    deleteTask,
    getTasks,
    setFilters,
    toggleTaskStatus
} from "../../store/slices/taskSlice.ts";

type SortMode = 'project' | 'priority' | 'none';

const TodoSection = () => {
    const dispatch = useAppDispatch();
    const { tasks, isLoading, error, filters } = useAppSelector((state) => state.tasks);
    const { projects } = useAppSelector((state) => state.projects);

    const [searchParams] = useSearchParams();
    const [value, setValue] = useState('');
    const [sortMode, setSortMode] = useState<SortMode>('none');

    // Определяем текущий вид и название
    const currentView = searchParams.get('view') || 'all';
    const currentStatus = searchParams.get('status');
    const currentProjectId = searchParams.get('project');

    const getViewTitle = () => {
        if (currentProjectId) {
            const project = projects.find(p => p.id === currentProjectId);
            return project?.name || 'Project';
        }
        if (currentStatus === 'DONE') return 'Completed'; // Изменено с 'completed' на 'DONE'
        switch (currentView) {
            case 'today': return 'Today';
            case 'tomorrow': return 'Tomorrow';
            case 'week': return 'This Week';
            default: return 'Tasks';
        }
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
            newFilters.status = currentStatus; // Убрал 'as any' для лучшей типизации
        }

        if (currentProjectId) {
            newFilters.projectId = currentProjectId;
        }

        console.log('Setting filters:', newFilters); // Отладка
        dispatch(setFilters(newFilters));
    }, [currentView, currentStatus, currentProjectId, dispatch]);

    useEffect(() => {
        console.log('Fetching tasks with filters:', filters); // Отладка
        dispatch(getTasks(filters));
    }, [dispatch, filters]);

    useEffect(() => {
        if(error) {
            setTimeout(() => dispatch(clearError()), 3000);
        }
    }, [error, dispatch]);

    const handleAddTask = async () => {
        if(!value.trim()) return;

        const taskData: any = {
            title: value,
            type: 'MICRO' as const,
            priority: 'MEDIUM' as const,
        };

        if (currentView === 'today') {
            const today = new Date();
            today.setHours(23, 59, 59, 999); // Конец сегодняшнего дня
            taskData.dueDate = today.toISOString();
        } else if (currentView === 'tomorrow') {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(23, 59, 59, 999); // Конец завтрашнего дня
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

        await dispatch(createTask(taskData));
        setValue('');
    };

    const handleToggleTask = (taskId: string) => {
        dispatch(toggleTaskStatus(taskId));
    };

    const handleDeleteTask = (taskId: string) => {
        dispatch(deleteTask(taskId));
    };

    const getSortedTasks = () => {
        let sorted = [...tasks];

        if (sortMode === 'priority') {
            const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
            sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        } else if (sortMode === 'project') {
            sorted.sort((a, b) => {
                if (!a.projectId && !b.projectId) return 0;
                if (!a.projectId) return 1;
                if (!b.projectId) return -1;
                return a.projectId.localeCompare(b.projectId);
            });
        }

        return sorted;
    };

    const sortedTasks = getSortedTasks();

    return (
        <section className='todo-section'>
            <div className='todo-section__header'>
                <p className='todo-section__view-btn'>{getViewTitle()}</p>
                <div className='todo-section__sort'>
                    <button
                        className={`todo-section__sort-btn ${sortMode === 'project' ? 'todo-section__sort-btn--active' : ''}`}
                        onClick={() => setSortMode(sortMode === 'project' ? 'none' : 'project')}
                        title="Sort by Project"
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
                        title="Sort by Priority"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>

            <div className='todo-section__stats'>
                <div className='todo-section__stat'>
                    <p className='todo-section__stat-value'>{stats.estimatedTime}<span className='todo-section__stat-unit'>m</span></p>
                    <p className='todo-section__stat-label'>Estimated Time</p>
                </div>
                <div className='todo-section__stat'>
                    <p className='todo-section__stat-value'>{stats.todoTasks}</p>
                    <p className='todo-section__stat-label'>Tasks to be Completed</p>
                </div>
                <div className='todo-section__stat'>
                    <p className='todo-section__stat-value'>{stats.elapsedTime}<span className='todo-section__stat-unit'>m</span></p>
                    <p className='todo-section__stat-label'>Elapsed Time</p>
                </div>
                <div className='todo-section__stat'>
                    <p className='todo-section__stat-value'>{stats.completedTasks}</p>
                    <p className='todo-section__stat-label'>Completed Tasks</p>
                </div>
            </div>

            <div className='todo-section__create'>
                <div className='todo-section__input-wrapper'>
                    <svg className='todo-section__input-icon' width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5v14m-7-7h14"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"/>
                    </svg>
                    <input
                        className='todo-section__input'
                        placeholder={`Add a task to "${getViewTitle()}", press Enter to save`}
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
                </div>
            </div>

            {error && (
                <div className='todo-section__error'>{error}</div>
            )}

            <div className='todo-section__list'>
                {isLoading && tasks.length === 0 ? (
                    <div className='todo-section__loading'>Loading...</div>
                ) : sortedTasks.length === 0 ? (
                    <div className='todo-section__empty'>
                        <p>No tasks yet. Add your first task above!</p>
                    </div>
                ) : (
                    sortedTasks.map((task) => (
                        <div
                            key={task.id}
                            className={`todo-card ${task.status === 'DONE' ? 'todo-card--done' : ''}`}
                        >
                            <button
                                className='todo-card__checkbox'
                                onClick={() => handleToggleTask(task.id)}
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
                                <p className='todo-card__title'>{task.title}</p>
                                {task.priority !== 'MEDIUM' && (
                                    <span className={`todo-card__priority todo-card__priority--${task.priority.toLowerCase()}`}>
                                        {task.priority}
                                    </span>
                                )}
                            </div>

                            <button
                                className='todo-card__delete'
                                onClick={() => handleDeleteTask(task.id)}
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
                    ))
                )}
            </div>
        </section>
    );
};

export default TodoSection;