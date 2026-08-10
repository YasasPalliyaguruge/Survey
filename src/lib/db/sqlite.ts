import initSqlJs from 'sql.js';

type SqlJsStatic = Awaited<ReturnType<typeof initSqlJs>>;
type SqlDatabase = InstanceType<SqlJsStatic['Database']>;

let db: SqlDatabase | null = null;
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
async function initDB(): Promise<SqlDatabase> {
  if (db) return db;

  const SQL = await initSqlJs({
    locateFile: file => `https://sql.js.org/dist/${file}`
  });

  // Try to load existing database from IndexedDB
  const storedDB = localStorage.getItem(DB_NAME);
  const database = storedDB
    ? new SQL.Database(new Uint8Array(JSON.parse(storedDB)))
    : new SQL.Database();

  db = database;

  if (!storedDB) {
    // Create tables
    database.run(`
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
    saveDB(database);
  }

  return database;
}

// Save database to IndexedDB
function saveDB(database: SqlDatabase) {
  const data = database.export();
  const array = Array.from(data);
  localStorage.setItem(DB_NAME, JSON.stringify(array));
}

export const sqliteDb = {
  surveys: {
    async insert(data: SurveyData) {
      const database = await initDB();
      try {
        const id = crypto.randomUUID();
        const stmt = database.prepare(`
          INSERT INTO surveys (id, name, email, age, gender, feedback, rating)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run([id, data.name, data.email, data.age, data.gender, data.feedback, data.rating]);
        stmt.free();
        saveDB(database);
        return { data: { ...data, id }, error: null };
      } catch (error) {
        console.error('Insert error:', error);
        return { data: null, error };
      }
    },

    async select() {
      const database = await initDB();
      try {
        const results = database.exec('SELECT * FROM surveys ORDER BY created_at DESC');
        return {
          data: results[0]?.values.map((row) => {
            const columns = results[0].columns;
            return Object.fromEntries(columns.map((col, i) => [col, row[i]]));
          }) || [],
          error: null
        };
      } catch (error) {
        console.error('Select error:', error);
        return { data: [], error };
      }
    },

    async getStats() {
      const database = await initDB();
      try {
        const avgRating = database.exec('SELECT AVG(rating) as avg FROM surveys')[0]?.values[0][0] || 0;
        const genderDist = database.exec('SELECT gender, COUNT(*) as count FROM surveys GROUP BY gender');
        const ageDist = database.exec(`
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
            averageRating: Number(avgRating),
            genderDistribution: genderDist[0]?.values.map(([gender, count]) => ({
              gender: String(gender ?? ''),
              count: Number(count ?? 0)
            })) || [],
            ageDistribution: ageDist[0]?.values.map(([age_group, count]) => ({
              age_group: String(age_group ?? ''),
              count: Number(count ?? 0)
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
