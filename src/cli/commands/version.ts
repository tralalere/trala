import {Manifest} from "../../manifest";
import {GSheet} from "../../connectors/gsheets";
import {existsSync} from "fs";
import {execSync} from "child_process";
import * as semver from "semver";
import {ReleaseType} from "semver";

/**
 * Implement Version command
 */
export class Version {
    private static manifest: Manifest;
    private static options = {
        autoVersion: true,
        baseVersion: '',
        delayVersion: false,
        merge: true,
        sourceBranche: 'develop',
        versionFromSheet: ''
    };
    private static action: string;

    /**
     * List or update version of modules
     * @param {string[]} args (arguments)
     */
    public static execute(args: string[]) {
        this.manifest = Manifest.getInstance();
        const currentModules = this.manifest.getModules();

        args = args.filter((arg: string) => !this.applySetting(arg));

        if (args.length) {
            this.action = args.shift();

            if (['major', 'minor', 'patch'].indexOf(this.action) === -1) {
                console.error('Action', this.action, 'not recognized. Should be "major", "minor" or "patch".')
                return;
            }

            if (this.options.versionFromSheet) {
                console.log('Version modules from sheet for project', this.options.versionFromSheet);
                GSheet.readSheet('1Sj5U3CFtQUO16XeKu0az_t3l8cMtqhfd9QmxWFqCGDU', this.options.versionFromSheet)
                    .then((data) => {
                        const modulesFromSheet = data.slice(1).map((row) => row[0]);
                        this.versionModules(this.mergeModules(args, modulesFromSheet));
                    }, (error) => {
                        console.error(error);
                    });
            }

            if (args.length && !this.options.delayVersion) {
                this.versionModules(args);
            } else if (this.options.autoVersion) {
                this.versionModules(currentModules.map((module: string[]) => module[0]));
            }
        } else {
            console.log(currentModules.map((module: string[]) => module.join(': ')).join('\n'));
        }
    }

    private static versionModules(modules: string[]): void {
        const rootDir: string = process.cwd();

        modules.forEach((module: string) => {
            const modulePath = `src/app/@modules/${module}`;

            if (existsSync(modulePath)) {
                let baseModuleVersion: string;
                let tags: string[];
                let branches: string[];
                let branchPresent = false;
                let branchLocal = false;

                process.chdir(modulePath);
                execSync('git fetch origin', {stdio: 'ignore'});
                tags = execSync('git tag', { encoding: 'utf8' })
                    .split('\n')
                    .map((tag: string) => semver.valid(tag))
                    .filter((tag: string) => tag);

                if (this.options.baseVersion) {
                    let checkRange = this.options.baseVersion;
                    switch(this.action) {
                        case 'major':
                            checkRange = 'x';
                            break;
                        case 'minor':
                            checkRange = `${semver.major(checkRange)}.x`;
                            break;
                        case 'patch':
                            checkRange = `${semver.major(checkRange)}.${semver.minor(checkRange)}.x`;
                            break;
                    }

                    baseModuleVersion = semver.maxSatisfying(tags, checkRange);
                } else {
                    baseModuleVersion = <string>(semver.sort(tags).pop())
                }

                console.log(module, 'doing a', this.action, 'from version', baseModuleVersion, 'to version', semver.inc(baseModuleVersion, <ReleaseType>this.action));

                branches = execSync('git branch -a', { encoding: 'utf8' })
                    .split('\n');

                const filteredBranches = branches.filter((branch: string) => {
                        const branchIndex = branch.indexOf(this.options.sourceBranche);
                        return branchIndex > -1 && branchIndex + this.options.sourceBranche.length === branch.length;
                    });

                if (filteredBranches.length) {
                    branchPresent = filteredBranches.some((branch: string) => branch.indexOf('remotes') > -1);
                    branchLocal = filteredBranches.some((branch: string) => branch.indexOf('remotes') === -1);
                }

                if (branchLocal) {
                    execSync(`git checkout ${this.options.sourceBranche}`, {stdio: 'ignore'});

                    if (branchPresent) {
                        execSync(`git pull origin ${this.options.sourceBranche}`, {stdio: 'ignore'});
                    }
                } else if (branchPresent) {
                    execSync(`git checkout -b ${this.options.sourceBranche} origin/${this.options.sourceBranche}`, {stdio: 'ignore'});
                    branchLocal = true;
                }

                if (branchLocal) {
                    const versionTimestamp = +execSync(`git show -s --format=%ct ${baseModuleVersion}`, {encoding: 'utf8'}).split('\n').slice(-2).shift();
                    const branchTimestamp = +execSync(`git show -s --format=%ct ${this.options.sourceBranche}`, {encoding: 'utf8'}).split('\n').slice(-2).shift();

                    if (branchTimestamp > versionTimestamp) {
                        if (this.options.merge) {
                            if (branches.some((branch: string) => branch.indexOf('master') === 2)) {
                                execSync(`git checkout master`, {stdio: 'ignore'});
                                execSync(`git pull origin master`, {stdio: 'ignore'});
                            } else {
                                execSync(`git checkout -b master origin/master`, {stdio: 'ignore'});
                            }

                            execSync(`git merge ${this.options.sourceBranche}`, {encoding: 'utf8'})
                        }

                        execSync(`git tag ${semver.inc(baseModuleVersion, <ReleaseType>this.action)}`, {encoding: 'utf8'});

                        console.log(module, this.action, 'done', this.options.merge ? '(merged into master)' : '(on branch' + this.options.sourceBranche + ')', ', new version is', semver.inc(baseModuleVersion, <ReleaseType>this.action));
                    } else {
                        console.log(module, 'nothing new, latest version is', baseModuleVersion);
                    }
                }

                process.chdir(rootDir);
            }
        });
    }

    private static mergeModules(modules1: string[], modules2: string[]): string[] {
        const modules = modules1.slice();

        modules2.forEach((module) => {
            if (modules.indexOf(module) === -1) {
                modules.push(module);
            }
        });

        return modules;
    }

    private static applySetting(argument: string): boolean {
        if (argument.indexOf('-') === 0) {

            if (argument.indexOf('--fromSheet=') === 0) {
                this.options.autoVersion = false;
                this.options.delayVersion = true;
                this.options.versionFromSheet = this.getParameter(argument);
            }

            if (argument.indexOf('--sourceBranch=') === 0) {
                this.options.sourceBranche = this.getParameter(argument);
            }

            if (argument.indexOf('--baseVersion=') === 0) {
                this.options.baseVersion = this.getParameter(argument);
            }

            if (argument.indexOf('--noMerge') === 0) {
                this.options.merge = false;
            }

            return true;
        }

        return false;
    }

    private static getParameter(argument: string): string {
        const arg = argument.split('=');
        return arg[1] ? arg[1] : '';
    }
}
