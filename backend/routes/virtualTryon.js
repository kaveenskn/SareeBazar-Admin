const express = require("express");
const router = express.Router();
const sharp = require("sharp");
const { GoogleGenAI } = require("@google/genai");

/* ──────────────────────────────────────────────────────────────────────
 *  Virtual Saree Try-On  —  Gemini Image Generation
 *
 *  POST /api/virtual-tryon/generate
 *  Body (JSON):
 *    personImage  : base64 data-URI string  (e.g. "data:image/jpeg;base64,...")
 *    sareeImage   : base64 data-URI string
 *
 *  Returns:
 *    { success: true, image: "data:image/png;base64,..." }
 *    or { success: false, message: "..." }
 * ────────────────────────────────────────────────────────────────────── */

// ── Saree draping prompt ─────────────────────────────────────────────
const TRYON_PROMPT = `You are a professional fashion photo editor specializing in Indian ethnic wear.

TASK: Create a single photorealistic image of the person in Image 1 wearing the saree fabric shown in Image 2.

STRICT RULES — follow every point exactly:
1. FACE & BODY: Keep the person's face, skin tone, hair, and body shape 100% identical to Image 1.
2. SAREE DRAPING STYLE — Nivi style (most common):
   - Fabric wraps around the waist forming the skirt (lower body, floor-length)
   - About 5 pleats tucked neatly into the front waistband
   - The pallu (loose end) draped diagonally over the LEFT shoulder, falling behind the back
   - A fitted short blouse (choli) on the upper body matching the saree border colour
3. FABRIC: Use the EXACT fabric texture, colour, pattern, zari/gold border from Image 2.
4. POSE: Keep the same pose as Image 1.
5. OUTPUT: Full body visible from head to toe. Photorealistic, studio lighting, sharp details.
6. DO NOT generate a t-shirt, kurti, dress, salwar, or any Western garment.
7. DO NOT crop the image — show the full saree including floor-length skirt and pallu.

Generate the result now.`;

// ── Helper: extract raw base64 + mimeType from a data-URI ────────────
function parseDataUri(dataUri) {
  if (!dataUri || typeof dataUri !== "string") {
    throw new Error("Invalid image data provided");
  }

  // Handle both data-URI and raw base64
  if (dataUri.startsWith("data:")) {
    const match = dataUri.match(/^data:(image\/\w+);base64,(.+)$/s);
    if (!match) throw new Error("Malformed data URI");
    return { mimeType: match[1], data: match[2] };
  }

  // Raw base64 — assume JPEG
  return { mimeType: "image/jpeg", data: dataUri };
}

// ── Helper: compress a base64 image to max 512×512 JPEG q60 ──────────
async function compressImage(base64Data) {
  const inputBuffer = Buffer.from(base64Data, "base64");
  const outputBuffer = await sharp(inputBuffer)
    .resize(512, 512, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 60 })
    .toBuffer();
  const compressedBase64 = outputBuffer.toString("base64");
  const originalKB = (inputBuffer.length / 1024).toFixed(0);
  const compressedKB = (outputBuffer.length / 1024).toFixed(0);
  console.log(`📦 Image compressed: ${originalKB}KB → ${compressedKB}KB`);
  return { mimeType: "image/jpeg", data: compressedBase64 };
}

// ── POST /api/virtual-tryon/generate ─────────────────────────────────
router.post("/generate", async (req, res) => {
  try {
    const { personImage, sareeImage } = req.body;

    // Validate inputs
    if (!personImage || !sareeImage) {
      return res.status(400).json({
        success: false,
        message: "Both personImage and sareeImage are required",
      });
    }

    // Check credentials — supports both AI Studio (API key) and Vertex AI (service account)
    const apiKey = process.env.GEMINI_API_KEY;
    const gcpProject = process.env.GCP_PROJECT_ID;
    const gcpLocation = process.env.GCP_LOCATION || "us-central1";

    if (!apiKey && !gcpProject) {
      return res.status(500).json({
        success: false,
        message:
          "Gemini is not configured. Set GEMINI_API_KEY (AI Studio) or GCP_PROJECT_ID (Vertex AI) in .env.",
      });
    }

    // Parse images
    const personRaw = parseDataUri(personImage);
    const sareeRaw = parseDataUri(sareeImage);

    // Compress images to max 512×512 JPEG q60 to stay within token limits
    console.log("📦 Compressing images before sending to Gemini...");
    const person = await compressImage(personRaw.data);
    const saree = await compressImage(sareeRaw.data);

    // Initialise Gemini client (AI Studio key OR Vertex AI ADC)
    const ai = apiKey
      ? new GoogleGenAI({ apiKey })
      : new GoogleGenAI({ vertexai: true, project: gcpProject, location: gcpLocation });

    console.log("🥻 Virtual Try-On: Sending request to Gemini...");
    const startTime = Date.now();

    // Build the multimodal request
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [
        {
          role: "user",
          parts: [
            { text: TRYON_PROMPT },
            {
              inlineData: {
                mimeType: person.mimeType,
                data: person.data,
              },
            },
            {
              inlineData: {
                mimeType: saree.mimeType,
                data: saree.data,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ["IMAGE", "TEXT"],
      },
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`🥻 Virtual Try-On: Gemini responded in ${elapsed}s`);

    // Extract the generated image from the response
    let resultImage = null;
    let geminiText = null;

    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const imgMime = part.inlineData.mimeType || "image/png";
          const imgData = part.inlineData.data;
          resultImage = `data:${imgMime};base64,${imgData}`;
          break;
        } else if (part.text) {
          geminiText = part.text;
          console.log("🥻 Gemini text response:", part.text);
        }
      }
    }

    if (!resultImage) {
      return res.status(422).json({
        success: false,
        message:
          geminiText ||
          "Gemini did not return an image. Try different, clearer photos.",
      });
    }

    return res.json({
      success: true,
      image: resultImage,
      processingTime: `${elapsed}s`,
    });
  } catch (err) {
    console.error("🥻 Virtual Try-On error:", err);

    // Provide user-friendly error messages
    let message = "An unexpected error occurred during image generation.";
    if (err.message?.includes("API_KEY")) {
      message = "Invalid Gemini API key. Please check your .env configuration.";
    } else if (err.message?.includes("RATE_LIMIT") || err.message?.includes("429")) {
      message =
        "Rate limit exceeded. Please wait a moment and try again.";
    } else if (err.message?.includes("SAFETY")) {
      message =
        "The image was blocked by safety filters. Try different photos.";
    } else if (err.message) {
      message = err.message.substring(0, 300);
    }

    return res.status(500).json({
      success: false,
      message,
    });
  }
});

// ── GET /api/virtual-tryon/status  (health check) ────────────────────
router.get("/status", (req, res) => {
  const hasApiKey = !!process.env.GEMINI_API_KEY;
  const hasVertexAI = !!process.env.GCP_PROJECT_ID;
  const isReady = hasApiKey || hasVertexAI;
  res.json({
    service: "virtual-tryon",
    status: isReady ? "ready" : "missing_credentials",
    authMethod: hasApiKey ? "api_key" : hasVertexAI ? "vertex_ai" : "none",
  });
});

module.exports = router;
