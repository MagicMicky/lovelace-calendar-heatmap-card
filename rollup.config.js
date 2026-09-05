const terser = require('@rollup/plugin-terser');
const postcss = require('rollup-plugin-postcss');
const resolve = require('@rollup/plugin-node-resolve');
const babel = require('@rollup/plugin-babel');
const pkg = require('./package.json');

// Rollup only *warns* on an unresolved bare import and still emits a bundle that
// carries it through - in the browser that is a 404 and a card that never
// registers. Treat it as fatal instead.
function onwarn(warning, warn) {
  if (warning.code === 'UNRESOLVED_IMPORT') {
    throw new Error(
      `Unresolved import "${warning.exporter}" in ${warning.id}. ` +
        'Is the dependency declared and installed?'
    );
  }
  warn(warning);
}

module.exports = {
  input: 'src/index.js',
  onwarn,
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
