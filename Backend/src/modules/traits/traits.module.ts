import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TraitsController } from './presentation/controllers/traits.controller';

import { CreateTraitUseCase } from './application/use-cases/create-traits.use-case';
import { GetAllTraitsUseCase } from './application/use-cases/get-all-traits.use-case';
import { UpdateTraitMetaUseCase } from './application/use-cases/update-trait-meta.use-case';

import { TraitOrmEntity } from './infrastructure/orm-entities/trait.orm-entity';
import { TraitRepository } from './infrastructure/repositories/trait.repository';
import { TRAIT_REPOSITORY_TOKEN } from './domain/repositories/trait.repository.interface';

@Module({
    imports: [
        TypeOrmModule.forFeature([TraitOrmEntity]),
    ],
    controllers: [TraitsController],
    providers: [
        CreateTraitUseCase,
        GetAllTraitsUseCase,
        UpdateTraitMetaUseCase,
        {
            provide: TRAIT_REPOSITORY_TOKEN,
            useClass: TraitRepository,
        },
    ],
})
export class TraitsModule { }