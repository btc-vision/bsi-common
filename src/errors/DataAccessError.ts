import { DataAccessErrorType } from './enums/DataAccessErrorType.js';

export class DataAccessError extends Error {
    public extra: string;
    public name: string;
    public errorType: DataAccessErrorType;

    constructor(
        message: string,
        errorType: DataAccessErrorType = DataAccessErrorType.Unknown,
        extra: string = '',
    ) {
        super(message);
        this.name = this.constructor.name;
        this.extra = extra;
        this.errorType = errorType;

        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        } else {
            this.stack = new Error(message).stack;
        }
    }
}
