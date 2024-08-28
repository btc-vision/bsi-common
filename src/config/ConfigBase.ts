import { CacheStrategy } from '../cache/enums/CacheStrategy.js';
import { DataBaseConfig, IConfig, IConfigBase, IConfigTemplate } from './interfaces/IConfig.js';
import { DebugLevel } from '@btc-vision/logger';

export abstract class ConfigBase<T extends IConfigTemplate> implements IConfigBase {
    public readonly DEBUG_FILEPATH: string;
    public readonly CACHE_STRATEGY: CacheStrategy;
    public readonly LOG_FOLDER: string;
    public readonly DEBUG_LEVEL: DebugLevel;

    public readonly DATABASE: DataBaseConfig;

    protected constructor(config: IConfig<T>) {
        this.DEBUG_LEVEL = config.DEBUG_LEVEL;

        this.DATABASE = config.DATABASE;

        this.DEBUG_FILEPATH = config.DEBUG_FILEPATH;
        this.CACHE_STRATEGY = config.CACHE_STRATEGY;
        this.LOG_FOLDER = config.LOG_FOLDER;
    }
}
