export class Manifest {
    static manifest: Manifest;

    static getInstance(): Manifest {
        if(!Manifest.manifest) {
            Manifest.manifest = new Manifest();
        }
        return Manifest.manifest;
    }

    public updateModules(modules: string[][]) {

    }
}