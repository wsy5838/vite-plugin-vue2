<!-- 单列下拉 -->
<!-- note：有部分class是用的boss-ui  -->
<template>
  <div
    ref="refWrap"
    class="single-drop-wrap"
    :class="[isOpen && 'dropdown-menu-open', directionClass]"
  >
    <div class="dropdown-wrap">
      <span
        v-if="type !== 'menu'"
        :class="[
          'dropdown-select',
          isOpen && 'is-open',
          isDefault ? '' : 'not-default-select',
        ]"
        @click="toggle"
      >
        <slot name="selected-item">
          <span :class="['item-display', isDefault ? '' : 'not-default']">{{
            search && !isDefault ? search : placeholder
          }}</span>
        </slot>
        <span v-if="showClear" class="suffix-close" @click="clear"
          ><i class="ui-icon-circle-close"></i
        ></span>
        <input type="hidden" :value="currentValue" />
      </span>
      <span
        v-if="type === 'menu'"
        class="dropdown-label"
        :class="{ gray: !currentLabel }"
        @click="toggle"
      >
        <slot name="prefix-label"></slot>
        {{ currentLabel || placeholder }}
        <slot name="suffix-label"></slot>
      </span>
      <p v-if="validateMessage" class="tip-error">
        <i class="ui-icon-warning"></i>{{ validateMessage }}
      </p>
    </div>

    <transition :name="transition">
      <div v-if="isOpen" ref="dropdown" class="dropdown-menu">
        <slot name="options">
          <ul class="options">
            <li
              v-for="(option, index) in filteredOptions"
              :key="index"
              @click="handleSelect(option, $event)"
            >
              <slot name="option-item" v-bind="option">
                <span>{{ option[selectLabel] }}</span>
                <svg-icon
                  v-if="
                    option[selectValue] !== undefined &&
                    option[selectValue] !== null &&
                    option[selectValue] == currentValue
                  "
                  width="16"
                  height="16"
                  icon-class="hunter-xuanzhongduigou"
                ></svg-icon>
              </slot>
            </li>
            <li
              v-if="optionsList && !filteredOptions.length"
              class="no-options"
            >
              <slot name="no-options">{{ noDataTip }}</slot>
            </li>
          </ul>
        </slot>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'SingleDrop',
  props: {
    disabled: Boolean,
    optionsList: [Object, Array],
    options: Array, // 自定义dropdown内容
    remoteData: Array, // 父组件远程获取到的数据
    type: {
      type: String,
      default: 'text',
    },
    value: {
      type: [String, Number],
      default: '',
    },
    selectLabel: {
      type: String, // 自定义选中的对象属性，用于显示,比如也可以定义为name
      default: 'label',
    },
    selectValue: {
      // 自定义选中的对象属性，用于标识value
      type: [String, Number],
      default: 'value',
    },
    prop: String,
    transition: {
      type: String,
      default: '',
    },
    filterable: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: String,
      default: '请选择',
    },
    initLabel: {
      type: String,
      default: '',
    },
    clearable: {
      type: Boolean,
      default: false,
    },
    changeable: {
      type: Boolean,
      default: true,
    },
    noDataTip: {
      type: String,
      default: '暂无数据',
    },
    // 打开选项回调
    onOpen: {
      type: Function,
    },
    defaultValue: {
      type: [String, Number],
      default: '',
    },
  },
  data() {
    return {
      currentLabel: '',
      currentValue: '',
      isOpen: false,
      isBottomShow: true,
      mutableValue: null,
      mutableOptions: [],
      search: '',
      optionClicked: false, // 是否点击过选项
      directionClass: '',
      validateState: '',
      validateMessage: '',
      validateDisabled: false,
    }
  },
  computed: {
    model: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('update:value', val)
      },
    },
    filteredOptions() {
      if (this.remoteData && this.remoteData.length) {
        return this.remoteData
      }
      if (!this.filterable) {
        return this.mutableOptions.slice()
      }

      return this.search && this.search.length
        ? this.filter(this.mutableOptions, this.search)
        : this.mutableOptions
    },
    showClear() {
      return (
        this.clearable && !this.disabled && !this.readonly && this.optionClicked
      )
    },
    isDefault() {
      return this.defaultValue == '' || this.currentValue == this.defaultValue
    },
  },
  watch: {
    value(val) {
      this.mutableValue = val
      this.validateState = ''
      this.validateMessage = ''
      this.setLabelAndVal(val)
    },
    optionsList() {
      this.mutableOptions = this.getOptions()
    },
    isOpen(val) {
      if (this.onOpen) {
        this.onOpen(val)
      }
    },
  },
  mounted() {
    this.mutableOptions = this.getOptions()
    this.getOptionSelected()
  },
  methods: {
    setLabelAndVal(value) {
      this.currentValue = value
      this.$emit('input', value)

      if (Array.isArray(this.optionsList)) {
        let bingo = false
        this.optionsList.forEach((item) => {
          if (`${item[this.selectValue]}` === `${value}`) {
            bingo = true
            this.currentLabel = item[this.selectLabel]
            this.search = item[this.selectLabel]
            this.$emit('update:label', item[this.selectLabel])
          }
        })
        if (!bingo) this.clear()
      }
    },
    /**
     * 设置选中label
     */
    setCurrentLabel(label) {
      this.search = label
      if (this.changeable) this.currentLabel = label
      this.$emit('update:label', label)
    },

    /**
     * 设置选中value
     */
    setCurrentValue(value) {
      this.currentValue = value
      this.$emit('input', value) // 这里利用emit触发input事件，
    },

    toggle() {
      this.isOpen = !this.isOpen
      if (this.isOpen) {
        this.$nextTick(() => {
          this.getDirection()
        })
      }
    },

    show() {
      this.isOpen = true
      this.$nextTick(() => {
        this.getDirection()
      })
    },

    /**
     * 检查是否有空间显示不同方向class
     */
    getDirection() {
      const pos = this.$refs.refWrap?.getBoundingClientRect()
      this.directionClass =
        pos?.top > window.innerHeight / 2 ? 'direction-up' : ''
    },

    /**
     * 关闭
     */
    handleClose() {
      this.isOpen = false
    },

    /**
     * 根据输入数据筛选出数据
     */
    filter(mutableOptions, search) {
      return mutableOptions.filter((item) => {
        const label = item[this.selectLabel]
        return this.filterBy(label, search)
      })
    },

    filterBy(label, search) {
      label = label.toString()
      return (label || '').toLowerCase().indexOf(search.toLowerCase()) > -1
    },

    /**
     * 选中
     */
    handleSelect(item, event) {
      const el = $(event.target).closest('li')
      const container = el.closest('ul')
      container.find('li').removeClass('selected')

      if (!el.hasClass('nodata') && !el.hasClass('disabled'))
        el.addClass('selected')

      this.optionClicked = true
      this.setCurrentLabel(item[this.selectLabel])
      this.setCurrentValue(item[this.selectValue])

      this.validateState = ''
      this.validateMessage = ''

      this.handleClose()
      this.$emit('update:selected', item)
      this.$emit('selected', item)
    },

    /**
     * 删除搜索文本
     */
    clear() {
      this.optionClicked = false
      this.setCurrentLabel('')
      this.setCurrentValue('')
      if (this.$refs.input) this.$refs.input.focus()
      this.$emit('update:input', '')
      if (this.filterable && this.mutableOptions.length) {
        this.$nextTick(() => {
          this.show()
        })
      }
    },
    /**
     * 整理对象为数组的参数  数组型对象会返回对象 否则会返回整理后的对象
     */
    getArrayOptions() {
      const newOptions = []
      if (this.optionsList.length) {
        this.optionsList.forEach((item) => {
          if (typeof item !== 'object') {
            const params = {
              [this.selectValue]: item,
              [this.selectLabel]: item,
            }
            newOptions.push(params)
          } else {
            newOptions.push(item)
          }
        })
      }

      return newOptions
    },

    /**
     * 整理对象的参数
     */
    getObjectOptions() {
      const newOptions = []
      if (this.optionsList instanceof Object) {
        for (let i in this.optionsList) {
          const params = {
            [this.selectValue]: i,
            [this.selectLabel]: this.optionsList[i],
          }

          newOptions.push(params)
        }
      }

      return newOptions
    },

    /**
     * 整理参数
     */
    getOptions() {
      return Array.isArray(this.optionsList)
        ? this.getArrayOptions()
        : this.getObjectOptions()
    },

    /**
     * 初始时数据被选中
     */
    getOptionSelected() {
      const options = this.getOptions()
      const findOption =
        options.find((item) => item[this.selectValue] == this.model) || {}
      /* 通过v-model获得value，然后通过value到optionsList数组中去查找并显示对应的label，但是也会存在初始时显示的文案与optionsList中的label不对应的情况 */
      this.setCurrentLabel(this.initLabel || findOption[this.selectLabel])
      this.setCurrentValue(findOption[this.selectValue] || this.model)
    },
  },
}
</script>

