import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ITraitRepository } from '../../domain/repositories/trait.repository.interface';
import { Trait } from '../../domain/entities/trait.entity';
import { TraitOrmEntity } from '../orm-entities/trait.orm-entity';
import { TraitMapper } from '../mappers/trait.mapper';

@Injectable()
export class TraitRepository implements ITraitRepository {
    constructor(
        @InjectRepository(TraitOrmEntity)
        private readonly ormRepository: Repository<TraitOrmEntity>,
    ) { }

    async create(trait: Trait): Promise<Trait> {
        const ormEntity = TraitMapper.toOrm(trait);
        const savedEntity = await this.ormRepository.save(ormEntity);
        return TraitMapper.toDomain(savedEntity);
    }

    async findById(id: number): Promise<Trait | null> {
        const ormEntity = await this.ormRepository.findOne({ where: { id } });
        if (!ormEntity) return null;
        return TraitMapper.toDomain(ormEntity);
    }

    async findByName(name: string): Promise<Trait | null> {
        const ormEntity = await this.ormRepository.findOne({ where: { name } });
        if (!ormEntity) return null;
        return TraitMapper.toDomain(ormEntity);
    }

    async findAll(): Promise<Trait[]> {
        const ormEntities = await this.ormRepository.find();
        return ormEntities.map(entity => TraitMapper.toDomain(entity));
    }

    async update(id: number, trait: Trait): Promise<Trait> {
        const ormEntity = TraitMapper.toOrm(trait);
        ormEntity.id = id;
        const updatedEntity = await this.ormRepository.save(ormEntity);
        return TraitMapper.toDomain(updatedEntity);
    }

    async delete(id: number): Promise<boolean> {
        const result = await this.ormRepository.delete(id);
        return result.affected !== null && result.affected! > 0;
    }

    async findMetaTraitsByRank(rank: string): Promise<Trait[]> {
        const ormEntities = await this.ormRepository.find({
            where: { rank },
            order: { avgPlacement: 'ASC' }
        });
        return ormEntities.map(entity => TraitMapper.toDomain(entity));
    }
}