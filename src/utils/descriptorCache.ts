import path from 'path'
import slash from 'slash'
import hash from 'hash-sum'
import type { SFCDescriptor, SFCBlock } from '@vue/component-compiler-utils'
import { parse } from '@vue/component-compiler-utils'
// 模板编译成 h函数
import * as vueTemplateCompiler from 'vue-template-compiler'
import type { ResolvedOptions } from '../index'
import { isJsxCode } from '../template/utils'

const cache = new Map<string, SFCDescriptor>()
const prevCache = new Map<string, SFCDescriptor | undefined>()

export function createDescriptor(
  source: string,
  filename: string,
  { root, isProduction, vueTemplateOptions }: ResolvedOptions,
) {

  // 解析.vue文件
  const descriptor = parse({
    source,
    compiler: vueTemplateOptions?.compiler || (vueTemplateCompiler as any),
    filename,
    sourceRoot: root,
    needMap: true,
  })



  updateJsToJSX(descriptor.script, filename)

  // v2 hasn't generate template and customBlocks map
  // ensure the path is normalized in a way that is consistent inside
  // project (relative to root) and on different systems.
  const normalizedPath = slash(path.normalize(path.relative(root, filename)))
  descriptor.id = hash(normalizedPath + (isProduction ? source : ''))

  cache.set(slash(filename), descriptor)
  return descriptor
}

export function getPrevDescriptor(filename: string) {
  return prevCache.get(slash(filename))
}

export function setPrevDescriptor(filename: string, entry: SFCDescriptor) {
  prevCache.set(slash(filename), entry)
}

export function getDescriptor(filename: string, errorOnMissing = true) {
  const descriptor = cache.get(slash(filename))
  if (descriptor)
    return descriptor

  if (errorOnMissing) {
    throw new Error(
      `${filename} has no corresponding SFC entry in the cache. `
      + 'This is a vite-plugin-vue2 internal error, please open an issue.',
    )
  }
}

export function setDescriptor(filename: string, entry: SFCDescriptor) {
  cache.set(slash(filename), entry)
}


// 如果script标签内有jsx预发，但是没有写lange="jsx", 给加上
export function updateJsToJSX(script: SFCBlock | null, filename: string) {
  if (script) {

    if (script.lang) {
      return
    }

    if (isJsxCode(script.content)) {
      if (!script.attrs) {
        script.attrs = {}
      }
      console.log('修正'.bgBlue.yellow, filename)
      script.attrs.lang = 'jsx'
      script.lang = 'jsx'
    }

  }

}