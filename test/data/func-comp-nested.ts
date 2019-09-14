import * as React from 'react';
var TestComponent = function () {
    var TestComponentNested = function () { return React.createElement("p", null, "returned value nested"); };
    TestComponentNested.displayName = "TestComponentNested"
    return React.createElement("p", null, "returned value");
};
TestComponent.displayName = "TestComponent"
