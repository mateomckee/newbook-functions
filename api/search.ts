import { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false //only for development, remove for production
  }
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {

    const tokens = (req.query.q as string).split(" ");

    if(tokens[0] == "" || tokens == null) return res.json({
      erorr: "Enter data",
    });

    console.log(tokens);
    //connect to the PostgreSQL database
    const client = await pool.connect();

    //write your SQL query
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

  var mainSqlCommand = "SELECT * FROM courses WHERE ";

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    let sql: string;
    if (!isNaN(token as any)) {
      sql = `(crn LIKE '%${token}%' or courselabel ILIKE '%${token}%')`;
    } else {
      sql = `(courselabel ILIKE '${token}%' or instructor ILIKE '%${token}%' or coursetitle ILIKE '%${token}%')`;
    }
    
    mainSqlCommand = mainSqlCommand.concat(sql);

    if (i < tokens.length - 1) {
      mainSqlCommand = mainSqlCommand.concat(" AND ");
    }
  }

  console.log(mainSqlCommand);
  return mainSqlCommand;
}