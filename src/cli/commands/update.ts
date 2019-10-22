import {Install} from "./install";
import {Remove} from "./remove";
import {Manifest} from "../../manifest";
import * as semver from "semver";
import {execSync} from "child_process";
import {existsSync} from "fs";
import {GSheet} from "../../connectors/gsheets";

/**
 * Implement Update command
 */
export class Update {
    private static manifest: Manifest;
    private static options = {
        updateFromSheet: false,
        autoUpdate: true,
        delayUpdate: false
    };

    /**
     * Perform an update on a module by removing it and installing it again
     * @param {string[]} args (arguments)
     */
    public static execute(args: string[]) {
        this.manifest = Manifest.getInstance();
        let modules: string[][];

        args = args.filter((arg: string) => !this.applySetting(arg));

        modules = args.map((arg: string) => arg.split('@'));

        if (this.options.updateFromSheet) {
            console.log('Update from sheet for project', this.manifest.getProjectName());
            GSheet.readSheet('1Sj5U3CFtQUO16XeKu0az_t3l8cMtqhfd9QmxWFqCGDU', this.manifest.getProjectName())
                .then((data) => {
                    const modulesFromSheet = [];

                    data.slice(1).forEach((row) => {
                        if (row[1] !== '--') {
                            modulesFromSheet.push(row.slice(0, 2));
                        }
                    });

                    this.updateModules(this.mergeModules(modules, modulesFromSheet));

                    console.log('Done!');
                }, (error) => {
                    console.error(error);
                });
        }

        if (modules.length && !this.options.delayUpdate) {
            this.updateModules(modules);

            console.log('Done!');
        } else if (this.options.autoUpdate) {
            console.log('Updating the project and all modules');

            this.updateRepository('.');
            console.log('Project updated');

            this.manifest.reloadManifest();

            modules = this.manifest.getModules();
            modules.forEach((module) => {
                const modulePath = 'src/app/@modules/' + module[0];

                if (existsSync(modulePath)) {
                    this.updateRepository(modulePath);
                    console.log('Module', module[0], 'updated');
                } else {
                    Install.installModule(module[0], module[1]);
                    console.log('Module', module[0], 'installed');
                }
            });

            console.log('Done!');
        }
    }

    /**
     * Execute fetch and pull git commands on the given path
     * @param {string} path (path to git repository)
     */
    private static updateRepository(path: string): void {
        execSync('git --git-dir=' + path + '/.git fetch', {stdio: 'ignore'});
        execSync('git --git-dir=' + path + '/.git pull', {stdio: 'ignore'});
    }

    private static updateModules(modules: string[][]): void {
        modules.forEach((module) => {
            Remove.removeModule(module[0], true);

            Install.installModule(module[0], module[1]);
        });

        this.manifest.updateModules(modules);
    }

    private static mergeModules(modules1: string[][], modules2: string[][]): string[][] {
        const modules = [];

        for (let i = 0; i < modules1.length; i += 1) {
            const module1 = modules1[i];
            const module2 = modules2.find((module2) => module2[0] === module1[0]);

            if (module2) {
                if (semver.gt(module2[1], module1[1])) {
                    modules1[i] = module2;
                }
                modules2.splice(modules2.indexOf(module2), 1);
            }
        }

        modules.push(...modules1, ...modules2);

        return modules;
    }

    private static applySetting(argument: string): boolean {
        if (argument.indexOf('-') === 0) {
            this.options.autoUpdate = false;

            switch (argument) {
                case '--fromSheet':
                    this.options.updateFromSheet = true;
                    this.options.delayUpdate = true;
                    break;
            }

            return true;
        }

        return false;
    }
}
