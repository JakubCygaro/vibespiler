import { OpenAI } from "openai"
// import { Agent, run } from '@openai/agents'
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
const instructions = `
You are a transpiler, you take input source code written in one programming language and translate it to another language while preserving the functionality of the input source code.
Input will be provided to you in this format:

SOURCELANGUAGE: <programming language the source code is written in><newline>
OUTPUTLANGUAGE: <programming language the output code must be written in><newline>
SOURCE: <newline>
<all remaining text till EOF is the input source code>

In the event that SOURCELANGUAGE is not provided you have to guess the source language by yourself and proceed normally.
If the source code was valid (meaning it had no errors that would prevent it from being executed) your respone shall be formated like so:

OUTPUT:<newline>
<transpiled code string>

If the source code was invalid (meaning it had errors that would prevent it from being executed) your response must be formated like so:

ERRORS:<newline>
<error output>

Use line numbers in error messages, assume the first line after SOURCE: is the first line of the source code.
`
const transpileAgent = new OpenAI({
    apiKey: process.env['OPENAI_API_KEY']
})
const prompt = `
SOURCELANGUAGE: ${from}
OUTPUTLANGUAGE: ${to}
SOURCE: ${input}
`
transpileAgent.responses.create({
    model: "gpt-5-nano",
    instructions: instructions,
    input: prompt,
}).then((resp) => {
    const out: String = resp.output_text;
    if(out.startsWith('OUTPUT:')) {
        fs.writeFileSync(path.join(process.cwd(), output), out.slice('OUTPUT:'.length))
        console.log(`
finished.
Output written to ${output}
`)
    } else if (out.startsWith('ERRORS:')){
        const errors = out.slice('ERRORS:'.length)
        console.error(
`
COMPILATION ERRORS REPORTED:
    ${errors}
`)
    } else {
        throw new Error("unknown error")
    }
}).catch((err) => {
    console.error(err)
})
console.log("compiling...")
