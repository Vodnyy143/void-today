import React, {useEffect, useRef, useState} from 'react';
import {
    createBoard, createColumn, deleteBoard, deleteColumn,
    fetchBoard,
    fetchBoards,
    type KanbanColumn,
    type KanbanTask, moveTask,
    optimisticMoveTask
} from "../store/slices/kanbanSlice.ts";
import {useAppDispatch, useAppSelector} from "../store/hooks.ts";
import {useSearchParams} from "react-router-dom";
import {getTasks} from "../store/slices/taskSlice.ts";
import {useTranslation} from "../i18n/useTranslation.ts";


const PRIORITY_COLOR: Record<string, string> = {
    HIGH: '#ef4444',
    MEDIUM: '#eab308',
    LOW: '#22c55e',
};

const TaskCard = ({
                      task,
                      onDragStart,
                  }: {
    task: KanbanTask;
    onDragStart: (e: React.DragEvent, taskId: string, fromColumnId: string) => void;
}) => {
    const { language } = useTranslation();
    const completedCheckpoints = task.checkpoints?.filter(c => c.done).length ?? 0;
    const totalCheckpoints = task.checkpoints?.length ?? 0;

    return (
        <div
            className='kanban-task'
            draggable
            onDragStart={(e) => onDragStart(e, task.id, task.kanbanColumnId ?? '')}
            style={{ borderLeft: `3px solid ${PRIORITY_COLOR[task.priority] ?? '#6b7280'}` }}
        >
            <p className='kanban-task__title'>{task.title}</p>

            <div className='kanban-task__meta'>
                {task.dueDate && (
                    <span className='kanban-task__date'>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                            <path d="M3 10h18M8 2v4m8-4v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        {new Date(task.dueDate).toLocaleDateString(language, { day: 'numeric', month: 'short' })}
                    </span>
                )}

                {totalCheckpoints > 0 && (
                    <span className='kanban-task__checkpoints'>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        {completedCheckpoints}/{totalCheckpoints}
                    </span>
                )}

                {task.assignee && (
                    <div className='kanban-task__assignee' title={task.assignee.name ?? task.assignee.email}>
                        {task.assignee.avatar
                            ? <img src={task.assignee.avatar} alt="" />
                            : <span>{(task.assignee.name ?? task.assignee.email)[0].toUpperCase()}</span>
                        }
                    </div>
                )}
            </div>
        </div>
    );
};

const Column = ({
                    column,
                    onDragStart,
                    onDrop,
                    onDragOver,
                    onDeleteColumn,
                    canManage,
                }: {
    column: KanbanColumn;
    onDragStart: (e: React.DragEvent, taskId: string, fromColumnId: string) => void;
    onDrop: (e: React.DragEvent, toColumnId: string) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDeleteColumn: (columnId: string) => void;
    canManage: boolean;
}) => {
    const { t } = useTranslation();
    const [isDragOver, setIsDragOver] = useState(false);
    const isAtLimit = column.wipLimit !== null && column.wipLimit !== undefined
        && column.tasks.length >= column.wipLimit;

    return (
        <div className={`kanban-column ${isDragOver ? 'kanban-column--drag-over' : ''}`}>
            <div className='kanban-column__header'>
                <div className='kanban-column__title-wrap'>
                    <span className='kanban-column__name'>{column.name}</span>
                    <span className={`kanban-column__count ${isAtLimit ? 'kanban-column__count--limit' : ''}`}>
                        {column.tasks.length}
                        {column.wipLimit ? `/${column.wipLimit}` : ''}
                    </span>
                </div>
                {canManage && (
                    <button
                        className='kanban-column__delete'
                        onClick={() => onDeleteColumn(column.id)}
                        title={t('kanban.deleteColumn')}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </button>
                )}
            </div>

            {isAtLimit && (
                <div className='kanban-column__wip-warning'>
                    {t('kanban.wipReached')}
                </div>
            )}

            <div
                className='kanban-column__tasks'
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); onDragOver(e); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => { setIsDragOver(false); onDrop(e, column.id); }}
            >
                {column.tasks.map(task => (
                    <TaskCard key={task.id} task={task} onDragStart={onDragStart} />
                ))}
                {column.tasks.length === 0 && (
                    <div className='kanban-column__empty'>{t('kanban.dropHere')}</div>
                )}
            </div>
        </div>
    );
};

