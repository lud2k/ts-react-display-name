import * as path from 'path'
import * as ts from 'typescript'

export interface AddDisplayNameOptions {
  /**
   * Only add displayName to components defined at the root of the file.
   * Setting this to true limits the scope of research for components to the root of the file. This
   * can dramatically speed things up. Usually components are deployed at the root of the file so
   * setting this to true is recommended.
   */
  onlyFileRoot: boolean
  /**
   * List of function types to add displayName to.
   * Default: ['React.FunctionComponent', 'React.FC']
   */
  funcTypes: string[]
  /**
   * List of classes to add displayName to.
   * Default: ['React.Component', 'React.PureComponent']
   */
  classTypes: string[]
  /**
   * List of factory functions to add displayName to.
   * Default: ['React.forwardRef', 'React.memo']
   */
  factoryFuncs: string[]
}

/**
 * Creates an assignment statement. We assign the name of the given node to the property displayName
 * of that node (node.displayName = node.name).
 */
const createSetDisplayNameStatement = (node: ts.VariableDeclaration, sf: ts.SourceFile) => {
  const name = ts.getNameOfDeclaration(node).getText(sf)
  const displayNameProp = ts.createPropertyAccess(node.name as ts.Expression, 'displayName')
  return ts.createAssignment(displayNameProp, ts.createStringLiteral(name))
}

/**
 * Creates a static class property named "displayName" and with value the name of the class.
 */
const createDisplayNameProperty = (node: ts.ClassDeclaration, sf: ts.SourceFile) => {
  const declaration = ts.getNameOfDeclaration(node)
  const name: string = declaration ? declaration.getText(sf) : path.parse(sf.fileName).name
  return ts.createProperty(
    undefined,
    ts.createModifiersFromModifierFlags(ts.ModifierFlags.Static),
    'displayName',
    undefined,
    undefined,
    ts.createStringLiteral(name)
  )
}

/**
 * Checks if a variable declaration is for a React.FunctionComponent/React.FC.
 */
const isFunctionComponent = (
  node: ts.VariableDeclaration,
  sf: ts.SourceFile,
  options: AddDisplayNameOptions
): boolean => {
  if (node.type && ts.isTypeReferenceNode(node.type)) {
    const type = node.type.typeName.getText(sf)
    return options.funcTypes.some(funcType => funcType === type)
  }
  return false
}

/**
 * Checks if a variable declaration is for a React.FunctionComponent.
 */
const isReactComponent = (
  node: ts.ClassDeclaration,
  sf: ts.SourceFile,
  options: AddDisplayNameOptions
): boolean => {
  return (
    node.heritageClauses &&
    node.heritageClauses.some(
      heritageClause =>
        heritageClause.types &&
        heritageClause.types.some(type => {
          const typeStr = type.getText(sf)
          return options.classTypes.some(classType => typeStr.startsWith(classType))
        })
    )
  )
}

/**
 * Checks if a variable declaration is for a React.forwardRef/React.memo.
 */
const isFactoryComponent = (
  node: ts.CallExpression | ts.PropertyAccessExpression,
  sf: ts.SourceFile,
  options: AddDisplayNameOptions
) => {
  if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
    const type = ts.getNameOfDeclaration(node.expression).getText(sf)
    return options.factoryFuncs.some(factoryType => factoryType === type)
  }
  if (
    ts.isPropertyAccessExpression(node) &&
    ts.isIdentifier(node.expression) &&
    ts.isIdentifier(node.name)
  ) {
    const type =
      ts.getNameOfDeclaration(node.expression).getText(sf) +
      '.' +
      ts.getNameOfDeclaration(node.name).getText(sf)
    return options.factoryFuncs.some(factoryType => factoryType === type)
  }
  if (ts.isCallExpression(node.expression) || ts.isPropertyAccessExpression(node.expression)) {
    return isFactoryComponent(node.expression, sf, options)
  }
  return false
}

/**
 * Checks if `static displayName` is defined for class
 */
function isStaticDisplayNameDefined(classDeclaration: ts.ClassDeclaration): boolean {
  return (
    classDeclaration.members.find(member => {
      try {
        return (
          member.kind === ts.SyntaxKind.PropertyDeclaration &&
          member.modifiers.some(
            modifier => (modifier.kind & ts.ModifierFlags.Static) === ts.ModifierFlags.Static
          ) &&
          (member.name as ts.Identifier).text === 'displayName'
        )
      } catch (e) {
        return false
      }
    }) !== undefined
  )
}

