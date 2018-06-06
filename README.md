# TRALA

`trala` is a CLI tool that aims to manage modules and packages in the most customizable way.

## Installation
```bash
npm install -g trala
```

## Usage
```bash
trala init <project>
```
Instanciate a project from a base project in a new folder.

```bash
trala install [<module>[@<version>]]
```
Add a module to the project from its remote git repository and import its modules and services into the base project. You can optionally specify a version. The latest version is installed by default.

If no module is given, install all the modules present in the manifest. 

```bash
trala update <module>[@<version>]
```
Update a module to the latest or specified version

```bash
trala remove <module>
```
Remove a module from the project.

## TODO List
* Create folder with init command, add --flat option to disable
* Do an npm install after init
* Add global config for where to look for remote git repos
* Add command to retrieve a project from a remote
* Clean data of octopus connector (defined endpoints)
* Add command to version modules
* Update package.json to change project name
* Clean other files when init command (app.component.ts, is-user-logged.class.ts, main/toolbar/toolbar.component.ts)
* Add configuration for module repo name
* Add configuration for module location(s)