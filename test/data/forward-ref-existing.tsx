import * as React from 'react'

const TestComponent = React.forwardRef<HTMLParagraphElement, {}>((_props, ref) => <p ref={ref}>returned value</p>)
TestComponent.displayName = 'MyTestComponent'