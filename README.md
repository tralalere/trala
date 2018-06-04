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
trala install <module>[@<version>]
```
Add a module to the project from its remote git repository and import its modules and services into the base project. You can optionally specify a version. The latest version is installed by default.

```bash
trala update <module>[@<version>]
```
Update a module to the latest or specified version

```bash
trala remvoe <module>
```
Remove a module from the project.