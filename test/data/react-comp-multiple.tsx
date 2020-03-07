import * as React from 'react'

class TestComponent extends React.Component<{}, {}> {
  render() {
    return <p>returned value</p>
  }
}

class TestComponentA extends React.Component<{}> {
  render() {
    return <p>returned value</p>
  }
}

class TestComponentB extends React.Component<{}> {
  static displayName = 'TestComponentB'
  render() {
    return <p>returned value</p>
  }
}
