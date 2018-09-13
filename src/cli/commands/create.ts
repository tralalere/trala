import {Manifest} from "../../manifest";
import {existsSync} from "fs";
import {execSync} from "child_process";

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
                // TODO - Update to match branch setting rather than version
                created.push([moduleName, '0.0.0']);
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

        // TODO - Create folder core
        // TODO - Generate modulename.module.ts
        // TODO - Generate modulename.service.ts
        // TODO - Generate index.ts
        // TODO - Generate README.md

        return true;
    }
}