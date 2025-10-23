// Vercel Serverless Function for health check
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || "production",
    chatbot: !!process.env.GROQ_API_KEY,
    version: "2.0.0",
  });
};
