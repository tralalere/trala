import {accessSync, constants, mkdirSync, readFileSync, writeFileSync} from 'fs';

/**
 * Object format for the manifest
 */
interface ManifestFormat {
    project: string;
    remoteUrl: string;
    namespace: string;
    version?: string;
    modules: {[name: string]: ModuleFormat};
}

/**
 * Object format for a module in the manifest
 */
interface ModuleFormat {
    version: string;
    remoteUrl?: string;
    namespace?: string;
    repository?: string;
}

const defaultFilename: string = 'trllr';
const defaultData: ManifestFormat = {
    project: '',
    remoteUrl: 'git@gitlab.abc-informatik.fr:',
    namespace: 'lms_trala',
    modules: {}
};

/**
 * Represents the manifest and facilitates operations on it
 */
export class Manifest {
    static manifest: Manifest;

    static getInstance(): Manifest {
        if(!Manifest.manifest) {
            Manifest.manifest = new Manifest();
        }
        return Manifest.manifest;
    }

    private readonly manifestPath: string;
    private manifestData: ManifestFormat;

    constructor() {
        const cwd = process.cwd();

        this.manifestPath = `./src/${defaultFilename}.json`;

        try {
            accessSync(this.manifestPath, constants.R_OK | constants.W_OK);
        } catch (error) {
            const dirName = cwd.substr(cwd.lastIndexOf('\\') + 1);

            if (dirName === 'src') {
                this.manifestPath = `./${defaultFilename}.json`;
            } else {
                try {
                    accessSync(cwd + '\\src');
                } catch (error) {
                    mkdirSync('src');
                }
            }
        }

        try {
            this.loadManifest();
        } catch (error) {
            this.loadManifestDefault();
        }
    }

    /**
     * Set the project name in the manifest
     * @param {string} projectName
     */
    public setProjectName(projectName: string) {
        this.manifestData.project = projectName;
    }

    /**
     * Set remote Url
     * @param {string} remoteUrl
     */
    public setRemoteUrl(remoteUrl: string) {
        this.manifestData.remoteUrl = remoteUrl;
    }

    /**
     * Set namespace
     * @param {string} namespace
     */
    public setNamespace(namespace: string) {
        this.manifestData.namespace = namespace;
    }

    /**
     * Set version
     * @param {string} version
     */
    public setVersion(version: string) {
        this.manifestData.version = version;
    }

    /**
     * Retrieve project name
     * @returns {string}
     */
    public getProjectName(): string {
        return this.manifestData.project;
    }

    /**
     * Retrieve remote Url
     * @returns {string}
     */
    public getRemoteUrl(): string {
        return this.manifestData.remoteUrl;
    }

    /**
     * Retrieve namespace
     * @returns {string}
     */
    public getNamespace(): string {
        return this.manifestData.namespace;
    }

    /**
     * Retrieve version of the project
     * @returns {string}
     */
    public getVersion(): string {
        return this.manifestData.version;
    }

    /**
     * Add a list of modules
     * @param {string[][]} modules (Array of [moduleName, moduleVersion])
     */
    public addModules(modules: string[][]) {
        modules.forEach((module) => {
            this.addModuleInternal(module[0], module[1]);
        });

        this.saveManifest();
    }

    /**
     * Remove a list of modules
     * @param {string[]} modules
     */
    public removeModules(modules: string[]) {
        modules.forEach((module) => {
            this.removeModuleInternal(module);
        });

        this.saveManifest();
    }

    /**
     * Update module version
     * @param {string[][]} modules (Array of [moduleName, moduleVersion])
     */
    public updateModules(modules: string[][]) {
        modules.forEach((module) => {
            this.removeModuleInternal(module[0]);
            this.addModuleInternal(module[0], module[1]);
        });

        this.saveManifest();
    }

    /**
     * Retrieve the list of modules installed
     * @returns {string[][]}
     */
    public getModules(): string[][] {
        const modules: string[][] = [];

        for (const module in this.manifestData.modules) {
            modules.push([module, this.manifestData.modules[module].version]);
        }

        return modules;
    }

    /**
     * Save the manifest file
     */
    public save() {
        this.saveManifest();
    }

    private addModuleInternal(name: string, version: string) {
        if (!this.manifestData.modules[name]) {
            this.manifestData.modules[name] = { version };
        }
    }

    private removeModuleInternal(name: string) {
        if (this.manifestData.modules[name]) {
            delete this.manifestData.modules[name];
        }
    }

    private loadManifest() {
        const manifestRaw = readFileSync(this.manifestPath, { encoding: 'utf8' });
        this.manifestData = JSON.parse(manifestRaw);

        // console.log('Manifest loaded', this.manifestData);
    }

    private loadManifestDefault() {
        const manifestBuilder = this.duplicateObject(defaultData);
        this.manifestData = manifestBuilder as ManifestFormat;

        // console.log('Default manifest loaded', this.manifestData);
    }

    private saveManifest() {
        writeFileSync(this.manifestPath, JSON.stringify(this.manifestData, null, 2), { encoding: 'utf8' });

        // console.log('Manifest saved', this.manifestData);
    }

    private duplicateObject(object: any): any {
        const newObject = {};

        for (const property in object) {
            if (object.hasOwnProperty(property)) {
                if (typeof object[property] === 'object') {
                    newObject[property] = this.duplicateObject(object[property]);
                } else {
                    newObject[property] = object[property];
                }
            }
        }

        return newObject;
    }
}