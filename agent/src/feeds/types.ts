export interface DataFeed {
  start(): Promise<void>;
  stop(): Promise<void>;
  getLatest(): Promise<unknown>;
}
