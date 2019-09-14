import * as React from 'react'

export class TestComponent extends React.Component<{}, {}> {
  static other = 'other'

  render() {
    return <p>returned value</p>
  }
}
