import { IsString, IsNotEmpty, IsOptional, IsNumber, ValidateNested, IsEnum, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { MilestoneColor } from '../../domain/enums/milestone-color.enum';

export class MilestoneDto {
    @IsNumber()
    @IsNotEmpty()
    count!: number;

    @IsString()
    @IsNotEmpty()
    effect!: string;

    @IsEnum(MilestoneColor)
    @IsNotEmpty()
    color!: MilestoneColor;
}

export class CreateTraitDto {
    @IsString()
    @IsNotEmpty({ message: 'Tên Tộc/Hệ không được để trống' })
    name!: string;

    @IsString()
    @IsNotEmpty()
    type!: string;

    @IsOptional()
    @IsString()
    iconPath?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MilestoneDto)
    milestones?: MilestoneDto[];
}