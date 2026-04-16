import { Injectable, Inject } from '@nestjs/common';
import { TRAIT_REPOSITORY_TOKEN, type ITraitRepository } from '../../domain/repositories/trait.repository.interface';
import { Trait } from '../../domain/entities/trait.entity';
import { UpdateTraitMetaDto } from '../dtos/update-trait-meta.dto';
import { TraitNotFoundException } from '../../domain/exceptions/trait-not-found.exception';

@Injectable()
export class UpdateTraitMetaUseCase {
    constructor(
        @Inject(TRAIT_REPOSITORY_TOKEN)
        private readonly traitRepository: ITraitRepository,
    ) { }

    async execute(id: number, dto: UpdateTraitMetaDto): Promise<Trait> {
        const trait = await this.traitRepository.findById(id);
        if (!trait) {
            throw new TraitNotFoundException(id);
        }

        trait.updateMetaStats(dto.gamesPlayed, dto.winRate, dto.avgPlacement);

        if (dto.rank) trait.rank = dto.rank;
        if (dto.topRate) trait.topRate = dto.topRate;

        return this.traitRepository.update(id, trait);
    }
}