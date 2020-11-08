import esbuild from 'rollup-plugin-esbuild'
import { PluginContext } from 'rollup'

export const esbuildPlugin = esbuild({
  // All options are optional
  include: /\.[jt]sx?$/, // default, inferred from `loaders` option
  exclude: /node_modules/, // default
  sourceMap: false, // default
  minify: process.env.NODE_ENV === 'production',
  target: 'es2017', // default, or 'es20XX', 'esnext'
  jsxFactory: 'React.createElement',
  jsxFragment: 'React.Fragment',
  // Like @rollup/plugin-replace
  define: {
    __VERSION__: '"x.y.z"',
  },
  // Add extra loaders
  loaders: {
    // Add .json files support
    // require @rollup/plugin-commonjs
    '.json': 'json',
    // Enable JSX in .js files too
    '.js': 'jsx',
  },
})

export async function closeEsbuild() {
  if (esbuildPlugin.buildEnd != null) {
    return esbuildPlugin.buildEnd.call({ meta: { watchMode: false } } as PluginContext, new Error())
  }
}
