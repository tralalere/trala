import { normalize } from '@angular-devkit/core';
import {
    Rule,
    SchematicContext,
    SchematicsException,
    Tree,
    branchAndMerge,
    chain,
} from '@angular-devkit/schematics';
import * as ts from 'typescript';
import {Change, RemoveChange} from '../utility/change';
import { Schema as ModuleOptions } from './schema';
import {
    listImports,
    removeFromInstantiator,
    removeFromNgModule
} from "../utility/update-files";


function clearNgModule(): Rule {
    return (host: Tree) => {
        const modulePath = normalize('/src/app/app.module.ts');
        const text = host.read(modulePath);
        if (text === null) {
            throw new SchematicsException(`File ${modulePath} does not exist.`);
        }
        const sourceText = text.toString('utf-8');
        const source = ts.createSourceFile(modulePath, sourceText, ts.ScriptTarget.Latest, true);

        const changes: Change[] = [];
        const changesAndImports = listImports(source, '@modules/', true);

        changes.push(...changesAndImports[1]);
        changes.push(...removeFromNgModule(source, modulePath, changesAndImports[0]));

        const recorder = host.beginUpdate(modulePath);
        for (const change of changes) {
            if (change instanceof RemoveChange) {
                console.log(change.description);
                recorder.remove(change.pos, change.toRemove.length);
            }
        }

        host.commitUpdate(recorder);

        return host;
    };
}

function clearInstantiator(): Rule {
    return (host: Tree) => {
        const classPath = normalize('/src/app/service-instantiator.class.ts');

        const text = host.read(classPath);
        if (text === null) {
            throw new SchematicsException(`File ${classPath} does not exist.`);
        }
        const sourceText = text.toString('utf-8');
        const source = ts.createSourceFile(classPath, sourceText, ts.ScriptTarget.Latest, true);

        const changes: Change[] = [];
        const changesAndImports = listImports(source, '@modules/', true);

        changes.push(...changesAndImports[1]);
        changes.push(...removeFromInstantiator(source, classPath, changesAndImports[0]));

        const recorder = host.beginUpdate(classPath);
        for (const change of changes) {
            if (change instanceof RemoveChange) {
                console.log(change.description);
                recorder.remove(change.pos, change.toRemove.length);
            }
        }

        host.commitUpdate(recorder);

        return host;
    }
}

export default function (options: ModuleOptions): Rule {
    return (host: Tree, context: SchematicContext) => {
        return chain([
            branchAndMerge(chain([
                clearNgModule(),
                clearInstantiator()
            ])),
        ])(host, context);
    };
}