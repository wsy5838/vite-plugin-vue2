<script>
export default {
  data() {
    return {
      count: 0,
    }
  },
}
</script>

<template>
  <div>
    <h2>Hot Module</h2>
    <p>
      <span>
        HMR: click button and edit template part of <code>./TestHmr.vue</code>,
        count should not reset
      </span>
      <button class="hmr-increment" @click="count++">
        &gt;&gt;&gt; {{ count }} &lt;&lt;&lt;
      </button>
    </p>
  </div>
</template>
