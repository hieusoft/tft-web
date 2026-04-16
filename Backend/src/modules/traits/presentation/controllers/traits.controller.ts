import { Controller, Get, Post, Body, Param, Patch, UseGuards, Delete } from '@nestjs/common';
import { CreateTraitDto } from '../../application/dtos/create-trait.dto';
import { UpdateTraitMetaDto } from '../../application/dtos/update-trait-meta.dto';
import { CreateTraitUseCase } from '../../application/use-cases/create-traits.use-case';
import { GetAllTraitsUseCase } from '../../application/use-cases/get-all-traits.use-case';
import { UpdateTraitMetaUseCase } from '../../application/use-cases/update-trait-meta.use-case';
import { ApiKeyGuard } from '../../../../core/guards/api-key.guard';
import { DeleteTraitUseCase } from '../../application/use-cases/delete-trait.use-case';

@Controller({
    path: "traits",
    version: '1'
})
@UseGuards(ApiKeyGuard)
export class TraitsController {
    constructor(
        private readonly createTraitUseCase: CreateTraitUseCase,
        private readonly getAllTraitsUseCase: GetAllTraitsUseCase,
        private readonly updateTraitMetaUseCase: UpdateTraitMetaUseCase,
        private readonly deleteTraitUseCase: DeleteTraitUseCase
    ) { }

    @Post()
    async create(@Body() createTraitDto: CreateTraitDto) {
        return this.createTraitUseCase.execute(createTraitDto);
    }

    @Get()
    async findAll() {
        return this.getAllTraitsUseCase.execute();
    }

    @Patch(':id/meta')
    async updateMeta(
        @Param('id') id: string,
        @Body() updateTraitMetaDto: UpdateTraitMetaDto,
    ) {
        return this.updateTraitMetaUseCase.execute(+id, updateTraitMetaDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        await this.deleteTraitUseCase.execute(+id);
        return { message: `Delete success trait with ${id}` };
    }
}