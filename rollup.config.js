import typescript from '@rollup/plugin-typescript';
import del from 'rollup-plugin-delete'
import { terser } from 'rollup-plugin-terser'
import pkg from './package.json';

export default {
  input: 'src/index.ts',
  output: {
    sourcemap: !!process.env.ROLLUP_WATCH,
    name: pkg.name,
    dir: 'dist',
    format: 'es'
  },
  external: [...Object.keys(pkg.peerDependencies || {})],
  plugins: [
    del({
      targets: ['dist/*']
    }),
    typescript({
      declaration: true,
      rootDir: 'src',
      declarationDir: 'dist'
    }),
    terser({
      output: {
        comments: false
      }
    })
  ]
};
