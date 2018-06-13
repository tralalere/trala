import {Manifest} from "../../manifest";
import {removeSync} from "fs-extra";
import {executeSchematics} from "../../schematics";

/**
 * Implement Remove command
 */
export class Remove{
    /**
     * Perform a removal of a module
     * @param {string[]} args (arguments)
     */
    public static execute(args: string[]) {
        const manifest = Manifest.getInstance();
        let modules: string[];

        modules = args.slice().map((arg: string) => arg.split('@')[0]);

        modules.forEach((module: string) => Remove.removeModule(module));

        manifest.removeModules(modules);

        console.log('Done!');
    }

    /**
     * Remove the module from the filesystem
     * @param {string} name (module name)
     */
    public static removeModule(name: string) {
        console.log('Removing module', name);

        this.excludeModule(name);

        removeSync(`src/app/@modules/${name}`);
    }

    /**
     * Remove all the imports of the module from other files
     * @param {string} name (module name)
     */
    public static excludeModule(name: string) {
        executeSchematics('trala', 'removeModule', {name});
    }
}