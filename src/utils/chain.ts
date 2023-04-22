import { LLMChain } from "langchain";
import type { ChainValues } from "langchain/dist/schema";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";

const OPENAI_API_KEY = process.env.NEXT_OPENAI_API_KEY;
const MAX_TOKENS = 300;
const DEFAULT_temperature = 0.9;
export class AgentOpenAIModel {
    public model: OpenAI;
    constructor(model: OpenAI) {
        this.model = model
    }

    public async startGoal(goal: string) {
        const prompt = createStartGoalPromptTempalte();
        return this._executeTask(prompt, { goal });
    }

    public async executeTask(goal: string, task: string) {
        const prompt = createTaskPromptTemplate();
        return this._executeTask(prompt, { goal, task });
    }

    private async _executeTask(prompt: PromptTemplate, parameters: ChainValues) {
        return await new LLMChain({ llm: this.model, prompt }).call(parameters);
    }
}

export const createModal = (modelName = "gpt-3.5-turbo") => {
    const model = new OpenAI({ openAIApiKey: OPENAI_API_KEY, temperature: DEFAULT_temperature, modelName, maxTokens: MAX_TOKENS })
    return new AgentOpenAIModel(model);
}

// export const withModel =

export const createPromptTemplate = (template: string, inputVariables: string[]) => {
    return new PromptTemplate({ template, inputVariables });
}

export const createStartGoalPromptTempalte = () => {
    const template = "You are an autonomous task creation AI called AgentGPT. You have the following objective `{goal}`. Create a list of zero to three tasks to be completed by your AI system such that your goal is more closely reached or completely reached. Return the response as an array of strings that can be used in JSON.parse()";
    const inputVariables = ["goal"];
    return createPromptTemplate(template, inputVariables);
}

export const createTaskPromptTemplate = () => {
    const template = "You are an autonomous task execution AI called AgentGPT. You have the following objective `{goal}`. You have the following tasks `{task}`. Execute the task and return the response as a string."
    const inputVariables = ["goal", "task"];
    return createPromptTemplate(template, inputVariables);
}
