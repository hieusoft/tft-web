import { PartialType } from '@nestjs/mapped-types';
import { CreateTraitDto } from './create-trait.dto';

export class UpdateTraitDto extends PartialType(CreateTraitDto) {}