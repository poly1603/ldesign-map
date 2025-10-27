/**
 * DataFilter - 数据过滤器
 * 提供强大的数据过滤和查询功能
 */
import type { FeatureCollection } from './types';
export type FilterOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains' | 'startsWith' | 'endsWith' | 'exists' | 'between' | 'matches';
export interface FilterRule {
    field: string;
    operator: FilterOperator;
    value: any;
}
export interface FilterGroup {
    logic: 'and' | 'or';
    rules: (FilterRule | FilterGroup)[];
}
export type FilterExpression = FilterRule | FilterGroup;
/**
 * 数据过滤器类
 */
export declare class DataFilter {
    private originalData;
    private filteredData;
    private activeFilters;
    /**
     * 设置原始数据
     */
    setData(data: FeatureCollection): void;
    /**
     * 添加过滤规则
     */
    addFilter(filter: FilterExpression): void;
    /**
     * 移除过滤规则
     */
    removeFilter(index: number): void;
    /**
     * 清除所有过滤
     */
    clearFilters(): void;
    /**
     * 应用所有过滤规则
     */
    private applyFilters;
    /**
     * 评估单个过滤规则
     */
    private evaluateFilter;
    /**
     * 评估过滤组
     */
    private evaluateFilterGroup;
    /**
     * 评估过滤规则
     */
    private evaluateFilterRule;
    /**
     * 获取要素属性值
     */
    private getFeatureValue;
    /**
     * 判断是否为过滤组
     */
    private isFilterGroup;
    /**
     * 获取过滤后的数据
     */
    getFilteredData(): FeatureCollection | null;
    /**
     * 获取原始数据
     */
    getOriginalData(): FeatureCollection | null;
    /**
     * 获取过滤统计
     */
    getStats(): {
        total: number;
        filtered: number;
        removed: number;
        filterCount: number;
    };
    /**
     * 快速过滤方法
     */
    static filterByProperty(data: FeatureCollection, field: string, operator: FilterOperator, value: any): FeatureCollection;
    /**
     * 按名称搜索
     */
    static searchByName(data: FeatureCollection, searchTerm: string): FeatureCollection;
    /**
     * 按范围过滤
     */
    static filterByRange(data: FeatureCollection, field: string, min: number, max: number): FeatureCollection;
}
//# sourceMappingURL=DataFilter.d.ts.map