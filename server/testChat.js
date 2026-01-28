import('dotenv/config').then(() => {
  const key = process.env.GOOGLE_GEMINI_API_KEY;
  console.log('GOOGLE_GEMINI_API_KEY loaded:', Boolean(key));
});
