import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  const { position, previousPosition, fieldSize, logoSize } = req.body;

  try {
    const requestPayload = {
      model: "gpt-3.5-turbo-0613",
      messages: [
        {
          role: "system",
          content: "You are an AI controlling a DVD logo moving across a screen. The position coordinates represents the top-left corner of the logo inside a field with a known height and width.",
        },
        {
          role: "system",
          content: "Step 1: Based on the current position and previous position, determine the direction and speed of the logo movement.",
        },
        {
          role: "system",
          content: "Step 2: Check if the logo is touching any of the 4 sides of the field. If it touches the left or right edge, make sure it bounces off the edge. If it touches the top or bottom edge, reverse the vertical direction. If it touches the left or right edge, reverse the horizontal direction.",
        },
        {
          role: "system",
          content: "Step 3: After these calculations, provide the updated position x and y. It will NEVER stay in the same place",
        },
        {
          role: "user",
          content: `Here are the current details: position - ${JSON.stringify(
            position
          )}, previous position - ${JSON.stringify(
            previousPosition
          )}, field size - ${JSON.stringify(
            fieldSize
          )}, logo size - ${JSON.stringify(logoSize)}.`,
        },
        {
          role: "user",
          content: `Now, please give the next position. Return the coordinates in the format: 'x:##, y:##. It will be parsed and used as the coordinates of the top left of the logo.`,
        },
      ],
      
    };

    console.log("OpenAI API New Request:", JSON.stringify(requestPayload));

    const response = await openai.createChatCompletion(requestPayload);

    console.log("OpenAI API Response:", JSON.stringify(response.data));

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
