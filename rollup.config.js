const terser = require('@rollup/plugin-terser');
const postcss = require('rollup-plugin-postcss');
const resolve = require('@rollup/plugin-node-resolve');
const babel = require('@rollup/plugin-babel');
const pkg = require('./package.json');

module.exports = {
  input: 'src/index.js',
  output: {
    file: 'dist/calendar-heatmap-card.js',
    format: 'es',
    sourcemap: true,
    banner: `/**
 * ${pkg.name} ${pkg.version}
 * ${pkg.description}
 * ${pkg.repository.url}
 *
 * @license ${pkg.license}
 * @author ${pkg.author}
 */`
  },
  plugins: [
    resolve({
      browser: true,
      preferBuiltins: false,
      dedupe: ['lit']
    }),
    babel({
      babelHelpers: 'bundled',
      presets: [
        ['@babel/preset-env', { 
          targets: { esmodules: true },
          modules: false
        }]
      ],
      exclude: 'node_modules/**'
    }),
    postcss({
      inject: true,
      minimize: true
    }),
    terser({
      format: {
        comments: false
      },
      compress: {
        drop_console: false,
        drop_debugger: true
      }
    })
  ]
};
