import { Injectable } from '@nestjs/common';

import { PrismaService } from '@core/prisma/prisma.service';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}
}
