import { getTasks, updateTask } from "../../store/slices/taskSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { useEffect, useState } from "react";
import TaskListSidebar from "./TaskListSidebar";
import {
    DndContext,
    type DragEndEvent,
    DragOverlay,
    type DragStartEvent,
    useSensor,
    useSensors,
    PointerSensor,
    closestCenter
} from '@dnd-kit/core';

const EventsSection = () => {
    const dispatch = useAppDispatch();
    const { tasks } = useAppSelector((state) => state.tasks);
    const { projects } = useAppSelector((state) => state.projects);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isTaskListOpen, setIsTaskListOpen] = useState(false);
    const [activeTask, setActiveTask] = useState<any>(null);

    // Настройка сенсоров для drag & drop
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Начинать перетаскивание после движения на 8px
            },
        })
    );

    useEffect(() => {
        dispatch(getTasks({}));
    }, [dispatch]);

    const hours = Array.from({ length: 24 }, (_, i) => i);

    const formatDate = () => {
        const today = new Date();
        const isToday = selectedDate.toDateString() === today.toDateString();

        if (isToday) {
            return 'Today';
        }

        const weekday = selectedDate.toLocaleString('en', { weekday: 'long' });
        return weekday;
    };

    const formatFullDate = () => {
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const goToPreviousDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() - 1);
        setSelectedDate(newDate);
    };

    const goToNextDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + 1);
        setSelectedDate(newDate);
    };

    // Фильтруем задачи по выбранной дате
    const scheduledTasks = tasks.filter(task => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        return taskDate.toDateString() === selectedDate.toDateString();
    });

    const getTasksForHour = (hour: number) => {
        return scheduledTasks.filter(task => {
            if (!task.dueDate) return false;
            const taskHour = new Date(task.dueDate).getHours();
            return taskHour === hour;
        });
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const task = tasks.find(t => t.id === active.id);
        setActiveTask(task);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);

        if (!over) return;

        const taskId = active.id as string;
        const targetHour = parseInt(over.id as string);

        if (isNaN(targetHour)) return;

        const newDate = new Date(selectedDate);
        newDate.setHours(targetHour, 0, 0, 0);

        await dispatch(updateTask({
            taskId: taskId,
            updates: {
                dueDate: newDate.toISOString()
            }
        }));

        dispatch(getTasks({}));
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className='events-wrapper'>
                <section className='events-section'>
                    <div className='events-section__header'>
                        <div className='events-section__nav'>
                            <h1 className='events-section__title'>{formatDate()}</h1>
                            <div className='events-section__controls'>
                                <button className='events-section__nav-btn' onClick={goToPreviousDay}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                                <button className='events-section__nav-btn' onClick={goToNextDay}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                                <input
                                    type="date"
                                    className='events-section__date-picker'
                                    value={formatFullDate()}
                                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                                />
                            </div>
                        </div>
                        <button
                            className='events-section__add-btn'
                            onClick={() => setIsTaskListOpen(!isTaskListOpen)}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                        </button>
                    </div>

                    <div className='events-section__subtitle'>
                        <span className='events-section__day-label'>Today</span>
                        <span className='events-section__weekday'>Tuesday</span>
                    </div>

                    <div className='events-section__timeline'>
                        <div className='events-section__time-labels'>
                            {hours.map(hour => (
                                <div key={hour} className='events-section__time-label'>
                                    {String(hour).padStart(2, '0')}:00
                                </div>
                            ))}
                        </div>

                        <div className='events-section__schedule'>
                            <div className='events-section__columns'>
                                <ScheduledColumn
                                    hours={hours}
                                    getTasksForHour={getTasksForHour}
                                    projects={projects}
                                />

                                <CompletedColumn
                                    hours={hours}
                                    tasks={tasks}
                                    selectedDate={selectedDate}
                                    projects={projects}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <TaskListSidebar
                    isOpen={isTaskListOpen}
                    onClose={() => setIsTaskListOpen(false)}
                    selectedDate={selectedDate}
                />

                <DragOverlay>
                    {activeTask ? (
                        <div
                            className='events-section__task events-section__task--dragging'
                            style={{
                                backgroundColor: 'rgba(59, 130, 246, 0.3)',
                                borderLeft: '3px solid #3b82f6'
                            }}
                        >
                            <div className='events-section__task-content'>
                                <span className='events-section__task-title'>{activeTask.title}</span>
                                <span className='events-section__task-duration'>25m</span>
                            </div>
                        </div>
                    ) : null}
                </DragOverlay>
            </div>
        </DndContext>
    );
};

