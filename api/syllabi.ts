import { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false //only for development, remove for production
  }
});

//set up CORS options
const allowedOrigins = ['https://www.newbookutsa.com', 'http://localhost:4200'];

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
    //verify with CORS middleware
    await corsMiddleware(req, res, () => { });

    //if input is empty, return
    if (req.query.q == "" || !req.query.q) {
      console.error('Error executing query: No input');
      return res.status(400).json({ error: 'No input' });
    }

    //get user-provided search tokens
    const token = (req.query.q as string);

    const client = await pool.connect();

    //build query
    const sqlQuery = `SELECT * FROM documents WHERE document_name = \'${token}\'`;

    //execute the query
    const result = await client.query(sqlQuery);

    //release the client back to the pool
    client.release();

    //format the results as JSON
    const data = result.rows;

    //return the JSON response
    return res.json({
      userInput: token,
      data: data
    });
  } catch (error) {
    console.error('Error executing query:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
