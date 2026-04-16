import { MilestoneColor } from '../enums/milestone-color.enum';
import { InvalidMilestoneException } from '../exceptions/invalid-milestone.exception';

export class TraitMilestoneVO {
    constructor(
        public readonly count: number,
        public readonly effect: string,
        public readonly color: MilestoneColor,
    ) {
        if (count <= 0) {
            throw new InvalidMilestoneException('Mốc kích hoạt (count) phải lớn hơn 0');
        }
    }
}