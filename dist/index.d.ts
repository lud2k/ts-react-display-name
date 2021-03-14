import * as ts from 'typescript';
export interface AddDisplayNameOptions {
    /**
     * Only add displayName to components defined at the root of the file.
     * Setting this to true limits the scope of research for components to the root of the file. This
     * can dramatically speed things up. Usually components are deployed at the root of the file so
     * setting this to true is recommended.
     */
    onlyFileRoot: boolean;
    /**
     * List of function types to add displayName to.
     * Default: ['React.FunctionComponent', 'React.FC']
     */
    funcTypes: string[];
    /**
     * List of classes to add displayName to.
     * Default: ['React.Component', 'React.PureComponent']
     */
    classTypes: string[];
    /**
     * List of factory functions to add displayName to.
     * Default: ['React.forwardRef', 'React.memo']
     */
    factoryFuncs: string[];
}
/**
 * Factory method that creates a Transformer.
 */
export declare function addDisplayNameTransformer(options?: Partial<AddDisplayNameOptions>): (ctx: ts.TransformationContext) => ts.Transformer<ts.SourceFile>;
