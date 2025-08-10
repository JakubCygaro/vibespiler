import { OpenAI } from "openai"
import * as prompts from "./prompts"
import arg from "arg"
import fs from 'fs'
import path from 'path'

const args = arg({
    '--input': String,
    '--output': String,
    '--from': String,
    '--to': String,

    '-i': '--input',
    '-o': '--output',
    '-f': '--from',
    '-t': '--to'
});
if(args['--input'] === undefined) {
    throw new Error("no input file specified");
}
let input = fs.readFileSync(path.join(process.cwd(), args["--input"])).toString();
if(args['--to'] === undefined) {
    throw new Error("output language not specified")
}
const to = args['--to'];
if(args['--output'] === undefined) {
    throw new Error("output file not specified")
}
const output = args['--output'];
const from: null | string = args['--from'] === undefined ? null : args['--from'];
const transpiler = new OpenAI({
    apiKey: process.env['OPENAI_API_KEY']
})
const prompt = prompts.generatePrompt(input, to, from!);

console.log("compiling...")
transpiler.responses.create({
    model: "gpt-5-nano",
    instructions: prompts.instructions,
    input: prompt,
}).then((resp) => {
    const response: String = resp.output_text;
    processResponse(response, output);
}).catch((err) => {
    console.error(err)
})

function processResponse(response: String, output: string){
    if(response.startsWith('OUTPUT:')) {
        fs.writeFileSync(path.join(process.cwd(), output), response.slice('OUTPUT:'.length))
        console.log(`
    finished.
    Output written to ${output}
    `)
    } else if (response.startsWith('ERRORS:')){
        const errors = response.slice('ERRORS:'.length)
        console.error(
    `
    COMPILATION ERRORS REPORTED:
    ${errors}
    `)
    } else {
        throw new Error("unknown error")
    }
}
