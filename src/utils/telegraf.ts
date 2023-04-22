import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next"
import Telegraf from "telegraf"
import type { TelegrafContext } from "telegraf/typings/context"
import type { Update } from "telegraf/typings/telegram-types"
import logger from "./logger"
import { type CustomContext } from "./context"

export type ApiHandler = (ctx: TelegrafContext) => Promise<void>;

export interface ApiRouter {
    commands: {
        [key: string]: ApiHandler
    }
    on: {
        [key: string]: ApiHandler
    }
}

export interface TelegramApiOptions {
    apiKey: string;
    router: ApiRouter;
    createContext?: CreateTelegrafContext
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CreateTelegrafContext = (ctx: TelegrafContext) => CustomContext

export const getBot = (apiKey: string, router: ApiRouter, createContext?: CreateTelegrafContext) => {
    const bot = new Telegraf(apiKey)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function withContext(handler: (ctx: CustomContext) => Promise<void>) {
        if (createContext) {
            return async (ctx: TelegrafContext) => {
                await handler(createContext(ctx))
            }
        }

        return handler
    }

    Object.keys(router.commands).forEach((command) => {
        const handler = router.commands[command] as ApiHandler
        bot.command(command, withContext(handler))
    })

    Object.keys(router.on).forEach((event) => {
        const handler = router.on[event] as ApiHandler
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
        bot.on(event as any, withContext(handler))
    })

    return bot
}

export const createTelegramRouter = (routes: {
    [key: string]: {
        type: "command" | "on"
        handler: ApiHandler
    }
}): ApiRouter => {
    return Object.keys(routes).reduce((acc, route) => {
        const { type, handler } = routes[route] as {
            type: "command" | "on"
            handler: ApiHandler
        }
        if (type === "command") {
            acc.commands[route] = handler
        } else if (type === "on") {
            acc.on[route] = handler
        }
        return acc
    }, {
        on: {},
        commands: {}
    } as ApiRouter)

}

export const on = (handler: ApiHandler) => ({
    type: "on" as "command" | "on",
    handler,
})

export const command = (handler: ApiHandler) => ({
    type: "command" as "command" | "on",
    handler,
})

export const telegramHTTPRequestsHandler = async ({
    req,
    res,
    bot,
    host
}: ({
    req: NextApiRequest;
    res: NextApiResponse;
    bot: Telegraf<TelegrafContext>;
    host: string;
})) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { body, query } = req

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    logger.log("Request received", req.method, host)
    if (req.method === "POST") {
        if (query?.method === "setWebhook") {
            // const BASE_PATH = process.env.NEXT_PUBLIC_VERCEL_URL || ''
            const webhookUrl = `${host}/api/telegram?secret=${query?.secret as string}`
            await bot.telegram.setWebhook(webhookUrl)
            logger.log(`Webhook set to ${webhookUrl}`)
        } else if (query?.method === "deleteWebhook") {
            await bot.telegram.deleteWebhook()
            logger.log("Webhook deleted")
        } else {
            if (query?.secret === process.env.NEXT_TELEGRAM_SECRET) {
                await bot.handleUpdate(body as Update)
                logger.log("Update handled")
            }
        }
    }

    res.status(200).json({ ok: true })
}

export const createTelegramApiHandler = (opts: TelegramApiOptions): NextApiHandler => {
    const { apiKey, router, createContext } = opts
    return async (req, res) => {
        const bot = getBot(apiKey, router, createContext);
        function getHost() {
            return `https://${req.headers.host as string}` || process.env['HOST'] || 'http://localhost:3000'
        }
        const host = getHost();

        return await telegramHTTPRequestsHandler(
            {
                req,
                res,
                bot,
                host
            }
        )
    }
}

export const createContext = (ctx: TelegrafContext) => {
    return ctx
}