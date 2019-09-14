# ts-react-display-name

[![react version](https://img.shields.io/badge/React-16+-green.svg?style=flat-square)](https://github.com/facebook/react/)
[![typescript version](https://img.shields.io/badge/TypeScript-3.6+-green.svg?style=flat-square)](https://www.typescriptlang.org/)

Typescript transformer that adds displayName to React components.

## Setup

### Installation

Install the library:
```bash
npm install --save-dev ts-react-display-name
```

### Webpack

If you are using Webpack, import the tranformer:
```js
const { addDisplayNameTransformer } = require('ts-react-display-name')
```

Then add it to ts-loader's options:
```js
{
  test: /\.(tsx?)$/,
  loader: 'ts-loader',
  options: {
    getCustomTransformers: () => ({
      before: [addDisplayNameTransformer()]
    })
  }
}
```


## Example

Using this transformer, the following code:
```js
// Function component
const TestFuncComponent: React.FC<{}> = () => <p>...</p>

// React component
export class TestComponent extends React.Component<{}, {}> {
  render() { ... }
}
```

Becomes:
```js
// Function component
const TestFuncComponent: React.FC<{}> = () => <p>...</p>
TestFuncComponent.displayName = 'TestFuncComponent'

// React component
export class TestComponent extends React.Component<{}, {}> {
  static displayName = 'TestComponent'
  render() { ... }
}
```


## Advanced

### Options

#### onlyFileRoot

Looking for components everywhere in the typescript file can take time. This
option reduces the scope of research to just the root of the file. Most of
the time components are declared at the root so looking further isn't really
worth it.

- Default: false

```js
addDisplayNameTransformer({
  onlyFileRoot: true
})
```

#### funcTypes

List of function types to add displayName to. Display names will only be added
to functions *explicitly* typed with one of those.

If you import React as "R" then you will have to update this list to be
['R.FunctionComponent', 'R.FC']. This list needs to match exactly what is
in the source code.

- Default: ['React.FunctionComponent', 'React.FC']

```js
addDisplayNameTransformer({
  funcTypes: ['React.FunctionComponent', 'React.FC']
})
```

#### classTypes

List of class types to add displayName to. Display names will only be added
to classes *explicitly* extending one of those.

If you import React as "R" then you will have to update this list to be
['R.Component', 'R.PureComponent']. This list needs to match exactly what is
in the source code.

- Default: ['React.Component', 'React.PureComponent']

```js
addDisplayNameTransformer({
  classTypes: ['React.Component', 'React.PureComponent']
})
```


## Contributing to this project

Feel free to contribute to this project and submit pull requests.

Here are a couple useful commands:
- `npm run test`: Runs tests and linters.
- `npm run build`: Builds the library.


## TODOs

- Try to find a better way to compare types (without converting to text
using getText(sourceFile))
- Optionally detect if there is already a displayName and don't override it.
