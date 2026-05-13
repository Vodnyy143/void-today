import { PrismaService } from '@core/prisma/prisma.service';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrganizationDto } from '@modules/organizations/dtos/create-organization.dto';
import { UpdateOrganizationDto } from '@modules/organizations/dtos/update-organization.dto';
import { InviteMemberDto } from '@modules/organizations/dtos/invite-member.dto';
import { UpdateMemberRoleDto } from '@modules/organizations/dtos/update-member-role.dto';
import { CreateDepartmentDto } from '@modules/organizations/dtos/create-department.dto';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateOrganizationDto) {
    const org = await this.prisma.organization.create({
      data: {
        name: dto.name,
        logo: dto.logo,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
      },
      include: {
        members: true,
        departments: true,
      },
    });
    return org;
  }

  async findAll(userId: string) {
    return this.prisma.organization.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        _count: { select: { members: true, projects: true } },
        members: {
          where: { userId },
          select: { role: true },
        },
      },
    });
  }

  async findOne(userId: string, orgId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, email: true, name: true, avatar: true },
            },
          },
        },
        departments: true,
        projects: {
          include: {
            _count: { select: { tasks: true, members: true } },
          },
        },
      },
    });

    if (!org) throw new NotFoundException('Организация не найдена');

    const isMember = org.members.some((m) => m.userId === userId);
    if (!isMember) throw new ForbiddenException('Нет доступа к организации');

    return org;
  }

  async update(userId: string, orgId: string, dto: UpdateOrganizationDto) {
    await this.checkRole(userId, orgId, ['OWNER', 'ADMIN']);

    return this.prisma.organization.update({
      where: { id: orgId },
      data: dto,
    });
  }

  async remove(userId: string, orgId: string) {
    await this.checkRole(userId, orgId, ['OWNER']);

    return this.prisma.organization.delete({
      where: { id: orgId },
    });
  }

  // ─── Members ─────────────────────────────────────────────────────

  async inviteMember(userId: string, orgId: string, dto: InviteMemberDto) {
    await this.checkRole(userId, orgId, ['OWNER', 'ADMIN']);

    const invitedUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!invitedUser) {
      throw new NotFoundException(
        `Пользователь с email ${dto.email} не найден`,
      );
    }

    const existing = await this.prisma.organizationMember.findUnique({
      where: {
        userId_orgId: { userId: invitedUser.id, orgId },
      },
    });

    if (existing) {
      throw new ForbiddenException('Пользователь уже является участником');
    }

    return this.prisma.organizationMember.create({
      data: {
        userId: invitedUser.id,
        orgId,
        role: dto.role,
      },
      include: {
        user: {
          select: { id: true, email: true, name: true, avatar: true },
        },
      },
    });
  }

  async updateMemberRole(
    userId: string,
    orgId: string,
    targetUserId: string,
    dto: UpdateMemberRoleDto,
  ) {
    await this.checkRole(userId, orgId, ['OWNER', 'ADMIN']);

    const member = await this.prisma.organizationMember.findUnique({
      where: { userId_orgId: { userId: targetUserId, orgId } },
    });

    if (!member) throw new NotFoundException('Участник не найден');
    if (member.role === 'OWNER') {
      throw new ForbiddenException('Нельзя изменить роль владельца');
    }

    return this.prisma.organizationMember.update({
      where: { userId_orgId: { userId: targetUserId, orgId } },
      data: { role: dto.role },
    });
  }

  async removeMember(userId: string, orgId: string, targetUserId: string) {
    await this.checkRole(userId, orgId, ['OWNER', 'ADMIN']);

    const member = await this.prisma.organizationMember.findUnique({
      where: { userId_orgId: { userId: targetUserId, orgId } },
    });

    if (!member) throw new NotFoundException('Участник не найден');
    if (member.role === 'OWNER') {
      throw new ForbiddenException('Нельзя удалить владельца организации');
    }

    return this.prisma.organizationMember.delete({
      where: { userId_orgId: { userId: targetUserId, orgId } },
    });
  }

  // ─── Departments ─────────────────────────────────────────────────

  async createDepartment(
    userId: string,
    orgId: string,
    dto: CreateDepartmentDto,
  ) {
    await this.checkRole(userId, orgId, ['OWNER', 'ADMIN']);

    return this.prisma.department.create({
      data: {
        name: dto.name,
        orgId,
      },
    });
  }

  async getDepartments(userId: string, orgId: string) {
    await this.checkMembership(userId, orgId);

    return this.prisma.department.findMany({
      where: { orgId },
      include: {
        _count: { select: { projects: true } },
      },
    });
  }

  async updateDepartment(
    userId: string,
    orgId: string,
    departmentId: string,
    dto: CreateDepartmentDto,
  ) {
    await this.checkRole(userId, orgId, ['OWNER', 'ADMIN']);

    return this.prisma.department.update({
      where: { id: departmentId },
      data: { name: dto.name },
    });
  }

  async removeDepartment(userId: string, orgId: string, departmentId: string) {
    await this.checkRole(userId, orgId, ['OWNER', 'ADMIN']);

    return this.prisma.department.delete({
      where: { id: departmentId },
    });
  }

  private async checkRole(
    userId: string,
    orgId: string,
    allowedRoles: string[],
  ) {
    const member = await this.prisma.organizationMember.findUnique({
      where: { userId_orgId: { userId, orgId } },
    });

    if (!member) {
      throw new ForbiddenException('Вы не являетесь участником организации');
    }

    if (!allowedRoles.includes(member.role)) {
      throw new ForbiddenException(
        `Требуется роль: ${allowedRoles.join(' или ')}`,
      );
    }

    return member;
  }

  private async checkMembership(userId: string, orgId: string) {
    const member = await this.prisma.organizationMember.findUnique({
      where: { userId_orgId: { userId, orgId } },
    });

    if (!member) {
      throw new ForbiddenException('Нет доступа к организации');
    }

    return member;
  }
}
