import * as ts from 'typescript';
import {Change, InsertChange} from "@schematics/angular/utility/change";
import {getSourceNodes} from "@schematics/angular/utility/ast-utils";
import {decamelize} from "@angular-devkit/core/src/utils/strings";
import {insertImport} from "@schematics/angular/utility/route-utils";

export function addServiceToInstantiator(source: ts.SourceFile,
                                        classPath: string,
                                        serviceName: string,
                                        importPath: string | null = null): Change[] {
    const changes: Change[] = [];
    const serviceVar = decamelize(serviceName);
    const nodes = getSourceNodes(source);
    const node = nodes.filter((node: ts.Node) => node.kind === ts.SyntaxKind.Constructor )[0] as ts.ConstructorDeclaration;

    let position: number;
    let toInsert: string;

    if (!node || !node.parameters) {
        console.log('No constructor node');
        return changes;
    }

    position = node.parameters.end;

    const params = node.parameters.filter((parameter: ts.ParameterDeclaration) => parameter.type.getText() === serviceName);
    if (params.length > 0) {
        console.log('Service already instantiated');
        return changes;
    }

    if (node.parameters.length == 0) {
        toInsert = `private ${serviceVar}: ${serviceName}`;
    } else {
        const text = node.parameters[node.parameters.length - 1].getFullText(source);
        const matches = text.match(/^\r?\n\s*/);

        if (matches.length > 0) {
            toInsert = `,${matches[0]}private ${serviceVar}: ${serviceName}`;
        } else {
            toInsert = `, private ${serviceVar}: ${serviceName}`;
        }
    }

    changes.push(new InsertChange(classPath, position, toInsert));

    if (importPath !== null) {
        changes.push(insertImport(source, classPath, serviceName, importPath));
    }

    return changes;
}