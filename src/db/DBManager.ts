import { AnyError, ClientSession, Db, MongoClient, ReadPreference } from 'mongodb';
import { IConfig, IConfigBase } from '../config/interfaces/IConfig.js';
import { DataAccessError } from '../errors/DataAccessError.js';
import { DataAccessErrorType } from '../errors/enums/DataAccessErrorType.js';
import { Globals } from '../utils/Globals.js';
import {
    MONGO_CONNECTION_TYPE,
    MongoCredentials,
    MongoCredentialsDTO,
} from './credentials/MongoCredentials.js';
import { InnerDBManager } from './interfaces/IDBManager.js';

Globals.register();

// @ts-ignore
BigInt.prototype.toJSON = function () {
    return this.toString();
};

export class ConfigurableDBManager extends InnerDBManager {
    public isConnected: boolean = false;
    public db: Db | null = null;

    private client: MongoClient | undefined;
    private mongo: MongoClient | undefined;
    private isConnecting: boolean = false;
    private databaseName: string = '';
    private isProduction: boolean = false;
    private connectionUri: string = '';

    private isSetup: boolean = false;

    private readonly mongoOpts: any = {
        readPreference: ReadPreference.PRIMARY_PREFERRED,
    };

    private connectionPromise: Promise<void> | null = null;

    constructor(config: IConfig<IConfigBase>) {
        super(config);
    }

    public createNewMongoClient(): [MongoClient, string] {
        const mongoCredentials = this.#getMongoCredentials();

        return [
            new MongoClient(mongoCredentials.connectionUri, this.mongoOpts),
            mongoCredentials.databaseName,
        ];
    }

    public async setup(_targetDatabase: string | MONGO_CONNECTION_TYPE): Promise<boolean> {
        if (!_targetDatabase) {
            _targetDatabase = this.config.DATABASE.CONNECTION_TYPE;
        }

        if (this.isSetup) return true;
        this.isSetup = true;

        this.isProduction = process.platform === 'win32';

        const mongoProductionCredentials = this.#getMongoCredentials();

        this.connectionUri = mongoProductionCredentials.connectionUri;
        this.databaseName = mongoProductionCredentials.databaseName;

        if (!this.mongo) {
            this.mongo = new MongoClient(this.connectionUri, this.mongoOpts);
        }

        return false;
    }

    public async close(): Promise<void> {
        this.client?.close();
        this.db = null;
        delete this.client;
        this.connectionPromise = null;
        this.isConnected = false;
    }

    public async connect(): Promise<void> {
        if (this.connectionPromise) {
            return this.connectionPromise;
        }

        if (this.isConnecting) return;
        if (!this.mongo) return;

        this.isConnecting = true;

        this.connectionPromise = new Promise(async (resolve) => {
            this.info('Initializing MongoDB Remote Connection.');
            if (!this.mongo) return this.log('Mongo client is not initialized.');

            this.isConnected = false;

            const client = await this.mongo.connect().catch((err: AnyError) => {
                this.error(`Something went wrong while connecting to mongo database: ${err}.`);

                setTimeout(async () => {
                    this.warn(`Attempting mongo auto reconnection.`);
                    await this.connect();

                    resolve();
                }, 2000);
            });

            if (!client) {
                return;
            }

            this.success('MongoDB Remote Connection Established.');

            this.client = client;
            this.isConnected = true;

            this.db = this.client.db(this.databaseName);

            resolve();
        });

        return this.connectionPromise;
    }

    public async startSession(): Promise<ClientSession> {
        if (!this.client) {
            throw new DataAccessError('Client not connected.', DataAccessErrorType.Unknown, '');
        }

        return this.client.startSession();
    }

    #getMongoCredentials() {
        const mongoCredentials = new MongoCredentials(<MongoCredentialsDTO>{
            databaseName: this.config.DATABASE.DATABASE_NAME,

            username: this.config.DATABASE.AUTH.USERNAME,
            password: this.config.DATABASE.AUTH.PASSWORD,

            host: this.config.DATABASE.HOST,
            port: this.config.DATABASE.PORT.toString(),

            databaseMode: this.config.DATABASE.CONNECTION_TYPE,
        });

        return mongoCredentials;
    }
}
