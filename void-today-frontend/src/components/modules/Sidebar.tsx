import {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "../../store/hooks.ts";
import {clearError, createProject, getProjects} from "../../store/slices/projectSlice.ts";
import CreateProjectModal from "./CreateProjectModal.tsx";

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();

    const { projects, isLoading, error } = useAppSelector((state) => state.projects);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        dispatch(getProjects());
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            setTimeout(() => dispatch(clearError()), 3000);
        }
    }, [error, dispatch]);

    const handleCreateProject = async (data: { name: string; color: string }) => {
        await dispatch(createProject(data));
    };

    const filteredProjects = projects.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isActive = (path: string) => {
        if (path.includes('?')) {
            return location.pathname + location.search === path;
        }
        return location.pathname === path;
    };

    return (
        <>
            <aside className='sidebar'>
                <div className='sidebar__search'>
                    <svg className='sidebar__search-icon' width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                        <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <input
                        className='sidebar__search-input'
                        placeholder='Search'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className='sidebar__section'>
                    <button
                        className={`sidebar__item ${isActive('/todos?view=today') ? 'sidebar__item--active' : ''}`}
                        onClick={() => navigate('/todos?view=today')}
                    >
                        <svg className='sidebar__item-icon' width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ color: '#10b981' }}>
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                            <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <span className='sidebar__item-text'>Today</span>
                        <span className='sidebar__item-count'>0m</span>
                        <span className='sidebar__item-badge'>4</span>
                    </button>

                    <button
                        className={`sidebar__item ${isActive('/todos?view=tomorrow') ? 'sidebar__item--active' : ''}`}
                        onClick={() => navigate('/todos?view=tomorrow')}
                    >
                        <svg className='sidebar__item-icon' width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ color: '#f97316' }}>
                            <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <span className='sidebar__item-text'>Tomorrow</span>
                        <span className='sidebar__item-count'>0m</span>
                        <span className='sidebar__item-badge'>0</span>
                    </button>

                    <button
                        className={`sidebar__item ${isActive('/todos?view=week') ? 'sidebar__item--active' : ''}`}
                        onClick={() => navigate('/todos?view=week')}
                    >
                        <svg className='sidebar__item-icon' width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ color: '#8b5cf6' }}>
                            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                            <path d="M3 10h18M8 2v4m8-4v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <span className='sidebar__item-text'>This Week</span>
                        <span className='sidebar__item-count'>0m</span>
                        <span className='sidebar__item-badge'>0</span>
                    </button>

                    <button
                        className={`sidebar__item ${isActive('/events') ? 'sidebar__item--active' : ''}`}
                        onClick={() => navigate('/events')}
                    >
                        <svg className='sidebar__item-icon' width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ color: '#14b8a6' }}>
                            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                            <path d="M3 10h18M8 2v4m8-4v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <span className='sidebar__item-text'>Events</span>
                        <span className='sidebar__item-count'>0m</span>
                        <span className='sidebar__item-badge'>0</span>
                    </button>

                    <button
                        className={`sidebar__item ${isActive('/organizations') ? 'sidebar__item--active' : ''}`}
                        onClick={() => navigate('/organizations')}
                    >
                        <svg className='sidebar__item-icon' width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ color: '#f59e0b' }}>
                            <path d="M3 21h18M3 7v14M21 7v14M6 7V5a2 2 0 012-2h8a2 2 0 012 2v2M9 21v-4a3 3 0 016 0v4"
                                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className='sidebar__item-text'>Organizations</span>
                    </button>

                    <button
                        className={`sidebar__item ${isActive('/todos?status=DONE') ? 'sidebar__item--active' : ''}`}
                        onClick={() => navigate('/todos?status=DONE')}
                    >
                        <svg className='sidebar__item-icon' width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ color: '#6b7280' }}>
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                            <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <span className='sidebar__item-text'>Completed</span>
                    </button>

                    <button
                        className={`sidebar__item ${isActive('/todos') ? 'sidebar__item--active' : ''}`}
                        onClick={() => navigate('/todos')}
                    >
                        <svg className='sidebar__item-icon' width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ color: '#3b82f6' }}>
                            <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                            <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                            <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                            <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        <span className='sidebar__item-text'>Tasks</span>
                        <span className='sidebar__item-count'>0m</span>
                        <span className='sidebar__item-badge'>1</span>
                    </button>
                </div>

                <div className='sidebar__divider'></div>

                <div className='sidebar__section'>
                    {isLoading ? (
                        <div className='sidebar__loading'>Loading projects...</div>
                    ) : filteredProjects.length === 0 ? (
                        <div className='sidebar__empty'>No projects found</div>
                    ) : (
                        filteredProjects.map((project) => (
                            <button
                                key={project.id}
                                className={`sidebar__item ${isActive(`/todos?project=${project.id}`) ? 'sidebar__item--active' : ''}`}
                                onClick={() => navigate(`/todos?project=${project.id}`)}
                            >
                                <div
                                    className='sidebar__item-dot'
                                    style={{ backgroundColor: project.color || '#3b82f6' }}
                                />
                                <span className='sidebar__item-text'>{project.name}</span>
                                <span className='sidebar__item-count'>0m</span>
                                <span className='sidebar__item-badge'>{project.taskCount || 0}</span>
                            </button>
                        ))
                    )}
                </div>

                <button
                    className='sidebar__add-project'
                    onClick={() => setIsCreateModalOpen(true)}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <span>Add Project</span>
                </button>
            </aside>

            <CreateProjectModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateProject}
            />
        </>
    );
};

export default Sidebar;