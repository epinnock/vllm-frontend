import { OpenAIChatMessage, OpenAIConfig } from "./OpenAI.types";
import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from "eventsource-parser";
const getDefaultModel = ()=>{
  let vllm_model = process.env.VLLM_MODEL;
  return vllm_model || "gpt-3.5-turbo"

}
export const defaultConfig = {
  model:"deepseek-ai/deepseek-coder-6.7b-instruct",
  temperature: 0.5,
  max_tokens: 2048,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0.6,
};

export type OpenAIRequest = {
  messages: OpenAIChatMessage[];
} & OpenAIConfig;

export const getOpenAICompletion = async (
  token: string,
  payload: OpenAIRequest
) => {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const vllm_openai_endpoint = process.env.VLLM_OPENAI_ENDPOINT;
  let baseurl = vllm_openai_endpoint || "https://api.openai.com"
  baseurl ="http://192.168.0.152:8000"
 
  const response = await fetch(baseurl+"/v1/chat/completions", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(payload),
  });

  // Check for errors
  if (!response.ok) {
    throw new Error(await response.text());
  }
  console.log(response)
  let counter = 0;
  const stream = new ReadableStream({
    async start(controller) {
      function onParse(event: ParsedEvent | ReconnectInterval) {
        if (event.type === "event") {
          const data = event.data;
          // https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
          if (data === "[DONE]") {
            controller.close();
            return;
          }

          try {
            const json = JSON.parse(data);
            const text = json.choices[0].delta?.content || "";
            if (counter < 2 && (text.match(/\n/) || []).length) {
              return;
            }
            const queue = encoder.encode(text);
            controller.enqueue(queue);
            counter++;
          } catch (e) {
            console.log(" Failed at line 70 OpenAI.ts")
            controller.error(e);
          }
        }
      }

      const parser = createParser(onParse);
      for await (const chunk of response.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return stream;
};
