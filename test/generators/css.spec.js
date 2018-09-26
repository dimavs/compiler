import {register, unregister} from '../../src/preprocessors'
import compileCSS from '../../src/generators/css'
import {createOutput} from '../../src/transformer'
import {expect} from 'chai'
import parser  from 'riot-parser'
import {renderSync} from 'node-sass'

const simpleCSS = `
<style>
  :root {
    color: 'red';
  }
</style>
`


const scssCSS = `
<style type='scss'>
  :root {
    color: 'red';

    & {
      background-color: red;
    }
  }
</style>
`
const FAKE_FILE = 'fake-file.js'

function scssPreprocessor(source, { file }) {
  const result = renderSync({
    file: file,
    data: source,
    outFile: file,
    sourceMap: true
  })

  return {
    code: String(result.css),
    map: JSON.parse(result.map)
  }
}

describe('Generators - CSS', () => {
  before(() => {
    register('css', 'scss', scssPreprocessor)
  })

  after(() => {
    unregister('css', 'scss')
  })

  it('compile a simple css node', async function() {
    const { css } = parser().parse(simpleCSS).output

    const { code, map } = await compileCSS(css, simpleCSS, {
      file: FAKE_FILE
    }, createOutput(null, { file: FAKE_FILE }))

    expect(map.mappings.split(',')).to.not.be.empty
    expect(code).to.be.a('string')
  })

  it('compile a scss file and generate a proper sourcemap', async function() {
    const { css } = parser().parse(scssCSS).output

    const { code, map } = await compileCSS(css, scssCSS, {
      file: FAKE_FILE
    }, createOutput(null, { file: FAKE_FILE }))

    expect(map.mappings.split(',')).to.not.be.empty
    expect(code).to.be.a('string')
  })
})