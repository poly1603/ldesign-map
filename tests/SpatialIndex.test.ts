/**
 * SpatialIndex测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SpatialIndex, createGeoIndex, createPlanarIndex } from '../src/spatial/SpatialIndex';
import type { Bounds } from '../src/spatial/Quadtree';

describe('SpatialIndex', () => {
  let index: SpatialIndex;
  const bounds: Bounds = { x: 0, y: 0, width: 1000, height: 1000 };

  beforeEach(() => {
    index = new SpatialIndex(bounds);
  });

  describe('基础操作', () => {
    it('应该插入点', () => {
      const result = index.insert({ x: 500, y: 500 });

      expect(result).toBe(true);
    });

    it('应该批量插入点', () => {
      const points = Array.from({ length: 100 }, (_, i) => ({
        x: (i % 10) * 100 + 50,
        y: Math.floor(i / 10) * 100 + 50
      }));

      const inserted = index.insertMany(points);

      expect(inserted).toBe(100);
    });
  });

  describe('查询操作', () => {
    beforeEach(() => {
      const points = Array.from({ length: 100 }, (_, i) => ({
        x: (i % 10) * 100 + 50,
        y: Math.floor(i / 10) * 100 + 50,
        data: { id: i }
      }));
      index.insertMany(points);
    });

    it('应该查询范围内的点', () => {
      const results = index.query({
        x: 0,
        y: 0,
        width: 300,
        height: 300
      });

      expect(results.length).toBe(9); // 3x3网格
    });

    it('应该查询圆形范围', () => {
      const results = index.queryCircle(500, 500, 150);

      expect(results.length).toBeGreaterThan(0);
      results.forEach(point => {
        const distance = Math.sqrt(
          Math.pow(point.x - 500, 2) + Math.pow(point.y - 500, 2)
        );
        expect(distance).toBeLessThanOrEqual(150);
      });
    });

    it('应该查询最近的点', () => {
      const nearest = index.queryNearest(505, 505, 3);

      expect(nearest.length).toBe(3);
    });

    it('应该进行视口裁剪', () => {
      const viewport: Bounds = {
        x: 200,
        y: 200,
        width: 400,
        height: 400
      };

      const visible = index.clipToViewport(viewport);

      expect(visible.length).toBeGreaterThan(0);
      visible.forEach(point => {
        expect(point.x).toBeGreaterThanOrEqual(200);
        expect(point.x).toBeLessThan(600);
        expect(point.y).toBeGreaterThanOrEqual(200);
        expect(point.y).toBeLessThan(600);
      });
    });
  });

  describe('自动优化', () => {
    it('应该在效率低时自动重建', () => {
      // 禁用自动重建进行测试
      const manualIndex = new SpatialIndex(bounds, { autoRebuild: false });

      const points = Array.from({ length: 1000 }, () => ({
        x: Math.random() * 1000,
        y: Math.random() * 1000
      }));

      manualIndex.insertMany(points);
      const statsBefore = manualIndex.getStats();

      manualIndex.rebuild();
      const statsAfter = manualIndex.getStats();

      expect(statsAfter.points).toBe(statsBefore.points);
    });
  });

  describe('统计信息', () => {
    it('应该提供准确的统计', () => {
      const points = Array.from({ length: 500 }, () => ({
        x: Math.random() * 1000,
        y: Math.random() * 1000
      }));

      index.insertMany(points);
      const stats = index.getStats();

      expect(stats.points).toBe(500);
      expect(stats.nodes).toBeGreaterThan(1);
      expect(stats.efficiency).toBeGreaterThan(0);
      expect(stats.efficiency).toBeLessThanOrEqual(1);
    });

    it('应该跟踪查询性能', () => {
      const points = Array.from({ length: 100 }, () => ({
        x: Math.random() * 1000,
        y: Math.random() * 1000
      }));

      index.insertMany(points);

      // 执行多次查询
      for (let i = 0; i < 10; i++) {
        index.query({ x: 0, y: 0, width: 500, height: 500 });
      }

      const stats = index.getStats();

      expect(stats.totalQueries).toBe(10);
      expect(stats.avgQueryTime).toBeGreaterThan(0);
    });
  });

  describe('性能基准', () => {
    it('应该运行性能测试', async () => {
      const results = await index.benchmark(1000);

      expect(results.insertTime).toBeGreaterThan(0);
      expect(results.queryTime).toBeGreaterThan(0);
      expect(results.pointsPerSecond).toBeGreaterThan(0);
      expect(results.queriesPerSecond).toBeGreaterThan(0);
    });
  });
});

describe('辅助函数', () => {
  it('createGeoIndex应该创建地理索引', () => {
    const geoIndex = createGeoIndex();
    const bounds = geoIndex.getBounds();

    expect(bounds.x).toBe(-180);
    expect(bounds.width).toBe(360);
  });

  it('createPlanarIndex应该创建平面索引', () => {
    const bounds: Bounds = { x: 0, y: 0, width: 100, height: 100 };
    const planarIndex = createPlanarIndex(bounds);

    expect(planarIndex.getBounds()).toEqual(bounds);
  });
});

