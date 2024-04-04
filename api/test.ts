import { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
      










      return res.json({
        data: "Test",
      });
    } 
    catch (error) {
      console.error('Error executing query:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
}