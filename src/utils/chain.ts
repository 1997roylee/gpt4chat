import { LLMChain } from "langchain";
import type { ChainValues } from "langchain/dist/schema";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";

const OPENAI_API_KEY = process.env.NEXT_OPENAI_API_KEY;
const MAX_TOKENS = 300;
const DEFAULT_temperature = 0.9;

// export const getModelName = (model: string) => {
//     return model;
// }

export const createModal = (modelName = "gpt-3.5-turbo") => {
    return new OpenAI({ openAIApiKey: OPENAI_API_KEY, temperature: DEFAULT_temperature, modelName, maxTokens: MAX_TOKENS });
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const executeTask = async (model: OpenAI, prompt: PromptTemplate, parameters: ChainValues) => {
    return await new LLMChain({ llm: model, prompt }).call(parameters);
}

export const executeTaskAgent = async (model: OpenAI, goal: string, task: string) => {
    const prompt = createTaskPromptTemplate();
    return executeTask(model, prompt, { goal, task });

}