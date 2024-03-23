import { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false //only for development, remove for production
  }
});

//set up CORS options
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
    //verify with CORS middleware
    await corsMiddleware(req, res, () => { });

    //if input is empty, return
    if (req.query.q == "") {
      console.error('Error executing query: No input');
      return res.status(400).json({ error: 'No input' });
    }

    //get user-provided search tokens
    const tokens = (req.query.q as string).split(" ");

    //connect to the PostgreSQL database
    const client = await pool.connect();

    //write SQL query
    const sqlQuery = buildQuery(tokens);

    //execute the query
    const result = await client.query(sqlQuery);

    //release the client back to the pool
    client.release();

    //format the results as JSON
    const data = result.rows;

    //return the JSON response
    return res.json({
      userInput: tokens,
      data: data,
    });
  } catch (error) {
    console.error('Error executing query:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

function buildQuery(tokens: string[]): string {
  var mainSQLCommand = "SELECT * FROM courses WHERE ";

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    let sql: string;
    if (!isNaN(token as any)) {
      sql = `(crn LIKE '%${token}%' or courselabel ILIKE '%${token}%')`;
    } else {
      sql = `(courselabel ILIKE '${token}%' or instructor ILIKE '%${token}%' or coursetitle ILIKE '%${token}%')`;
    }

    mainSQLCommand = mainSQLCommand.concat(sql);

    if (i < tokens.length - 1) {
      mainSQLCommand = mainSQLCommand.concat(" AND ");
    }
  }
  return mainSQLCommand;
}