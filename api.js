const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const QUESTIONS_FILE = path.join(__dirname, 'database.json');

// Ensure data directory exists
const ensureDataDir = async () => {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
};

// Initialize data files
const initializeFiles = async () => {
  await ensureDataDir();
  
  try {
    await fs.access(USERS_FILE);
  } catch {
    // Create users file with admin user
    const adminUser = {
      "admin": {
        id: "admin",
        email: "admin@mathquest.com",
        name: "Admin",
        avatar: "👨‍💼",
        password: "admin123", // In real app, this should be hashed
        role: "admin",
        level: 10,
        xp: 9999,
        coins: 9999,
        streak: 0,
        weeklyStreak: 0,
        hearts: 5,
        maxHearts: 5,
        lastActiveDate: new Date().toISOString(),
        dailyChallengeCompleted: false,
        league: "Diamond",
        leaguePoints: 9999,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        quizStats: {
          totalQuizzes: 0,
          correctAnswers: 0,
          totalTime: 0
        },
        moduleProgress: {
          "addition-subtraction": 10,
          "multiplication-division": 10,
          "advanced-math": 10,
          "geometry": 10,
          "fractions": 10
        },
        achievements: [],
        accessories: []
      }
    };
    await fs.writeFile(USERS_FILE, JSON.stringify(adminUser, null, 2), 'utf8');
    console.log('✅ Admin user created: admin@mathquest.com');
  }
  
  try {
    await fs.access(QUESTIONS_FILE);
  } catch {
    // Copy database.json if it doesn't exist
    const dbPath = path.join(__dirname, 'database.json');
    try {
      const dbContent = await fs.readFile(dbPath, 'utf8');
      await fs.writeFile(QUESTIONS_FILE, dbContent, 'utf8');
    } catch {
      // Create minimal database.json
      const minimalDB = {
        questions: {
          "world-1": {
            "addition-subtraction": {
              "lesson-1": [
                { id: 1, question: "5 + 3 = ?", options: ["8", "7", "9", "6"], correct: 0, emoji: "➕" },
                { id: 2, question: "12 - 4 = ?", options: ["8", "7", "9", "6"], correct: 0, emoji: "➖" },
                { id: 3, question: "7 + 6 = ?", options: ["13", "12", "14", "11"], correct: 0, emoji: "➕" },
                { id: 4, question: "15 - 8 = ?", options: ["7", "6", "8", "5"], correct: 0, emoji: "➖" },
                { id: 5, question: "9 + 4 = ?", options: ["13", "12", "14", "11"], correct: 0, emoji: "➕" }
              ]
            }
          }
        },
        achievements: [],
        shopItems: [],
        leaderboard: []
      };
      await fs.writeFile(QUESTIONS_FILE, JSON.stringify(minimalDB, null, 2), 'utf8');
    }
  }
};

// API Routes

// Create admin user endpoint
app.post('/api/admin/create-admin', async (req, res) => {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    const users = JSON.parse(data);
    
    // Check if admin already exists
    const existingAdmin = Object.values(users).find((user: any) => user.email === "admin@mathquest.com");
    
    if (existingAdmin) {
      return res.json({ success: true, message: 'Admin already exists' });
    }
    
    // Create admin user
    const adminUser = {
      id: "admin",
      email: "admin@mathquest.com",
      name: "Admin",
      avatar: "👨‍💼",
      password: "admin123", // In real app, this should be hashed
      role: "admin",
      level: 10,
      xp: 9999,
      coins: 9999,
      streak: 0,
      weeklyStreak: 0,
      hearts: 5,
      maxHearts: 5,
      lastActiveDate: new Date().toISOString(),
      dailyChallengeCompleted: false,
      league: "Diamond",
      leaguePoints: 9999,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      quizStats: {
        totalQuizzes: 0,
        correctAnswers: 0,
        totalTime: 0
      },
      moduleProgress: {
        "addition-subtraction": 10,
        "multiplication-division": 10,
        "advanced-math": 10,
        "geometry": 10,
        "fractions": 10
      },
      achievements: [],
      accessories: []
    };
    
    users[adminUser.id] = adminUser;
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    
    console.log('✅ Admin user created: admin@mathquest.com');
    
    res.json({ 
      success: true, 
      message: 'Admin user created successfully',
      admin: adminUser 
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error creating admin user' 
    });
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    const users = JSON.parse(data);
    
    // Return in the expected format
    const usersArray = Object.values(users);
    
    res.json({
      success: true,
      data: usersArray
    });
  } catch (error) {
    console.error('Error reading users data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error reading users data' 
    });
  }
});

// Get specific user
app.get('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const data = await fs.readFile(USERS_FILE, 'utf8');
    const users = JSON.parse(data);
    const user = users[userId];
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error reading user data' });
  }
});

// Update user data
app.put('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userData = req.body;
    
    const data = await fs.readFile(USERS_FILE, 'utf8');
    const users = JSON.parse(data);
    
    users[userId] = { ...users[userId], ...userData, updatedAt: new Date().toISOString() };
    
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    
    res.json({ success: true, user: users[userId] });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Error updating user data' });
  }
});

// Get questions
app.get('/api/questions', async (req, res) => {
  try {
    const data = await fs.readFile(QUESTIONS_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Error reading questions data' });
  }
});

// Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    const users = JSON.parse(data);
    
    // Convert users to leaderboard format
    const leaderboard = Object.values(users).map(user => ({
      id: user.id,
      name: user.name,
      avatar: user.avatar || "👤",
      level: user.level || 1,
      xp: user.xp || 0,
      coins: user.coins || 0,
      streak: user.streak || 0,
      accuracy: user.quizStats ? Math.round((user.quizStats.correctAnswers / (user.quizStats.totalQuizzes * 5)) * 100) : 0,
      weeklyStreak: user.weeklyStreak || 0,
      league: getLeague(user.xp || 0),
      leaguePoints: user.leaguePoints || 0,
      rank: 0, // Will be calculated on frontend
      changeFromLastWeek: Math.floor(Math.random() * 10) - 5 // Mock change
    })).sort((a, b) => b.xp - a.xp).map((user, index) => ({ ...user, rank: index + 1 }));
    
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: 'Error reading leaderboard data' });
  }
});

// Helper function to get league based on XP
function getLeague(xp) {
  if (xp >= 2000) return "Platinum";
  if (xp >= 1500) return "Gold";
  if (xp >= 1000) return "Silver";
  return "Bronze";
}

// Get achievements
app.get('/api/achievements', async (req, res) => {
  try {
    const data = await fs.readFile(QUESTIONS_FILE, 'utf8');
    const parsed = JSON.parse(data);
    res.json(parsed.achievements || []);
  } catch (error) {
    res.status(500).json({ error: 'Error reading achievements data' });
  }
});

// Get shop items
app.get('/api/shop', async (req, res) => {
  try {
    const data = await fs.readFile(QUESTIONS_FILE, 'utf8');
    const parsed = JSON.parse(data);
    res.json(parsed.shopItems || []);
  } catch (error) {
    res.status(500).json({ error: 'Error reading shop data' });
  }
});

// Start server
const startServer = async () => {
  await initializeFiles();
  app.listen(PORT, () => {
    console.log(`🚀 MathQuest Backend API running on http://localhost:${PORT}`);
    console.log(`📁 Data directory: ${DATA_DIR}`);
  });
};

startServer().catch(console.error);
