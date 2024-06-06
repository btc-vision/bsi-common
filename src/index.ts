import { CacheStrategy } from './cache/enums/CacheStrategy.js';
import { ICacheStrategy } from './cache/interfaces/ICacheStrategy.js';
import { NodeCacheStrategy } from './cache/NodeCacheStrategy.js';
import { BitcoinNetwork } from './config/enums/BitcoinNetwork.js';
import {
    MONGO_CONNECTION_TYPE,
    MongoCredentials,
    MongoCredentialsDTO,
} from './db/credentials/MongoCredentials.js';
import { DBConstants } from './db/DBConstants.js';
import { ConfigurableDBManager } from './db/DBManager.js';
import { IBaseDocument } from './db/documents/interfaces/IBaseDocument.js';
import { IBaseDocumentWithId } from './db/documents/interfaces/IBaseDocumentWithId.js';
import { IDBManager } from './db/interfaces/IDBManager.js';
import { BaseModel } from './db/models/BaseModel.js';
import { BaseModelWithId } from './db/models/BaseModelWithId.js';
import { BaseRepository } from './db/repositories/BaseRepository.js';
import { BaseRepositoryWithId } from './db/repositories/BaseRepositoryWithId.js';
import { PagingQueryInfo, PagingQueryResult } from './db/repositories/PagingQuery.js';
import { DataAccessError } from './errors/DataAccessError.js';
import { DataAccessErrorType } from './errors/enums/DataAccessErrorType.js';
import { Globals } from './utils/Globals.js';
import { TypeConverter } from './utils/TypeConverter.js';

export { CacheStrategy, ICacheStrategy, NodeCacheStrategy };
export { MongoCredentials, MONGO_CONNECTION_TYPE, MongoCredentialsDTO, BitcoinNetwork };
export { DataAccessErrorType, DataAccessError };
export * from '@btc-vision/logger';

export { Globals, TypeConverter };
export { IBaseDocument, IBaseDocumentWithId, IDBManager, BaseModel, BaseModelWithId };
export {
    BaseRepository,
    BaseRepositoryWithId,
    PagingQueryInfo,
    PagingQueryResult,
    DBConstants,
    ConfigurableDBManager,
};

export * from './config/ConfigBase.js';
export * from './config/interfaces/IConfig.js';
export * from './config/ConfigLoader.js';
