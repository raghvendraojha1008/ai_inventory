import { GEMINI_API_KEY } from '../config/constants';

// Helper to format date as YYYY-MM-DD
const getToday = () => new Date().toISOString().split('T')[0];

export const GeminiService = {
  // FIX: Added explicit return type ': Promise<any[]>'
  processInput: async (text: string, imageFile?: File | null, audioFile?: File | null): Promise<any[]> => {
    try {
      if (!GEMINI_API_KEY || GEMINI_API_KEY.includes('YOUR_API')) {
          alert("Gemini API Key is missing. Check .env file.");
          return [];
      }

      // Default: Gemini 2.0 Flash Experimental (Latest Preview)
      const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/";
      const MODEL_NAME = "gemini-2.0-flash-exp"; 
      
      const API_URL = `${BASE_URL}${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;

      const parts: any[] = [];
      
      const systemPrompt = `
        You are a smart accounting assistant. Convert command to JSON Array.
        Current Date: ${getToday()}
        
        SCHEMAS (Strict):
        1. "parties": { "collection": "parties", "role": "customer"|"supplier", "name": "...", "contact": "...", "address": "...", "gstin": "..." }
        2. "ledger_entries": { "collection": "ledger_entries", "type": "sell"|"purchase", "date": "YYYY-MM-DD", "party_name": "...", "total_amount": 0, 
             "vehicle": "...", "vehicle_rent": 0, "payment_received_by": "...", "paid_by": "...", "send_to": "...",
             "items": [{ "item_name": "...", "quantity": 0, "rate": 0, "unit": "Pcs", "total": 0 }] }
        3. "transactions": { "collection": "transactions", "type": "received"|"paid", "date": "YYYY-MM-DD", "party_name": "...", "amount": 0, "payment_mode": "Cash" }
        4. "expenses": { "collection": "expenses", "category": "...", "amount": 0, "date": "YYYY-MM-DD", "notes": "..." }
        5. "vehicles": { "collection": "vehicles", "vehicle_number": "...", "owner_name": "..." }
        6. "inventory": { "collection": "inventory", "name": "...", "sale_rate": 0, "purchase_rate": 0 }

        RULES:
        1. Return ONLY the JSON Array. No text.
        2. SPLIT commands: "Add Ayush and Sell 100 bags" -> [ {party}, {ledger_entry} ]
      `;
      
      parts.push({ text: systemPrompt + "\nUSER INPUT: " + (text || "Analyze attached media.") });

      const fileToBase64 = (file: File): Promise<string> => {
          return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.readAsDataURL(file);
              reader.onload = () => resolve(reader.result?.toString().split(',')[1] || '');
              reader.onerror = reject;
          });
      };

      const media = imageFile || audioFile;
      if (media) {
          const b64 = await fileToBase64(media);
          parts.push({ inline_data: { mime_type: media.type, data: b64 } });
      }

      const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: parts }] })
      });

      if (!response.ok) {
          const errorText = await response.text();
          console.error("Gemini API Error:", errorText);
          
          // Fallback Logic
          if (response.status === 404 && MODEL_NAME === "gemini-2.0-flash-exp") {
             console.log("Retrying with gemini-1.5-flash...");
             // Recursion now works because explicit return type is set
             return GeminiService.processInput(text, imageFile, audioFile); 
          }
          
          throw new Error(`AI Error ${response.status}`);
      }
      
      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      
      const jsonStart = rawText.indexOf('[');
      const jsonEnd = rawText.lastIndexOf(']');
      
      if (jsonStart === -1 || jsonEnd === -1) return [];

      const cleanJson = rawText.substring(jsonStart, jsonEnd + 1);
      
      try {
          return JSON.parse(cleanJson);
      } catch (e) {
          return JSON.parse(cleanJson.replace(/\n/g, '').replace(/,(\s*)\]/, ']'));
      }

    } catch (e: any) {
      console.error("Gemini Logic Failure:", e);
      return [];
    }
  }
};
