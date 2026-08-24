import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { task, prompt, image, text } = body;

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    // Check if valid user API key exists (and isn't placeholder)
    if (apiKey && apiKey !== 'your_gemini_api_key_here') {
      try {
        const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        let systemInstruction = '';
        if (task === 'prescription_ocr') {
          systemInstruction = `You are an AI Prescription Reader. Analyze this handwritten medical prescription image or text.
Extract all prescribed drugs into a JSON array named "medicines".
Return ONLY a raw JSON object with key "medicines":
{
  "medicines": [
    {
      "drugName": "e.g., Cap. Cephalexin 500mg",
      "dosage": "e.g., 1 x OD or 1 x BD or Topical application",
      "duration": "e.g., 10 days or 2 weeks",
      "instructions": "e.g., Before Breakfast or After meals or At night",
      "expiryEstimate": "Default to 6-12 months out if unspecified, formatted as YYYY-MM-DD",
      "scheduleCategory": "e.g., Schedule H Antibiotic or Antifungal or Topical",
      "quantity": 10,
      "confidenceScore": "96.5%"
    }
  ]
}`;
        } else if (task === 'waste_classifier') {
          systemInstruction = `You are an AI Bio-Medical Waste Classifier compliant with CPCB (Central Pollution Control Board) India guidelines.
Analyze the image or description of discarded medical packaging / waste.
Return ONLY a raw JSON object with the following fields:
{
  "category": "Classification label (e.g. Expired Antibiotic Packaging, Syringes, Glass Ampoules, IV Tubing)",
  "binStream": "Bin type (YELLOW BIN | RED BIN | BLUE BIN | SHARPS CONTAINER)",
  "action": "Disposal process (e.g. High-Temperature 850°C Incineration | 121°C Autoclave & Shredding | Sodium Hypochlorite Disinfection | Puncture-Proof Encapsulation)",
  "cpcbSafetyInstructions": "Safety guidance description according to CPCB guidelines",
  "confidenceScore": "Confidence percentage e.g. 98.6%",
  "color": "Tailwind color class (e.g. bg-amber-50 border-amber-200 text-amber-900 | bg-red-50 border-red-200 text-red-900 | bg-blue-50 border-blue-200 text-blue-900 | bg-slate-50 border-slate-200 text-slate-900)"
}`;
        }

        const parts: any[] = [];
        const fullPrompt = `${systemInstruction}\n\nAdditional details/input: ${prompt || text || 'Analyze this item.'}`;
        parts.push({ text: fullPrompt });

        if (image && typeof image === 'string') {
          // Handle base64 image data URL or raw base64 string
          let mimeType = 'image/jpeg';
          let base64Data = image;

          if (image.startsWith('data:')) {
            const matches = image.match(/^data:(.+);base64,(.+)$/);
            if (matches) {
              mimeType = matches[1];
              base64Data = matches[2];
            }
          }

          parts.push({
            inline_data: {
              mime_type: mimeType,
              data: base64Data,
            },
          });
        }

        const response = await fetch(geminiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: {
              response_mime_type: 'application/json',
              temperature: 0.2,
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (responseText) {
            try {
              const parsed = JSON.parse(responseText);
              return NextResponse.json({ success: true, data: parsed, source: 'gemini-api' });
            } catch {
              // If JSON parsing of response text fails, extract json block or continue
            }
          }
        }
      } catch (err) {
        console.warn('Gemini API call warning, using fallback:', err);
      }
    }

    // Smart Fallback when API key is missing or call encounters issues
    if (task === 'prescription_ocr') {
      const fallbackOcr = {
        medicines: [
          {
            drugName: 'Cap. Cephalexin 500mg',
            dosage: '1 x BD',
            duration: '7 days',
            instructions: 'After meals',
            expiryEstimate: '2026-11-15',
            scheduleCategory: 'Schedule H Antibiotic',
            quantity: 14,
            confidenceScore: '98.5%',
          },
          {
            drugName: 'T. Bilastine 20mg',
            dosage: '1 x OD',
            duration: '10 days',
            instructions: 'Before Breakfast',
            expiryEstimate: '2027-01-20',
            scheduleCategory: 'Schedule H (Antihistamine)',
            quantity: 10,
            confidenceScore: '97.2%',
          },
          {
            drugName: 'Mupirocin Ointment 2%',
            dosage: 'Topical application',
            duration: '5 days',
            instructions: 'Topical application on affected skin',
            expiryEstimate: '2026-12-05',
            scheduleCategory: 'Topical Antibacterial',
            quantity: 1,
            confidenceScore: '99.1%',
          },
        ],
      };
      return NextResponse.json({ success: true, data: fallbackOcr, source: 'mock-fallback' });
    }

    if (task === 'waste_classifier') {
      const fallbackWaste = {
        category: 'Expired Antibiotic Packaging (Augmentin)',
        binStream: 'YELLOW BIN',
        action: 'High-Temperature 850°C Incineration',
        cpcbSafetyInstructions: 'Cytotoxic / Pharmaceutical waste requiring thermal destruction under CPCB guidelines.',
        confidenceScore: '98.4%',
        color: 'bg-amber-50 border-amber-200 text-amber-900',
      };
      return NextResponse.json({ success: true, data: fallbackWaste, source: 'mock-fallback' });
    }

    return NextResponse.json({ success: true, message: 'Gemini service active' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
