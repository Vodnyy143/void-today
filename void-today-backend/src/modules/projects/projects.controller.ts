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

import { ProjectsService } from '@modules/projects/projects.service';
import { GetUserId } from '@common/decorators/get-user.decorator';
import { CreateProjectDto } from '@modules/projects/dtos/create-project.dto';
import { UpdateProjectDto } from '@modules/projects/dtos/update-project.dto';
import { AddMemberDto } from '@modules/projects/dtos/add-member.dto';
import { UpdateMemberRoleDto } from '@modules/projects/dtos/update-member-role.dto';
import { JwtGuard } from '@modules/auth/guards/jwt.guard';

@Controller('projects')
@UseGuards(JwtGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@GetUserId() userId: string, @Body() dto: CreateProjectDto) {
    return this.projectsService.create(userId, dto);
  }

  @Get()
  async findAll(@GetUserId() userId: string) {
    return this.projectsService.findAll(userId);
  }

  @Get(':id')
  async findOne(@Param('id') projectId: string, @GetUserId() userId: string) {
    return this.projectsService.findOne(projectId, userId);
  }

  @Get(':id/stats')
  async getStats(@Param('id') projectId: string, @GetUserId() userId: string) {
    return this.projectsService.getProjectStats(projectId, userId);
  }

  @Get(':id/team-stats')
  async getTeamStats(
    @Param('id') projectId: string,
    @GetUserId() userId: string,
  ) {
    return this.projectsService.getTeamStats(projectId, userId);
  }

  @Patch(':id')
  async update(
    @Param('id') projectId: string,
    @GetUserId() userId: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(projectId, userId, dto);
  }

  @Post(':id/members')
  @HttpCode(HttpStatus.CREATED)
  async addMember(
    @Param('id') projectId: string,
    @GetUserId() userId: string,
    @Body() dto: AddMemberDto,
  ) {
    return this.projectsService.addMember(projectId, userId, dto.userId);
  }

  @Delete(':id/members/:memberId')
  async removeMember(
    @Param('id') projectId: string,
    @Param('memberId') memberId: string,
    @GetUserId() userId: string,
  ) {
    await this.projectsService.removeMember(projectId, userId, memberId);
    return { success: true };
  }

  @Patch(':id/members/:memberId/role')
  async updateMemberRole(
    @Param('id') projectId: string,
    @Param('memberId') memberId: string,
    @GetUserId() userId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    await this.projectsService.updateMemberRole(
      projectId,
      userId,
      memberId,
      dto.role,
    );
    return { success: true };
  }

  @Delete(':id')
  async delete(@Param('id') projectId: string, @GetUserId() userId: string) {
    return this.projectsService.delete(projectId, userId);
  }
}
