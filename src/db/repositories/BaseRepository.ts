import { Collection, Db, Filter, Sort, ClientSession, OperationOptions, DeleteOptions, FindOptions, CountDocumentsOptions, UpdateOptions } from 'mongodb';
import { Logger } from '../../logger/Logger.js';
import { DataAccessError } from '../../errors/DataAccessError.js';
import { DataAccessErrorType } from '../../errors/enums/DataAccessErrorType.js';
import { IBaseDocument } from '../documents/interfaces/IBaseDocument.js';
import { PagingQueryInfo, PagingQueryResult } from './PagingQuery.js'

export abstract class BaseRepository<TDocument extends IBaseDocument> extends Logger {
    protected _db: Db;
    
    public async delete(criteria: Partial<TDocument>,
        currentSession?: ClientSession): Promise<number> {
        try {
            const collection = this.getCollection();
            const filter: Filter<TDocument> = {
                criteria
            };

            const options: DeleteOptions = this.getOptions(currentSession);
            
            const result = await collection.deleteMany(filter,
                options);
            
            return result.deletedCount;
        } catch (error) {
            if (error instanceof (Error)) {
                throw new DataAccessError(error.message,
                    DataAccessErrorType.Unknown,
                    '');
            } else {
                throw error;
            }
        }
    }

    public async getAll(criteria?: Partial<TDocument>,
        currentSession?: ClientSession): Promise<TDocument[]> {
        try {
            const collection = this.getCollection();
            const options: FindOptions = this.getOptions(currentSession);

            if (criteria) {
                const filter: Filter<TDocument> = {
                    criteria
                };

                return await collection.find(filter,
                    options).toArray() as TDocument[];
            } else {
                return await collection.find({},
                    options).toArray() as TDocument[];
            }
        } catch (error) {
            if (error instanceof (Error)) {
                throw new DataAccessError(error.message);
            } else {
                throw error;
            }
        }
    }

    public async getCount(criteria?: Partial<TDocument>,
        currentSession?: ClientSession): Promise<number> {
        try {
            const collection = this.getCollection();
            const options: CountDocumentsOptions = this.getOptions(currentSession);

            if (criteria) {
                const filter: Filter<TDocument> = {
                    criteria
                };

                return await collection.countDocuments(filter,
                    options);
            } else {
                return await collection.countDocuments({},
                    options);
            }
        } catch (error) {
            if (error instanceof (Error)) {
                throw new DataAccessError(error.message);
            } else {
                throw error;
            }
        }
    }

    public async queryOne(criteria: Partial<TDocument>,
        currentSession?: ClientSession): Promise<TDocument | null>  {
        try {
            const collection = this.getCollection();
            const options: FindOptions = this.getOptions(currentSession);
            const filter: Filter<TDocument> = {
                criteria
            };

            return await collection.findOne(filter,
                options) as TDocument;
        } catch (error) {
            if (error instanceof (Error)) {
                throw new DataAccessError(error.message);
            } else {
                throw error;
            }
        }
    }

    public async queryMany(criteria: Partial<TDocument>,
        currentSession?: ClientSession): Promise<TDocument[]> {
        try {
            const collection = this.getCollection();
            const options: FindOptions = this.getOptions(currentSession);
            const filter: Filter<TDocument> = {
                criteria
            };

            return await collection.find(filter,
                options).toArray() as TDocument[];
        } catch (error) {
            if (error instanceof (Error)) {
                throw new DataAccessError(error.message);
            } else {
                throw error;
            }
        }
    }

    public async queryManyAndSortPaged(criteria: Partial<TDocument>,
        sort: Sort,
        pagingQueryInfo: PagingQueryInfo,
        currentSession?: ClientSession
    ): Promise<PagingQueryResult<TDocument>> {
        try {
            const collection = this.getCollection();
            const skips = pagingQueryInfo.pageSize * (pagingQueryInfo.pageNumber - 1);
            let count: number = await this.getCount(criteria);
            const options: FindOptions = this.getOptions(currentSession);
            const filter: Filter<TDocument> = {
                criteria
            };

            const documents = await collection.find(filter,
                options)
                .sort(sort)
                .skip(skips)
                .limit(pagingQueryInfo.pageSize)
                .toArray();

            return new PagingQueryResult<TDocument>(pagingQueryInfo.pageSize,
                pagingQueryInfo.pageNumber,
                count,
                (pagingQueryInfo.pageNumber * pagingQueryInfo.pageSize) < count,
                documents as TDocument[]);
        } catch (error) {
            if (error instanceof (Error)) {
                throw new DataAccessError(error.message);
            } else {
                throw error;
            }
        }
    }

    public async queryManyAndSort(criteria: Partial<TDocument>,
        sort: Sort,
        currentSession?: ClientSession): Promise<TDocument[]> {
        try {
            const collection = this.getCollection();
            const options: FindOptions = this.getOptions(currentSession);
            const filter: Filter<TDocument> = {
                criteria
            };

            return await collection.find(filter,
                options)
                .sort(sort)
                .toArray() as TDocument[];
        } catch (error) {
            if (error instanceof (Error)) {
                throw new DataAccessError(error.message);
            } else {
                throw error;
            }
        }
    }

    public async save(criteria: Partial<TDocument>,
        document: TDocument,
        currentSession?: ClientSession
    ): Promise<void> {
        try {
            const collection = this.getCollection();
            const options: UpdateOptions = this.getOptions(currentSession);
            const filter: Filter<TDocument> = {
                criteria
            };

            options.upsert = true;

            const result = await collection.updateOne(filter,
                { $set: document },
                options);

            if (result.modifiedCount === 0 && result.upsertedCount === 0) {
                throw new DataAccessError('Concurency error while updating.',
                    DataAccessErrorType.Concurency,
                    '');
            }
        } catch (error) {
            if (error instanceof DataAccessError) {
                throw error;
            } else if (error instanceof (Error)) {
                throw new DataAccessError(error.message);
            } else {
                throw error;
            }
        }
    }

    public async updatePartial(criteria: Partial<TDocument>,
        document: Partial<TDocument>,
        currentSession?: ClientSession): Promise<void> {
        try {
            const collection = this.getCollection();
            const options: UpdateOptions = this.getOptions(currentSession);
            const filter: Filter<TDocument> = {
                criteria
            };

            const updateResult = await collection.updateOne(
                filter,
                { $set: document },
                options
            );

            if (updateResult.modifiedCount !== 1) {
                throw new DataAccessError('Concurency error while updating.',
                    DataAccessErrorType.Concurency,
                    '');
            }
        } catch (error) {
            if (error instanceof Error) {
                throw new DataAccessError(error.message,
                    DataAccessErrorType.Unknown,
                    '');
            } else {
                throw error;
            }
        }
    }

    protected constructor(db: Db) {
        super();
        this._db = db;
    }

    protected abstract getCollection(): Collection<TDocument>;

    protected getOptions(currentSession?: ClientSession): OperationOptions {
        const options: OperationOptions = {};

        if (currentSession) {
            options.session = currentSession
        }

        return options;
    }
}
