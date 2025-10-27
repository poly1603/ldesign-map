/**
 * 日志级别
 */
export declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    NONE = 4
}
/**
 * 日志条目接口
 */
export interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: number;
    data?: any;
    stack?: string;
}
/**
 * 日志处理函数类型
 */
export type LogHandler = (entry: LogEntry) => void;
/**
 * Logger - 日志管理器
 * 提供统一的日志记录和错误处理
 */
export declare class Logger {
    private static instance;
    private level;
    private logs;
    private maxLogs;
    private handlers;
    private enabled;
    private constructor();
    /**
     * 获取Logger实例
     */
    static getInstance(): Logger;
    /**
     * 设置日志级别
     */
    setLevel(level: LogLevel): void;
    /**
     * 获取日志级别
     */
    getLevel(): LogLevel;
    /**
     * 启用日志
     */
    enable(): void;
    /**
     * 禁用日志
     */
    disable(): void;
    /**
     * 添加日志处理函数
     */
    addHandler(handler: LogHandler): () => void;
    /**
     * 移除所有处理函数
     */
    removeAllHandlers(): void;
    /**
     * Debug 日志
     */
    debug(message: string, data?: any): void;
    /**
     * Info 日志
     */
    info(message: string, data?: any): void;
    /**
     * Warn 日志
     */
    warn(message: string, data?: any): void;
    /**
     * Error 日志
     */
    error(message: string, error?: Error | any): void;
    /**
     * 记录日志
     */
    private log;
    /**
     * 控制台输出
     */
    private consoleOutput;
    /**
     * 获取日志历史
     */
    getLogs(level?: LogLevel, limit?: number): LogEntry[];
    /**
     * 清除日志历史
     */
    clearLogs(): void;
    /**
     * 设置最大日志数量
     */
    setMaxLogs(max: number): void;
    /**
     * 导出日志为JSON
     */
    exportLogs(): string;
    /**
     * 导出日志为文本
     */
    exportLogsAsText(): string;
    /**
     * 下载日志文件
     */
    downloadLogs(filename?: string): void;
}
/**
 * 错误类型
 */
export declare enum ErrorType {
    INITIALIZATION = "INITIALIZATION",
    RENDERING = "RENDERING",
    DATA_LOADING = "DATA_LOADING",
    INVALID_PARAMETER = "INVALID_PARAMETER",
    UNSUPPORTED_FEATURE = "UNSUPPORTED_FEATURE",
    NETWORK = "NETWORK",
    UNKNOWN = "UNKNOWN"
}
/**
 * MapError - 自定义地图错误类
 */
export declare class MapError extends Error {
    type: ErrorType;
    data?: any;
    timestamp: number;
    constructor(type: ErrorType, message: string, data?: any);
    /**
     * 转换为JSON
     */
    toJSON(): object;
}
/**
 * 创建标准化的错误
 */
export declare function createMapError(type: ErrorType, message: string, data?: any): MapError;
export declare const debug: (message: string, data?: any) => void;
export declare const info: (message: string, data?: any) => void;
export declare const warn: (message: string, data?: any) => void;
export declare const error: (message: string, err?: Error | any) => void;
export default Logger;
//# sourceMappingURL=Logger.d.ts.map