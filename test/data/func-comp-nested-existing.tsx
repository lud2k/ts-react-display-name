import * as React from 'react'

const TestComponentA: React.FunctionComponent<{}> = () => {
  const TestComponentB: React.FunctionComponent<{}> = () => <p>returned value nested</p>
  TestComponentB.displayName = 'MyTestComponentB'
  return <p>returned value</p>
}
TestComponentA.displayName = 'MyTestComponentA'

const TestComponentC: React.FunctionComponent<{}> = () => {
  const TestComponentB: React.FunctionComponent<{}> = () => <p>returned value nested</p>
  return <p>returned value</p>
}
