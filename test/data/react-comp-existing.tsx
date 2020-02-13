import * as React from 'react'

export class TestComponent extends React.Component<{}, {}> {
  static displayName = 'TestComponent'
  render() {
    return <p>returned value</p>
  }
}
