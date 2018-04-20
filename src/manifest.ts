interface ManifestFormat {

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

        return modules;
    }

    private addModuleInternal(name: string, version: string) {

    }

    private removeModuleInternal(name: string) {

    }

    private saveManifest() {

    }
}