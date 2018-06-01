import {Manifest} from "../../manifest";
import {removeSync} from "fs-extra";
import {executeSchematics} from "../../schematics";

/**
 *
 */
export class Remove{
    /**
     *
     * @param {string[]} args
     */
    public static execute(args: string[]) {
        console.log('remove', args);

        const manifest = Manifest.getInstance();
        let modules: string[];

        modules = args.slice().map((arg: string) => arg.split('@')[0]);

        modules.forEach((module: string) => Remove.removeModule(module));

        manifest.removeModules(modules);
    }

    /**
     *
     * @param {string} name
     */
    public static removeModule(name: string) {
        console.log('remove module', name);

        this.excludeModule(name);

        removeSync(`src/app/@modules/${name}`);
    }

    /**
     *
     * @param {string} name
     */
    public static excludeModule(name: string) {
        executeSchematics('trala', 'removeModule', {name});
    }
}