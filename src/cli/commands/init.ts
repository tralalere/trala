import { Manifest } from "../../manifest";

export class Init {
    static execute(args: string[]) {
        console.log('init', args);

        console.log(process.cwd());

        const manifest = Manifest.getInstance();

        // TODO get project name

        // TODO create remote repository (Gitlab API)

        // TODO clone repository

        // TODO branch to master

        // TODO add skeleton-front as remote (needs configuration)

        // TODO pull skeleton-front/develop into develop

        // TODO clone fuse-core in the appropriate directory

        // TODO update trllr.json file
    }
}