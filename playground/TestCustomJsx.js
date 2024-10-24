const word = 'JS22X  cus222tom 123'

const CCC = () => <div>2223</div>

export default {
  data() {
    return {
      aaa: 'ffffff',
    }
  },
  methods: {
    click(params) {
      //  console.log('asdasdas')
    },
  },
  render() {
    return (
      <div class={'jsx'} onClick={this.click}>
        {this.aaa}
        {/* {word} */}
        <CCC />
        <CCC />
        <CCC />
      </div>
    )
  },
}
