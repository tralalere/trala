import {Manifest} from "../../manifest";
import {readFileSync, writeFileSync} from "fs";

/**
 * Implement Theme switching command
 */
export class Theme {
  static manifest: Manifest;
  static projectName: string;

  /**
   * Switch theme used by replacing paths in key files
   * @param {string[]} args (arguments)
   */
  public static execute(args: string[]) {
    this.manifest = Manifest.getInstance();
    this.projectName = this.manifest.getProjectName().toLowerCase();

    const themeName = args[0].replace(/\//g, '');
    const basePath = '';

    console.log('Switching theme to', themeName);

    // Edit angular.json
    const angularManifestPath = `${basePath}angular.json`;
    const angularManifest = JSON.parse(readFileSync(angularManifestPath, { encoding: 'utf-8' }));
    const buildOptions = angularManifest.projects.fuse.architect.build.options;

    buildOptions.assets = buildOptions.assets.map((path: string) => {
      const pattern = 'src/assets/';
      const patternIndex = path.indexOf(pattern);

      if (patternIndex > -1) {
        const slashIndex = path.indexOf('/', patternIndex + pattern.length);
        let newPath = path.slice(0, patternIndex + pattern.length) + themeName;

        if (slashIndex > -1) {
          newPath += path.slice(slashIndex);
        }

        return newPath;
      }

      return path;
    });

    writeFileSync(angularManifestPath, JSON.stringify(angularManifest, null, '    ')+'\n', { encoding: 'utf-8' });

    // Edit src/styles.scss
    const stylesPath = `${basePath}src/styles.scss`;
    const styles = readFileSync(stylesPath, { encoding: 'utf-8' });
    const newStyles = styles.replace(/(@import.*app\/themes\/)([^\/]*)(\/.*;)/g, `$1${themeName}$3`);

    writeFileSync(stylesPath, newStyles, { encoding: 'utf-8' });

    // Edit src/app/app.module.ts
    const appModulePath = `${basePath}src/app/app.module.ts`;
    const appModule = readFileSync(appModulePath, { encoding: 'utf-8' });
    const newAppModule = appModule.replace(/(import.*\/themes\/)([^\/]*)(\/.*;)/g, `$1${themeName}$3`);

    writeFileSync(appModulePath, newAppModule, { encoding: 'utf-8' });

    // Edit src/app/service-instantiator.class.ts
    const serviceInstantiatorPath = `${basePath}src/app/service-instantiator.class.ts`;
    const serviceInstantiator = readFileSync(serviceInstantiatorPath, { encoding: 'utf-8' });
    const newServiceInstantiator = serviceInstantiator.replace(/(import.*\/themes\/)([^\/]*)(\/.*;)/g, `$1${themeName}$3`);

    writeFileSync(serviceInstantiatorPath, newServiceInstantiator, { encoding: 'utf-8' });

    // Edit src/app/settings.ts
    const settingsPath = `${basePath}src/app/settings.ts`;
    const settings = readFileSync(settingsPath, { encoding: 'utf-8' });
    const newSettings = settings.replace(/(export.*brand[^'"]*['"])([^'"]*)([^;];)/g, `$1${themeName}$3`);

    writeFileSync(settingsPath, newSettings, { encoding: 'utf-8' });

    // Edit src/app/themes/theme.scss
    const themePath = `${basePath}src/app/themes/theme.scss`;
    const theme = readFileSync(themePath, { encoding: 'utf-8' });
    const newTheme = theme.replace(/(@import.*\.\/)([^\/]*)(\/.*;)/g, `$1${themeName}$3`);

    writeFileSync(themePath, newTheme, { encoding: 'utf-8' });

  }
}