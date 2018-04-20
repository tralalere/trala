import { Install } from "./install";
import { Remove } from "./remove";

export class Update {
    static execute(args: string[]) {
        console.log('update', args);

        const modules: string[] = [];

        // TODO get module(s) and version(s) (flag to add to trllr.json)

        // TODO if no modules update all modules (?) (maybe not)

        modules.forEach((module) => {
            let moduleName: string;
            let version: string;

            if (module.indexOf('@') > -1) {
                const moduleData = module.split('@');
                moduleName = moduleData[0];
                version = moduleData[1];
            } else {
                moduleName = module;
            }

            Remove.removeModule(moduleName, version);

            Install.installModule(moduleName, version);
        });
    }
}
