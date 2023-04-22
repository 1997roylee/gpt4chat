import type { TelegrafContext } from "telegraf/typings/context"
import { createModal } from "./chain"

export type CustomContext = TelegrafContext & {
    model?: ReturnType<typeof createModal>
}

export const createContext = (ctx: TelegrafContext): CustomContext => {
    const model = createModal()

    return ({
        model,
        ...ctx
    }) as CustomContext
}

// export type Context = ReturnType<typeof createContext>