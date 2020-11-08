import path from 'path'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import alias from '@rollup/plugin-alias'
import json from '@rollup/plugin-json'
import { esbuildPlugin } from '../script/esbuildPlugin'
import type { RollupOptions, OutputOptions } from 'rollup'

const external = [
  'electron', //
  'path',
  'fs',
  'url',
]

const plugins = [
  nodeResolve(), //
  commonjs(),
  json(),
  esbuildPlugin,
  alias({
    entries: [{ find: '@', replacement: path.join(__dirname, '../src') }],
  }),
]

interface OutputOptionsWithFile extends OutputOptions {
  file: string
}

interface RollupOptionsWithFile extends RollupOptions {
  input: string
  output: OutputOptionsWithFile
}

const options: RollupOptionsWithFile[] = [
  {
    input: './src/background.ts',
    output: {
      file: './build/background.js',
      format: 'cjs',
      sourcemap: true,
    },
    plugins,
    external,
  },
  {
    input: './src/preload.ts',
    output: {
      file: './build/preload.js',
      format: 'cjs',
      sourcemap: true,
    },
    plugins,
    external,
  },
]

export default options
