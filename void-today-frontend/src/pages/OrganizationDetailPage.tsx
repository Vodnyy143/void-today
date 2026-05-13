import {
    createDepartment, deleteDepartment,
    deleteOrganization,
    fetchOrganization,
    removeMember,
    updateMemberRole
} from "../store/slices/organizationSlice.ts";
import {useNavigate, useParams} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "../store/hooks.ts";
import {useEffect, useState} from "react";
import InviteMemberModal from "../components/modules/InviteMemberModal.tsx";

type Tab = 'members' | 'departments' | 'settings';

const OrganizationDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { currentOrg } = useAppSelector((state) => state.organizations);
    const { user } = useAppSelector((state) => state.auth);
    const [activeTab, setActiveTab] = useState<Tab>('members');
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [newDeptName, setNewDeptName] = useState('');
    const [isAddingDept, setIsAddingDept] = useState(false);

    useEffect(() => {
        if (id) dispatch(fetchOrganization(id));
    }, [id, dispatch]);

    if (!currentOrg) return (
        <div className='org-detail__loading'>Загрузка...</div>
    );

    const myMember = currentOrg.members?.find(m => m.userId === user?.id);
    const myRole = myMember?.role;
    const canManage = myRole === 'OWNER' || myRole === 'ADMIN';

    const handleRemoveMember = (userId: string) => {
        if (confirm('Удалить участника?')) {
            dispatch(removeMember({ orgId: currentOrg.id, userId }));
        }
    };

    const handleRoleChange = (userId: string, role: 'ADMIN' | 'MEMBER') => {
        dispatch(updateMemberRole({ orgId: currentOrg.id, userId, role }));
    };

    const handleAddDepartment = async () => {
        if (!newDeptName.trim()) return;
        await dispatch(createDepartment({ orgId: currentOrg.id, name: newDeptName.trim() }));
        setNewDeptName('');
        setIsAddingDept(false);
    };

    const handleDeleteOrg = async () => {
        if (confirm('Удалить организацию? Это действие необратимо.')) {
            await dispatch(deleteOrganization(currentOrg.id));
            navigate('/organizations');
        }
    };


    return (
        <div className='org-detail'>
            <div className='org-detail__header'>
                <button className='org-detail__back' onClick={() => navigate('/organizations')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M19 12H5m7-7l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                </button>
                <div className='org-detail__logo'>
                    {currentOrg.logo
                        ? <img src={currentOrg.logo} alt={currentOrg.name} />
                        : <span>{currentOrg.name[0].toUpperCase()}</span>
                    }
                </div>
                <div className='org-detail__title-wrap'>
                    <h1 className='org-detail__name'>{currentOrg.name}</h1>
                    {myRole && (
                        <span className={`org-detail__role org-detail__role--${myRole.toLowerCase()}`}>
                            {myRole}
                        </span>
                    )}
                </div>
            </div>

            <div className='org-detail__tabs'>
                {(['members', 'departments', 'settings'] as Tab[]).map(tab => (
                    <button
                        key={tab}
                        className={`org-detail__tab ${activeTab === tab ? 'org-detail__tab--active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab === 'members' && 'Участники'}
                        {tab === 'departments' && 'Отделы'}
                        {tab === 'settings' && 'Настройки'}
                    </button>
                ))}
            </div>

            <div className='org-detail__content'>
                {/* ── Участники ── */}
                {activeTab === 'members' && (
                    <div className='org-detail__members'>
                        <div className='org-detail__section-header'>
                            <span>{currentOrg.members?.length ?? 0} участников</span>
                            {canManage && (
                                <button
                                    className='org-detail__invite-btn'
                                    onClick={() => setIsInviteOpen(true)}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                    </svg>
                                    Пригласить
                                </button>
                            )}
                        </div>

                        <div className='org-detail__member-list'>
                            {currentOrg.members?.map((member) => (
                                <div key={member.id} className='member-row'>
                                    <div className='member-row__avatar'>
                                        {member.user.avatar
                                            ? <img src={member.user.avatar} alt="" />
                                            : <span>{(member.user.name || member.user.email)[0].toUpperCase()}</span>
                                        }
                                    </div>
                                    <div className='member-row__info'>
                                        <span className='member-row__name'>
                                            {member.user.name || member.user.email}
                                        </span>
                                        <span className='member-row__email'>{member.user.email}</span>
                                    </div>

                                    {canManage && member.role !== 'OWNER' ? (
                                        <select
                                            className='member-row__role-select'
                                            value={member.role}
                                            onChange={(e) => handleRoleChange(
                                                member.userId,
                                                e.target.value as 'ADMIN' | 'MEMBER'
                                            )}
                                        >
                                            <option value="MEMBER">MEMBER</option>
                                            <option value="ADMIN">ADMIN</option>
                                        </select>
                                    ) : (
                                        <span className={`member-row__role member-row__role--${member.role.toLowerCase()}`}>
                                            {member.role}
                                        </span>
                                    )}

                                    {canManage && member.role !== 'OWNER' && member.userId !== user?.id && (
                                        <button
                                            className='member-row__remove'
                                            onClick={() => handleRemoveMember(member.userId)}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Отделы ── */}
                {activeTab === 'departments' && (
                    <div className='org-detail__departments'>
                        <div className='org-detail__section-header'>
                            <span>{currentOrg.departments?.length ?? 0} отделов</span>
                            {canManage && (
                                <button
                                    className='org-detail__invite-btn'
                                    onClick={() => setIsAddingDept(true)}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                    </svg>
                                    Добавить отдел
                                </button>
                            )}
                        </div>

                        {isAddingDept && (
                            <div className='org-detail__add-dept'>
                                <input
                                    className='org-detail__dept-input'
                                    placeholder='Название отдела'
                                    value={newDeptName}
                                    onChange={(e) => setNewDeptName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddDepartment()}
                                    autoFocus
                                />
                                <button onClick={handleAddDepartment}>Добавить</button>
                                <button onClick={() => { setIsAddingDept(false); setNewDeptName(''); }}>
                                    Отмена
                                </button>
                            </div>
                        )}

                        {currentOrg.departments?.length === 0 && !isAddingDept && (
                            <div className='org-detail__empty'>Отделов пока нет</div>
                        )}

                        <div className='org-detail__dept-list'>
                            {currentOrg.departments?.map((dept) => (
                                <div key={dept.id} className='dept-row'>
                                    <div className='dept-row__icon'>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                            <path d="M3 21h18M3 7v14M21 7v14M6 7V5a2 2 0 012-2h8a2 2 0 012 2v2"
                                                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                        </svg>
                                    </div>
                                    <span className='dept-row__name'>{dept.name}</span>
                                    <span className='dept-row__count'>
                                        {dept._count?.projects ?? 0} проектов
                                    </span>
                                    {canManage && (
                                        <button
                                            className='dept-row__delete'
                                            onClick={() => dispatch(deleteDepartment({
                                                orgId: currentOrg.id,
                                                departmentId: dept.id
                                            }))}
                                        >
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                                                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
                                                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Настройки ── */}
                {activeTab === 'settings' && (
                    <div className='org-detail__settings'>
                        <div className='org-detail__settings-row'>
                            <span>Название организации</span>
                            <span className='org-detail__settings-value'>{currentOrg.name}</span>
                        </div>
                        <div className='org-detail__settings-row'>
                            <span>Дата создания</span>
                            <span className='org-detail__settings-value'>
                                {new Date(currentOrg.createdAt).toLocaleDateString('ru')}
                            </span>
                        </div>
                        {myRole === 'OWNER' && (
                            <div className='org-detail__danger-zone'>
                                <h3>Опасная зона</h3>
                                <button
                                    className='org-detail__delete-btn'
                                    onClick={handleDeleteOrg}
                                >
                                    Удалить организацию
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <InviteMemberModal
                isOpen={isInviteOpen}
                onClose={() => setIsInviteOpen(false)}
                orgId={currentOrg.id}
            />
        </div>
    );
};

export default OrganizationDetailPage;