import * as ts from 'typescript';
import {Change} from "@schematics/angular/utility/change";
import {findNodes} from "@schematics/angular/utility/ast-utils";

export function addServiceToConstructor(source: ts.SourceFile,
                                        classPath: string,
                                        serviceName: string,
                                        importPath: string): Change[] {
    const classConstructor: ts.Node[] = findNodes(source, ts.SyntaxKind.ConstructorKeyword);

    // TODO get nodes starting at the first parameter (i think ?)

    // TODO check if service is not yet in parameters

    // TODO get indentation

    // TODO insert service call with correction position (with InsertChange)

    // TODO insert import

    // TODO return the changes
    return [];
}