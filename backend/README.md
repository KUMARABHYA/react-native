# Product API

Backend for the ecommerce app: product list, details, create, update, and remove. Data is stored in `data/products.json`.

## Run

```bash
cd backend
npm install
npm start
```

Server runs at **http://localhost:3000**.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products |
| GET | `/api/products/:id` | Get one product |
| POST | `/api/products` | Create product (body: name, price, packName?, image?, description?, tag?) |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Remove product |

## Product shape

- `id` (string, auto)
- `name` (string, required)
- `price` (number, required)
- `packName` (string, optional)
- `image` (string, optional)
- `description` (string, optional)
- `tag` (string, optional)
