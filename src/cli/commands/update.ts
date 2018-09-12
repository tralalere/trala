import { Install } from "./install";
import { Remove } from "./remove";
import { Manifest } from "../../manifest";
import {execSync} from "child_process";

/**
 * Implement Update command
 */
export class Update {
    static manifest: Manifest;

    /**
     * Perform an update on a module by removing it and installing it again
     * @param {string[]} args (arguments)
     */
    public static execute(args: string[]) {
        this.manifest = Manifest.getInstance();
        let modules: string[][];

        modules = args.slice().map((arg: string) => arg.split('@'));

        if (modules.length) {
            modules.forEach((module) => {
                Remove.removeModule(module[0], true);

                Install.installModule(module[0], module[1]);
            });

            this.manifest.updateModules(modules);
        } else {
            console.log('Updating the project and all modules');

            this.updateRepository('.');
            console.log('Project updated');

            this.manifest.reloadManifest();

            modules = this.manifest.getModules();
            modules.forEach((module) => {
                this.updateRepository('src/app/@modules/'+module[0]);
                console.log('Module', module[0], 'updated');
            });
        }

        console.log('Done!');
    }

    /**
     * Execute fetch and pull git commands on the given path
     * @param {string} path (path to git repository)
     */
    private static updateRepository(path: string) {
        execSync('git --git-dir='+path+'/.git fetch', {stdio: 'ignore'});
        execSync('git --git-dir='+path+'/.git pull', {stdio: 'ignore'});
    }
}
