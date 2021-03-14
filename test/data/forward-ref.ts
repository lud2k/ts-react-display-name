import * as React from 'react';
var TestComponent = React.forwardRef(function (_props, ref) { return React.createElement("p", { ref: ref }, "returned value"); });
TestComponent.displayName = "TestComponent"
