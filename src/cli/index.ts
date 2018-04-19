import { Init, Install, Update, Remove } from './commands';

export class CLI {

    private readonly arguments: string[];
    private command: string;

    constructor(
        private args: string[]
    ) {
        this.arguments = args;

        this.extractCommand();
        this.selectCommand();
    }

    static execute(args: string[]) {
        return new CLI(args);
    }

    extractCommand() {
        // TODO retrieve it more genericly
        if (this.arguments.length !== 0) {
            this.command = this.arguments.shift();
        }
    }

    selectCommand() {
        switch (this.command) {
            case 'init':
                Init.execute(this.arguments);
                break;
            case 'install':
                Install.execute(this.arguments);
                break;
            case 'update':
                Update.execute(this.arguments);
                break;
            case 'remove':
                Remove.execute(this.arguments);
                break;
            default:
                console.log('no command, display help');
                // display help
                process.exit(0);
        }
    }
}

