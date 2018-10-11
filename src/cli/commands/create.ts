import {Manifest} from "../../manifest";
import {existsSync, mkdirSync} from "fs";
import {execSync} from "child_process";
import {executeSchematics} from "../../schematics";

/**
 * Implement Create command
 */
export class Create {
    static manifest: Manifest;

    /**
     * Create a new module
     * @param {string[]} args (arguments)
     */
    public static execute(args: string[]) {
        this.manifest = Manifest.getInstance();
        let modules: string[];
        const created: string[][] = [];

        modules = args.slice().map((arg: string) => arg.split('@')[0]);

        console.log(modules);

        modules.forEach((moduleName: string) => {
            if (this.createModule(moduleName)) {
                created.push([moduleName, 'develop']);
            }
        });

        this.manifest.updateModules(created);

        console.log('Done!');
    }

    /**
     *
     * @param {string} moduleName
     */
    private static createModule(moduleName: string): boolean {
        const path = `src/app/@modules/${moduleName}`;

        if (existsSync(path)) {
            console.log('Module', moduleName, 'already exists');
            return false;
        }

        // TODO - Create repository on remote server, then clone
        execSync(`git init ${path}`, {stdio: 'ignore'});

        mkdirSync(`${path}/core`);
        executeSchematics('@schematics/angular', 'module', {
            project: 'fuse',
            name: moduleName,
            path: `src/app/@modules/${moduleName}/core`,
            spec: false,
            flat: true
        });
        executeSchematics('@schematics/angular', 'service', {
            project: 'fuse',
            name: moduleName,
            path: `src/app/@modules/${moduleName}/core`,
            spec: false,
            flat: true
        });
        executeSchematics('trala', 'baseModule', {
            name: moduleName,
            path: path
        });

        return true;
    }
}