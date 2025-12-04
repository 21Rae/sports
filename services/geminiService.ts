import { GoogleGenAI } from "@google/genai";
import { ExtractedDataset, AnalysisResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const extractDatasetFromText = async (text: string, name: string = "Dataset"): Promise<ExtractedDataset> => {
  try {
    const prompt = `
      You are an expert data engineer. Your task is to convert the following unstructured or semi-structured text into a clean, normalized dataset.

      Rules:
      1. Analyze the text to identify recurring entities (rows) and their attributes (columns).
      2. Normalize column names to be snake_case or camelCase (consistent, no spaces).
      3. Extract the values. Handle missing values by using null.
      4. If the text implies a specific data type (number, boolean), convert it.
      5. Provide a brief 1-sentence summary of what this dataset represents.
      6. Return a JSON object with strictly these keys: "columns" (array of strings), "data" (array of objects), and "summary" (string).

      IMPORTANT: The "data" array must contain objects where keys match the "columns".

      Input Text:
      """
      ${text}
      """
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    if (!response.text) {
      throw new Error("No response text from Gemini");
    }

    let jsonString = response.text.trim();
    if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    const result = JSON.parse(jsonString) as ExtractedDataset;
    
    // Safety check: ensure all data rows have all columns (fill with null if missing)
    const normalizedData = (result.data || []).map(row => {
      const newRow: any = {};
      (result.columns || []).forEach(col => {
        newRow[col] = row[col] !== undefined ? row[col] : null;
      });
      return newRow;
    });

    return {
      name,
      columns: result.columns || [],
      data: normalizedData,
      summary: result.summary || "No summary provided."
    };

  } catch (error) {
    console.error("Error calling Gemini:", error);
    throw error;
  }
};

export const analyzeDataset = async (datasets: ExtractedDataset[], query: string): Promise<AnalysisResponse> => {
  try {
    // Construct context for one or multiple datasets
    let context = "";
    datasets.forEach(ds => {
      context += `
      === ${ds.name} ===
      Summary: ${ds.summary}
      Data Sample (first 50 rows):
      ${JSON.stringify(ds.data.slice(0, 50))}
      
      `;
    });

    const prompt = `
      You are a data analyst. You have access to the following dataset(s):
      ${context}

      User Query: "${query}"

      Your goal is to answer the user's question.
      If there are multiple datasets, the user might ask to compare them.
      
      If the question implies a comparison, trend, or distribution that can be visualized, you MUST provide a chart configuration.

      Return a JSON object with the following structure:
      {
        "answer": "A clear, concise text answer to the question.",
        "chart": {
          "type": "bar" | "line" | "area" | "pie",
          "title": "Chart Title",
          "data": [ ...array of objects optimized for the chart... ],
          "xAxisKey": "key_for_x_axis_label",
          "seriesKeys": ["key_for_value_1", "key_for_value_2"] 
        }
      }

      Rules for Charts:
      - Only include "chart" if the data supports it and the user asks for something visualizable.
      - "data" in the chart object should be aggregated or formatted specifically for the chart.
      - If comparing two datasets (e.g., A vs B), merge the relevant data points into a single array if possible.
        Example: [{ "category": "Q1", "Dataset_A_Sales": 100, "Dataset_B_Sales": 150 }]
        seriesKeys would be ["Dataset_A_Sales", "Dataset_B_Sales"].
      - "seriesKeys" are the keys in the data objects that contain the numerical values to plot.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    if (!response.text) {
      throw new Error("No response text from Gemini");
    }

    let jsonString = response.text.trim();
    if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    return JSON.parse(jsonString) as AnalysisResponse;

  } catch (error) {
    console.error("Error analyzing dataset:", error);
    throw error;
  }
}
