import { OpenAI } from "openai"
import * as prompts from "./prompts"
import arg from "arg"
import fs from 'fs'
import path from 'path'

const args = arg({
    '--output': String,
    '--from': String,
    '--to': String,

    '-o': '--output',
    '-f': '--from',
    '-t': '--to'
});
if (process.env['OPENAI_API_KEY'] === null) {
    exitError("OPENAI_API_KEY enviroment variable not set")
}
const apiKey = process.env['OPENAI_API_KEY'];
if(args._[0] === undefined) {
    exitError("no input file path specified");
}
const input = fs.readFileSync(path.join(process.cwd(), args._[0])).toString();
if(args['--to'] === undefined) {
    exitError("output language not specified")
}
const to = args['--to'];
if(args['--output'] === undefined) {
    exitError("output file path not specified")
}
const output = args['--output'];
const from: null | string = args['--from'] === undefined ? null : args['--from'];

const transpiler = new OpenAI({
    apiKey: apiKey
})
const prompt = prompts.generatePrompt(input, to, from!);

console.log("Starting compilation...")
transpiler.responses.create({
    model: "gpt-5-nano",
    instructions: prompts.instructions,
    input: prompt,
}).then((resp) => {
    const response: String = resp.output_text;
    processResponse(response, output);
}).catch((err) => {
    exitError(err)
})

function processResponse(response: String, output: string){
    if(response.startsWith('OUTPUT:')) {
        fs.writeFileSync(path.join(process.cwd(), output), response.slice('OUTPUT:'.length))
        console.log(
`Finished.
Output written to ${output}`)
    } else if (response.startsWith('ERRORS:')){
        const errors = response.slice('ERRORS:'.length)
        exitError(
`COMPILATION ERRORS REPORTED:
${errors}`)
    } else {
        exitError("unknown error")
    }
}
function exitError(msg?: string) : never {
    console.error(`Error: ${msg}`)
    process.exit(-1);
}
