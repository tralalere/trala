interface ManifestFormat {
    project: string;
    remoteUrl: string;
    namespace: string;
    version?: string;
    modules: {[name: string]: ModuleFormat};
}

interface ModuleFormat {
    version: string;
    remoteUrl?: string;
    namespace?: string;
    repository?: string;
}

export class Manifest {
    static manifest: Manifest;

    static getInstance(): Manifest {
        if(!Manifest.manifest) {
            Manifest.manifest = new Manifest();
        }
        return Manifest.manifest;
    }

    private manifestData: ManifestFormat;

    constructor() {
        // TODO get/save manifest path file

        this.loadManifest();
    }

    public addModules(modules: string[][]) {
        modules.forEach((module) => {
            this.addModuleInternal(module[0], module[1]);
        });

        this.saveManifest();
    }

    public removeModules(modules: string[]) {
        modules.forEach((module) => {
            this.removeModuleInternal(module[0]);
        });

        this.saveManifest();
    }

    public updateModules(modules: string[][]) {
        modules.forEach((module) => {
            this.removeModuleInternal(module[0]);
            this.addModuleInternal(module[0], module[1]);
        });

        this.saveManifest();
    }

    public getModules(): string[][] {
        const modules: string[][] = [];

        for (const module in this.manifestData.modules) {
            modules.push([module, this.manifestData.modules[module].version]);
        }

        return modules;
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
        // TODO load manifest
    }

    private saveManifest() {

    }
}