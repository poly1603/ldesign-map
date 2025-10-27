import type { Deck } from '@deck.gl/core';
/**
 * 导出格式类型
 */
export type ExportFormat = 'png' | 'jpeg' | 'webp';
/**
 * 导出配置选项
 */
export interface ExportOptions {
    format?: ExportFormat;
    quality?: number;
    filename?: string;
    width?: number;
    height?: number;
    scale?: number;
}
/**
 * ExportUtil - 地图导出工具
 * 提供将地图导出为图片的功能
 */
export declare class ExportUtil {
    /**
     * 导出地图为图片
     * @param deck Deck.gl 实例
     * @param options 导出选项
     * @returns Promise<Blob> 图片数据
     */
    static exportToImage(deck: Deck | null, options?: ExportOptions): Promise<Blob>;
    /**
     * 下载地图为图片文件
     * @param deck Deck.gl 实例
     * @param options 导出选项
     */
    static downloadAsImage(deck: Deck | null, options?: ExportOptions): Promise<void>;
    /**
     * 将地图导出为 Base64 字符串
     * @param deck Deck.gl 实例
     * @param options 导出选项
     * @returns Promise<string> Base64 字符串
     */
    static exportToBase64(deck: Deck | null, options?: ExportOptions): Promise<string>;
    /**
     * 打印地图
     * @param deck Deck.gl 实例
     * @param options 导出选项
     */
    static print(deck: Deck | null, options?: ExportOptions): Promise<void>;
    /**
     * 将地图截图复制到剪贴板
     * @param deck Deck.gl 实例
     * @param options 导出选项
     */
    static copyToClipboard(deck: Deck | null, options?: ExportOptions): Promise<void>;
}
//# sourceMappingURL=ExportUtil.d.ts.map