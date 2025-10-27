/**
 * SearchLocator - 搜索定位器
 * 提供地理位置搜索和快速定位功能
 */
import type { Feature, FeatureCollection } from './types';
export interface SearchResult {
    feature: Feature;
    name: string;
    center: [number, number];
    adcode?: string;
    score: number;
}
export interface SearchOptions {
    fields?: string[];
    fuzzy?: boolean;
    caseSensitive?: boolean;
    maxResults?: number;
}
/**
 * 搜索定位器类
 */
export declare class SearchLocator {
    private data;
    private searchIndex;
    /**
     * 设置数据并建立索引
     */
    setData(data: FeatureCollection): void;
    /**
     * 建立搜索索引
     */
    private buildIndex;
    /**
     * 搜索
     */
    search(query: string, options?: SearchOptions): SearchResult[];
    /**
     * 计算匹配分数
     */
    private calculateMatchScore;
    /**
     * 计算字符串相似度（Levenshtein距离）
     */
    private calculateSimilarity;
    /**
     * 分词
     */
    private tokenize;
    /**
     * 获取要素名称
     */
    private getFeatureName;
    /**
     * 获取要素中心点
     */
    private getFeatureCenter;
    /**
     * 按adcode搜索
     */
    searchByAdcode(adcode: string): SearchResult | null;
    /**
     * 获取所有要素名称列表（用于自动完成）
     */
    getAllNames(): string[];
    /**
     * 获取索引统计
     */
    getIndexStats(): {
        features: number;
        tokens: number;
        avgTokensPerFeature: number;
    };
}
//# sourceMappingURL=SearchLocator.d.ts.map