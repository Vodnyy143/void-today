import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const AddTasksToSprintSchema = z.object({
  taskIds: z.array(z.string()).min(1),
});

export class AddTasksToSprintDto extends createZodDto(AddTasksToSprintSchema) {}
