import { IBaseDocument } from '../documents/interfaces/IBaseDocument';

export abstract class BaseModel {
    constructor() {
    }

    public abstract toDocument(): Readonly<IBaseDocument>;
}