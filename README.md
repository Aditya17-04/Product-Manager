# Product Manager

A simple full-stack CRUD app using Express and MongoDB to manage products.

## Features

- Product CRUD API with Express and Mongoose
- Basic frontend served from `public`
- Add, update, and delete products from the browser
- Edit mode with pre-filled form and cancel option
- Optional product image display (shown only when image URL is provided)
- Price display in Indian Rupees (`INR`)

## Tech Stack

- Node.js
- Express
- MongoDB
- Mongoose
- Nodemon (development)

## Project Structure

```text
10_express/
  models/
    products.js
  public/
    index.html
    style.css
    script.js
  server.js
  package.json
  README.md
```

## Prerequisites

- Node.js (LTS recommended)
- MongoDB running locally
- Connection string used by app: `mongodb://localhost:27017/myData`

## Installation

```bash
npm install
```

## Run

```bash
npm run dev
```

## App URLs

- Frontend: `http://localhost:3000/`
- API base: `http://localhost:3000/api`

## Frontend Usage

1. Add Product:
  - Fill the form and click `Add Product`.
2. Update Product:
  - Click `Edit` on a product card.
  - Update form fields and click `Update Product`.
  - Use `Cancel Edit` to return to add mode.
3. Delete Product:
  - Click `Delete` on a product card.

## API Endpoints

| Method | Route | Description |
| --- | --- | --- |
| GET | `/api/products` | Get all products |
| GET | `/api/product/:id` | Get one product by ID |
| POST | `/api/products` | Create a product |
| PUT | `/api/product/:id` | Update a product by ID |
| DELETE | `/api/product/:id` | Delete a product by ID |

### Sample request body (POST/PUT)

```json
{
  "name": "Keyboard",
  "quantity": 5,
  "price": 1499.99,
  "image": "https://example.com/image.jpg"
}
```

## Product Schema

- `name` (string, required)
- `quantity` (number, required, default `0`)
- `price` (number, required, default `0`)
- `image` (string, optional)

## Notes

- Ensure MongoDB is running before starting the app.
- If MongoDB connection fails, the server will not start.
