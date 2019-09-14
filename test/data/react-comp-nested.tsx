import * as React from 'react'

export class TestComponent extends React.Component<{}, {}> {
  render() {
    class TestComponentNested extends React.Component<{}, {}> {
      render() {
        return <p>returned value nested</p>
      }
    }

    return <TestComponentNested />
  }
}
