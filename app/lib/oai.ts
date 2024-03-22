import { OpenAI } from "openai";

interface PlaceResponse {
    name: string;
    location: string;
    description?: string;
}

const model = 'gpt-4'

export const findPopularPlaces = async (city: string, country: string): Promise<PlaceResponse[]> => {
    const openai = new OpenAI({
        apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
        dangerouslyAllowBrowser: true
    });

    const chatCompletion = await openai.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: `Behave as you are places API that returns responses in JSON format and follows the following schema: ` +
                    `{
                    name: string;
                    location: string;
                    description?: string;
                    type: string;
                } as an array of places. 
                You only return places that exist. Type indicates whether it's a tourist attraction or something else. The location includes the street, street number, city`
            },
            {
                role: 'user',
                content: 'List the most popular places in ' + city + ', ' + country + '.'
            }
        ],
        model: model
    });

    console.log(chatCompletion);

    const response = chatCompletion.choices[0].message.content;

    return JSON.parse(response ?? '[]');
}
