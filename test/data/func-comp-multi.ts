import * as React from 'react';
var TestComponent1 = function () { return React.createElement("p", null, "returned value 1"); }, TestComponent2 = function () { return React.createElement("p", null, "returned value 2"); };
TestComponent1.displayName = "TestComponent1"
TestComponent2.displayName = "TestComponent2"
