<script lang="jsx">
// import TestMultiplySrcImport from './src-import/TestMultiplySrcImport.vue'
// import TestBlockSrcImport from './src-import/TestBlockSrcImport.vue'
// import TestScopedCss from './css/TestScopedCss.vue'
// import TestCssModules from './css/TestCssModules.vue'
// import TestEmptyCss from './css/TestEmptyCss.vue'
// import TestCustomBlock from './custom/TestCustomBlock.vue'
// import TestHmr from './hmr/TestHmr.vue'
// import TestAssets from './test-assets/TestAssets.vue'
// import TestJsx from './TestJsx.tsx'
// import TestJsxAAA from './TestCustomJsx'
// import TestJsxSFC from './TestJsxSFC.vue'
// import TestDecorator from './TestDecorator.tsx'
// import TestES2020Features from './TestES2020Features.vue'

export default {
  name: 'App',
  components: {
    // TestMultiplySrcImport,
    // TestScopedCss,
    // TestBlockSrcImport,
    // TestCssModules,
    // TestEmptyCss,
    // TestCustomBlock,
    // TestHmr,
    // TestAssets,
    // TestJsx,
    // TestJsxAAA,
    // TestJsxSFC,
    // TestDecorator,
    // TestES2020Features,
  },
  methods: {
    onClick() {
      console.log(12223)
      const a = (h) => <div>222222</div>
      // console.log(a)
      // console.log(2223)
    },
  },
}
</script>

<template>
  <div>
    <h1 class="a" @click="onClick">111</h1>
    <!-- <TestJsxSFC /> -->

    <br />
    <br />
    <br />
    <br />
    <!-- <TestBlockSrcImport /> -->
    <!-- <TestJsx /> -->

    <!-- <TestJsxAAA /> -->
    <!-- <TestMultiplySrcImport />
    <TestBlockSrcImport />
    <TestScopedCss />
    <TestCssModules />
    <TestCustomBlock />
    <TestEmptyCss />
    <TestHmr />
    <TestAssets />
    <TestJsx />

    <TestDecorator />
    <TestES2020Features /> -->
  </div>
</template>
<style scoped>
div {
  color: rgb(138, 43, 226);
}
</style>
