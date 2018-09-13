import {Manifest} from "../../manifest";
import {readdirSync} from "fs";

/**
 * Implement Sync command
 */
export class Sync {
    static manifest: Manifest;

    /**
     * Synchronise the manifest with the state of the file system
     * @param {string[]} args (arguments)
     */
    public static execute(args: string[]) {
        this.manifest = Manifest.getInstance();
        const modulesFS = readdirSync('src/app/@modules');
        const modules: string[][] = [];

        modulesFS.forEach((moduleName) => {
           const version = this.getModuleVersion(moduleName);
           modules.push([moduleName, version]);
        });

        this.manifest.removeModules(this.manifest.getModules().map((module) => module[0]));
        this.manifest.updateModules(modules);
    }

    private static getModuleVersion(moduleName: string): string {
        const path = `src/app/@modules/${moduleName}`;
        let version = '';
        
        // TODO - Check current branch
        // TODO - Retrieve version tag if branch is project-*
        // TODO - Else, version is branch name

        return version;
    }
}