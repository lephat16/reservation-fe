export * from './user';
export * from './product';
export * from './category';
export * from './supplier';
export * from './transaction';
export interface ResponseData {
    status: number;
    message: string;
    timestamp: string;
}