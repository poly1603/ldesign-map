import { defineConfig } from '@ldesign/builder';

export default defineConfig({
  input: 'src/index.ts',

  output: {
    format: ['esm', 'cjs'],
    esm: {
      dir: 'es',
      preserveStructure: true,
    },
    cjs: {
      dir: 'lib',
      preserveStructure: true,
    },
  },

  dts: true,
  sourcemap: true,
  minify: false,
  clean: true,

  external: [
    'vue',
    '@ldesign-map/core',
    '@deck.gl/core',
    '@deck.gl/layers',
    '@deck.gl/geo-layers',
    '@deck.gl/aggregation-layers',
  ],
});
