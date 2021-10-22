import { z } from 'zod';
import { Doc } from '../doc';
import { Field } from '../field';
import { Query } from '../onQuery';
import { SnapshotInfo } from '../snapshot';
import { SetModel } from '../set';
import { UpdateModel } from '../update';
import { UpsetModel } from '../upset';
export default function <T>(collectionName: string, zodSchema?: Record<keyof T, z.Schema<T[keyof T]>>): () => {
    collectionName: string;
    collection: import("../collection").Collection<T>;
    zod: z.ZodObject<Record<keyof T, z.ZodType<T[keyof T], z.ZodTypeDef, T[keyof T]>>, "strip", z.ZodTypeAny, { [k_1 in keyof z.objectUtil.addQuestionMarks<{ [k in keyof Record<keyof T, z.ZodType<T[keyof T], z.ZodTypeDef, T[keyof T]>>]: Record<keyof T, z.ZodType<T[keyof T], z.ZodTypeDef, T[keyof T]>>[k]["_output"]; }>]: z.objectUtil.addQuestionMarks<{ [k_2 in keyof Record<keyof T, z.ZodType<T[keyof T], z.ZodTypeDef, T[keyof T]>>]: Record<keyof T, z.ZodType<T[keyof T], z.ZodTypeDef, T[keyof T]>>[k_2]["_output"]; }>[k_1]; }, { [k_3 in keyof z.objectUtil.addQuestionMarks<{ [k_2 in keyof Record<keyof T, z.ZodType<T[keyof T], z.ZodTypeDef, T[keyof T]>>]: Record<keyof T, z.ZodType<T[keyof T], z.ZodTypeDef, T[keyof T]>>[k_2]["_input"]; }>]: z.objectUtil.addQuestionMarks<{ [k_2_1 in keyof Record<keyof T, z.ZodType<T[keyof T], z.ZodTypeDef, T[keyof T]>>]: Record<keyof T, z.ZodType<T[keyof T], z.ZodTypeDef, T[keyof T]>>[k_2_1]["_input"]; }>[k_3]; }> | null;
    remove: {
        (id: string): Promise<void>;
        (id: Doc<T>): Promise<void>;
    };
    set: {
        (id: string, data: SetModel<T>): Promise<void>;
        (model: Doc<T>): Promise<void>;
    };
    save: {
        (id: string, data: UpdateModel<T> | Field<T>[]): Promise<void>;
        (model: Doc<T>): Promise<void>;
    };
    update: {
        (id: string, data: UpdateModel<T> | Field<T>[]): Promise<void>;
        (model: Doc<T>): Promise<void>;
    };
    upset: {
        (id: string, data: UpsetModel<T>): Promise<void>;
        (model: Doc<T>): Promise<void>;
    };
    parse(data: T): T;
    add(data: T): Promise<import("..").Ref<T>>;
    all(): Promise<Doc<T>[]>;
    get(id: string): Promise<Doc<T> | null>;
    getInRadius(center: [number, number], radiusInM: number, maxLimit?: number): Promise<Doc<T>[]>;
    getMany(ids: string[], onMissing?: "ignore" | ((id: string) => T) | undefined): Promise<Doc<T>[]>;
    onAll(onResult: (docs: Doc<T>[], info: SnapshotInfo<T>) => any, onError?: ((error: Error) => any) | undefined): () => void;
    onGet(id: string, onResult: (doc: Doc<T> | null) => any, onError?: ((error: Error) => any) | undefined): () => void;
    onGetMany(ids: string[], onResult: (docs: Doc<T>[]) => any, onError?: ((error: Error) => any) | undefined): () => void;
    onQuery(queries: Query<T, keyof T>[], onResult: (docs: Doc<T>[]) => any, onError?: ((error: Error) => any) | undefined): () => void;
    query(queries: Query<T, keyof T>[]): Promise<Doc<T>[]>;
};
