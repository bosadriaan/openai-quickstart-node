import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  const { position, previousPosition, fieldSize, logoSize, userPrompt } =
    req.body;

  try {
    const requestPayload = {
      model: "gpt-3.5-turbo-0613",
      messages: [
        {
          role: "system",
          content:
            "You are an AI model trained to process and respond to human language based on prompts provided to you.",
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.5,
    };

    console.log("\nOpenAI API New Request:", JSON.stringify(requestPayload));

    const response = await openai.createChatCompletion(requestPayload);

    console.log("\nOpenAI API Response:", JSON.stringify(response.data));

    const result = response.data.choices[0].message.content;

    res.status(200).json({ result });
  } catch (error) {
    console.error(`Error with OpenAI API request: ${error.message}`);
    res.status(500).json({
      error: {
        message: "An error occurred during your request.",
      },
    });
  }
}
