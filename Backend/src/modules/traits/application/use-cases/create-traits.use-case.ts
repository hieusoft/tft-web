import { Injectable, Inject } from '@nestjs/common';
import { TRAIT_REPOSITORY_TOKEN, type ITraitRepository } from '../../domain/repositories/trait.repository.interface';
import { Trait } from '../../domain/entities/trait.entity';
import { TraitMilestoneVO } from '../../domain/value-objects/trait-milestone.vo';
import { CreateTraitDto } from '../dtos/create-trait.dto';

@Injectable()
export class CreateTraitUseCase {
    constructor(
        @Inject(TRAIT_REPOSITORY_TOKEN)
        private readonly traitRepository: ITraitRepository,
    ) { }

    async execute(dto: CreateTraitDto): Promise<Trait> {
        const milestones = dto.milestones?.map(m =>
            new TraitMilestoneVO(m.count, m.effect, m.color)
        ) || [];

        const newTrait = new Trait({
            name: dto.name,
            type: dto.type,
            iconPath: dto.iconPath,
            gamesPlayed: 0,
            milestones: milestones,
        });

        return this.traitRepository.create(newTrait);
    }
}