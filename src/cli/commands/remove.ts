import {Manifest} from "../../manifest";
import {removeSync} from "fs-extra";

export class Remove{
    static execute(args: string[]) {
        console.log('remove', args);

        const manifest = Manifest.getInstance();
        let modules: string[];

        modules = args.slice().map((arg: string) => arg.split('@')[0]);

        modules.forEach((module: string) => Remove.removeModule(module));

        manifest.removeModules(modules);
    }

    static removeModule(name: string) {
        console.log('remove module', name);

        this.excludeModule(name);

        removeSync(`src/app/@modules/${name}`);
    }

    static excludeModule(name: string) {
        // TODO update files to remove module inclusion*

    }
}