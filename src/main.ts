import { OpenAI } from "openai"
import * as prompts from "./prompts.js"
import * as args from "./args.js"
import fs from 'fs'
import path from 'path'

try{
    main();
} catch (e: any) {
    console.error("Error: ", e.message);
}

function main(): void {

    const a = args.parseArguments();
    if (a.help) {
        args.printHelp()
        process.exit(0);
    }
    if (process.env['OPENAI_API_KEY'] == null) {
        throw Error("OPENAI_API_KEY enviroment variable not set")
    }
    const apiKey = process.env['OPENAI_API_KEY'];

    if(a.inputFile === undefined) {
        throw Error("no input file path specified");
    }
    if(a.to === undefined) {
        throw Error("output language not specified")
    }
    if(a.outputFile === undefined) {
        throw Error("output file path not specified")
    }
    const inputPath = path.join(process.cwd(), a.inputFile)

    const input = fs.readFileSync(inputPath).toString();

    const transpiler = new OpenAI({
        apiKey: apiKey
    })

    const prompt = prompts.generatePrompt(input, a.to, a.from!);

    console.log("Starting compilation...")
    transpiler.responses.create({
        model: "gpt-5-nano",
        instructions: prompts.instructions,
        input: prompt,
    }).then((resp) => {
        const response: String = resp.output_text;
        processResponse(response, a.outputFile!);
    }).catch((err) => {
        throw Error(err)
    })
}

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
