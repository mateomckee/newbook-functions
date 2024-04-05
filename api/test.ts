import { VercelRequest, VercelResponse } from "@vercel/node";



//CORS Options 
const allowedOrigins = ['https://bluebook-2.vercel.app', 'https://bluebook-2.vercel.app/*', 'http://localhost:4200'];

function corsMiddleware(req, res, next) {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, q');
  }
  next();
}


export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
      return res.status(200).json({ message: "Hello, World!" });

      return res.json({
        data: "Test",
      });
    } 
    catch (error) {
      console.error('Error has occured while handling request', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
}