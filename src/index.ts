import fs from 'fs'
import type { SFCBlock, TemplateCompileOptions } from '@vue/component-compiler-utils'
import { createFilter } from '@rollup/pluginutils'
import type { Plugin, ViteDevServer } from 'vite'
import { normalizeComponentCode } from './utils/componentNormalizer'
import { vueHotReloadCode } from './utils/vueHotReload'
import { parseVueRequest } from './utils/query'
import { transformMain } from './main'
import { compileSFCTemplate } from './template'
import { getDescriptor } from './utils/descriptorCache'
import { transformStyle } from './style'
import { handleHotUpdate } from './hmr'
import { transformVueJsx } from './jsxTransform'
import { isJsxCode } from './template/utils'
import { esbuildPlugin } from './esbuild-plugin'
import 'colors'

export const vueComponentNormalizer = '\0/vite/vueComponentNormalizer'
export const vueHotReload = '\0/vite/vueHotReload'

// extend the descriptor so we can store the scopeId on it
declare module '@vue/component-compiler-utils' {
  interface SFCDescriptor {
    id: string
  }
}

export interface VueViteOptions {
  include?: string | RegExp | (string | RegExp)[]
  exclude?: string | RegExp | (string | RegExp)[]
  /**
   * The options for `@vue/component-compiler-utils`.
   */
  vueTemplateOptions?: Partial<TemplateCompileOptions>
  /**
   * The options for jsx transform
   * @default false
   */
  jsx?: boolean
  /**
   * The options for `@vue/babel-preset-jsx`
   */
  jsxOptions?: Record<string, any>
  /**
   * The options for esbuild to transform script code
   * @default 'esnext'
   * @example 'esnext' | ['esnext','chrome58','firefox57','safari11','edge16','node12']
   */
  target?: string | string[]
}

export interface ResolvedOptions extends VueViteOptions {
  root: string
  devServer?: ViteDevServer
  isProduction: boolean
  target?: string | string[]
}


