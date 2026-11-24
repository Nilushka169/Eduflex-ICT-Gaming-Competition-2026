import { MongoClient } from 'mongodb';

const DB_NAME = 'eduflex_ict_gaming';
const COLLECTION_NAME = 'tournament_state';
const DOC_ID = 'main';
const ADMIN_KEYCODE = 'nilulinu2002art';

function getDefaultData() {
  return {
    players: [
      { id: 1, name: 'Kasun Perera', points: 0, wins: 0, matches: 0, isEliminated: false },
      { id: 2, name: 'Nuwan Pradeep', points: 0, wins: 0, matches: 0, isEliminated: false },
      { id: 3, name: 'Sahan Dilshan', points: 0, wins: 0, matches: 0, isEliminated: false },
      { id: 4, name: 'Thilina Madushan', points: 0, wins: 0, matches: 0, isEliminated: false },
      { id: 5, name: 'Kavindu Senanayake', points: 0, wins: 0, matches: 0, isEliminated: false },
      { id: 6, name: 'Dilan Chamara', points: 0, wins: 0, matches: 0, isEliminated: false },
    ],
    matchHistory: [],
  };
}

function getClientPromise() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not configured.');
  }

  if (!globalThis._mongoClientPromise) {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    globalThis._mongoClientPromise = client.connect().catch((err) => {
      globalThis._mongoClientPromise = null;
      throw err;
    });
  }
  return globalThis._mongoClientPromise;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-keycode');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const client = await getClientPromise();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    if (req.method === 'GET') {
      let doc = await collection.findOne({ _id: DOC_ID });
      if (!doc) {
        const defaults = getDefaultData();
        doc = {
          _id: DOC_ID,
          ...defaults,
          updatedAt: new Date().toISOString(),
        };
        await collection.insertOne(doc);
      }
      return res.status(200).json({
        players: Array.isArray(doc.players) ? doc.players : [],
        matchHistory: Array.isArray(doc.matchHistory) ? doc.matchHistory : [],
        updatedAt: doc.updatedAt || null,
      });
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      const keycode = req.headers['x-admin-keycode'];
      if (keycode !== ADMIN_KEYCODE) {
        return res.status(401).json({ error: 'Unauthorized: Invalid admin keycode.' });
      }

      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!body || !Array.isArray(body.players) || !Array.isArray(body.matchHistory)) {
        return res.status(400).json({ error: 'Invalid payload: players and matchHistory arrays are required.' });
      }

      const updatedAt = new Date().toISOString();
      await collection.updateOne(
        { _id: DOC_ID },
        {
          $set: {
            players: body.players,
            matchHistory: body.matchHistory,
            updatedAt,
          },
        },
        { upsert: true }
      );

      return res.status(200).json({ ok: true, updatedAt });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('MongoDB API Error:', err);
    return res.status(500).json({
      error: err.message || 'Database connection error',
    });
  }
}
