import { ClientSession } from 'mongodb';
import { IConfig, IConfigBase } from '../../config/interfaces/IConfig.js';
import { Logger } from '@btc-vision/logger';

export interface IDBManager {
    connect: () => Promise<void>;
    setup: (targetDatabase: string) => Promise<boolean>;
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

    public abstract setup(targetDatabase: string): Promise<boolean>;

    public abstract close(): Promise<void>;

    public abstract startSession(): Promise<ClientSession>;
}
