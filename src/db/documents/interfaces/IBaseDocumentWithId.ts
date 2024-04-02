import { Document, WithId } from 'mongodb';
import { IBaseDocument } from './IBaseDocument';

export interface IBaseDocumentWithId extends WithId<IBaseDocument> {
    version: number;
}
