import {Create, Init, Install, Theme, Update, Remove, Sync, Help, Version} from './commands';
const packageJson = require('../../package.json');

/**
 * Handles operations for the command line
 */
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

    /**
     * Generate an instance of the class
     * @param {string[]} args
     * @returns {CLI}
     */
    public static execute(args: string[]) {
        return new CLI(args);
    }

    /**
     * Retrieve and store the command from the list of command line arguments
     */
    public extractCommand() {
        // TODO retrieve it more genericly
        if (this.arguments.length !== 0) {
            this.command = this.arguments.shift();
        }
    }

    /**
     * Execute the command stored by extractCommand
     */
    public selectCommand() {
        switch (this.command) {
            case 'create':
                Create.execute(this.arguments);
                break;
            case 'init':
                Init.execute(this.arguments);
                break;
            case 'install':
                Install.execute(this.arguments, false);
                break;
            case 'include':
                Install.execute(this.arguments, true);
                break;
            case 'theme':
                Theme.execute(this.arguments);
                break;
            case 'update':
                Update.execute(this.arguments);
                break;
            case 'remove':
                Remove.execute(this.arguments);
                break;
            case 'sync':
                Sync.execute(this.arguments);
                break;
            case 'version':
                Version.execute(this.arguments);
                break;
            case '-v':
            case '--version':
                console.log(packageJson.version);
                break;
            case 'help':
                if (this.arguments.length) {
                    Help.execute(this.arguments);
                    break;
                }
            default:
                console.log('no command, display help (TODO)', packageJson.version);
                // display help
                process.exit(0);
        }
    }
}

