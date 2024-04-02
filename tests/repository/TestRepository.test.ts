import 'jest';
import { TestRepository } from './repositories/TestRepository.js'
import { Filter, Sort } from 'mongodb';
import { ConfigurableDBManager } from '../../src/db/DBManager.js';
import { ITestDocument } from './documents/interfaces/ITestDocument.js';
import { TypeConverter } from '../../src/utils/TypeConverter.js';
import { DataAccessError } from '../../src/errors/DataAccessError.js';
import { PagingQueryInfo } from '../../src/db/repositories/PagingQuery.js';
import { DBTestHelper } from '../utils/DBTestHelper.js';
import { DBConstants } from '../../src/db/DBConstants.js';
import { Config } from '../config/Config.js';

describe('TestRepository Integration Tests', () => {
    const DBManagerInstance = new ConfigurableDBManager(Config);

    beforeAll(async () => {
        await DBManagerInstance.setup(Config.DATABASE.CONNECTION_TYPE);
        await DBManagerInstance.connect();
        await DBTestHelper.setupDatabaseForTests(DBManagerInstance.db!,
            __dirname);
        process.env = {
            TEST_JS: '1'
        };
    }, 20000);

    afterAll(async () => {
        await DBManagerInstance.close();
    });

    describe('deleteById method tests', () => {
        test('deleteById should return true when document to delete is deleted', async () => {
            const repo = new TestRepository(DBManagerInstance.db!);

            const result = await repo.deleteById(new ObjectId('6605d14603bce86bdca515b2'));

            expect(result).toBe(true);
        });

        test('deleteById should return false when document to delete does not exist or was not deleted', async () => {
            const repo = new TestRepository(DBManagerInstance.db!);

            const result = await repo.deleteById(new ObjectId('000000000000000000000000'));

            expect(result).toBe(false);
        });
    });

    describe('delete method tests', () => {
        test('delete should return true when document to delete is deleted', async () => {
            const repo = new TestRepository(DBManagerInstance.db!);

            const document: ITestDocument = {
                _id: new ObjectId('6605d41603bce86bdca515b3'),
                account: '234',
                ticker: 'SOL',
                amount: TypeConverter.numberToDecimal128(100),
                lock: TypeConverter.numberToDecimal128(0),
                mint: TypeConverter.numberToDecimal128(0),
                stake: TypeConverter.numberToDecimal128(0),
                burn: TypeConverter.numberToDecimal128(0),
                version: 1
            };

            const result = await repo.delete(document);

            expect(result).toBe(true);
        });

        test('delete should return false when document to delete does not exist or was not deleted', async () => {
            const repo = new TestRepository(DBManagerInstance.db!);

            const document: ITestDocument = {
                _id: new ObjectId('000000000000000000000000'),
                account: '234',
                ticker: 'SOL',
                amount: TypeConverter.numberToDecimal128(100),
                lock: TypeConverter.numberToDecimal128(0),
                mint: TypeConverter.numberToDecimal128(0),
                stake: TypeConverter.numberToDecimal128(0),
                burn: TypeConverter.numberToDecimal128(0),
                version: 1
            };

            const result = await repo.delete(document);;

            expect(result).toBe(false);
        });
    });

    describe('getAll method tests', () => {
        test('getAll should return all documents when no criteria', async () => {
            const repo = new TestRepository(DBManagerInstance.db!);

            const documents = await repo.getAll();

            expect(documents.length).toBe(4);
        });

        test('getAll should return all documents matching single criteria', async () => {
            const repo = new TestRepository(DBManagerInstance.db!);

            const criteria : Partial<Filter<ITestDocument>>  = {
                ticker: 'BTC'
            };

            const documents = await repo.getAll(criteria);

            expect(documents.length).toBe(3);
        });

        test('getAll should return all documents matching multiple criterias', async () => {
            const repo = new TestRepository(DBManagerInstance.db!);

            const criteria: Partial<Filter<ITestDocument>> = {
                ticker: 'BTC',
                amount: { $gt: TypeConverter.numberToDecimal128(1000) }
            };

            const documents = await repo.getAll(criteria);

            expect(documents.length).toBe(1);
        });

        test('getAll should return all documents matching id criteria', async () => {
            const repo = new TestRepository(DBManagerInstance.db!);
            
            const criteria: Partial<Filter<ITestDocument>> = {
                _id: {
                    $in: [new ObjectId('65ff1f6c0e0dd5a32089fc22'),
                        new ObjectId('65ff1f6c0e0dd5a32089fc25'),
                        new ObjectId('000000000000000000000000')
                    ]
                }
            };

            const documents = await repo.getAll(criteria);

            expect(documents.length).toBe(2);
        });
    });

    describe('getById method tests', () => {
        test('getById should return a document when id is found', async () => {
            const repo = new TestRepository(DBManagerInstance.db!);

            const document = await repo.getById(new ObjectId('65ff1f6c0e0dd5a32089fc28'));

            expect(document).toBeDefined();
            expect(document).not.toBeNull();
            expect(document?._id.toString()).toBe('65ff1f6c0e0dd5a32089fc28');
        });

        test('getById should return null when id is not found', async () => {
            const repo = new TestRepository(DBManagerInstance.db!);

            const document = await repo.getById(new ObjectId('000000000000000000000000'));

            expect(document).toBeNull();
        });
    });

    describe('getCount method tests', () => {
        test('getCount should return total number of document in collection when no criteria', async () => {
            const repo = new TestRepository(DBManagerInstance.db!);

            const count = await repo.getCount();

            expect(count).toBe(4);
        });

        test('getCount should return total number of document in collection matching criteria when criteria is specified', async () => {
            const repo = new TestRepository(DBManagerInstance.db!);

            const criteria: Partial<Filter<ITestDocument>> = {
                ticker: 'BTC'
            };

            const count = await repo.getCount(criteria);

            expect(count).toBe(3);
        });
    });

    describe('queryOne method tests', () => {
        test('queryOne should return the first document matching the criteria', async () => {
            const repo = new TestRepository(DBManagerInstance.db!);

            const criteria: Partial<Filter<ITestDocument>> = {
                $and: [
                    { ticker: 'BTC' },
                    { account: '456'}
                ]
            };

            const document = await repo.queryOne(criteria);

            expect(document).toBeDefined();
            expect(document).not.toBeNull();
            expect(document?._id.toString()).toBe('65ff1f6c0e0dd5a32089fc25');
        });

        test('queryOne should return null when no criteria match', async () => {
            const repo = new TestRepository(DBManagerInstance.db!);

            const criteria: Partial<Filter<ITestDocument>> = {
                $and: [
                    { ticker: 'ABC' },
                    { account: '000' }
                ]
            };

            const document = await repo.queryOne(criteria);

            expect(document).toBeNull();
        });
    });

    describe('queryMany method tests', () => {
        test('queryMany should return the documents matching the criteria', async () => {
            const repo = new TestRepository(DBManagerInstance.db!);

            const criteria: Partial<Filter<ITestDocument>> = {
                $or: [
                    { ticker: 'BTC' },
                    { account: '123' }
                ]
            };

            const documents = await repo.queryMany(criteria);

            expect(documents).toBeDefined();
            expect(documents).not.toBeNull();
            expect(documents.length).toBe(4);
        });

        test('queryMany should return empty when no criteria match', async () => {
            const repo = new TestRepository(DBManagerInstance.db!);

            const criteria: Partial<Filter<ITestDocument>> = {
                $or: [
                    { ticker: 'ABC' },
                    { account: '000' }
                ]
            };

            const documents = await repo.queryMany(criteria);

            expect(documents.length).toBe(0);
        });
    });

    describe('queryManyAndSortPaged method tests', () => {
        test('queryManyAndSortPaged with 2 pages should return the paged documents matching the criteria, sort and paging info', async () => {
            const repo = new TestRepository(DBManagerInstance.db!);

            const criteria: Partial<Filter<ITestDocument>> = {
                ticker: 'BTC'
            };

            const sort: Sort = {
                account: 1,
                amount: -1,
            };

            const pagingInfo: PagingQueryInfo = {
                pageNumber: 1,
                pageSize: 2
            };

            const pagingInfo2: PagingQueryInfo = {
                pageNumber: 2,
                pageSize: 2
            };

            const pagingResult = await repo.queryManyAndSortPaged(criteria,
                sort,
                pagingInfo);

            expect(pagingResult.count).toBe(3);
            expect(pagingResult.pageNumber).toBe(1);
            expect(pagingResult.hasMoreResults).toBe(true);
            expect(pagingResult.results.length).toBe(2);
            expect(pagingResult.results[0].account).toBe('123');
            expect(pagingResult.results[1].account).toBe('456');

            const pagingResult2 = await repo.queryManyAndSortPaged(criteria,
                sort,
                pagingInfo2);

            expect(pagingResult2.count).toBe(3);
            expect(pagingResult2.pageNumber).toBe(2);
            expect(pagingResult2.results.length).toBe(1);
            expect(pagingResult2.hasMoreResults).toBe(false);
            expect(pagingResult2.results[0].account).toBe('789');
        });

        test('queryManyAndSortPaged with no result should return no result in the paged result', async () => {
            const repo = new TestRepository(DBManagerInstance.db!);

            const criteria: Partial<Filter<ITestDocument>> = {
                $or: [
                    { ticker: 'ABC' },
                    { account: '000' }
                ]
            };

            const sort: Sort = {
                account: 1,
                amount: -1,
            };

            const pagingInfo: PagingQueryInfo = {
                pageNumber: 1,
                pageSize: 2
            };

            const pagingResult = await repo.queryManyAndSortPaged(criteria,
                sort,
                pagingInfo);

            expect(pagingResult.count).toBe(0);
            expect(pagingResult.pageNumber).toBe(1);
            expect(pagingResult.hasMoreResults).toBe(false);
            expect(pagingResult.results.length).toBe(0);
        });
    });

    describe('queryManyAndSort method tests', () => {
        test('queryManyAndSort should return the documents matching the criteria and sort', async () => {
            const repo = new TestRepository(DBManagerInstance.db!);

            const criteria: Partial<Filter<ITestDocument>> = {
                ticker: 'BTC'
            };

            const sort: Sort = {
                account: 1,
                amount: -1,
            };

            const documents = await repo.queryManyAndSort(criteria,
                sort);

            expect(documents.length).toBe(3);
            expect(documents[0].account).toBe('123');
            expect(documents[1].account).toBe('456');
            expect(documents[2].account).toBe('789');
        });

        test('queryManyAndSort should return no documents when no matching the criteria', async () => {
            const repo = new TestRepository(DBManagerInstance.db!);

            const criteria: Partial<Filter<ITestDocument>> = {
                $or: [
                    { ticker: 'ABC' },
                    { account: '000' }
                ]
            };

            const sort: Sort = {
                account: 1,
                amount: -1,
            };

            const documents = await repo.queryManyAndSort(criteria,
                sort);

            expect(documents.length).toBe(0);
        });
    });

    describe('save method tests', () => {
        test('save a new document, should increment version and upsert the document', async () => {
            const repo = new TestRepository(DBManagerInstance.db!);

            const initialVersion = 0;
            const document: ITestDocument = {
                _id: new ObjectId(DBConstants.NULL_OBJECT_ID),
                version: initialVersion,
                account: '9999',
                amount: TypeConverter.numberToDecimal128(8888),
                lock: TypeConverter.numberToDecimal128(0),
                mint: TypeConverter.numberToDecimal128(0),
                stake: TypeConverter.numberToDecimal128(0),
                ticker: 'TCK1'
            };

            await repo.save(document);
            
            const savedDocument = await repo.getById(document._id);

            expect(savedDocument).toBeDefined();
            expect(savedDocument).not.toBeNull();
            expect(savedDocument?.version).toBe(initialVersion + 1);
        });

        test('save an existing document, should increment version and update the document', async () => {
            const repo = new TestRepository(DBManagerInstance.db!);
            let document = await repo.getById(new ObjectId('65ff1f6c0e0dd5a32089fc28'));

            expect(document).not.toBeNull();

            if (document !== null) {
                const currentVersion = document.version;
                const updateDocument: ITestDocument = {
                    account: document.account,
                    amount: document.amount,
                    lock: TypeConverter.numberToDecimal128(999),
                    mint: document.mint,
                    stake: document.stake,
                    ticker: document.ticker,
                    version: document.version,
                    _id: document._id
                };

                await repo.save(updateDocument);

                expect(updateDocument.version).toBe(currentVersion + 1);

                let document2 = await repo.getById(new ObjectId('65ff1f6c0e0dd5a32089fc28'));

                expect(document2).not.toBeNull();

                if (document2 !== null) {
                    expect(document2.version).toBe(currentVersion + 1);
                    expect(document2.lock.toString()).toBe(TypeConverter.numberToDecimal128(999).toString());
                }
            }
        });

        test('save an existing document with an outdated version, should throw concurency error', async () => {
            const repo = new TestRepository(DBManagerInstance.db!);
            let document = await repo.getById(new ObjectId('65ff1f6c0e0dd5a32089fc28'));

            expect(document).not.toBeNull();

            if (document !== null) {
                const updateDocument: ITestDocument = {
                    account: document.account,
                    amount: document.amount,
                    lock: TypeConverter.numberToDecimal128(999),
                    mint: document.mint,
                    stake: document.stake,
                    ticker: document.ticker,
                    version: 1,
                    _id: document._id
                };

                await expect(repo.save(updateDocument)).rejects.toThrow(DataAccessError);
            }
        });
    });

    describe('updatePartial method tests', () => {
        test('updatePartial an existing document, should increment version and update the document', async () => {
            const repo = new TestRepository(DBManagerInstance.db!);
            let document = await repo.getById(new ObjectId('65ff1f6c0e0dd5a32089fc28'));

            expect(document).not.toBeNull();

            if (document !== null) {
                const currentVersion = document.version;
                const updateDocument: Partial<ITestDocument> = {
                    mint: TypeConverter.numberToDecimal128(3333),
                    stake: TypeConverter.numberToDecimal128(4444),
                };

                await repo.updatePartial(document._id,
                    currentVersion,
                    updateDocument);

                expect(updateDocument.version).toBe(currentVersion + 1);

                let document2 = await repo.getById(new ObjectId('65ff1f6c0e0dd5a32089fc28'));

                expect(document2).not.toBeNull();

                if (document2 !== null) {
                    expect(document2.version).toBe(currentVersion + 1);
                    expect(document2.mint.toString()).toBe(TypeConverter.numberToDecimal128(3333).toString());
                    expect(document2.stake.toString()).toBe(TypeConverter.numberToDecimal128(4444).toString());
                }
            }
        });

        test('updatePartial an existing document with a non existing id, should throw concurency error', async () => {
            const repo = new TestRepository(DBManagerInstance.db!);

            const updateDocument: Partial<ITestDocument> = {
                mint: TypeConverter.numberToDecimal128(3333),
                stake: TypeConverter.numberToDecimal128(4444),
            };

            await expect(repo.updatePartial(new ObjectId(),
                0,
                updateDocument)).rejects.toThrow(DataAccessError);
        });

        test('updatePartial an existing document with an outdated version, should throw concurency error', async () => {
            const repo = new TestRepository(DBManagerInstance.db!);
            let document = await repo.getById(new ObjectId('65ff1f6c0e0dd5a32089fc28'));

            expect(document).not.toBeNull();

            if (document !== null) {
                const updateDocument: Partial<ITestDocument> = {
                    mint: TypeConverter.numberToDecimal128(3333),
                    stake: TypeConverter.numberToDecimal128(4444),
                };

                await expect(repo.updatePartial(document._id,
                    0,
                    updateDocument)).rejects.toThrow(DataAccessError);
            }
        });
    });

    describe('custom db connection tests', () => {
        test('deleteById should not delete the document if rollback is called', async () => {
            const [mongoClient, databaseName] = DBManagerInstance.createNewMongoClient();

            try {
                await mongoClient.connect();

                const session = mongoClient.startSession();

                try {
                    const db = mongoClient.db(databaseName);

                    session.startTransaction();

                    const repo = new TestRepository(db);
                    const repo2 = new TestRepository(DBManagerInstance.db!);

                    const result = await repo.deleteById(new ObjectId('65ff1f6c0e0dd5a32089fc28'),
                        session);

                    expect(result).toBe(true);

                    await session.abortTransaction();

                    const document = await repo2.getById(new ObjectId('65ff1f6c0e0dd5a32089fc28'));

                    expect(document).toBeDefined();
                    expect(document).not.toBeNull();
                } finally {
                    session.endSession();
                }
            } finally {
                mongoClient.close();
            }
        });

        test('deleteById should delete the document if commit is called', async () => {
            const [mongoClient, databaseName] = DBManagerInstance.createNewMongoClient();

            try {
                await mongoClient.connect();

                const session = mongoClient.startSession();

                try {
                    const db = mongoClient.db(databaseName);

                    session.startTransaction();

                    const repo = new TestRepository(db);
                    const repo2 = new TestRepository(DBManagerInstance.db!);

                    const result = await repo.deleteById(new ObjectId('65ff1f6c0e0dd5a32089fc28'),
                        session);

                    expect(result).toBe(true);

                    await session.commitTransaction();

                    const document = await repo2.getById(new ObjectId('65ff1f6c0e0dd5a32089fc28'));
                    
                    expect(document).toBeNull();
                } finally {
                    session.endSession();
                }
            } finally {
                mongoClient.close();
            }
        });
    });
});

