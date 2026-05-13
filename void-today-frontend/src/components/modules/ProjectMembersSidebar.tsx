import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
    getProject,
    addMember,
    removeMember,
    updateMemberRole,
    type ProjectRole,
} from '../../store/slices/projectSlice';
import { fetchOrganization } from '../../store/slices/organizationSlice';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
}

const ProjectMembersSidebar = ({ isOpen, onClose, projectId }: Props) => {
    const dispatch = useAppDispatch();
    const { currentProject } = useAppSelector((state) => state.projects);
    const { currentOrg } = useAppSelector((state) => state.organizations);
    const { user } = useAppSelector((state) => state.auth);
    const [showOrgMembers, setShowOrgMembers] = useState(false);

    useEffect(() => {
        if (isOpen && projectId) {
            dispatch(getProject(projectId));
        }
    }, [isOpen, projectId, dispatch]);

    // Загружаем участников организации если проект привязан к орг
    useEffect(() => {
        if (currentProject?.orgId) {
            dispatch(fetchOrganization(currentProject.orgId));
        }
    }, [currentProject?.orgId, dispatch]);

    if (!isOpen) return null;

    const myRole = currentProject?.members?.find(m => m.userId === user?.id)?.role;
    const canManage = myRole === 'MANAGER';

    // Участники орг которых ещё нет в проекте
    const orgMembersNotInProject = currentOrg?.members?.filter(orgMember =>
        !currentProject?.members?.some(pm => pm.userId === orgMember.userId)
    ) ?? [];

    const handleAddFromOrg = (userId: string) => {
        dispatch(addMember({ projectId, userId }));
    };

    const handleRemove = (memberId: string) => {
        if (confirm('Удалить участника из проекта?')) {
            dispatch(removeMember({ projectId, memberId }));
        }
    };

    const handleRoleChange = (memberId: string, role: ProjectRole) => {
        dispatch(updateMemberRole({ projectId, memberId, role }));
    };

    return (
        <>
            <div className='pm-sidebar-overlay' onClick={onClose} />
            <div className='pm-sidebar'>
                <div className='pm-sidebar__header'>
                    <h3 className='pm-sidebar__title'>Участники проекта</h3>
                    <button className='pm-sidebar__close' onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </button>
                </div>

                <div className='pm-sidebar__body'>
                    {/* Список участников проекта */}
                    <div className='pm-sidebar__section'>
                        <div className='pm-sidebar__section-title'>
                            {currentProject?.members?.length ?? 0} участников
                        </div>

                        <div className='pm-sidebar__list'>
                            {currentProject?.members?.map(member => (
                                <div key={member.id} className='pm-sidebar__member'>
                                    <div className='pm-sidebar__avatar'>
                                        {member.user.avatar
                                            ? <img src={member.user.avatar} alt="" />
                                            : <span>{(member.user.name || member.user.email)[0].toUpperCase()}</span>
                                        }
                                    </div>
                                    <div className='pm-sidebar__member-info'>
                                        <span className='pm-sidebar__member-name'>
                                            {member.user.name || member.user.email}
                                        </span>
                                        <span className='pm-sidebar__member-email'>
                                            {member.user.email}
                                        </span>
                                    </div>

                                    {canManage && member.userId !== user?.id ? (
                                        <select
                                            className='pm-sidebar__role-select'
                                            value={member.role}
                                            onChange={(e) => handleRoleChange(
                                                member.id,
                                                e.target.value as ProjectRole
                                            )}
                                        >
                                            <option value="MEMBER">MEMBER</option>
                                            <option value="MANAGER">MANAGER</option>
                                        </select>
                                    ) : (
                                        <span className={`pm-sidebar__role pm-sidebar__role--${member.role.toLowerCase()}`}>
                                            {member.role}
                                        </span>
                                    )}

                                    {canManage && member.userId !== user?.id && (
                                        <button
                                            className='pm-sidebar__remove'
                                            onClick={() => handleRemove(member.id)}
                                        >
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                                                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Добавить из организации */}
                    {canManage && currentProject?.orgId && orgMembersNotInProject.length > 0 && (
                        <div className='pm-sidebar__section'>
                            <button
                                className='pm-sidebar__toggle'
                                onClick={() => setShowOrgMembers(!showOrgMembers)}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d={showOrgMembers ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"}
                                          stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                                Добавить из организации ({orgMembersNotInProject.length})
                            </button>

                            {showOrgMembers && (
                                <div className='pm-sidebar__list pm-sidebar__list--org'>
                                    {orgMembersNotInProject.map(orgMember => (
                                        <div key={orgMember.id} className='pm-sidebar__member pm-sidebar__member--add'>
                                            <div className='pm-sidebar__avatar'>
                                                {orgMember.user.avatar
                                                    ? <img src={orgMember.user.avatar} alt="" />
                                                    : <span>{(orgMember.user.name || orgMember.user.email)[0].toUpperCase()}</span>
                                                }
                                            </div>
                                            <div className='pm-sidebar__member-info'>
                                                <span className='pm-sidebar__member-name'>
                                                    {orgMember.user.name || orgMember.user.email}
                                                </span>
                                                <span className='pm-sidebar__member-email'>
                                                    {orgMember.user.email}
                                                </span>
                                            </div>
                                            <button
                                                className='pm-sidebar__add-btn'
                                                onClick={() => handleAddFromOrg(orgMember.userId)}
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                    <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Если проект не привязан к орг */}
                    {canManage && !currentProject?.orgId && (
                        <div className='pm-sidebar__hint'>
                            Чтобы добавлять участников из организации, привяжите проект к организации
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ProjectMembersSidebar;