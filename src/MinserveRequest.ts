export type MinserveRequest = {
    method?: string;
    url?: string;
    headers: Record<string, string[] | undefined>;
    body: {
        registerBodyChunkListener: (listener: (chunk: Uint8Array) => void | Promise<void>) => void;
        registerBodyEndListener: (listener: () => void | Promise<void>) => void;
        registerBodyErrorListener: (listener: (error: Error) => void | Promise<void>) => void;
    };
};