import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'es/index.js',
        format: 'esm',
        sourcemap: true
      },
      {
        file: 'lib/index.js',
        format: 'cjs',
        sourcemap: true
      }
    ],
    external: [
      '@deck.gl/core',
      '@deck.gl/layers',
      '@deck.gl/geo-layers',
      '@deck.gl/aggregation-layers'
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: 'es',
        outDir: 'es'
      })
    ]
  }
];
