import { type CustomContext, createContext } from "@/utils/context";
import { createTelegramRouter, createTelegramApiHandler, on, command } from "@/utils/telegraf";
import type { TelegrafContext } from "telegraf/typings/context"

export async function handleOnMessage(ctx: TelegrafContext) {
    const { message } = ctx

    const isGroup =
        message?.chat.type === "group" || message?.chat.type === "supergroup"

    if (isGroup) {
        await ctx.reply("This bot is only available in private chats.")
        return
    }

    const telegramUsername = message?.from?.username
    const reply = "a message was sent"

    await ctx.reply(reply, {
        reply_to_message_id: message?.message_id,
    })
}

export async function handleTestCommand(ctx: CustomContext) {
    const COMMAND = "/test"
    const { message, model, update, ...rest } = ctx

    
    const reployId = message?.message_id || update?.message?.message_id
    const loadingMessage = await ctx.reply("🧠 Loading... (Restart if this takes more than 30 seconds)", {
        reply_to_message_id: reployId
    })

    const didReply = await ctx.reply("hello", {
        reply_to_message_id: loadingMessage?.message_id
    })

    await ctx.replyWithMarkdown("### Hello", {
        reply_to_message_id: reployId
    })

    await ctx.replyWithHTML("<b>Hello</b>", {
        reply_to_message_id: reployId
    })

    if (didReply) {
        console.log(`Reply to ${COMMAND} command sent successfully.`)
    } else {
        console.error(
            `Something went wrong with the ${COMMAND} command. Reply not sent.`
        )
    }
}

const router = createTelegramRouter({
    message: on(handleOnMessage),
    test: command(handleTestCommand)
})

export default createTelegramApiHandler({
    apiKey: process.env.NEXT_TELEGRAM_TOKEN || "",
    router,
    createContext
})