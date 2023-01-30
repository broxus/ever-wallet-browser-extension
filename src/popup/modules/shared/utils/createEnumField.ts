import { makeAutoObservable } from 'mobx'

type OptionalEnumField<T extends Record<string, string | number>> = {
    readonly value: T[keyof T] | undefined;
    setValue(value: T[keyof T] | undefined): void;
    is(value: T[keyof T]): boolean;
    callback(value: T[keyof T] | undefined): () => void;
};

type EnumField<T extends Record<string, string | number>> = {
    readonly value: T[keyof T];
    setValue(value: T[keyof T]): void;
    is(value: T[keyof T]): boolean;
    callback(value: T[keyof T]): () => void;
};

type Enumeration = { [key: string]: string | number };

export function createEnumField<T extends Enumeration>(): OptionalEnumField<T>;
export function createEnumField<T extends Enumeration>(initialValue: T[keyof T]): EnumField<T>;
export function createEnumField<T extends Enumeration>(initialValue?: T[keyof T]): EnumField<T> {
    const callbacks = {} as Record<T[keyof T], () => void>
    const result: any = {
        value: initialValue,
        setValue(value: T[keyof T]) {
            result.value = value
        },
        is(value: T[keyof T]): boolean {
            return result.value === value
        },
        callback(value: T[keyof T]): () => void {
            if (!callbacks[value]) {
                callbacks[value] = () => result.setValue(value)
            }
            return callbacks[value]
        },
    }

    return makeAutoObservable(result as EnumField<T>)
}
