import { Manifest } from "../../manifest";
import {execSync} from "child_process";
import {executeSchematics} from "../../schematics";

/**
 * Implement Init command
 */
export class Init {
    /**
     * Perform the initialisation of the project by initializing a git repo, pulling from the parent project,
     * getting optional other repositories and cleaning all existing imports
     * @param {string[]} args
     */
    public static execute(args: string[]) {
        console.log('Initializing project', args[0]);

        const cwd = process.cwd();
        const manifest = Manifest.getInstance();
        let projectName = args[0];

        // console.log(cwd);

        if (!projectName) {
            projectName = cwd.substr(cwd.lastIndexOf('\\') + 1);
        }

        // TODO get data for manifest interactively (from console)
        manifest.setProjectName(projectName);

        execSync('git init', {stdio: 'ignore'});
        execSync(`git remote add skeleton ${manifest.getRemoteUrl()}${manifest.getNamespace()}/skeleton-front`, {stdio: 'ignore'});
        execSync('git fetch skeleton', {stdio: 'ignore'});
        execSync('git pull skeleton master', {stdio: 'ignore'});
        execSync('git branch develop', {stdio: 'ignore'});
        execSync('git checkout develop', {stdio: 'ignore'});
        execSync('git pull skeleton develop', {stdio: 'ignore'});

        // TODO create remote repository (Gitlab API) (POST, use private_token ?)
        // TODO add repository as origin remote
        // TODO track master to origin/master

        // TODO handle fuse-core clone as a parameter
        execSync(`git clone ${manifest.getRemoteUrl()}${manifest.getNamespace()}/fuse-core src/app/core -b develop`, {stdio: 'ignore'});

        executeSchematics('trala', 'clearModules', {});

        manifest.save();

        console.log('Done!');
    }
}