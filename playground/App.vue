<script>
// import TestMultiplySrcImport from './src-import/TestMultiplySrcImport.vue'
// import TestBlockSrcImport from './src-import/TestBlockSrcImport.vue'
// import TestScopedCss from './css/TestScopedCss.vue'
// import TestCssModules from './css/TestCssModules.vue'
// import TestEmptyCss from './css/TestEmptyCss.vue'
// import TestCustomBlock from './custom/TestCustomBlock.vue'
// import TestHmr from './hmr/TestHmr.vue'
// import TestAssets from './test-assets/TestAssets.vue'
import TestJsx from './TestJsx.tsx'
import TestJsxAAA from './TestCustomJsx'
import TestJsxSFC from './TestJsxSFC.vue'
// import SlotCom from './slot.vue'

// import TestDecorator from './TestDecorator.tsx'
// import TestES2020Features from './TestES2020Features.vue'

export default {
  name: 'App',
  components: {
    TestJsx,
    TestJsxAAA,
    TestJsxSFC,
    // SlotCom,
  },
  created() {
    //  console.log('asf222d')
  },
  methods: {
    onClick() {
      // //  console.log('ffq222wef')
      //  console.log(a)
      // //  console.log(2223)
    },
  },
}
</script>

<template>
  <div>
    <h1 class="a" @click="onClick">fdadad</h1>

    <div class="a">
      <div class="b"></div>
    </div>
    <!-- <SlotCom /> -->

    <TestJsxSFC />

    <br />
    <br />
    <TestJsxAAA />

    <br />
    <br />
    <br />
    <br />
    <TestJsx />
  </div>
</template>
<style scoped lang="less">
h1 {
  color: rgb(138, 43, 226);
  font-size: 30px;
}
.a {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: yellow;
  .b {
    width: 50px;
    height: 50px;
    background-color: aqua;
  }
}
</style>
