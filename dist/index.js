"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
/**
 * Creates an assignment statement. We assign the name of the given node to the property displayName
 * of that node (node.displayName = node.name).
 */
const createSetDisplayNameStatement = (node, sf) => {
    const name = ts.getNameOfDeclaration(node).getText(sf);
    const displayNameProp = ts.createPropertyAccess(node.name, 'displayName');
    return ts.createAssignment(displayNameProp, ts.createStringLiteral(name));
};
/**
 * Creates a static class property named "displayName" and with value the name of the class.
 */
const createDisplayNameProperty = (node, sf) => {
    const name = ts.getNameOfDeclaration(node).getText(sf);
    return ts.createProperty(undefined, ts.createModifiersFromModifierFlags(ts.ModifierFlags.Static), 'displayName', undefined, undefined, ts.createStringLiteral(name));
};
/**
 * Checks if a variable declaration is for a React.FunctionComponent/React.FC.
 */
const isFunctionComponent = (node, sf, options) => {
    if (node.type && ts.isTypeReferenceNode(node.type)) {
        const type = node.type.typeName.getText(sf);
        return options.funcTypes.some(funcType => funcType === type);
    }
    return false;
};
/**
 * Checks if a variable declaration is for a React.FunctionComponent.
 */
const isReactComponent = (node, sf, options) => {
    return (node.heritageClauses &&
        node.heritageClauses.some(heritageClause => heritageClause.types &&
            heritageClause.types.some(type => {
                const typeStr = type.getText(sf);
                return options.classTypes.some(classType => typeStr.startsWith(classType));
            })));
};
/**
 * Recursive function that visits the nodes of the file.
 */
function visit(ctx, sf, options) {
    const visitor = (node) => {
        if (ts.isVariableStatement(node)) {
            const components = [];
            ts.forEachChild(node, (child1) => {
                if (ts.isVariableDeclarationList(child1)) {
                    ts.forEachChild(child1, (child2) => {
                        if (ts.isVariableDeclaration(child2) && isFunctionComponent(child2, sf, options)) {
                            components.push(child2);
                        }
                    });
                }
            });
            let result = node;
            if (!options.onlyFileRoot) {
                result = ts.visitEachChild(node, visitor, ctx);
            }
            if (components.length) {
                return [result, ...components.map(comp => createSetDisplayNameStatement(comp, sf))];
            }
            else {
                return result;
            }
        }
        if (ts.isClassDeclaration(node) && isReactComponent(node, sf, options)) {
            const result = ts.visitEachChild(node, visitor, ctx);
            const member = createDisplayNameProperty(node, sf);
            result.members = ts.createNodeArray([...result.members, member]);
            return result;
        }
        if (!options.onlyFileRoot || ts.isSourceFile(node)) {
            return ts.visitEachChild(node, visitor, ctx);
        }
        else {
            return node;
        }
    };
    return visitor;
}
/**
 * Factory method that creates a Transformer.
 */
function addDisplayNameTransformer(options = {}) {
    const optionsWithDefaults = {
        onlyFileRoot: false,
        funcTypes: ['React.FunctionComponent', 'React.FC'],
        classTypes: ['React.Component', 'React.PureComponent'],
        ...options,
    };
    return (ctx) => {
        return (sf) => ts.visitNode(sf, visit(ctx, sf, optionsWithDefaults));
    };
}
exports.addDisplayNameTransformer = addDisplayNameTransformer;
