const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'products.json');

app.use(cors());
app.use(express.json());

function readProducts() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function writeProducts(products) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2), 'utf8');
}

// GET all products
app.get('/api/products', (req, res) => {
  const products = readProducts();
  res.json(products);
});

// GET single product by id
app.get('/api/products/:id', (req, res) => {
  const products = readProducts();
  const product = products.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

// POST create product
app.post('/api/products', (req, res) => {
  const products = readProducts();
  const { name, price, packName, image, description, tag } = req.body;
  if (!name || price == null) {
    return res.status(400).json({ error: 'name and price are required' });
  }
  const id = String(Date.now());
  const product = {
    id,
    name: name || '',
    price: Number(price),
    packName: packName || '',
    image: image || '',
    description: description || '',
    tag: tag || '',
  };
  products.push(product);
  writeProducts(products);
  res.status(201).json(product);
});

// PUT update product
app.put('/api/products/:id', (req, res) => {
  const products = readProducts();
  const index = products.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  const { name, price, packName, image, description, tag } = req.body;
  products[index] = {
    id: products[index].id,
    name: name !== undefined ? name : products[index].name,
    price: price !== undefined ? Number(price) : products[index].price,
    packName: packName !== undefined ? packName : products[index].packName,
    image: image !== undefined ? image : products[index].image,
    description: description !== undefined ? description : products[index].description,
    tag: tag !== undefined ? tag : products[index].tag,
  };
  writeProducts(products);
  res.json(products[index]);
});

// DELETE remove product
app.delete('/api/products/:id', (req, res) => {
  const products = readProducts();
  const index = products.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  const removed = products.splice(index, 1)[0];
  writeProducts(products);
  res.json(removed);
});

app.listen(PORT, () => {
  console.log(`Product API running at http://localhost:${PORT}`);
  console.log('  GET    /api/products     - list all');
  console.log('  GET    /api/products/:id  - get one');
  console.log('  POST   /api/products     - create');
  console.log('  PUT    /api/products/:id  - update');
  console.log('  DELETE /api/products/:id - remove');
});
