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
    const result = ts.transpileModule(file('func-comp.tsx'), options)
    expect(result.outputText).to.equal(file('func-comp.ts'))
  })

  it('adds displayName to FC (shortcut for FunctionComponent)', () => {
    const result = ts.transpileModule(file('fc-comp.tsx'), options)
    expect(result.outputText).to.equal(file('func-comp.ts'))
  })

  it('adds displayName to many FunctionComponent', () => {
    const result = ts.transpileModule(file('func-comp-multi.tsx'), options)
    expect(result.outputText).to.equal(file('func-comp-multi.ts'))
  })

  it('adds displayName to nested FunctionComponent', () => {
    const result = ts.transpileModule(file('func-comp-nested.tsx'), options)
    expect(result.outputText).to.equal(file('func-comp-nested.ts'))
  })

  it('does not add displayName to nested FunctionComponent if onlyFileRoot is set', () => {
    const onlyRootOptions = makeOptions({ onlyFileRoot: true })
    const result = ts.transpileModule(file('func-comp-nested.tsx'), onlyRootOptions)
    expect(result.outputText).to.equal(file('func-comp-nested-only-root.ts'))
  })

  it('adds displayName to classes extending React.Component', () => {
    const result = ts.transpileModule(file('react-comp.tsx'), options)
    expect(result.outputText).to.equal(file('react-comp.ts'))
  })

  it('adds displayName to mulitple classes extending React.Component', () => {
    const result = ts.transpileModule(file('react-comp-multiple.tsx'), options)
    expect(result.outputText).to.equal(file('react-comp-multiple.ts'))
  })

  it('adds displayName to classes extending React.Component containing other static prop', () => {
    const result = ts.transpileModule(file('react-comp-other-static.tsx'), options)
    expect(result.outputText).to.equal(file('react-comp-other-static.ts'))
  })

  it('adds displayName to classes extending React.Component nested', () => {
    const result = ts.transpileModule(file('react-comp-nested.tsx'), options)
    expect(result.outputText).to.equal(file('react-comp-nested.ts'))
  })

  it('does not add displayName to classes extending React.Component nested if onlyFileRoot is set', () => {
    const onlyRootOptions = makeOptions({ onlyFileRoot: true })
    const result = ts.transpileModule(file('react-comp-nested.tsx'), onlyRootOptions)
    expect(result.outputText).to.equal(file('react-comp-nested-only-root.ts'))
  })

  it('adds displayName to classes extending React.PureComponent', () => {
    const result = ts.transpileModule(file('pure-comp.tsx'), options)
    expect(result.outputText).to.equal(file('pure-comp.ts'))
  })

  it('adds displayName to unamed default classes extending React.Component', () => {
    const result = ts.transpileModule(file('react-comp-unamed-default.tsx'), {
      ...options,
      fileName: 'react-comp-unamed-default.tsx',
    })
    expect(result.outputText).to.equal(file('react-comp-unamed-default.ts'))
  })

  it('does not add displayName to classes extending React.Component with static displayName', () => {
    const result = ts.transpileModule(file('react-comp-existing.tsx'), options)
    expect(result.outputText).to.equal(file('react-comp-existing.ts'))
  })

  it('does not crash when no prop/state is declared on a React.Component', () => {
    const result = ts.transpileModule(file('react-comp-no-prop-state.tsx'), options)
    expect(result.outputText).to.equal(file('react-comp-no-prop-state.ts'))
  })

  it('adds displayName to forwardRef', () => {
    const result = ts.transpileModule(file('forward-ref.tsx'), options)
    expect(result.outputText).to.equal(file('forward-ref.ts'))
  })

  it('adds displayName to many forwardRef', () => {
    const result = ts.transpileModule(file('forward-ref-multi.tsx'), options)
    expect(result.outputText).to.equal(file('forward-ref-multi.ts'))
  })

  it('adds displayName to tagged template', () => {
    const taggedTemplateOptions = makeOptions({ taggedTemplateModules: ['styled'] })
    const result = ts.transpileModule(file('tagged-template.tsx'), taggedTemplateOptions)
    expect(result.outputText).to.equal(file('tagged-template.ts'))
  })
})
