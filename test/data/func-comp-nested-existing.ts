import * as React from 'react';
var TestComponentA = function () {
    var TestComponentB = function () { return React.createElement("p", null, "returned value nested"); };
    TestComponentB.displayName = 'MyTestComponentB';
    return React.createElement("p", null, "returned value");
};
TestComponentA.displayName = 'MyTestComponentA';
var TestComponentC = function () {
    var TestComponentB = function () { return React.createElement("p", null, "returned value nested"); };
    TestComponentB.displayName = "TestComponentB"
    return React.createElement("p", null, "returned value");
};
TestComponentC.displayName = "TestComponentC"
