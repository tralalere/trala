export class Manifest {
    static manifest: Manifest;

    static getInstance(): Manifest {
        if(!Manifest.manifest) {
            Manifest.manifest = new Manifest();
        }
        return Manifest.manifest;
    }

    public addModules(modules: string[][]) {

    }

    public removeModules(modules: string[]) {

    }

    public updateModules(modules: string[][]) {

    }

    public getModules(): string[][] {
        const modules: string[][] = [];

        return modules;
    }
}