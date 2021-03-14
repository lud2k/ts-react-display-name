import * as React from 'react'

const TestComponent1 = React.forwardRef<HTMLParagraphElement, {}>((_props, ref) => <p ref={ref}>returned value 1</p>),
  TestComponent2 = React.forwardRef<HTMLParagraphElement, {}>((_props, ref) => <p ref={ref}>returned value 2</p>)
