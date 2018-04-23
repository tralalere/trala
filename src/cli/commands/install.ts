import { Manifest } from "../../manifest";
import {execSync} from "child_process";

export class Install {
    static manifest: Manifest;
    static projectName: string;

    static execute(args: string[]) {
        console.log('install', args);

        this.manifest = Manifest.getInstance();
        this.projectName = this.manifest.getProjectName().toLowerCase();
        let modules: string[][];
        let updateManifest: boolean = true;

        modules = args.slice().map((arg: string) => arg.split('@'));

        if (modules.length === 0) {
            updateManifest = false;
            modules = this.manifest.getModules();
        }

        modules.forEach((module: string[]) => module[1] = this.installModule(module[0], module[1]));

        if (updateManifest) {
            this.manifest.addModules(modules);
        }
    }

    static installModule(name: string, version?: string): string {
        console.log('install module', name, version);


        const rootDir: string = process.cwd();
        const branchName: string = `project-${this.projectName}`;
        let branches: string[];
        let branchPresent: boolean = false;
        let branchLocal: boolean = false;
        let currentVersion: string;
        let useVersion: string;

        execSync(`git clone ${this.manifest.getRemoteUrl()}${this.manifest.getNamespace()}/module-${name}-front src/app/@modules/${name}`);
        process.chdir(`src/app/@modules/${name}`);

        execSync('git fetch origin');
        branches = execSync('git branch -a', { encoding: 'utf8' })
            .split('\n')
            .filter((branch: string) => {
                const branchIndex = branch.indexOf(branchName);
                return branchIndex > -1 && branchIndex + branchName.length === branch.length;
            });

        if (branches.length) {
            branchPresent = branches.some((branch: string) => branch.indexOf('remotes') > -1);
            branchLocal = branches.some((branch: string) => branch.indexOf('remotes') === -1);
        }

        // TODO if project branch exists, get current version

        // TODO list tags

        if (version) {
            // TODO check if version is present
            useVersion = version;
        } else if (currentVersion) {
            useVersion = currentVersion;
        } else {
            // TODO get latest version from tags
            useVersion = '0.1.0'
        }

        // TODO update version (branches if needed) and push changes
        process.chdir(rootDir);

        this.includeModule(name);

        return useVersion;
    }

    static includeModule(name: string) {
        // TODO update files to include module

    }
}