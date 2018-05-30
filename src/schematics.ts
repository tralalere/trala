import {DryRunEvent, UnsuccessfulWorkflowExecution} from "@angular-devkit/schematics";
import {NodeWorkflow} from "@angular-devkit/schematics/tools";
import {normalize, virtualFs} from "@angular-devkit/core";
import {NodeJsSyncHost} from "@angular-devkit/core/node";

export function executeSchematics(collectionName: string, schematicsName: string, options: any) {
    const fsHost = new virtualFs.ScopedHost(new NodeJsSyncHost(), normalize(process.cwd()));
    const workflow = new NodeWorkflow(fsHost, {dryRun: false, force: false});

    workflow.reporter.subscribe((event: DryRunEvent) => {
        switch (event.kind) {
            case 'error':
                console.log('Error:', event.path, event.description);
                break;
            case 'update':
                console.log('Update:', event.path, event.content.length, 'bytes');
                break;
            case 'create':
                console.log('Create:', event.path,event.content.length, 'bytes');
                break;
            case 'delete':
                console.log('Delete:', event.path);
                break;
            case 'rename':
                console.log('Rename:', event.path, 'to', event.to);
                break;
        }
    });

    console.log(process.cwd());

    workflow.execute({
        collection: collectionName,
        schematic: schematicsName,
        options
    })
    .subscribe({
        error(err: Error) {
            if (err instanceof  UnsuccessfulWorkflowExecution) {
                console.log('The Schematic workflow failed.');
            } else {
                console.log('Error somewhere', err.stack);
            }
        },
        complete() {
            console.log('Workflow done !');
        }
    });
};