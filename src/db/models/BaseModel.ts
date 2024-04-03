import { IBaseDocument } from '../documents/interfaces/IBaseDocument.js';

export abstract class BaseModel {
    constructor() {}

    public abstract toDocument(): Readonly<IBaseDocument>;
}
