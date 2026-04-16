import { TraitMilestoneVO } from '../value-objects/trait-milestone.vo';

export class Trait {
    id?: number;
    name!: string;
    type!: string;
    rank?: string;
    avgPlacement?: number;
    topRate?: string;
    winRate?: string;
    gamesPlayed!: number;
    iconPath?: string;
    milestones: TraitMilestoneVO[] = [];

    constructor(partial: Partial<Trait>) {
        Object.assign(this, partial);
        this.milestones = this.milestones || [];
    }

    addMilestone(milestone: TraitMilestoneVO) {
        const exists = this.milestones.find(m => m.count === milestone.count);
        if (!exists) {
            this.milestones.push(milestone);
        }
    }

    updateMetaStats(gamesPlayed: number, winRate: string, avgPlacement: number) {
        this.gamesPlayed = gamesPlayed;
        this.winRate = winRate;
        this.avgPlacement = avgPlacement;
    }
}