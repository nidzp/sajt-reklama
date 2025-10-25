// Vercel Serverless Function for health check
// PATCH 4: Health-Check Endpoint
module.exports = async (req, res) => {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed. Use GET.",
    });
  }

  res.setHeader("Access-Control-Allow-Origin", "*");

  // PATCH 4: Simple health check response
  res.status(200).json({
    ok: true,
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || "production",
    chatbot: !!process.env.GROQ_API_KEY,
    version: "2.1.0",
  });
};
