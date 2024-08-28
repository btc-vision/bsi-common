import { CacheStrategy } from '../../cache/enums/CacheStrategy.js';
import { DebugLevel } from '@btc-vision/logger';

export interface DataBaseConfig {
    DATABASE_NAME: string;

    HOST: string;
    PORT: number;

    AUTH: {
        USERNAME: string;
        PASSWORD: string;
    };
}

export interface IConfigBase extends IConfigTemplate {
    DEBUG_LEVEL: DebugLevel;
    DEBUG_FILEPATH: string;
    CACHE_STRATEGY: CacheStrategy;
    LOG_FOLDER: string;
    DATABASE: DataBaseConfig;
}

export interface IConfigTemplate {}

export type IConfig<T extends IConfigTemplate> = IConfigBase & T;
