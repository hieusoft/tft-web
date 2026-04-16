export class InvalidMilestoneException extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidMilestoneException';
    }
}