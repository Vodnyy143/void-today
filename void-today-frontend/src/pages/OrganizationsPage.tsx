import {useAppDispatch, useAppSelector} from "../store/hooks.ts";
import {useNavigate} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {deleteOrganization, fetchOrganizations} from "../store/slices/organizationSlice.ts";
import CreateOrganizationModal from "../components/modules/CreateOrganizationModal.tsx";
import {useTranslation} from "../i18n/useTranslation.ts";

const OrganizationsPage = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { organizations, status } = useAppSelector((state) => state.organizations);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        dispatch(fetchOrganizations());
    }, [dispatch]);

    const handleDelete = async (e: React.MouseEvent, orgId: string) => {
        e.stopPropagation();
        if (confirm(t('orgs.confirmDelete'))) {
            dispatch(deleteOrganization(orgId));
        }
    };


    return (
        <div className='organizations-page'>
            <div className='organizations-page__header'>
                <h1 className='organizations-page__title'>{t('orgs.title')}</h1>
                <button
                    className='organizations-page__create-btn'
                    onClick={() => setIsCreateOpen(true)}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    {t('orgs.create')}
                </button>
            </div>

            {status === 'loading' && (
                <div className='organizations-page__loading'>{t('orgs.loading')}</div>
            )}

            {status === 'idle' && organizations.length === 0 && (
                <div className='organizations-page__empty'>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                        <path d="M3 21h18M3 7v14M21 7v14M6 7V5a2 2 0 012-2h8a2 2 0 012 2v2M9 21v-4a3 3 0 016 0v4"
                              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p>{t('orgs.empty')}</p>
                    <button onClick={() => setIsCreateOpen(true)}>{t('orgs.createFirst')}</button>
                </div>
            )}

            <div className='organizations-page__grid'>
                {organizations.map((org) => (
                    <div
                        key={org.id}
                        className='org-card'
                        onClick={() => navigate(`/organizations/${org.id}`)}
                    >
                        <div className='org-card__logo'>
                            {org.logo
                                ? <img src={org.logo} alt={org.name} />
                                : <span>{org.name[0].toUpperCase()}</span>
                            }
                        </div>
                        <div className='org-card__info'>
                            <h3 className='org-card__name'>{org.name}</h3>
                            <div className='org-card__meta'>
                                <span>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                                              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                    </svg>
                                    {org._count?.members ?? 0} {t('orgs.membersUnit')}
                                </span>
                                <span>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                        <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z"
                                              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                    </svg>
                                    {org._count?.projects ?? 0} {t('orgs.projectsUnit')}
                                </span>
                            </div>
                            {org.members?.[0]?.role && (
                                <span className={`org-card__role org-card__role--${org.members[0].role.toLowerCase()}`}>
                                    {org.members[0].role}
                                </span>
                            )}
                        </div>
                        <button
                            className='org-card__delete'
                            onClick={(e) => handleDelete(e, org.id)}
                            title={t('orgs.delete')}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
                                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                        </button>
                    </div>
                ))}
            </div>

            <CreateOrganizationModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
            />
        </div>
    );
};

export default OrganizationsPage;
