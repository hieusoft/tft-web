import { Injectable, Inject } from '@nestjs/common';
import { TRAIT_REPOSITORY_TOKEN, type ITraitRepository } from '../../domain/repositories/trait.repository.interface';
import { Trait } from '../../domain/entities/trait.entity';

@Injectable()
export class GetAllTraitsUseCase {
    constructor(
        @Inject(TRAIT_REPOSITORY_TOKEN)
        private readonly traitRepository: ITraitRepository,
    ) { }

    async execute(): Promise<Trait[]> {
        return this.traitRepository.findAll();
    }
}