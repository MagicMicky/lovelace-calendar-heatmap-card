const terser = require("@rollup/plugin-terser");
const postcss = require('rollup-plugin-postcss');

module.exports = {
  input: "src/index.js",
  output: {
    file: "dist/calendar-heatmap-card.js",
    format: "es",
    sourcemap: true
  },
  plugins: [
    postcss({
      inject: true,
      minimize: false
    }),
    terser()
  ]
};
