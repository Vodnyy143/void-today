import {useAppDispatch, useAppSelector} from "../../store/hooks.ts";
import {clearCurrentTask} from "../../store/slices/taskSlice.ts";

const TaskDetailSidebar = () => {
    const dispatch = useAppDispatch();
    const { currentTask } = useAppSelector((state) => state.tasks);
    const { projects } = useAppSelector((state) => state.projects);

    if (!currentTask) return null;

    const handleClose = () => {
        dispatch(clearCurrentTask());
    };

    const project = projects.find(p => p.id === currentTask.projectId);

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'None';
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleString('en', { month: 'short' });
        const weekday = date.toLocaleString('en', { weekday: 'short' });
        return `${weekday}, ${day} ${month}`;
    };

    const formatCreatedDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleString('en', { month: 'short' });
        return `Created on ${day} ${month}`;
    };

    return (
        <aside className='task-detail'>
            <div className='task-detail__header'>
                <button className='task-detail__close' onClick={handleClose}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                </button>
            </div>

            <div className='task-detail__content'>
                <div className='task-detail__title-section'>
                    <button className='task-detail__checkbox'>
                        {currentTask.status === 'DONE' && (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M5 13l4 4L19 7"
                                      stroke="currentColor"
                                      strokeWidth="3"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"/>
                            </svg>
                        )}
                    </button>
                    <h2 className='task-detail__title'>{currentTask.title}</h2>
                </div>

                <button className='task-detail__tags-btn'>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"/>
                        <circle cx="7" cy="7" r="1" fill="currentColor"/>
                    </svg>
                    Tags
                </button>

                <div className='task-detail__section'>
                    <div className='task-detail__row'>
                        <div className='task-detail__row-icon'>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                        </div>
                        <div className='task-detail__row-content'>
                            <span className='task-detail__row-label'>Pomodoro</span>
                            <span className='task-detail__row-value'>
                                <span className='task-detail__pomodoro'>
                                    <span className='task-detail__pomodoro-done'>0</span>
                                    <span className='task-detail__pomodoro-separator'>/</span>
                                    <span className='task-detail__pomodoro-total'>0</span>
                                </span>
                                <span className='task-detail__row-time'>= 25m</span>
                            </span>
                        </div>
                    </div>

                    <div className='task-detail__row'>
                        <div className='task-detail__row-icon'>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                                <path d="M3 10h18M8 2v4m8-4v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                        </div>
                        <div className='task-detail__row-content'>
                            <span className='task-detail__row-label'>Due Date</span>
                            <span className={`task-detail__row-value ${currentTask.dueDate ? 'task-detail__row-value--date' : ''}`}>
                                {formatDate(currentTask.dueDate)}
                            </span>
                        </div>
                    </div>

                    <div className='task-detail__row'>
                        <div className='task-detail__row-icon'>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <div className='task-detail__row-content'>
                            <span className='task-detail__row-label'>Project</span>
                            <span className='task-detail__row-value'>
                                {project ? project.name : 'None'}
                            </span>
                        </div>
                    </div>

                    <div className='task-detail__row'>
                        <div className='task-detail__row-icon'>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <div className='task-detail__row-content'>
                            <span className='task-detail__row-label'>Reminder</span>
                            <span className='task-detail__row-value'>None</span>
                        </div>
                    </div>

                    <div className='task-detail__row'>
                        <div className='task-detail__row-icon'>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <div className='task-detail__row-content'>
                            <span className='task-detail__row-label'>Repeat</span>
                            <span className='task-detail__row-value'>None</span>
                        </div>
                    </div>
                </div>

                <button className='task-detail__subtask-btn'>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Add a subtask...
                </button>

                <div className='task-detail__note'>
                    <span className='task-detail__note-placeholder'>Add a note...</span>
                </div>
            </div>

            <div className='task-detail__footer'>
                <span className='task-detail__created'>{formatCreatedDate(currentTask.createdAt)}</span>
                <div className='task-detail__actions'>
                    <button className='task-detail__action-btn' title="Comments">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"/>
                        </svg>
                    </button>
                    <button className='task-detail__action-btn' title="Delete">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default TaskDetailSidebar;