import initSqlJs from 'sql.js';
import bcrypt from 'bcryptjs';

let db: any = null;

// Initialize the database
export async function initDB() {
  if (db) return;

  const SQL = await initSqlJs({
    locateFile: file => `https://sql.js.org/dist/${file}`
  });
  
  db = new SQL.Database();

  // Initialize database tables
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      password TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT CHECK(status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED')) DEFAULT 'PENDING',
      user_id TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);
}

// Auth functions
export async function signUp(email: string, password: string, name: string) {
  await initDB();
  const hashedPassword = await bcrypt.hash(password, 10);
  const id = crypto.randomUUID();

  try {
    db.run(
      'INSERT INTO users (id, email, name, password) VALUES (?, ?, ?, ?)',
      [id, email, name, hashedPassword]
    );
    return { id, email, name };
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      throw new Error('Email already exists');
    }
    throw error;
  }
}

export async function signIn(email: string, password: string) {
  await initDB();
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  const result = stmt.getAsObject([email]);
  stmt.free();

  if (!result.id) {
    throw new Error('Invalid credentials');
  }

  const valid = await bcrypt.compare(password, result.password);
  if (!valid) {
    throw new Error('Invalid credentials');
  }

  return {
    id: result.id,
    email: result.email,
    name: result.name
  };
}

// Task functions
export async function createTask(userId: string, title: string, description: string) {
  await initDB();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  
  db.run(
    'INSERT INTO tasks (id, title, description, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    [id, title, description, userId, now, now]
  );

  return {
    id,
    title,
    description,
    status: 'PENDING',
    user_id: userId,
    created_at: now,
    updated_at: now
  };
}

export async function getTasks(userId: string, status: string) {
  await initDB();
  const stmt = db.prepare(
    'SELECT * FROM tasks WHERE user_id = ? AND status = ? ORDER BY created_at DESC'
  );
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

export async function updateTask(taskId: string, userId: string, updates: any) {
  await initDB();
  const setClause = Object.keys(updates)
    .map(key => `${key} = ?`)
    .join(', ');
  
  const values = [...Object.values(updates), new Date().toISOString(), taskId, userId];
  
  db.run(
    `UPDATE tasks SET ${setClause}, updated_at = ? WHERE id = ? AND user_id = ?`,
    values
  );
}

export async function deleteTask(taskId: string, userId: string) {
  await initDB();
  db.run('DELETE FROM tasks WHERE id = ? AND user_id = ?', [taskId, userId]);
}