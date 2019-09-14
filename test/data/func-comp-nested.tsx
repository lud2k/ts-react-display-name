import * as React from 'react'

const TestComponent: React.FunctionComponent<{}> = () => {
  const TestComponentNested: React.FunctionComponent<{}> = () => <p>returned value nested</p>
  return <p>returned value</p>
}