<style lang="less" scoped>
.single-drop-wrap {
  position: relative;
  height: 24px;
  line-height: 24px;
}
.dropdown-wrap {
  position: relative;
  .dropdown-select {
    height: 24px;
    line-height: 24px;
    .item-display {
      padding: 0;
      padding-right: 15px;
      border: none;
      line-height: 24px;
      color: #262f4d;
      font-size: 13px;
      border-radius: 4px;

      &.not-default {
        overflow: hidden;
        color: #31488d;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    &.not-default-select {
      .item-display {
        color: #31488d;
      }

      &::after {
        border-top-color: #31488d;
      }
    }
    &::after {
      content: '';
      position: absolute;
      top: 9px;
      right: 0;
      border: 4px solid transparent;
      border-top: 5px dashed #b8bbcc;
      border-bottom-width: 5px;
    }
    &:hover {
      .item-display {
        color: #2a5cc9;
      }
      &::after {
        border-top: 5px dashed #2a5cc9;
      }
    }
    &.is-open::after {
      top: 4px;
      transform: rotate(180deg);
    }
  }

  .dropdown-menu {
    .options {
      box-sizing: border-box;
      min-width: 130px;
      padding: 4px;

      li {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 12px;
        color: #243466;
        font-size: 13px;
        border-radius: 4px;
        &:hover {
          background: #f0f3f7;
        }
      }
    }
  }
}
</style>
