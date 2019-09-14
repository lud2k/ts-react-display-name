import { describe, it } from 'mocha'
import { expect } from 'chai'
import * as fs from 'fs'
import * as ts from 'typescript'
import { addDisplayNameTransformer, AddDisplayNameOptions } from '../src'

const file = (name: string) => fs.readFileSync('test/data/' + name).toString('utf-8')

describe('index.ts', () => {
  const makeOptions = (
    transformerOptions?: Partial<AddDisplayNameOptions>
  ): ts.TranspileOptions => ({
    compilerOptions: { module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.React },
    transformers: { before: [addDisplayNameTransformer(transformerOptions)] },
  })
  const options = makeOptions()

  it('adds displayName to FunctionComponent', () => {
    let result = ts.transpileModule(file('func-comp.tsx'), options)
    expect(result.outputText).to.equal(file('func-comp.ts'))
  })

  it('adds displayName to FC (shortcut for FunctionComponent)', () => {
    let result = ts.transpileModule(file('fc-comp.tsx'), options)
    expect(result.outputText).to.equal(file('func-comp.ts'))
  })

  it('adds displayName to many FunctionComponent', () => {
    let result = ts.transpileModule(file('func-comp-multi.tsx'), options)
    expect(result.outputText).to.equal(file('func-comp-multi.ts'))
  })

  it('adds displayName to nested FunctionComponent', () => {
    let result = ts.transpileModule(file('func-comp-nested.tsx'), options)
    expect(result.outputText).to.equal(file('func-comp-nested.ts'))
  })

  it('does not add displayName to nested FunctionComponent if onlyFileRoot is set', () => {
    const onlyRootOptions = makeOptions({ onlyFileRoot: true })
    let result = ts.transpileModule(file('func-comp-nested.tsx'), onlyRootOptions)
    expect(result.outputText).to.equal(file('func-comp-nested-only-root.ts'))
  })

  it('adds displayName to classes extending React.Component', () => {
    let result = ts.transpileModule(file('react-comp.tsx'), options)
    expect(result.outputText).to.equal(file('react-comp.ts'))
  })

  it('adds displayName to classes extending React.Component containing other static prop', () => {
    let result = ts.transpileModule(file('react-comp-other-static.tsx'), options)
    expect(result.outputText).to.equal(file('react-comp-other-static.ts'))
  })

  it('adds displayName to classes extending React.Component nested', () => {
    let result = ts.transpileModule(file('react-comp-nested.tsx'), options)
    expect(result.outputText).to.equal(file('react-comp-nested.ts'))
  })

  it('does not add displayName to classes extending React.Component nested if onlyFileRoot is set', () => {
    const onlyRootOptions = makeOptions({ onlyFileRoot: true })
    let result = ts.transpileModule(file('react-comp-nested.tsx'), onlyRootOptions)
    expect(result.outputText).to.equal(file('react-comp-nested-only-root.ts'))
  })

  it('adds displayName to classes extending React.PureComponent', () => {
    let result = ts.transpileModule(file('pure-comp.tsx'), options)
    expect(result.outputText).to.equal(file('pure-comp.ts'))
  })
})
