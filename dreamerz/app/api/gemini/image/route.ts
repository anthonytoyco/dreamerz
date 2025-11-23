import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai'; 


const GEMINI_API_KEY = process.env.GEMINI_KEY || ""; 

// Initialize the Google GenAI SDK
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });


/**
 * Route Handler for generating a unique "Dreamscape Image" using gemini-2.5-flash-image.
 * POST /api/gemini/image
 * WARNING: THIS ENDPOINT IS NO LONGER PROTECTED. ANYONE CAN CALL THIS PUBLIC URL, 
 * WHICH WILL WILL RESULT IN CALLS TO THE PAID GEMINI API.
 */
export async function POST(request: NextRequest) {
    // 1. --- Initial Configuration Checks ---
    if (!GEMINI_API_KEY) {
         return NextResponse.json(
            { message: "Server configuration error: GEMINI_KEY environment variable is not set." },
            { status: 500 }
        );
    }
    
    // 2. --- AUTHENTICATION: Supabase Session Check (REMOVED AS REQUESTED) ---
    /* *** WARNING: REMOVING THIS BLOCK CREATES A PUBLIC VULNERABILITY ***
    The authentication check was removed as per user request. This endpoint is now public.
    This means anyone can send a POST request directly to the API URL, bypassing the login screen.
    Since the Gemini API costs money, this exposes the application to potential abuse and high billing costs.
    */
    
    // 3. --- Handling the Request Body (Prompt) ---
    let requestBody;
    try {
        requestBody = await request.json();
    } catch (e) {
        // Catch 'Invalid JSON body' if Content-Type header is missing or JSON is malformed
        return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
    }

    const { prompt } = requestBody;

    if (!prompt) {
        return NextResponse.json({ message: 'Missing generation prompt in request body.' }, { status: 400 });
    }

    // 4. --- Gemini SDK Image Generation Call ---
    const finalPrompt = `A surreal, high-detail digital painting of a dreamscape based on the theme: ${prompt}. Use a cinematic, ethereal, and artistic style.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: finalPrompt,
            config: {
                // Requesting the image modality in the response
                responseModalities: ['IMAGE'], 
            },
        });

        // 5. --- Extract Base64 Image Data ---
        const candidate = response.candidates?.[0];
        
        // FIX: Explicitly check for 'candidate.content.parts' to satisfy TypeScript.
        if (!candidate || !candidate.content || !candidate.content.parts) { 
            return NextResponse.json({ message: 'Failed to receive image candidate or content from API.' }, { status: 500 });
        }
        
        // Find the part containing the base64 image data
        const base64Part = candidate.content.parts.find(p => p.inlineData && p.inlineData.data);
        
        const base64Data = base64Part?.inlineData?.data;
        const mimeType = base64Part?.inlineData?.mimeType;

        if (!base64Data) {
            console.error('Gemini Image Response was missing image data after successful call.');
            return NextResponse.json(
                { message: 'API response was successful but image data is missing in the payload.' },
                { status: 500 }
            );
        }

        // 6. --- Success Response ---
        return NextResponse.json(
            { 
                base64Image: base64Data, 
                contentType: mimeType || 'image/png' 
            },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('SDK Image Generation Error:', error);
        
        // Specific handling for API Key errors (403 Permission Denied)
        const errorMessage = error.message || 'An unknown error occurred.';
        if (errorMessage.includes("API key is not valid") || errorMessage.includes("PERMISSION_DENIED")) {
             return NextResponse.json(
                { 
                    message: "API Key Error: Check your GEMINI_KEY variable. It may be invalid or unauthorized.", 
                    details: errorMessage 
                },
                { status: 403 }
            );
        }

        return NextResponse.json(
            { message: `Internal Server Error during image generation: ${errorMessage}` },
            { status: 500 }
        );
    }
}

  //  // Function to handle the API call
  //   const generateImage = async (): Promise<void> => {
  //       if (!prompt.trim()) {
  //           setError('Please enter a dream description.');
  //           return;
  //       }

  //       setIsLoading(true);
  //       setImageUrl(null);
  //       setError(null);

  //       try {
  //           // 1. Call the Next.js API Route
  //           const response: Response = await fetch('/api/gemini/image', {
  //               method: 'POST',
  //               headers: {
  //                   'Content-Type': 'application/json',
  //                   // NOTE: Authentication cookies (if used) are automatically sent by the browser.
  //               },
  //               body: JSON.stringify({ prompt }),
  //           });

  //           // The data structure can either be the successful ImageResponse or an error object
  //           const data: ImageResponse | { message: string, details?: any } = await response.json();

  //           if (!response.ok) {
  //               // Handle API errors (e.g., 400, 403, 500 from your route.ts)
  //               const errorData = data as { message: string, details?: any };
  //               const message = errorData.message || "Image generation failed.";
  //               setError(`Error: ${message}`);
  //               console.error("API Error Details:", errorData.details || errorData);
  //               return;
  //           }

  //           // 2. Extract Data (Safely cast since response.ok is true)
  //           const { base64Image, contentType } = data as ImageResponse;

  //           // 3. Construct the Data URI (Crucial step for visualization)
  //           // Format: data:[<MIME-type>][;charset=<encoding>][;base64],<data>
  //           const dataUri: string = `data:${contentType || 'image/png'};base64,${base64Image}`;

  //           // 4. Set the state to display the image
  //           setImageUrl(dataUri);

  //       } catch (err: any) {
  //           console.error("Client Fetch Error:", err);
  //           // Type the error object as 'any' or 'Error'
  //           setError('A network error occurred while connecting to the server.');
  //       } finally {
  //           setIsLoading(false);
  //       }