/**
 * Check if node is Component.displayName = "string" and return "Component" if it is
 */
function nodeIsComponentDisplayNameAssignment(node: ts.Node): string | undefined {
  if (ts.isExpressionStatement(node)) {
    const expression = node.expression
    if (ts.isBinaryExpression(expression) && expression.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
      const left = expression.left
      if (ts.isPropertyAccessExpression(left)) {
        return left.name.getText() === 'displayName' ? left.expression.getText() : undefined
      }
    }
  }
  return undefined
}

/**
 * Accumulate all components that have a display name specified at the current node level
 */
const accumulateExistingDisplayName = (node: ts.Node) => {
  const componentWithNames = {};
  if (node.parent) {
    node.parent.forEachChild(c => {
      const componentName = nodeIsComponentDisplayNameAssignment(c)
      if (componentName) {
        componentWithNames[componentName] = true
      }
    })
  }
  return componentWithNames;
}

/**
 * Recursive function that visits the nodes of the file.
 */
function visit(ctx: ts.TransformationContext, sf: ts.SourceFile, options: AddDisplayNameOptions) {
  const visitor: ts.Visitor = (node: ts.Node): ts.VisitResult<ts.Node> => {
    if (ts.isVariableStatement(node)) {
      const components: ts.VariableDeclaration[] = []
      ts.forEachChild(node, (child1: ts.Node) => {
        if (ts.isVariableDeclarationList(child1)) {
          ts.forEachChild(child1, (child2: ts.Node) => {
            if (ts.isVariableDeclaration(child2)) {
              if (isFunctionComponent(child2, sf, options)) {
                components.push(child2)
              } else {
                ts.forEachChild(child2, (child3: ts.Node) => {
                  if (ts.isCallExpression(child3) || ts.isPropertyAccessExpression(child3)) {
                    if (isFactoryComponent(child3, sf, options)) {
                      components.push(child2)
                    }
                  }
                })
              }
            }
          })
        }
      })
      let result = node
      if (!options.onlyFileRoot) {
        result = ts.visitEachChild(node, visitor, ctx)
      }
      if (components.length) {
        const componentHasDisplayName = accumulateExistingDisplayName(node);
        const displayNameStatements = [];
        components.forEach(comp => {
          if (!(comp.name.getText() in componentHasDisplayName)) {
            displayNameStatements.push(createSetDisplayNameStatement(comp, sf))
          }
        })
        return [result, ...displayNameStatements]
      } else {
        return result
      }
    }
    if (ts.isClassDeclaration(node) && isReactComponent(node, sf, options)) {
      const result = ts.visitEachChild(node, visitor, ctx)
      if (!isStaticDisplayNameDefined(result)) {
        const member = createDisplayNameProperty(node, sf)
        return ts.updateClassDeclaration(
          node,
          node.decorators,
          node.modifiers,
          node.name,
          node.typeParameters,
          node.heritageClauses,
          ts.createNodeArray([...result.members, member])
        )
      }
      return result
    }
    if (!options.onlyFileRoot || ts.isSourceFile(node)) {
      return ts.visitEachChild(node, visitor, ctx)
    } else {
      return node
    }
  }
  return visitor
}

/**
 * Factory method that creates a Transformer.
 */
export function addDisplayNameTransformer(options: Partial<AddDisplayNameOptions> = {}) {
  const optionsWithDefaults = {
    onlyFileRoot: false,
    funcTypes: ['React.FunctionComponent', 'React.FC'],
    classTypes: ['React.Component', 'React.PureComponent'],
    factoryFuncs: ['React.forwardRef', 'React.memo'],
    ...options,
  }
  return (ctx: ts.TransformationContext): ts.Transformer<ts.SourceFile> => {
    return (sf: ts.SourceFile) => ts.visitNode(sf, visit(ctx, sf, optionsWithDefaults))
  }
}

export default function(_program: ts.Program, options: AddDisplayNameOptions) {
  return addDisplayNameTransformer(options)
}
