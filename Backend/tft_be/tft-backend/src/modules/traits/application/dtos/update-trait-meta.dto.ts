import { IsNumber, IsString, IsOptional } from 'class-validator';

export class UpdateTraitMetaDto {
    @IsNumber()
    gamesPlayed!: number;

    @IsString()
    winRate!: string;

    @IsNumber()
    avgPlacement!: number;

    @IsOptional()
    @IsString()
    rank?: string;

    @IsOptional()
    @IsString()
    topRate?: string;
}