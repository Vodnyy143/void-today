import { useState } from "react";
import { useAppSelector } from "../../store/hooks";
import { useDraggable } from '@dnd-kit/core';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    selectedDate: Date;
}

const DraggableSidebarTask = ({ task }: { task: any }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: task.id,
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className='task-list-sidebar__task'
        >
            <div className='task-list-sidebar__task-checkbox'>
                {task.status === 'DONE' && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M5 13l4 4L19 7"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"/>
                    </svg>
                )}
            </div>
            <div className='task-list-sidebar__task-content'>
                <span className='task-list-sidebar__task-title'>{task.title}</span>
                {task.priority !== 'MEDIUM' && (
                    <span className={`task-list-sidebar__task-priority task-list-sidebar__task-priority--${task.priority.toLowerCase()}`}>
                        {task.priority}
                    </span>
                )}
            </div>
            <svg className='task-list-sidebar__task-drag' width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="9" cy="5" r="1" fill="currentColor"/>
                <circle cx="9" cy="12" r="1" fill="currentColor"/>
                <circle cx="9" cy="19" r="1" fill="currentColor"/>
                <circle cx="15" cy="5" r="1" fill="currentColor"/>
                <circle cx="15" cy="12" r="1" fill="currentColor"/>
                <circle cx="15" cy="19" r="1" fill="currentColor"/>
            </svg>
        </div>
    );
};

const TaskListSidebar = ({ isOpen, onClose }: Props) => {
    const { tasks } = useAppSelector((state) => state.tasks);
    const [searchQuery, setSearchQuery] = useState('');

    if (!isOpen) return null;

    const availableTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    return (
        <aside className='task-list-sidebar'>
            <div className='task-list-sidebar__header'>
                <h2 className='task-list-sidebar__title'>Schedule Tasks</h2>
                <button className='task-list-sidebar__close' onClick={onClose}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                </button>
            </div>

            <div className='task-list-sidebar__search'>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                    <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className='task-list-sidebar__content'>
                {availableTasks.length === 0 ? (
                    <div className='task-list-sidebar__empty'>No tasks found</div>
                ) : (
                    availableTasks.map(task => (
                        <DraggableSidebarTask key={task.id} task={task} />
                    ))
                )}
            </div>
        </aside>
    );
};

export default TaskListSidebar;