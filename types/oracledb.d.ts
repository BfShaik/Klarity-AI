declare module "oracledb" {
  export interface Pool {
    getConnection(): Promise<Connection>;
    close(gracePeriod?: number): Promise<void>;
  }

  export interface Connection {
    execute<T>(sql: string, binds?: Record<string, unknown>): Promise<Result<T>>;
    commit(): Promise<void>;
    close(): Promise<void>;
  }

  export interface Result<T> {
    rows?: T[];
    rowsAffected?: number;
  }

  export let outFormat: number;
  export let autoCommit: boolean;
  export const OUT_FORMAT_OBJECT: number;

  export function createPool(config: {
    user: string;
    password: string;
    connectString: string;
    poolMin?: number;
    poolMax?: number;
    poolIncrement?: number;
  }): Promise<Pool>;

  export function getConnection(config?: {
    user?: string;
    password?: string;
    connectString?: string;
  }): Promise<Connection>;
}
