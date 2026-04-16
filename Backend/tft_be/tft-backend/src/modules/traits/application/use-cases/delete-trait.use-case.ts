import { Injectable, Inject } from '@nestjs/common';
import { TRAIT_REPOSITORY_TOKEN, type ITraitRepository } from '../../domain/repositories/trait.repository.interface';
import { TraitNotFoundException } from '../../domain/exceptions/trait-not-found.exception';

@Injectable()
export class DeleteTraitUseCase {
    constructor(
        @Inject(TRAIT_REPOSITORY_TOKEN)
        private readonly traitRepository: ITraitRepository,
    ) { }

    async execute(id: number): Promise<boolean> {
        const trait = await this.traitRepository.findById(id);
        if (!trait) {
            throw new TraitNotFoundException(id);
        }

        return this.traitRepository.delete(id);
    }
}