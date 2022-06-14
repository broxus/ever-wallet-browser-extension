import { makeAutoObservable } from 'mobx';

type OptionalEnumField<T extends Record<string, string | number>> = {
  [key in keyof T as `set${string & key}`]: () => void;
} & {
  readonly value: T[keyof T] | undefined;
  setValue(value: T[keyof T] | undefined): void;
};

type EnumField<T extends Record<string, string | number>> = {
  [key in keyof T as `set${string & key}`]: () => void;
} & {
  readonly value: T[keyof T];
  setValue(value: T[keyof T]): void;
};

export function createEnumField<T extends { [key: string]: string | number }>(enumeration: T): OptionalEnumField<T>;
export function createEnumField<T extends { [key: string]: string | number }>(enumeration: T, initialValue: T[keyof T]): EnumField<T>;
export function createEnumField<T extends { [key: string]: string | number }>(enumeration: T, initialValue?: T[keyof T]): EnumField<T> {
  const entries = Object.entries(enumeration).filter(([key]) => (!~~key && key !== '0'));
  const result: any = {
    value: initialValue,
    setValue(value: T[keyof T]) {
      result.value = value;
    },
  };

  for (const [key, value] of entries) {
    if (result[`set${key}`]) {
      throw new Error(`Incompatible enum property: ${key}`);
    }

    result[`set${key}`] = () => {
      result.value = value;
    };
  }

  return makeAutoObservable(result as EnumField<T>);
}
