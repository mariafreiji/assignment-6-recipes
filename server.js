import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import { Recipe } from './models/Recipe.js';

const app = express();
const port = Number(process.env.PORT) || 3000;

function logger(req, res, next) {
  const time = new Date().toLocaleTimeString();
  console.log(`${time} ${req.method} ${req.path}`);
  next();
}

function validateRecipe(req, res, next) {
  const { title, ingredients, instructions, minutes } = req.body ?? {};

  if (typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }

  if (
    !Array.isArray(ingredients) ||
    ingredients.length === 0 ||
    ingredients.some(item => typeof item !== 'string' || !item.trim())
  ) {
    return res.status(400).json({
      error: 'Ingredients must be a list of non-empty strings'
    });
  }

  if (typeof instructions !== 'string' || !instructions.trim()) {
    return res.status(400).json({ error: 'Instructions are required' });
  }

  if (!Number.isInteger(minutes) || minutes < 1) {
    return res.status(400).json({
      error: 'Minutes must be a positive integer'
    });
  }

  req.recipeData = { title, ingredients, instructions, minutes };
  next();
}

function validateId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid recipe ID' });
  }

  next();
}

app.use(logger);
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/recipes', async (req, res, next) => {
  try {
    const recipes = await Recipe.find();
    res.json(recipes);
  } catch (err) {
    next(err);
  }
});

app.get('/api/recipes/:id', validateId, async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    res.json(recipe);
  } catch (err) {
    next(err);
  }
});

app.post('/api/recipes', validateRecipe, async (req, res, next) => {
  try {
    const recipe = await Recipe.create(req.recipeData);
    res.status(201).json(recipe);
  } catch (err) {
    next(err);
  }
});

app.put('/api/recipes/:id', validateId, validateRecipe, async (req, res, next) => {
  try {
    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      req.recipeData,
      { new: true, runValidators: true }
    );

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    res.json(recipe);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/recipes/:id', validateId, async (req, res, next) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  console.error(err.message);
  res.status(500).json({ error: 'Internal server error' });
});

try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
  });
} catch (err) {
  console.error('Database connection failed:', err.message);
  process.exit(1);
}