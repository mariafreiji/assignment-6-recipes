import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    ingredients: [{ type: String, trim: true }],
    instructions: { type: String, required: true, trim: true },
    minutes: { type: Number, required: true, min: 1 }
  },
  { timestamps: true } 
);

export const Recipe = mongoose.model('Recipe', recipeSchema);