// Компонент для Scheduled колонки
import { useDroppable } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';

const ScheduledColumn = ({ hours, getTasksForHour, projects }: any) => {
    return (
        <div className='events-section__column'>
            <div className='events-section__column-header'>Scheduled</div>
            <div className='events-section__slots'>
                {hours.map((hour: number) => (
                    <TimeSlot
                        key={hour}
                        hour={hour}
                        tasks={getTasksForHour(hour)}
                        projects={projects}
                    />
                ))}
            </div>
        </div>
    );
};

const TimeSlot = ({ hour, tasks, projects }: any) => {
    const { setNodeRef, isOver } = useDroppable({
        id: hour.toString(),
    });

    return (
        <div
            ref={setNodeRef}
            className={`events-section__slot ${isOver ? 'events-section__slot--over' : ''}`}
        >
            {tasks.map((task: any) => (
                <DraggableTask key={task.id} task={task} projects={projects} />
            ))}
        </div>
    );
};

const DraggableTask = ({ task, projects }: any) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task.id,
    });

    const project = projects.find((p: any) => p.id === task.projectId);
    const projectColor = project?.color || '#3b82f6';

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className='events-section__task'
            data-task-id={task.id}
        >
            <div
                className='events-section__task-bar'
                style={{
                    backgroundColor: task.projectId ? `${projectColor}33` : 'rgba(156, 163, 175, 0.2)',
                    borderLeft: `3px solid ${task.projectId ? projectColor : '#9ca3af'}`
                }}
            >
                <div className='events-section__task-content'>
                    <span className='events-section__task-title'>{task.title}</span>
                    <span className='events-section__task-duration'>25m</span>
                </div>
                <button
                    className='events-section__task-play'
                    onClick={(e) => {
                        e.stopPropagation();
                        // Handle play action
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                        <path d="M10 8l6 4-6 4V8z" fill="currentColor"/>
                    </svg>
                </button>
            </div>
        </div>
    );
};

const CompletedColumn = ({ hours, tasks, selectedDate, projects }: any) => {
    return (
        <div className='events-section__column events-section__column--completed'>
            <div className='events-section__column-header'>Completed</div>
            <div className='events-section__slots'>
                {hours.map((hour: number) => {
                    const completedTasks = tasks.filter((task: any) => {
                        if (!task.dueDate || task.status !== 'DONE') return false;
                        const taskDate = new Date(task.dueDate);
                        const taskHour = taskDate.getHours();
                        return taskDate.toDateString() === selectedDate.toDateString() && taskHour === hour;
                    });

                    return (
                        <div key={hour} className='events-section__slot'>
                            {completedTasks.map((task: any) => {
                                const project = projects.find((p: any) => p.id === task.projectId);
                                const projectColor = project?.color || '#3b82f6';
                                return (
                                    <div
                                        key={task.id}
                                        className='events-section__task events-section__task--completed'
                                        style={{
                                            backgroundColor: task.projectId ? `${projectColor}33` : 'rgba(156, 163, 175, 0.2)',
                                            borderLeft: `3px solid ${task.projectId ? projectColor : '#9ca3af'}`
                                        }}
                                    >
                                        <div className='events-section__task-content'>
                                            <span className='events-section__task-title'>{task.title}</span>
                                            <span className='events-section__task-duration'>25m</span>
                                        </div>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <path d="M5 13l4 4L19 7"
                                                  stroke="currentColor"
                                                  strokeWidth="2"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default EventsSection;