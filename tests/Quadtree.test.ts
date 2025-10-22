/**
 * Quadtree空间索引测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Quadtree, GeoQuadtree, type Point, type Bounds } from '../src/spatial/Quadtree';

describe('Quadtree', () => {
  let quadtree: Quadtree;
  const bounds: Bounds = { x: 0, y: 0, width: 100, height: 100 };

  beforeEach(() => {
    quadtree = new Quadtree({ bounds, capacity: 4, maxDepth: 8 });
  });

  describe('插入操作', () => {
    it('应该成功插入点', () => {
      const point: Point = { x: 50, y: 50 };
      const result = quadtree.insert(point);

      expect(result).toBe(true);
      expect(quadtree.size()).toBe(1);
    });

    it('应该拒绝边界外的点', () => {
      const point: Point = { x: 150, y: 150 };
      const result = quadtree.insert(point);

      expect(result).toBe(false);
      expect(quadtree.size()).toBe(0);
    });

    it('应该批量插入多个点', () => {
      const points: Point[] = [
        { x: 10, y: 10 },
        { x: 20, y: 20 },
        { x: 30, y: 30 },
        { x: 40, y: 40 },
        { x: 50, y: 50 }
      ];

      const inserted = quadtree.insertMany(points);

      expect(inserted).toBe(5);
      expect(quadtree.size()).toBe(5);
    });

    it('应该在容量超限时自动分裂', () => {
      const points: Point[] = [
        { x: 10, y: 10 },
        { x: 20, y: 20 },
        { x: 30, y: 30 },
        { x: 40, y: 40 },
        { x: 50, y: 50 } // 第5个点触发分裂
      ];

      quadtree.insertMany(points);
      const stats = quadtree.getStats();

      expect(stats.totalNodes).toBeGreaterThan(1);
      expect(stats.totalPoints).toBe(5);
    });
  });

  describe('查询操作', () => {
    beforeEach(() => {
      // 插入测试数据
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
          quadtree.insert({ x: i * 10 + 5, y: j * 10 + 5 });
        }
      }
    });

    it('应该查询范围内的点', () => {
      const range: Bounds = { x: 0, y: 0, width: 30, height: 30 };
      const results = quadtree.query(range);

      expect(results.length).toBe(9); // 3x3 = 9个点
    });

    it('应该查询圆形范围内的点', () => {
      const results = quadtree.queryCircle(50, 50, 20);

      expect(results.length).toBeGreaterThan(0);
      // 验证所有点都在圆内
      results.forEach(point => {
        const distance = Math.sqrt(
          Math.pow(point.x - 50, 2) + Math.pow(point.y - 50, 2)
        );
        expect(distance).toBeLessThanOrEqual(20);
      });
    });

    it('应该查询最近的N个点', () => {
      const nearest = quadtree.queryNearest(50, 50, 5);

      expect(nearest.length).toBe(5);

      // 验证按距离排序
      for (let i = 0; i < nearest.length - 1; i++) {
        const dist1 = Math.sqrt(
          Math.pow(nearest[i].x - 50, 2) + Math.pow(nearest[i].y - 50, 2)
        );
        const dist2 = Math.sqrt(
          Math.pow(nearest[i + 1].x - 50, 2) + Math.pow(nearest[i + 1].y - 50, 2)
        );
        expect(dist1).toBeLessThanOrEqual(dist2);
      }
    });

    it('应该返回空结果当查询范围不相交', () => {
      const range: Bounds = { x: 200, y: 200, width: 50, height: 50 };
      const results = quadtree.query(range);

      expect(results.length).toBe(0);
    });
  });

  describe('性能测试', () => {
    it('应该高效处理大量数据', () => {
      const pointCount = 10000;
      const points: Point[] = [];

      for (let i = 0; i < pointCount; i++) {
        points.push({
          x: Math.random() * 100,
          y: Math.random() * 100,
          data: { id: i }
        });
      }

      const startInsert = performance.now();
      quadtree.insertMany(points);
      const insertTime = performance.now() - startInsert;

      const startQuery = performance.now();
      quadtree.query({ x: 25, y: 25, width: 50, height: 50 });
      const queryTime = performance.now() - startQuery;

      expect(insertTime).toBeLessThan(500); // 插入应在500ms内
      expect(queryTime).toBeLessThan(5); // 查询应在5ms内
    });
  });

  describe('统计信息', () => {
    it('应该提供准确的统计', () => {
      const points = Array.from({ length: 100 }, (_, i) => ({
        x: (i % 10) * 10 + 5,
        y: Math.floor(i / 10) * 10 + 5
      }));

      quadtree.insertMany(points);
      const stats = quadtree.getStats();

      expect(stats.totalPoints).toBe(100);
      expect(stats.totalNodes).toBeGreaterThan(1);
      expect(stats.maxDepth).toBeGreaterThan(0);
      expect(stats.efficiency).toBeGreaterThan(0);
      expect(stats.efficiency).toBeLessThanOrEqual(1);
    });
  });

  describe('清空和重建', () => {
    it('应该清空所有数据', () => {
      quadtree.insertMany([
        { x: 10, y: 10 },
        { x: 20, y: 20 },
        { x: 30, y: 30 }
      ]);

      quadtree.clear();

      expect(quadtree.size()).toBe(0);
      expect(quadtree.getAllPoints()).toHaveLength(0);
    });

    it('应该重建优化树结构', () => {
      const points = Array.from({ length: 100 }, (_, i) => ({
        x: Math.random() * 100,
        y: Math.random() * 100
      }));

      quadtree.insertMany(points);
      const statsBeforeinsertMany(points);
      const statsBefore = quadtree.getStats();

      quadtree.rebuild();
      const statsAfter = quadtree.getStats();

      expect(statsAfter.totalPoints).toBe(statsBefore.totalPoints);
      // 重建后效率应该相同或更好
      expect(statsAfter.efficiency).toBeGreaterThanOrEqual(statsBefore.efficiency * 0.9);
    });
  });
});

describe('GeoQuadtree', () => {
  let geoQuadtree: GeoQuadtree;

  beforeEach(() => {
    geoQuadtree = new GeoQuadtree();
  });

  it('应该使用全球范围作为默认边界', () => {
    const bounds = geoQuadtree.getBounds();

    expect(bounds.x).toBe(-180);
    expect(bounds.y).toBe(-90);
    expect(bounds.width).toBe(360);
    expect(bounds.height).toBe(180);
  });

  it('应该插入地理坐标点', () => {
    const result = geoQuadtree.insertGeoPoint(116.4, 39.9, { city: 'Beijing' });

    expect(result).toBe(true);
    expect(geoQuadtree.size()).toBe(1);
  });

  it('应该批量插入地理点', () => {
    const cities = [
      { lng: 116.4, lat: 39.9, data: { city: 'Beijing' } },
      { lng: 121.5, lat: 31.2, data: { city: 'Shanghai' } },
      { lng: 113.3, lat: 23.1, data: { city: 'Guangzhou' } }
    ];

    const inserted = geoQuadtree.insertGeoPoints(cities);

    expect(inserted).toBe(3);
    expect(geoQuadtree.size()).toBe(3);
  });

  it('应该查询地理范围', () => {
    geoQuadtree.insertGeoPoints([
      { lng: 116.4, lat: 39.9, data: { city: 'Beijing' } },
      { lng: 121.5, lat: 31.2, data: { city: 'Shanghai' } },
      { lng: 113.3, lat: 23.1, data: { city: 'Guangzhou' } }
    ]);

    // 查询东部地区
    const results = geoQuadtree.queryGeoRange(110, 30, 125, 40);

    expect(results.length).toBe(2); // Beijing and Shanghai
  });

  it('应该查询地理圆形范围', () => {
    geoQuadtree.insertGeoPoints([
      { lng: 113.3, lat: 23.1, data: { city: 'Guangzhou' } },
      { lng: 113.5, lat: 23.3, data: { city: 'Nearby' } },
      { lng: 120.0, lat: 30.0, data: { city: 'Far' } }
    ]);

    // 查询广州附近1度范围
    const results = geoQuadtree.queryGeoCircle(113.3, 23.1, 1);

    expect(results.length).toBe(2); // Guangzhou and Nearby
  });
});

