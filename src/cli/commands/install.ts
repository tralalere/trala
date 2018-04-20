import { Manifest } from "../../manifest";

export class Install {
    static execute(args: string[]) {
        console.log('install', args);

        const manifest = Manifest.getInstance();
        let modules: string[][];
        let updateManifest: boolean = true;

        modules = args.slice().map((arg: string) => arg.split('@'));

        if (modules.length === 0) {
            updateManifest = false;
            modules = manifest.getModules();
        }

        modules.forEach((module: string[]) => Install.installModule(module[0], module[1]));

        if (updateManifest) {
            manifest.addModules(modules);
        }
    }

    static installModule(name: string, version?: string) {
        console.log('install module', name, version);

        // TODO clone module repository and checkout branch for project

        // TODO update version (branches if needed) and push changes

        // TODO update files to include module
    }
}