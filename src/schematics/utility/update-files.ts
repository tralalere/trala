import * as ts from 'typescript';
import {Change, InsertChange, RemoveChange} from "../utility/change";
import {getDecoratorMetadata, getSourceNodes} from "@schematics/angular/utility/ast-utils";
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
        // console.log('No constructor node');
        return changes;
    }

    position = node.parameters.end;

    const params = node.parameters.filter((parameter: ts.ParameterDeclaration) => parameter.type.getText() === serviceName);
    if (params.length > 0) {
        // console.log('Service already instantiated');
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

export function listImports(source: ts.SourceFile,
                            fromPattern: string,
                            removeImports: boolean = false): [string[], Change[]] {
    const imports: string[] = [];
    const changes: Change[] = [];
    const nodes = getSourceNodes(source);

    nodes
        .filter((node: ts.Node) => node.kind === ts.SyntaxKind.ImportDeclaration)
        .forEach((node: ts.ImportDeclaration) => {
            const modulePath = (node.moduleSpecifier as ts.StringLiteral).text;

            if (modulePath.indexOf(fromPattern) > -1) {
                if (node.importClause) {
                    if (removeImports) {
                        changes.push(new RemoveChange(modulePath, node.pos, node.getFullText(source)));
                    }

                    const importClause = (node.importClause as ts.ImportClause);

                    if (importClause.namedBindings.kind === ts.SyntaxKind.NamedImports) {
                        imports.push(...(importClause.namedBindings as ts.NamedImports).elements
                            .map((element: ts.ImportSpecifier) => element.name.text));
                    } else if (importClause.namedBindings.kind === ts.SyntaxKind.NamespaceImport) {
                        imports.push((importClause.namedBindings as ts.NamespaceImport).name.text);
                    }
                }
            }
        });

    return [imports, changes];
}

export function removeFromNgModule(source: ts.SourceFile,
                                   sourcePath: string,
                                   imports: string[]) : Change[] {
    const changes: Change[] = [];
    const decorator: ts.ObjectLiteralExpression = getDecoratorMetadata(source, 'NgModule', '@angular/core')[0] as ts.ObjectLiteralExpression;

    if (decorator) {
        decorator.properties
            .filter(node => node.kind === ts.SyntaxKind.PropertyAssignment)
            .filter((node: ts.PropertyAssignment) => node.initializer.kind === ts.SyntaxKind.ArrayLiteralExpression)
            .forEach((node: ts.PropertyAssignment) => {
                const arrayLiteral = node.initializer as ts.ArrayLiteralExpression;

                arrayLiteral.elements.forEach(element => {
                    const position = element.pos - (element.pos > 0 && source.text[element.pos - 1] === ',' ? 1 : 0);
                    const end = element.end + (position === element.pos && source.text[element.end] === ',' ? 1 : 0);

                    switch (element.kind) {
                        case ts.SyntaxKind.Identifier:
                            if (imports.indexOf((element as ts.Identifier).text) > -1) {
                                changes.push(new RemoveChange(sourcePath, position, source.text.substring(position, end)));
                            }
                            break;
                        case ts.SyntaxKind.PropertyAccessExpression:
                            const identifier = element.getText().split('.')[0];
                            if (imports.indexOf(identifier) > -1) {
                                changes.push(new RemoveChange(sourcePath, position, source.text.substring(position, end)));
                            }
                            break;
                    }
                });
            });
    }

    return changes;
}

export function removeFromInstantiator(source: ts.SourceFile,
                                       sourcePath: string,
                                       imports: string[]): Change[] {
    const changes: Change[] = [];
    const nodes = getSourceNodes(source);
    const node = nodes.filter((node: ts.Node) => node.kind === ts.SyntaxKind.Constructor )[0] as ts.ConstructorDeclaration;

    if (!node || !node.parameters) {
        // console.log('No constructor node');
        return changes;
    }

    node.parameters.forEach((parameter: ts.ParameterDeclaration) => {
        const position = parameter.pos - (parameter.pos > 0 && source.text[parameter.pos - 1] === ',' ? 1 : 0);
        const end = parameter.end + (position === parameter.pos && source.text[parameter.end] === ',' ? 1 : 0);

        if (imports.indexOf(parameter.type.getText(source)) > -1) {
            changes.push(new RemoveChange(sourcePath, position, source.text.substring(position, end)));
        }
    });

    return changes;
}