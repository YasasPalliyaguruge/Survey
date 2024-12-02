import initSqlJs from 'sql.js';

let db: any = null;
const DB_NAME = 'surveyDB';

interface SurveyData {
  id?: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  feedback: string;
  rating: number;
}

// Initialize the database
async function initDB() {
  if (db) return db;
  
  const SQL = await initSqlJs({
    locateFile: file => `https://sql.js.org/dist/${file}`
  });
  
  // Try to load existing database from IndexedDB
  const storedDB = localStorage.getItem(DB_NAME);
  if (storedDB) {
    const uint8Array = new Uint8Array(JSON.parse(storedDB));
    db = new SQL.Database(uint8Array);
  } else {
    db = new SQL.Database();
    // Create tables
    db.run(`
      CREATE TABLE IF NOT EXISTS surveys (
        id TEXT PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        name TEXT,
        email TEXT,
        age INTEGER,
        gender TEXT,
        feedback TEXT,
        rating INTEGER
      );
    `);
    saveDB();
  }
  return db;
}

// Save database to IndexedDB
function saveDB() {
  if (!db) return;
  const data = db.export();
  const array = Array.from(data);
  localStorage.setItem(DB_NAME, JSON.stringify(array));
}

export const sqliteDb = {
  surveys: {
    async insert(data: SurveyData) {
      await initDB();
      try {
        const id = crypto.randomUUID();
        const stmt = db.prepare(`
          INSERT INTO surveys (id, name, email, age, gender, feedback, rating)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run([id, data.name, data.email, data.age, data.gender, data.feedback, data.rating]);
        saveDB();
        return { data: { ...data, id }, error: null };
      } catch (error) {
        console.error('Insert error:', error);
        return { data: null, error };
      }
    },

    async select() {
      await initDB();
      try {
        const results = db.exec('SELECT * FROM surveys ORDER BY created_at DESC');
        return { 
          data: results[0]?.values.map((row: any) => {
            const columns = results[0].columns;
            return Object.fromEntries(columns.map((col: string, i: number) => [col, row[i]]));
          }) || [], 
          error: null 
        };
      } catch (error) {
        console.error('Select error:', error);
        return { data: [], error };
      }
    },

    async getStats() {
      await initDB();
      try {
        const avgRating = db.exec('SELECT AVG(rating) as avg FROM surveys')[0]?.values[0][0] || 0;
        const genderDist = db.exec('SELECT gender, COUNT(*) as count FROM surveys GROUP BY gender');
        const ageDist = db.exec(`
          SELECT 
            CASE 
              WHEN age < 20 THEN '<20'
              WHEN age BETWEEN 20 AND 30 THEN '20-30'
              WHEN age BETWEEN 31 AND 40 THEN '31-40'
              ELSE '40+'
            END as age_group,
            COUNT(*) as count
          FROM surveys
          GROUP BY age_group
        `);

        return {
          data: {
            averageRating: avgRating,
            genderDistribution: genderDist[0]?.values.map(([gender, count]: [string, number]) => ({
              gender,
              count
            })) || [],
            ageDistribution: ageDist[0]?.values.map(([age_group, count]: [string, number]) => ({
              age_group,
              count
            })) || []
          },
          error: null
        };
      } catch (error) {
        console.error('Stats error:', error);
        return { 
          data: { 
            averageRating: 0, 
            genderDistribution: [], 
            ageDistribution: [] 
          }, 
          error 
        };
      }
    }
  }
};
