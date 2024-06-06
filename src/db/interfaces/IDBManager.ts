import { ClientSession } from 'mongodb';
import { IConfig, IConfigBase } from '../../config/interfaces/IConfig.js';
import { MONGO_CONNECTION_TYPE } from '../credentials/MongoCredentials.js';
import { Logger } from '@btc-vision/logger';

export interface IDBManager {
    connect: () => Promise<void>;
    setup: (targetDatabase: string | MONGO_CONNECTION_TYPE) => Promise<boolean>;
    close: () => Promise<void>;
    startSession: () => Promise<ClientSession>;
}

export abstract class InnerDBManager extends Logger implements IDBManager {
    protected config: IConfig<IConfigBase>;

    protected constructor(config: IConfig<IConfigBase>) {
        super();
        this.config = config;
    }

    public abstract connect(): Promise<void>;

    public abstract setup(targetDatabase: string | MONGO_CONNECTION_TYPE): Promise<boolean>;

    public abstract close(): Promise<void>;

    public abstract startSession(): Promise<ClientSession>;
}
