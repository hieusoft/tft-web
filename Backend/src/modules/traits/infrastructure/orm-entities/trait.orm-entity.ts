import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../../core/base/base.entity';
import { TraitMilestoneVO } from '../../domain/value-objects/trait-milestone.vo';

@Entity('traits')
export class TraitOrmEntity extends BaseEntity {
    @Column({ type: 'varchar', length: 100, unique: true })
    name: string;

    @Column({ type: 'varchar', length: 50 })
    type: string;

    @Column({ type: 'varchar', nullable: true })
    rank?: string; // Thêm ?

    @Column({ type: 'float', nullable: true })
    avgPlacement?: number; 

    @Column({ type: 'varchar', nullable: true })
    topRate?: string; // Thêm ?

    @Column({ type: 'varchar', nullable: true })
    winRate?: string; // Thêm ?

    @Column({ type: 'int', default: 0 })
    gamesPlayed: number;

    @Column({ type: 'varchar', nullable: true })
    iconPath?: string; // Thêm ?

    @Column({ type: 'jsonb', default: [] })
    milestones: TraitMilestoneVO[];
}