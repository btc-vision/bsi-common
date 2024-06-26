import { CacheStrategy } from '../../cache/enums/CacheStrategy.js';
import { MONGO_CONNECTION_TYPE } from '../../db/credentials/MongoCredentials.js';
import { BitcoinNetwork } from '../enums/BitcoinNetwork.js';
import { DebugLevel } from '@btc-vision/logger';

export interface DocsConfig {
    ENABLED: boolean;
    PORT: number;
}

export interface APIConfig {
    ENABLED: boolean;
    PORT: number;
    THREADS: number;
}

export interface DataBaseConfig {
    CONNECTION_TYPE: MONGO_CONNECTION_TYPE;
    DATABASE_NAME: string;

    HOST: string;
    PORT: number;

    AUTH: {
        USERNAME: string;
        PASSWORD: string;
    };
}

export interface BlockchainConfig {
    BITCOIND_NETWORK: BitcoinNetwork;
    BITCOIND_HOST: string;
    BITCOIND_PORT: number;

    BITCOIND_USERNAME: string;
    BITCOIND_PASSWORD: string;
}

export interface ORDClientConfig {
    ORDCLIENT_URL: string;
}

export interface IConfigBase extends IConfigTemplate {
    DOCS: DocsConfig;
    API: APIConfig;

    DATABASE: DataBaseConfig;
    BLOCKCHAIN: BlockchainConfig;
    ORDCLIENT: ORDClientConfig;

    DEBUG_LEVEL: DebugLevel;
    MRC_DISTRIBUTION_PERIOD: number;
    DEBUG_FILEPATH: string;
    CACHE_STRATEGY: CacheStrategy;
    LOG_FOLDER: string;
}

export interface IConfigTemplate {}

export type IConfig<T extends IConfigTemplate> = IConfigBase & T;
