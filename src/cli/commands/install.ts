import { Manifest } from "../../manifest";
import {execSync} from "child_process";
import * as semver from "semver";
import {pathExistsSync, removeSync} from "fs-extra";
import {executeSchematics} from "../../schematics";

/**
 * Implement Install and Include command
 */
export class Install {
    static manifest: Manifest;
    static projectName: string;

    /**
     * Perform the installation of a module
     * @param {string[]} args (arguments)
     * @param {boolean} includeOnly (selects if we install and import modules or only import)
     */
    public static execute(args: string[], includeOnly: boolean) {
        this.manifest = Manifest.getInstance();
        this.projectName = this.manifest.getProjectName().toLowerCase();
        let modules: string[][];
        let updateManifest: boolean = true;

        modules = args.slice().map((arg: string) => arg.split('@'));

        if (modules.length === 0) {
            updateManifest = false;
            modules = this.manifest.getModules();

            if (!pathExistsSync('src/app/core')) {
                // TODO handle fuse-core clone as a parameter
                execSync(`git clone ${this.manifest.getRemoteUrl()}${this.manifest.getNamespace()}/fuse-core src/app/core -b develop`);
            }

            const remotes = execSync('git remote', { encoding: 'utf8' })
                .split('\n')
                .filter((remote: string) => remote === 'skeleton');
            if (remotes.length === 0) {
                execSync(`git remote add skeleton ${this.manifest.getRemoteUrl()}${this.manifest.getNamespace()}/skeleton-front`, {stdio: 'ignore'});
                execSync('git fetch skeleton', {stdio: 'ignore'});
            }
        }

        if (includeOnly) {
            modules.forEach((module: string[]) => this.includeModule(module[0]));
            return;
        }

        modules = modules
            .filter((module: string[]) => !pathExistsSync('src/app/@modules/' + module[0]))
            .map((module: string[]) => [module[0], this.installModule(module[0], module[1])])
            .filter((module: string[]) => !!module[1]);

        if (updateManifest) {
            this.manifest.addModules(modules);
        }

        console.log('Done!')
    }

    /**
     * Retrieve the git repo of the module, select the version and if needed create a branch specific to the project
     * @param {string} name (module name)
     * @param {string} version (module version)
     * @returns {string} (actual version installed)
     */
    public static installModule(name: string, version?: string): string {
        console.log('Installing module', name, version);

        if (!this.manifest) {
            this.manifest = Manifest.getInstance();
        }

        const rootDir: string = process.cwd();
        const branchName: string = `project-${this.projectName}`;
        let branches: string[];
        let tags: string[];
        let branchPresent: boolean = false;
        let branchLocal: boolean = false;
        let currentVersion: string;
        let useVersion: string;

        // execSync(`git clone ${this.manifest.getRemoteUrl()}${this.manifest.getNamespace()}/${name}-module src/app/@modules/${name}`);
        execSync(`git clone ${this.manifest.getRemoteUrl()}${this.manifest.getNamespace()}/module-${name}-front src/app/@modules/${name}`, {stdio: 'ignore'});
        process.chdir(`src/app/@modules/${name}`);

        execSync('git fetch origin', {stdio: 'ignore'});
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

        if (branchLocal) {
            execSync(`git checkout ${branchName}`, {stdio: 'ignore'});

            if (branchPresent) {
                execSync(`git pull origin/${branchName}`, {stdio: 'ignore'});
            }
        } else if (branchPresent) {
            execSync(`git checkout -b ${branchName} origin/${branchName}`, {stdio: 'ignore'});
            branchLocal = true;
        }

        if (branchLocal) {
            currentVersion = execSync(`git describe --tags --abbrev=0 ${branchName}`, { encoding: 'utf8' }).split('\n')[0];
            currentVersion = semver.valid(currentVersion);
        }

        tags = execSync('git tag', { encoding: 'utf8' })
            .split('\n')
            .map((tag: string) => semver.valid(tag))
            .filter((tag: string) => tag);

        if (semver.valid(version)) {
            if (currentVersion) {
                if (semver.gt(version, currentVersion)) {
                    useVersion = semver.valid(version);
                } else {
                    useVersion = currentVersion;
                }
            } else {
                useVersion = semver.valid(version);
            }
        } else if (currentVersion) {
            useVersion = currentVersion;
        } else {
            if (tags.length) {
                useVersion = tags.pop();
            }
        }

        // TODO update version (branches if needed) and push changes
        if (useVersion) {
            if (useVersion !== currentVersion) {
                if (!branchLocal) {
                    execSync(`git checkout ${useVersion}`, {stdio: 'ignore'});
                    execSync(`git branch ${branchName}`, {stdio: 'ignore'});
                } else {
                    execSync(`git merge ${useVersion}`, {stdio: 'ignore'});
                }

                execSync(`git push -u origin ${branchName}`, {stdio: 'ignore'});
            }
        }

        process.chdir(rootDir);

        if (useVersion) {
            this.includeModule(name);
        } else {
            removeSync(`src/app/@modules/${name}`);

            console.log('No suiting version found, module was not installed');
        }

        return useVersion;
    }

    /**
     * Add imports of all modules and services into the project
     * @param {string} name (module name)
     */
    public static includeModule(name: string) {
        executeSchematics('trala', 'addModule', {name});
    }
}