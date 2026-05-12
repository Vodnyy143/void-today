import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';
import { CreateProjectDto } from '@modules/projects/dtos/create-project.dto';
import { ProjectRole } from '@generated/prisma/enums';
import { UpdateProjectDto } from '@modules/projects/dtos/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateProjectDto) {
    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        orgId: dto.orgId,
        color: dto.color,
        departmentId: dto.departmentId,
        members: {
          create: {
            userId,
            role: ProjectRole.MANAGER,
          },
        },
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, email: true, name: true } },
          },
        },
        org: true,
        department: true,
      },
    });

    return project;
  }

  async findAll(userId: string) {
    const projects = await this.prisma.project.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, email: true, name: true } },
          },
        },
        org: true,
        department: true,
        _count: {
          select: {
            tasks: true,
            boards: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return projects;
  }

  async findOne(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, email: true, name: true, avatar: true },
            },
          },
        },
        org: true,
        department: true,
        tasks: { select: { id: true, title: true, status: true } },
        boards: { select: { id: true, name: true } },
        sprints: { select: { id: true, name: true, status: true } },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const isMember = project.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this project');
    }

    return project;
  }

  async update(projectId: string, userId: string, dto: UpdateProjectDto) {
    const project = await this.findOne(projectId, userId);

    const userRole = project.members.find((m) => m.userId === userId)?.role;
    if (userRole !== ProjectRole.MANAGER) {
      throw new ForbiddenException('Only managers can update project');
    }

    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        name: dto.name,
        color: dto.color,
        description: dto.description,
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, email: true, name: true } },
          },
        },
      },
    });
  }

  async delete(projectId: string, userId: string) {
    const project = await this.findOne(projectId, userId);

    const userRole = project.members.find((m) => m.userId === userId)?.role;
    if (userRole !== ProjectRole.MANAGER) {
      throw new ForbiddenException('Only managers can delete project');
    }

    return this.prisma.project.delete({
      where: { id: projectId },
    });
  }

  async addMember(projectId: string, userId: string, targetUserId: string) {
    const project = await this.findOne(projectId, userId);

    const userRole = project.members.find((m) => m.userId === userId)?.role;
    if (userRole !== ProjectRole.MANAGER) {
      throw new ForbiddenException('Only managers can add members');
    }

    const exists = project.members.some((m) => m.userId === targetUserId);
    if (exists) {
      throw new BadRequestException('User is already a member');
    }
    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    const member = await this.prisma.projectMember.create({
      data: {
        projectId,
        userId: targetUserId,
        role: ProjectRole.MEMBER,
      },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
    });

    return member;
  }

  async removeMember(projectId: string, userId: string, targetUserId: string) {
    const project = await this.findOne(projectId, userId);

    const managers = project.members.filter(
      (m) => m.role === ProjectRole.MANAGER,
    );
    if (managers.length === 1 && managers[0].userId === targetUserId) {
      throw new BadRequestException('Cannot remove last manager from project');
    }

    const userRole = project.members.find((m) => m.userId === userId)?.role;
    if (userRole !== ProjectRole.MANAGER) {
      throw new ForbiddenException('Only managers can remove members');
    }

    if (userId === targetUserId && managers.length === 1) {
      throw new BadRequestException(
        'Cannot remove yourself if you are the only manager',
      );
    }

    return this.prisma.projectMember.deleteMany({
      where: {
        projectId,
        userId: targetUserId,
      },
    });
  }

  async updateMemberRole(
    projectId: string,
    userId: string,
    targetUserId: string,
    role: ProjectRole,
  ) {
    const project = await this.findOne(projectId, userId);

    const userRole = project.members.find((m) => m.userId === userId)?.role;
    if (userRole !== ProjectRole.MANAGER) {
      throw new ForbiddenException('Only managers can change member roles');
    }

    if (userId === targetUserId) {
      throw new BadRequestException('Cannot change your own role');
    }

    return this.prisma.projectMember.updateMany({
      where: {
        projectId,
        userId: targetUserId,
      },
      data: { role },
    });
  }

  async getProjectStats(projectId: string, userId: string) {
    const project = await this.findOne(projectId, userId);

    const tasks = await this.prisma.task.findMany({
      where: { projectId },
    });

    const completedTasks = tasks.filter((t) => t.status === 'DONE').length;
    const totalTasks = tasks.length;

    const memberCount = project.members.length;

    const sprints = await this.prisma.sprint.findMany({
      where: { projectId },
    });

    return {
      id: project.id,
      name: project.name,
      memberCount,
      taskCount: totalTasks,
      completedTasks,
      completionRate:
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      sprintCount: sprints.length,
      activeSprints: sprints.filter((s) => s.status === 'ACTIVE').length,
    };
  }

  async getTeamStats(projectId: string, userId: string) {
    const project = await this.findOne(projectId, userId);

    const teamStats = await Promise.all(
      project.members.map(async (member) => {
        const userTasks = await this.prisma.task.findMany({
          where: {
            projectId,
            assigneeId: member.userId,
          },
        });

        const completedTasks = userTasks.filter(
          (t) => t.status === 'DONE',
        ).length;

        return {
          userId: member.userId,
          name: member.user.name,
          email: member.user.email,
          role: member.role,
          taskCount: userTasks.length,
          completedTasks,
          completionRate:
            userTasks.length > 0
              ? Math.round((completedTasks / userTasks.length) * 100)
              : 0,
        };
      }),
    );

    return teamStats;
  }
}
