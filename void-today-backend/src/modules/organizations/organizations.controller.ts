import { Controller } from '@nestjs/common';

import { OrganizationsService } from '@modules/organizations/organizations.service';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}
}
