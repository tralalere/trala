/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Change, Host} from '@schematics/angular/utility/change'
export {Change, Host, InsertChange, NoopChange} from '@schematics/angular/utility/change'

/**
 * Will remove text from the source code.
 */
export class RemoveChange implements Change {

  order: number;
  description: string;

  constructor(public path: string, public pos: number, public toRemove: string) {
    if (pos < 0) {
      throw new Error('Negative positions are invalid');
    }
    this.description = `Removed ${toRemove} into position ${pos} of ${path}`;
    this.order = pos;
  }

  apply(host: Host): Promise<void> {
    return host.read(this.path).then(content => {
      const prefix = content.substring(0, this.pos);
      const suffix = content.substring(this.pos + this.toRemove.length);

      // TODO: throw error if toRemove doesn't match removed string.
      return host.write(this.path, `${prefix}${suffix}`);
    });
  }
}

/**
 * Will replace text from the source code.
 */
export class ReplaceChange implements Change {
  order: number;
  description: string;

  constructor(public path: string, public pos: number, public oldText: string,
              public newText: string) {
    if (pos < 0) {
      throw new Error('Negative positions are invalid');
    }
    this.description = `Replaced ${oldText} into position ${pos} of ${path} with ${newText}`;
    this.order = pos;
  }

  apply(host: Host): Promise<void> {
    return host.read(this.path).then(content => {
      const prefix = content.substring(0, this.pos);
      const suffix = content.substring(this.pos + this.oldText.length);
      const text = content.substring(this.pos, this.pos + this.oldText.length);

      if (text !== this.oldText) {
        return Promise.reject(new Error(`Invalid replace: "${text}" != "${this.oldText}".`));
      }

      // TODO: throw error if oldText doesn't match removed string.
      return host.write(this.path, `${prefix}${this.newText}${suffix}`);
    });
  }
}
