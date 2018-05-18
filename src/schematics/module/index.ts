import { basename, dirname, normalize, relative, strings } from '@angular-devkit/core';
import {
    Rule,
    SchematicContext,
    SchematicsException,
    Tree,
    branchAndMerge,
    chain,
} from '@angular-devkit/schematics';
import * as ts from 'typescript';
import { addImportToModule } from '@schematics/angular/utility/ast-utils';
import {Change, InsertChange} from '@schematics/angular/utility/change';
import { Schema as ModuleOptions } from './schema';
import {addServiceToConstructor} from "../utility/update-files";


function addDeclarationsToNgModule(options: ModuleOptions, modules: string[]): Rule {
    return (host: Tree) => {
        const modulePath = normalize('/src/app/app.module.ts');

        const text = host.read(modulePath);
        if (text === null) {
            throw new SchematicsException(`File ${modulePath} does not exist.`);
        }
        const sourceText = text.toString('utf-8');
        const source = ts.createSourceFile(modulePath, sourceText, ts.ScriptTarget.Latest, true);

        const importModulePath = normalize(
            '/src/app/@modules/'
            + strings.dasherize(options.name)
        );
        const relativeDir = relative(dirname(modulePath), dirname(importModulePath));
        const relativePath = (relativeDir.startsWith('.') ? relativeDir : './' + relativeDir)
            + '/' + basename(importModulePath);

        const changes: Change[] = [];

        for (const module of modules) {
            changes.push(...addImportToModule(source, modulePath,
                strings.classify(module),
                relativePath));
        }

        const recorder = host.beginUpdate(modulePath);
        for (const change of changes) {
            if (change instanceof InsertChange) {
                recorder.insertLeft(change.pos, change.toAdd);
            }
        }

        host.commitUpdate(recorder);

        return host;
    };
}

function addInitializationToService(options: ModuleOptions, services: string[]): Rule {
    return (host: Tree) => {
        const classPath = normalize('/src/app/service-instantiator.class.ts');

        const text = host.read(classPath);
        if (text === null) {
            throw new SchematicsException(`File ${classPath} does not exist.`);
        }
        const sourceText = text.toString('utf-8');
        const source = ts.createSourceFile(classPath, sourceText, ts.ScriptTarget.Latest, true);

        const importModulePath = normalize(
            '/src/app/@modules/'
            + strings.dasherize(options.name)
        );
        const relativeDir = relative(dirname(classPath), dirname(importModulePath));
        const relativePath = (relativeDir.startsWith('.') ? relativeDir : './' + relativeDir)
            + '/' + basename(importModulePath);

        const changes: Change[] = [];

        for (const service of services) {
            changes.push(...addServiceToConstructor(source, classPath,
                strings.classify(service),
                relativePath));
        }

        const recorder = host.beginUpdate(classPath);
        for (const change of changes) {
            if (change instanceof InsertChange) {
                recorder.insertLeft(change.pos, change.toAdd);
            }
        }

        host.commitUpdate(recorder);

        return host;
    }
}

export default function (options: ModuleOptions): Rule {
    return (host: Tree, context: SchematicContext) => {
        const modules: string[] = [];
        const services: string[] = [];

        const modulePath = normalize('/src/app/@modules/' + strings.dasherize(options.name) + '/index.ts');
        const text = host.read(modulePath);

        if (text === null) {
            throw new SchematicsException(`File ${modulePath} does not exist.`);
        }

        const sourceText = text.toString('utf8');

        const lines = sourceText.split('\n');
        lines.forEach((line: string) => {
            if (line.indexOf('export') > -1) {
                const startExport = line.indexOf('{') + 1;
                const exportLine = line.substring(startExport, line.indexOf('}', startExport)).trim();
                const exportedStuff = exportLine.split(',').map((module: string) => module.trim());

                modules.push(...exportedStuff.filter((module) => module.indexOf('Module') > -1));
                services.push(...exportedStuff.filter((service) => service.indexOf('Service') > -1));
            }
        });

        return chain([
            branchAndMerge(chain([
                addDeclarationsToNgModule(options, modules),
                addInitializationToService(options, services)
            ])),
        ])(host, context);
    };
}