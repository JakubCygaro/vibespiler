import arg from "arg"

export type Args = {
    inputFile: string | undefined,
    outputFile: string | undefined,
    from?: string | undefined,
    to: string | undefined,
    help: boolean,
}
export function printHelp(): void {
    console.log(
`Usage: vibesc INPUT_FILE [OPTION...] -o OUTPUT_FILE
Transpile source code of one language into another.

 General options:

   -o, --output\t\tPath to output file
   -f, --from\t\t[OPTIONAL] Input file programming language
   -t, --to\t\tOutput file programming language

   -h, --help\t\tPrint this help
        `)
}
export function parseArguments(): Args {
    const args = arg({
        '--output': String,
        '--from': String,
        '--to': String,
        '--help': Boolean,

        '-o': '--output',
        '-f': '--from',
        '-t': '--to',
        '-h': '--help' ,
    });
    return {
        inputFile: args._[0],
        outputFile: args['--output'],
        to: args['--to'],
        from: args['--from'],
        help: args['--help'] === undefined ? false : true,
    }
}
