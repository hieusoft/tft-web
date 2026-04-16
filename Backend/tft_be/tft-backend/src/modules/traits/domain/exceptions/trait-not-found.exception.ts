export class TraitNotFoundException extends Error {
    constructor(identifier: string | number) {
        super(`Không tìm thấy Tộc/Hệ với định danh: ${identifier}`);
        this.name = 'TraitNotFoundException';
    }
}