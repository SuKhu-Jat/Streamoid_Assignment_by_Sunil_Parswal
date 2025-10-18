const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const cors = require('cors');
const { sequelize, Product, Op } = require('./database');
const { fn, col, where: seqWhere } = require('sequelize');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());


app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} => ${req.method} ${req.path} content-type=${req.headers['content-type']}`);
    next();
});

const upload = multer({ dest: 'uploads/' });

app.use(express.json());


const safeUnlink = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (err) {
        console.error(`Failed to delete temporary file: ${filePath}`, err);
    }
};


app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded. Please upload a CSV file.' });
    }

    const results = [];
    const failedRows = [];
    let storedCount = 0;
    const filePath = req.file.path;

    const fileReadPromise = new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve())
            .on('error', (err) => reject(err));
    });

    try {
        await fileReadPromise; 

        await Product.destroy({ where: {} });
        console.log('Product table has been cleared.');


        const normalizeRow = (raw) => {
            const out = {};
            Object.keys(raw).forEach((k) => {
                const nk = String(k).trim().toLowerCase();
                let v = raw[k];
                if (v === undefined || v === null) v = '';
                else v = String(v).trim();
                out[nk] = v;
            });
            return out;
        };
        const parseNumber = (s) => {
            if (s === undefined || s === null || s === '') return NaN;
            const cleaned = String(s).replace(/[^0-9.\-]+/g, '');
            return parseFloat(cleaned);
        };

        for (const rawRow of results) {
            const row = normalizeRow(rawRow);
            const requiredFields = ['sku', 'name', 'brand', 'mrp', 'price'];
            const missingFields = requiredFields.filter(field => !row[field]);

            if (missingFields.length > 0) {
                failedRows.push({ row: rawRow, reason: `Missing required fields: ${missingFields.join(', ')}` });
                continue;
            }

            const mrp = parseNumber(row.mrp);
            const price = parseNumber(row.price);
            const quantity = (row.quantity === undefined || row.quantity === '') ? 0 : parseInt(String(row.quantity).replace(/[^0-9-]+/g, ''), 10);
            if (isNaN(mrp) || isNaN(price) || isNaN(quantity)) {
                failedRows.push({ row: rawRow, reason: 'Invalid number format.'});
                continue;
            }
            if (price > mrp) {
                failedRows.push({ row: rawRow, reason: 'Price cannot be greater than mrp.'});
                continue;
            }

            try {
                await Product.create({
                    sku: row.sku,
                    name: row.name,
                    brand: row.brand,
                    color: row.color || null,
                    size: row.size || null,
                    mrp: mrp,
                    price: price,
                    quantity: quantity,
                });
                storedCount++;
            } catch (error) {
                failedRows.push({ row: rawRow, reason: `Database error: ${error.message}` });
            }
        }
        
        const allProducts = await Product.findAll();
        const limit = 9; 
        
        res.status(200).json({
            message: 'CSV processing complete.',
            stored: storedCount,
            failed: failedRows,
            products: allProducts, 
            totalItems: allProducts.length,
            totalPages: Math.ceil(allProducts.length / limit),
            currentPage: 1
        });

    } catch (error) {
        console.error('Error during CSV processing:', error);
        res.status(500).json({ error: 'An unexpected error occurred while processing the file.' });
    } finally {
        safeUnlink(filePath);
    }
});

app.get('/products', async (req, res) => {
    try {
        const returnAll = req.query.all === '1' || req.query.all === 'true';
        if (returnAll) {
            const rows = await Product.findAll();
            return res.status(200).json({
                totalItems: rows.length,
                totalPages: 1,
                currentPage: 1,
                products: rows,
            });
        }

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Product.findAndCountAll({ limit, offset });
        res.status(200).json({
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            products: rows,
        });
    } catch (error) {
        res.status(500).json({ error: `Failed to retrieve products: ${error.message}` });
    }
});

app.get('/products/search', async (req, res) => {
    const { brand, color, minPrice, maxPrice } = req.query;
    const whereClauses = [];

    try {
        if (brand) {
            whereClauses.push(seqWhere(fn('LOWER', fn('COALESCE', col('brand'), '')), Op.like, `%${String(brand).toLowerCase()}%`));
        }

        if (color) {
            whereClauses.push(seqWhere(fn('LOWER', fn('COALESCE', col('color'), '')), Op.like, `%${String(color).toLowerCase()}%`));
        }

        if (minPrice || maxPrice) {
            const priceClause = {};
            if (minPrice) priceClause[Op.gte] = parseFloat(minPrice);
            if (maxPrice) priceClause[Op.lte] = parseFloat(maxPrice);
            whereClauses.push({ price: priceClause });
        }

        const where = whereClauses.length > 0 ? { [Op.and]: whereClauses } : {};
        const products = await Product.findAll({ where });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: `Failed to search products: ${error.message}` });
    }
});

const startServer = async () => {
    try {
        await sequelize.sync();
        console.log('Database synced successfully.');
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

startServer();

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err && err.stack ? err.stack : err);
    if (res.headersSent) return next(err);
    res.status(500).json({ error: 'Internal server error' });
});

