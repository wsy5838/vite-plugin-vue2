const word = 'JS22X  cus222tom 123'

const CCC = () => <div>2</div>

export default {
  data() {
    return {
      aaa: 'f2ff',
    }
  },
  methods: {
    click(params) {
      console.log(123121231313)
    },
  },
  render() {
    return (
      <div class={'jsx'} onClick={this.click}>
        {this.aaa}
        {/* {word} */}
        <CCC />
      </div>
    )
  },
}
