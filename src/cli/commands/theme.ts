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

    console.log('switching to', args[0]);
    const themeName = args[0];

    // Edit angular.json
    const angularManifest = JSON.parse(readFileSync('angular.json', { encoding: 'utf-8' }));
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

    writeFileSync('angular.json', JSON.stringify(angularManifest, null, '    ')+'\n', { encoding: 'utf-8' });

    // TODO edit src/styles.scss
    const styles = readFileSync('src/styles.scss', { encoding: 'utf-8' });
    const pattern = 'app/themes/';
    const patternIndex = styles.indexOf(pattern);

    // TODO use string.replace to make it more straight forward, build a regexp to match @import "app/themes/(.*)/.*"; and replace group 1 with themeName
    // TODO use same logic in every file

    if (patternIndex > -1) {
      const slashIndex = styles.indexOf('/', patternIndex + pattern.length);
      let newStyles = styles.slice(0, patternIndex + pattern.length) + themeName;

      if (slashIndex > -1) {

      } else {

      }
      console.log(newStyles);

      // writeFileSync('src/styles.scss', newStyles, { encoding: 'utf-8' });
    }

    // TODO edit src/app/app.module.ts

    // TODO edit src/app/service-instantiator.class.ts

    // TODO edit src/app/settings.ts

    // TODO edit src/app/themes/theme.scss

  }
}