import { Install } from "./install";
import { Remove } from "./remove";
import { Manifest } from "../../manifest";

/**
 * Implement Update command
 */
export class Update {
    /**
     * Perform an update on a module by removing it and installing it again
     * @param {string[]} args (arguments)
     */
    public static execute(args: string[]) {
        const manifest = Manifest.getInstance();
        let modules: string[][];

        modules = args.slice().map((arg: string) => arg.split('@'));

        // TODO if no modules update all modules (?) (maybe not)

        modules.forEach((module) => {
            Remove.removeModule(module[0]);

            Install.installModule(module[0], module[1]);
        });

        manifest.updateModules(modules);

        console.log('Done!');
    }
}
