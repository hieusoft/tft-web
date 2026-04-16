import { Trait } from '../entities/trait.entity';

export const TRAIT_REPOSITORY_TOKEN = Symbol('TRAIT_REPOSITORY_TOKEN');

export interface ITraitRepository {
    create(trait: Trait): Promise<Trait>;
    findById(id: number): Promise<Trait | null>;
    findByName(name: string): Promise<Trait | null>;
    findAll(): Promise<Trait[]>;
    update(id: number, trait: Trait): Promise<Trait>;
    delete(id: number): Promise<boolean>;
    findMetaTraitsByRank(rank: string): Promise<Trait[]>;
}