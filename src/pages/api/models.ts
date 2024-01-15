import { OpenAIChatModels } from "@/utils/OpenAI";
import type { NextApiRequest, NextApiResponse } from "next";
import { OpenAIApi, Configuration } from "openai";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const apiKey = (req.headers["authorization"] as string)?.split(" ")[1];
  if (!apiKey) {
    return res.status(401).json({ error: "Missing token" });
  }

  const configuration = new Configuration({
    apiKey:apiKey,
    baseURL: 'http://192.168.0.152:8000',

  });



  const openAi = new OpenAIApi(configuration);
  try {
    const inner_data=[
      {
      id: "deepseek-ai/deepseek-coder-6.7b-instruct",
      object: "model",
      created: 1705337569,
      owned_by: "vllm",
      root: "deepseek-ai/deepseek-coder-6.7b-instruct",
      parent: null,
      permission: [
      {
      id: "modelperm-f13b5f8f92604237b10de3be817183df",
      object: "model_permission",
      created: 1705337569,
      allow_create_engine: false,
      allow_sampling: true,
      allow_logprobs: true,
      allow_search_indices: false,
      allow_view: true,
      allow_fine_tuning: false,
      organization: "*",
      group: null,
      is_blocking: false
      }
      ]
      }
      ]


    // Get the list of models
    const models = inner_data.map(({ id }) => id);

    // Get the models that can interface with the chat API and return
   /* const chatModels = models
      .filter((model) => model in OpenAIChatModels)
      .map((model) => OpenAIChatModels[model as keyof typeof OpenAIChatModels])
      .sort((a, b) => (b.maxLimit || 0) - (a.maxLimit || 0)); // Sort by max limit
*/

    const chatModels = models

    return res.status(200).json({
      models,

    });
  } catch (e: any) {
    if (e.response) {
      return res.status(e.response.status).json({ error: e.response.data });
    }

    return res.status(500).json({ error: e.message });
  }
}
