import { Install } from "./install";
import { Remove } from "./remove";
import { Manifest } from "../../manifest";

/**
 *
 */
export class Update {
    /**
     *
     * @param {string[]} args
     */
    public static execute(args: string[]) {
        console.log('update', args);

        const manifest = Manifest.getInstance();
        let modules: string[][];

        modules = args.slice().map((arg: string) => arg.split('@'));

        // TODO if no modules update all modules (?) (maybe not)

        modules.forEach((module) => {
            Remove.removeModule(module[0]);

            Install.installModule(module[0], module[1]);
        });

        manifest.updateModules(modules);
    }
}
