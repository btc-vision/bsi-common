import { CacheStrategy } from '../cache/enums/CacheStrategy.js';
import {
    APIConfig,
    BlockchainConfig,
    DataBaseConfig,
    DocsConfig,
    IConfig,
    IConfigBase,
    IConfigTemplate
} from './interfaces/IConfig.js';
import { DebugLevel } from '@btc-vision/logger';

export abstract class ConfigBase<T extends IConfigTemplate> implements IConfigBase {
    public readonly DEBUG_FILEPATH: string;
    public readonly CACHE_STRATEGY: CacheStrategy;
    public readonly LOG_FOLDER: string;
    public readonly DEBUG_LEVEL: DebugLevel;
    public readonly DOCS: DocsConfig;

    public readonly API: APIConfig;

    public readonly DATABASE: DataBaseConfig;

    public readonly BLOCKCHAIN: BlockchainConfig;

    protected constructor(config: IConfig<T>) {
        this.DEBUG_LEVEL = config.DEBUG_LEVEL;
        this.DOCS = config.DOCS;

        this.API = config.API;
        this.DATABASE = config.DATABASE;

        this.BLOCKCHAIN = config.BLOCKCHAIN;

        this.DEBUG_FILEPATH = config.DEBUG_FILEPATH;
        this.CACHE_STRATEGY = config.CACHE_STRATEGY;
        this.LOG_FOLDER = config.LOG_FOLDER;
    }
}
