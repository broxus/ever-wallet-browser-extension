export interface CreatePasswordStore {
    loading: boolean;
    submit(password: string, cache?: boolean): Promise<void>;
}
