import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { OrganizationsService } from '@modules/organizations/organizations.service';
import { RequirePlan } from '@modules/subscriptions/decorators/require-plan.decorator';
import { SubscriptionPlan } from '@generated/prisma/enums';
import { GetUserId } from '@common/decorators/get-user.decorator';
import { CreateOrganizationDto } from '@modules/organizations/dtos/create-organization.dto';
import { UpdateOrganizationDto } from '@modules/organizations/dtos/update-organization.dto';
import { InviteMemberDto } from '@modules/organizations/dtos/invite-member.dto';
import { UpdateMemberRoleDto } from '@modules/organizations/dtos/update-member-role.dto';
import { CreateDepartmentDto } from '@modules/organizations/dtos/create-department.dto';
import { JwtGuard } from '@modules/auth/guards/jwt.guard';
import { SubscriptionGuard } from '@modules/subscriptions/guards/subscription.guard';

@Controller('organizations')
@UseGuards(JwtGuard, SubscriptionGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @RequirePlan(SubscriptionPlan.PRO)
  @HttpCode(HttpStatus.CREATED)
  create(@GetUserId() userId: string, @Body() dto: CreateOrganizationDto) {
    return this.organizationsService.create(userId, dto);
  }

  @Get()
  findAll(@GetUserId() userId: string) {
    return this.organizationsService.findAll(userId);
  }

  @Get(':id')
  findOne(@GetUserId() userId: string, @Param('id') orgId: string) {
    return this.organizationsService.findOne(userId, orgId);
  }

  @Patch(':id')
  update(
    @GetUserId() userId: string,
    @Param('id') orgId: string,
    @Body() dto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.update(userId, orgId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@GetUserId() userId: string, @Param('id') orgId: string) {
    return this.organizationsService.remove(userId, orgId);
  }

  // ─── Members ─────────────────────────────────────────────────────

  @Post(':id/members')
  inviteMember(
    @GetUserId() userId: string,
    @Param('id') orgId: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.organizationsService.inviteMember(userId, orgId, dto);
  }

  @Patch(':id/members/:userId')
  updateMemberRole(
    @GetUserId() userId: string,
    @Param('id') orgId: string,
    @Param('userId') targetUserId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.organizationsService.updateMemberRole(
      userId,
      orgId,
      targetUserId,
      dto,
    );
  }

  @Delete(':id/members/:userId')
  @HttpCode(HttpStatus.OK)
  removeMember(
    @GetUserId() userId: string,
    @Param('id') orgId: string,
    @Param('userId') targetUserId: string,
  ) {
    return this.organizationsService.removeMember(userId, orgId, targetUserId);
  }

  // ─── Departments (только BUSINESS) ───────────────────────────────

  @Post(':id/departments')
  @RequirePlan(SubscriptionPlan.BUSINESS)
  createDepartment(
    @GetUserId() userId: string,
    @Param('id') orgId: string,
    @Body() dto: CreateDepartmentDto,
  ) {
    return this.organizationsService.createDepartment(userId, orgId, dto);
  }

  @Get(':id/departments')
  getDepartments(@GetUserId() userId: string, @Param('id') orgId: string) {
    return this.organizationsService.getDepartments(userId, orgId);
  }

  @Patch(':id/departments/:departmentId')
  @RequirePlan(SubscriptionPlan.BUSINESS)
  updateDepartment(
    @GetUserId() userId: string,
    @Param('id') orgId: string,
    @Param('departmentId') departmentId: string,
    @Body() dto: CreateDepartmentDto,
  ) {
    return this.organizationsService.updateDepartment(
      userId,
      orgId,
      departmentId,
      dto,
    );
  }

  @Delete(':id/departments/:departmentId')
  @HttpCode(HttpStatus.OK)
  @RequirePlan(SubscriptionPlan.BUSINESS)
  removeDepartment(
    @GetUserId() userId: string,
    @Param('id') orgId: string,
    @Param('departmentId') departmentId: string,
  ) {
    return this.organizationsService.removeDepartment(
      userId,
      orgId,
      departmentId,
    );
  }
}
