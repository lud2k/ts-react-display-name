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
 * Recursive function that visits the nodes of the file.
 */
function visit(ctx: ts.TransformationContext, sf: ts.SourceFile, options: AddDisplayNameOptions) {
  const visitor: ts.Visitor = (node: ts.Node): ts.VisitResult<ts.Node> => {
    if (ts.isVariableStatement(node)) {
      const components = []
      ts.forEachChild(node, (child1: ts.Node) => {
        if (ts.isVariableDeclarationList(child1)) {
          ts.forEachChild(child1, (child2: ts.Node) => {
            if (ts.isVariableDeclaration(child2) && isFunctionComponent(child2, sf, options)) {
              components.push(child2)
            }
          })
        }
      })
      let result = node
      if (!options.onlyFileRoot) {
        result = ts.visitEachChild(node, visitor, ctx)
      }
      if (components.length) {
        return [result, ...components.map(comp => createSetDisplayNameStatement(comp, sf))]
      } else {
        return result
      }
    }
    if (ts.isClassDeclaration(node) && isReactComponent(node, sf, options)) {
      const result = ts.visitEachChild(node, visitor, ctx)
      const member = createDisplayNameProperty(node, sf)
      result.members = ts.createNodeArray([...result.members, member])
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
    ...options,
  }
  return (ctx: ts.TransformationContext): ts.Transformer<ts.SourceFile> => {
    return (sf: ts.SourceFile) => ts.visitNode(sf, visit(ctx, sf, optionsWithDefaults))
  }
}