export function createVuePlugin(rawOptions: VueViteOptions = {}): Plugin {
  const options: ResolvedOptions = {
    isProduction: process.env.NODE_ENV === 'production',
    ...rawOptions,
    root: process.cwd(),
  }

  const filter = createFilter(options.include || /\.vue$/, options.exclude)

  return {
    name: 'vite-plugin-vue2',
    // 解析配置前
    // 这里加入 esbuild插件，防止报错
    config(config) {
      console.log('启动1'.rainbow)
      if (!config.optimizeDeps) config.optimizeDeps = {};
      config.optimizeDeps = config.optimizeDeps || {};
      config.optimizeDeps.esbuildOptions = config.optimizeDeps.esbuildOptions || {};
      config.optimizeDeps.esbuildOptions.plugins = config.optimizeDeps.esbuildOptions.plugins || [];

      // 注入 esbuild插件
      config.optimizeDeps.esbuildOptions.plugins.push(esbuildPlugin)

      if (options.jsx) {
        return {
          esbuild: {
            include: /\.(ts)$/,
            exclude: /\.(tsx|jsx)$/,
          },
        }
      }
    },


    // 解析配置后
    configResolved(config) {
      // //  console.log('启动2'.rainbow)

      options.isProduction = config.isProduction
      options.root = config.root
    },

    // 开发服务器（node）配置项
    configureServer(server) {
      // //  console.log('启动3'.rainbow)

      options.devServer = server
    },

    // 热更新入口函数
    handleHotUpdate(ctx) {
      //  console.log('热更新1'.rainbow)
      //  console.log(ctx.file)
      // 不是.vue的 直接忽略,不由本插件处理
      if (!filter(ctx.file)) {
        //  console.log(ctx.file.yellow)
        return
      }

      return handleHotUpdate(ctx, options)
    },

    // 解析模块首先方法，id 粗浅可以理解为 需要解析的模块路径 如：虚拟路径,alias 路径 
    // 正常可以解析的路径不走这个方法(被其他前置插件跳过了)，比如同目录一个a.js,只要路径正确是指向这个的 不走，别的都走 ps: ./a.vue or @/a.js
    resolveId(id) {
      // //  console.log('解析1'.rainbow, id)

      if (id === vueComponentNormalizer || id === vueHotReload) {

        return id
      }
      // serve subpart requests (*?vue) as virtual modules
      if (parseVueRequest(id).query.vue) {

        return id
      }
    },

    load(id) {
      // //  console.log('加载1'.rainbow, id)
      // 组件归一化代码（sfc .vue文件 处理 js css template对象）
      if (id === vueComponentNormalizer)
        return normalizeComponentCode

      // 热加载模块代码
      if (id === vueHotReload)
        return vueHotReloadCode
      const { filename, query } = parseVueRequest(id)
      // select corresponding block for subpart virtual modules
      // ！！！！这块代码执行顺序是 先load原文件然后没命中判断 然后 走transform 然后 返回load 然后下面命中
      if (query.vue) {
        // 这个是.vue内 外部引入js css等的场景
        if (query.src) {
          // 读取代码文件
          return fs.readFileSync(filename, 'utf-8')
        }

        // 解析vue文件 分出 js css tmp
        const descriptor = getDescriptor(filename)!
        // //  console.log(!!descriptor, 'descriptor')
        let block: SFCBlock | null | undefined

        if (query.type === 'script')
          block = descriptor.script!
        else if (query.type === 'template')
          block = descriptor.template!
        else if (query.type === 'style')
          block = descriptor.styles[query.index!]
        else if (query.index != null)
          block = descriptor.customBlocks[query.index]

        if (block) {
          // 会流转到下面的 transform 进行编译
          return {
            code: block.content,
            // code: block.content,
            map: block.map as any,
          }
        }
      }
    },

    async transform(code, id) {
      // //  console.log('加载2'.rainbow, id)

      const { filename, query } = parseVueRequest(id)

      // jsx类型的文件
      // .jsx .tsx   /App.vue?vue&type=script&lang.jsx
      if (/\.(tsx|jsx)$/.test(id)) {

        //  console.log(id, 1233)

        return transformVueJsx(code, id, options.jsxOptions)
      }

      // 如果js里 有jsx代码  按照js转化
      if (!query.vue && /\.(js)$/.test(id) && isJsxCode(code)) {
        return transformVueJsx(code, id, options.jsxOptions)
      }

      // 不是.vue 也不是jsx类型的 会走到这里，ps:普通js文件 css/scss文件等
      if ((!query.vue && !filter(filename)) || query.raw) {
        // //  console.log('不被本插件处理'.green)
        return
      }

      // 原始未经过任何编译的.vue文件会到这里，
      // 可以理解成第一步
      // 出来的 初次编译的 带有虚拟路径 和热更新的代码
      if (!query.vue) {
        //  console.log('我是原始vue文件'.blue, id)
        // main request
        let res = await transformMain(code, filename, options, this as any)

        // //  console.log(res, 999)

        return res
      }


      //  console.log('文件'.red.bgCyan, id)


      // 这两类
      // /App.vue?vue&type=template&lang.js
      // /App.vue?vue&type=style&index=0&scoped=true&lang.css
      const descriptor = getDescriptor(
        query.from ? decodeURIComponent(query.from) : filename,
      )!
      // sub block request
      if (query.type === 'template') {
        return compileSFCTemplate(
          code,
          descriptor.template!,
          filename,
          options,
          this as any,
        )
      }
      if (query.type === 'style') {
        return await transformStyle(
          code,
          filename,
          descriptor,
          Number(query.index),
          this as any,
        )
      }
    },

    transformIndexHtml(html, ctx) {

      console.log(ctx.bundle, 123123)
      console.log(ctx.chunk, 123123)
      return html.replace(
        /<title>(.*?)<\/title>/,
        `<title>Title replaced!</title>`,
      )
    },
  }
}


export function createVuePluginCss(rawOptions: VueViteOptions = {}): Plugin {

  return {
    name: 'vite-plugin-vue2-xxx',
    async generateBundle(output, bundle) {
      console.log('output', output, 111)
      console.log('bundle', bundle, 222)
    }
  }
}