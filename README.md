# Lebanese Recipes REST API

A Node.js and Express API for managing Lebanese recipes. Recipes are stored in MongoDB Atlas using Mongoose.

## Setup

1. Open the project folder in a terminal.
2. Run `npm install` (`npm.cmd install` in Windows PowerShell if needed).
3. Copy `.env.example` to a new file named `.env`.
4. Set `MONGODB_URI` to your MongoDB connection string and `PORT=3000`. If you use Atlas, make sure your current IP address is allowed.
5. Run `node --watch server.js`.

The API runs at `http://localhost:3000`.

## Routes

| Method | Route | Successful response |
| --- | --- | --- |
| GET | `/` | `200` with `{"status":"ok"}` |
| GET | `/api/recipes` | `200` with an array of recipes, or `[]` if empty |
| GET | `/api/recipes/:id` | `200` with the requested recipe |
| POST | `/api/recipes` | `201` with the new recipe |
| PUT | `/api/recipes/:id` | `200` with the updated recipe |
| DELETE | `/api/recipes/:id` | `204` with an empty body |

`POST` and `PUT` require `title`, `ingredients`, `instructions`, and `minutes`. The title and instructions must be non-empty strings, ingredients must be a non-empty list of non-empty strings, and minutes must be a positive integer.

Example recipe response for `POST`, `GET` by ID, or `PUT`:

```json
{
  "_id": "6aef204b083555e144fd8b32",
  "title": "Batata harra au four",
  "ingredients": ["Pommes de terre", "Ail", "Coriandre", "Citron"],
  "instructions": "Rotir les pommes de terre, puis ajouter l'ail, la coriandre et le citron.",
  "minutes": 35,
  "createdAt": "2026-11-07T12:57:47.311Z",
  "updatedAt": "2026-11-07T12:57:47.311Z",
  "__v": 0
}
```

`GET /api/recipes` returns an array of objects like this. After the example update below, the response has `minutes: 40` and a new `updatedAt` value.

## Test with curl in Windows PowerShell

Keep the server running in one terminal and execute these commands in a second terminal.

### Create a recipe — 201

```powershell
$api = 'http://localhost:3000/api/recipes'
$body = @'
{
  "title": "Batata harra au four",
  "ingredients": ["Pommes de terre", "Ail", "Coriandre", "Citron"],
  "instructions": "Rotir les pommes de terre, puis ajouter l'ail, la coriandre et le citron.",
  "minutes": 35
}
'@
$body | curl.exe -i -X POST "$api" -H "Content-Type: application/json" --data-binary "@-"
```

Copy the `_id` from the response and replace `PASTE_ID_HERE` below.

### Read all recipes and read one recipe — 200

```powershell
$id = 'PASTE_ID_HERE'
curl.exe -i "$api"
curl.exe -i "$api/$id"
```

### Update the recipe — 200

```powershell
$updated = $body.Replace('"minutes": 35', '"minutes": 40')
$updated | curl.exe -i -X PUT "$api/$id" -H "Content-Type: application/json" --data-binary "@-"
```

The response should contain `"minutes":40`. To check persistence, restart the server and repeat `curl.exe -i "$api/$id"`.

### Reject an empty recipe on create and update — 400

```powershell
'{}' | curl.exe -i -X POST "$api" -H "Content-Type: application/json" --data-binary "@-"
'{}' | curl.exe -i -X PUT "$api/$id" -H "Content-Type: application/json" --data-binary "@-"
```

Both requests return `{"error":"Title is required"}`.

### Delete the recipe, then verify it is gone — 204 and 404

```powershell
curl.exe -i -X DELETE "$api/$id"
curl.exe -i "$api/$id"
```

The first request returns an empty body. The second returns `{"error":"Recipe not found"}`.

An invalid ID returns `400` with `{"error":"Invalid recipe ID"}`. An unexpected server error returns `500` with `{"error":"Internal server error"}`.