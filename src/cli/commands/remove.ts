import {Manifest} from "../../manifest";

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

        // TODO delete module repository

        // TODO update files to remove module inclusion
    }
}