import { Trait } from '../../domain/entities/trait.entity';
import { TraitOrmEntity } from '../orm-entities/trait.orm-entity';
import { TraitMilestoneVO } from '../../domain/value-objects/trait-milestone.vo';

export class TraitMapper {
    static toDomain(ormEntity: TraitOrmEntity): Trait {
        const milestones = ormEntity.milestones?.map(
            (m) => new TraitMilestoneVO(m.count, m.effect, m.color)
        ) || [];

        return new Trait({
            id: ormEntity.id,
            name: ormEntity.name,
            type: ormEntity.type,
            rank: ormEntity.rank,
            avgPlacement: ormEntity.avgPlacement,
            topRate: ormEntity.topRate,
            winRate: ormEntity.winRate,
            gamesPlayed: ormEntity.gamesPlayed,
            iconPath: ormEntity.iconPath,
            milestones: milestones,
        });
    }

    static toOrm(domainEntity: Trait): TraitOrmEntity {
        const ormEntity = new TraitOrmEntity();

        if (domainEntity.id) {
            ormEntity.id = domainEntity.id;
        }

        ormEntity.name = domainEntity.name;
        ormEntity.type = domainEntity.type;
        ormEntity.rank = domainEntity.rank;
        ormEntity.avgPlacement = domainEntity.avgPlacement;
        ormEntity.topRate = domainEntity.topRate;
        ormEntity.winRate = domainEntity.winRate;
        ormEntity.gamesPlayed = domainEntity.gamesPlayed;
        ormEntity.iconPath = domainEntity.iconPath;
        ormEntity.milestones = domainEntity.milestones;

        return ormEntity;
    }
}