const KanbanPage = () => {
    const dispatch = useAppDispatch();
    const [searchParams] = useSearchParams();
    const projectId = searchParams.get('project') ?? '';
    const { t } = useTranslation();

    const { boards, currentBoard, status } = useAppSelector(s => s.kanban);
    const { projects } = useAppSelector(s => s.projects);

    const [isCreatingBoard, setIsCreatingBoard] = useState(false);
    const [newBoardName, setNewBoardName] = useState('');
    const [isAddingColumn, setIsAddingColumn] = useState(false);
    const [newColumnName, setNewColumnName] = useState('');
    const [newColumnWip, setNewColumnWip] = useState('');

    const [showBacklog, setShowBacklog] = useState(false);
    const { tasks } = useAppSelector(s => s.tasks);

    const dragTaskId = useRef<string>('');
    const dragFromColumnId = useRef<string>('');

    const project = projects.find(p => p.id === projectId);

    useEffect(() => {
        if (projectId) dispatch(fetchBoards(projectId));
    }, [projectId, dispatch]);

    useEffect(() => {
        if (projectId) {
            dispatch(getTasks({ projectId }));
        }
    }, [projectId, dispatch]);

    const boardBacklog = tasks.filter(t => !t.kanbanColumnId && t.projectId === projectId);

    const handleSelectBoard = (boardId: string) => {
        dispatch(fetchBoard(boardId));
    };

    const handleCreateBoard = async () => {
        if (!newBoardName.trim() || !projectId) return;
        await dispatch(createBoard({ name: newBoardName.trim(), projectId }));
        setNewBoardName('');
        setIsCreatingBoard(false);
    };

    const handleDeleteBoard = async (boardId: string) => {
        if (confirm(t('kanban.confirmDeleteBoard'))) {
            dispatch(deleteBoard(boardId));
        }
    };

    const handleAddColumn = async () => {
        if (!newColumnName.trim() || !currentBoard) return;
        await dispatch(createColumn({
            boardId: currentBoard.id,
            name: newColumnName.trim(),
            wipLimit: newColumnWip ? parseInt(newColumnWip) : undefined,
        }));
        setNewColumnName('');
        setNewColumnWip('');
        setIsAddingColumn(false);
    };

    const handleDeleteColumn = (columnId: string) => {
        if (confirm(t('kanban.confirmDeleteColumn'))) {
            dispatch(deleteColumn(columnId));
        }
    };

    const handleDragStart = (e: React.DragEvent, taskId: string, fromColumnId: string) => {
        dragTaskId.current = taskId;
        dragFromColumnId.current = fromColumnId;
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDrop = async (e: React.DragEvent, toColumnId: string) => {
        e.preventDefault();
        const taskId = dragTaskId.current;
        const fromColumnId = dragFromColumnId.current;
        if (!taskId) return;

        if (fromColumnId === 'backlog') {
            try {
                await dispatch(moveTask({ taskId, columnId: toColumnId })).unwrap();
                dispatch(fetchBoard(currentBoard!.id));
                dispatch(getTasks({ projectId }));
            } catch (err: any) {
                alert(err || t('kanban.errorMove'));
            }
            dragTaskId.current = '';
            dragFromColumnId.current = '';
            return;
        }

        if (fromColumnId === toColumnId) return;

        dispatch(optimisticMoveTask({ taskId, fromColumnId, toColumnId }));
        try {
            await dispatch(moveTask({ taskId, columnId: toColumnId })).unwrap();
        } catch (err: any) {
            dispatch(optimisticMoveTask({ taskId, fromColumnId: toColumnId, toColumnId: fromColumnId }));
            alert(err || t('kanban.errorMove'));
        }
        dragTaskId.current = '';
        dragFromColumnId.current = '';
    };

    if (!projectId) {
        return (
            <div className='kanban-page kanban-page--empty'>
                <p>{t('kanban.selectProject')}</p>
            </div>
        );
    }

    return (
        <div className='kanban-page'>
            <div className='kanban-page__header'>
                <div className='kanban-page__title-wrap'>
                    <h1 className='kanban-page__title'>
                        {project?.name ?? 'Kanban'}
                    </h1>
                    <span className='kanban-page__subtitle'>{t('kanban.subtitle')}</span>
                </div>
            </div>

            <div className='kanban-boards-list'>
                {boards.map(board => (
                    <button
                        key={board.id}
                        className={`kanban-board-tab ${currentBoard?.id === board.id ? 'kanban-board-tab--active' : ''}`}
                        onClick={() => handleSelectBoard(board.id)}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                            <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                            <rect x="3" y="14" width="7" height="11" rx="1" stroke="currentColor" strokeWidth="2"/>
                            <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        {board.name}
                        <span
                            className='kanban-board-tab__delete'
                            onClick={(e) => { e.stopPropagation(); handleDeleteBoard(board.id); }}
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                        </span>
                    </button>
                ))}

                {isCreatingBoard ? (
                    <div className='kanban-board-create'>
                        <input
                            className='kanban-board-create__input'
                            placeholder={t('kanban.boardNamePlaceholder')}
                            value={newBoardName}
                            onChange={e => setNewBoardName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleCreateBoard()}
                            autoFocus
                        />
                        <button onClick={handleCreateBoard}>{t('common.create')}</button>
                        <button onClick={() => { setIsCreatingBoard(false); setNewBoardName(''); }}>✕</button>
                    </div>
                ) : (
                    <button className='kanban-board-tab kanban-board-tab--new' onClick={() => setIsCreatingBoard(true)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        {t('kanban.newBoard')}
                    </button>
                )}
            </div>

            {currentBoard && (
                <button
                    className={`kanban-backlog-toggle ${showBacklog ? 'kanban-backlog-toggle--active' : ''}`}
                    onClick={() => setShowBacklog(!showBacklog)}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    {t('kanban.backlog')} ({boardBacklog.length})
                </button>
            )}

            {status === 'loading' && !currentBoard && (
                <div className='kanban-page__loading'>{t('kanban.loading')}</div>
            )}

            {!currentBoard && status === 'idle' && boards.length === 0 && (
                <div className='kanban-page__empty-board'>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                        <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                        <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                        <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                    <p>{t('kanban.noBoards')}</p>
                </div>
            )}

            {currentBoard && (
                <div className='kanban-workspace'>
                    {showBacklog && (
                        <div className='kanban-backlog'>
                            <div className='kanban-backlog__header'>
                                <span>{t('kanban.projectTasks')}</span>
                                <button onClick={() => setShowBacklog(false)}>✕</button>
                            </div>
                            <p className='kanban-backlog__hint'>
                                {t('kanban.dragHint')}
                            </p>
                            <div className='kanban-backlog__list'>
                                {boardBacklog.length === 0 && (
                                    <div className='kanban-backlog__empty'>
                                        {t('kanban.allOnBoard')}
                                    </div>
                                )}
                                {boardBacklog.map(task => (
                                    <div
                                        key={task.id}
                                        className='kanban-backlog-task'
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, task.id, 'backlog')}
                                        style={{ borderLeft: `3px solid ${PRIORITY_COLOR[task.priority] ?? '#6b7280'}` }}
                                    >
                                        <span className='kanban-backlog-task__title'>{task.title}</span>
                                        {task.assigneeId && (
                                            <span className='kanban-backlog-task__meta'>
                                    {task.dueDate && new Date(task.dueDate).toLocaleDateString('ru', { day: 'numeric', month: 'short' })}
                                </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}


                    <div className='kanban-board'>
                        {currentBoard.columns
                            .slice()
                            .sort((a, b) => a.order - b.order)
                            .map(column => (
                                <Column
                                    key={column.id}
                                    column={column}
                                    onDragStart={handleDragStart}
                                    onDrop={handleDrop}
                                    onDragOver={e => e.preventDefault()}
                                    onDeleteColumn={handleDeleteColumn}
                                    canManage={true}
                                />
                            ))
                        }

                        {isAddingColumn ? (
                            <div className='kanban-add-column'>
                                <input
                                    className='kanban-add-column__input'
                                    placeholder={t('kanban.columnNamePlaceholder')}
                                    value={newColumnName}
                                    onChange={e => setNewColumnName(e.target.value)}
                                    autoFocus
                                />
                                <input
                                    className='kanban-add-column__input kanban-add-column__input--wip'
                                    placeholder={t('kanban.wipLimitPlaceholder')}
                                    type='number'
                                    min='1'
                                    value={newColumnWip}
                                    onChange={e => setNewColumnWip(e.target.value)}
                                />
                                <div className='kanban-add-column__actions'>
                                    <button
                                        className='kanban-add-column__btn kanban-add-column__btn--confirm'
                                        onClick={handleAddColumn}
                                    >
                                        {t('kanban.addColumnBtn')}
                                    </button>
                                    <button
                                        className='kanban-add-column__btn kanban-add-column__btn--cancel'
                                        onClick={() => { setIsAddingColumn(false); setNewColumnName(''); setNewColumnWip(''); }}
                                    >
                                        {t('common.cancel')}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                className='kanban-add-column-btn'
                                onClick={() => setIsAddingColumn(true)}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                                {t('kanban.addColumnBtn')}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default KanbanPage;
