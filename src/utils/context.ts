import type { TelegrafContext } from "telegraf/typings/context"
import { createModal } from "./chain"

export const createContext = async (ctx: TelegrafContext) => {
    const model = createModal()
    // eslint-disable-next-line @typescript-eslint/await-thenable, @typescript-eslint/no-unsafe-return
    return await ({
        model,
        ...ctx
    })
}

export type Context = ReturnType<typeof createContext>