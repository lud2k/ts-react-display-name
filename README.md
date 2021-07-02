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

### TTypeScript

Add it to `plugins` in your `tsconfig.json`

```json
{
  "compilerOptions": {
    "plugins": [
      {
        "transform": "ts-react-display-name"
      }
    ]
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

// Factory component
const TextFactoryComponent = React.forwardRef<HTMLParagraphElement, {}>(
  (props, ref) => <p ref={ref}>...</p>
)
TextFactoryComponent.displayName = 'TextFactoryComponent'

// Tagged template
const TaggedTemplateComponent = styled.div`
  color: red;
`
TaggedTemplateComponent.displayName = 'TaggedTemplateComponent'
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
  onlyFileRoot: true,
})
```

```json
{
  "transform": "ts-react-display-name",
  "onlyFileRoot": true
}
```

#### funcTypes

List of function types to add displayName to. Display names will only be added
to functions _explicitly_ typed with one of those.

If you import React as "R" then you will have to update this list to be
['R.FunctionComponent', 'R.FC']. This list needs to match exactly what is
in the source code.

- Default: ['React.FunctionComponent', 'React.FC']

```js
addDisplayNameTransformer({
  funcTypes: ['React.FunctionComponent', 'React.FC'],
})
```

```json
{
  "transform": "ts-react-display-name",
  "funcTypes": ["React.FunctionComponent", "React.FC"]
}
```

#### classTypes

List of class types to add displayName to. Display names will only be added
to classes _explicitly_ extending one of those.

If you import React as "R" then you will have to update this list to be
['R.Component', 'R.PureComponent']. This list needs to match exactly what is
in the source code.

- Default: ['React.Component', 'React.PureComponent']

```js
addDisplayNameTransformer({
  classTypes: ['React.Component', 'React.PureComponent'],
})
```

```json
{
  "transform": "ts-react-display-name",
  "classTypes": ["React.Component", "React.PureComponent"]
}
```

#### factoryFuncs

List of factory functions to add displayName to. Display names will only be added
to variables _explicitly_ called with one of those.

If you import React as "R" then you will have to update this list to be
['R.forwardRef', 'R.memo']. This list needs to match exactly what is
in the source code.

- Default: ['React.forwardRef', 'React.memo']

#### taggedTemplateModules

List of tagged template modules to add displayName to. 
For example, if you set `taggedTemplateModules` to `['styled']` then `displayName` will be added to any component created like this 

```ts
const TaggedTemplateComponent = styled.div`
  color: red;
`
```

- Default: []

```js
addDisplayNameTransformer({
  factoryFuncs: ['React.forwardRef', 'React.memo'],
})
```

```json
{
  "transform": "ts-react-display-name",
  "factoryFuncs": ["React.forwardRef", "React.memo"]
}
```

## Contributing to this project

Feel free to contribute to this project and submit pull requests.

Here are a couple useful commands:

- `npm run test`: Runs tests and linters.
- `npm run build`: Builds the library.

### Adding Unit test data

1. Add your origin test data file as `/test/data/xxx.tsx`
2. Paste your raw `/test/data/xxx.tsx` file into [Typescript Playround](https://www.typescriptlang.org/play/index.html?target=1&jsx=2) using the link settings, then add the displayName (function or static property) and save the generated output to `test/data/xxx.ts`

## TODOs

- Try to find a better way to compare types (without converting to text
  using getText(sourceFile))
- Optionally detect if there is already a displayName for functional componments and don't override it.
