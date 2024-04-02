import { CacheStrategy } from '../cache/enums/CacheStrategy.js';
import { DebugLevel } from '../logger/enums/DebugLevel.js';
import {
    APIConfig,
    BlockchainConfig,
    DataBaseConfig,
    DocsConfig,
    IConfig,
    IConfigBase,
    IConfigTemplate,
    ORDClientConfig,
} from './interfaces/IConfig.js';

export abstract class ConfigBase<T extends IConfigTemplate> implements IConfigBase {
    public readonly MRC_DISTRIBUTION_PERIOD: number;
    public readonly DEBUG_FILEPATH: string;
    public readonly CACHE_STRATEGY: CacheStrategy;
    public readonly LOG_FOLDER: string;
    public readonly DEBUG_LEVEL: DebugLevel;
    public readonly DOCS: DocsConfig;

    public readonly API: APIConfig;

    public readonly DATABASE: DataBaseConfig;

    public readonly BLOCKCHAIN: BlockchainConfig;

    public readonly ORDCLIENT: ORDClientConfig;

    constructor(config: IConfig<T>) {
        this.DEBUG_LEVEL = config.DEBUG_LEVEL;
        this.DOCS = config.DOCS;

        this.API = config.API;
        this.DATABASE = config.DATABASE;

        this.BLOCKCHAIN = config.BLOCKCHAIN;
        this.ORDCLIENT = config.ORDCLIENT;

        this.MRC_DISTRIBUTION_PERIOD = config.MRC_DISTRIBUTION_PERIOD;
        this.DEBUG_FILEPATH = config.DEBUG_FILEPATH;
        this.CACHE_STRATEGY = config.CACHE_STRATEGY;
        this.LOG_FOLDER = config.LOG_FOLDER;
    }
}

