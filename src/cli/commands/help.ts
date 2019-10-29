/**
 * Implement Help command
 */
export class Help {
    /**
     * Display help for a specific command
     * @param {string[]} args (arguments)
     */
    public static execute(args: string[]) {
        console.log('Display help about', args);
    }

    /**
     * Display global help message;
     */
    public static displayHelp() {
        console.log('Display help (TODO)');
    }
}
