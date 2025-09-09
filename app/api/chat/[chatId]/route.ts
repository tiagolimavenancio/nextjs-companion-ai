/* eslint-disable @typescript-eslint/no-explicit-any */
import dotenv from "dotenv";
import { currentUser } from "@clerk/nextjs/server";
import { toDataStreamResponse } from "@ai-sdk/langchain";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { Replicate } from "@langchain/community/llms/replicate";
import { NextResponse } from "next/server";
import { MemoryManager } from "@/lib/memory";
import prismadb from "@/lib/prismadb";
import { ratelimit } from "@/lib/rate-limit";

dotenv.config({ path: `.env` });

export async function POST(request: Request, { params }: { params: { chatId: string } }) {
  try {
    const { prompt } = await request.json();
    const user = await currentUser();

    if (!user || !user.firstName || !user.id)
      return new NextResponse("Unauthorized!", { status: 401 });

    const identifier = request.url + "-" + user.id;
    const { success } = await ratelimit(identifier);

    if (!success) return new NextResponse("Ratelimit Exceeded!", { status: 429 });

    const companion = await prismadb.companion.update({
      where: { id: params.chatId },
      data: {
        messages: {
          create: {
            content: prompt,
            role: "user",
            userId: user.id,
          },
        },
      },
    });

    if (!companion) return new NextResponse("Companion Not Found.", { status: 404 });

    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json({ error: "REPLICATE_API_TOKEN not found." }, { status: 500 });
    }

    const companionKey = {
      companionName: companion.id,
      userId: user.id,
      modelName: "llama2-13b",
    };

    const memoryManager = await MemoryManager.getInstance();
    const records = await memoryManager.readLatestHistory(companionKey);

    if (records.length === 0) {
      await memoryManager.seedChatHistory(companion.seed, "\n\n", companionKey);
    }

    await memoryManager.writeToHistory("User: " + prompt + "\n", companionKey);

    const recentChatHistory = await memoryManager.readLatestHistory(companionKey);
    const similarDocs = await memoryManager.vectorSearch(recentChatHistory, `${companion.id}.txt`);

    const relevantHistory = (similarDocs ?? []).map((d: any) => d.pageContent).join("\n");
    const finalPrompt =
      `ONLY generate plain sentences without prefix of who is speaking. DO NOT use ${
        companion.name
      }: prefix.${companion.instructions ?? ""}
Below are relevant details about ${
        companion.name
      }'s past and the conversation you are in.${relevantHistory}${recentChatHistory}${
        companion.name
      }:`.trim();

    const model = new Replicate({
      model:
        "a16z-infra/llama-2-13b-chat:df7690f1994d94e96ad9d568eac121aecf50684a0b0963b25a41cc40061269e5",
      apiKey: process.env.REPLICATE_API_TOKEN,
      input: { max_length: 2048 },
    });

    const parser = new StringOutputParser();
    const stream = await model.pipe(parser).stream(finalPrompt);

    return toDataStreamResponse(stream, {
      callbacks: {
        async onFinal(text: any) {
          const response = text.trim();

          await memoryManager.writeToHistory(`${response}\n`, companionKey);

          await prismadb.companion.update({
            where: { id: params.chatId },
            data: {
              messages: {
                create: {
                  role: "system",
                  content: response,
                  userId: user.id,
                },
              },
            },
          });
        },
      },
    });
  } catch (error) {
    console.error("[CHAT_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
