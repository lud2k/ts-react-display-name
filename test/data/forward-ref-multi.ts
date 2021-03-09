import * as React from 'react';
var TestComponent1 = React.forwardRef(function (_props, ref) { return React.createElement("p", { ref: ref }, "returned value 1"); }), TestComponent2 = React.forwardRef(function (_props, ref) { return React.createElement("p", { ref: ref }, "returned value 2"); });
TestComponent1.displayName = "TestComponent1"
TestComponent2.displayName = "TestComponent2"
