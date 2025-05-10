import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { Product } from '../types/products';
import { Invoice } from '../types/invoices';

let db: SQLiteDatabase | null = null;

export const setupDatabase = async () => {
  try {
    db = await openDatabaseAsync('inventory.db');
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        barcode TEXT UNIQUE,
        price REAL,
        unit TEXT,
        category TEXT,
        stock_quantity INTEGER DEFAULT 0,
        min_stock INTEGER DEFAULT 0
      );
    `);
    console.log('Database initialized and products table created.');
  } catch (error) {
    throw new Error('Failed to create products table: ' + (error instanceof Error ? error.message : String(error)));
  }
};

export const dropProductTable = async () => {
  try {
    if (!db) {
      await setupDatabase();
    }
  
    if (!db) throw new Error('Database not initialized. Call setupDatabase first.');
  
    await db.execAsync(`DROP TABLE IF EXISTS products;`);
    console.log('Products table dropped.');
  } catch (error) {
    throw new Error('Failed to drop products table: ' + (error instanceof Error ? error.message : String(error)));
  }
};

export const dropInvoiceTables = async () => {
  try {
    if (!db) {
      await setupInvoiceTables();
    }
  
    if (!db) throw new Error('Database not initialized. Call setupInvoiceTables first.');
  
    await db.execAsync(`DROP TABLE IF EXISTS invoices;`);
    await db.execAsync(`DROP TABLE IF EXISTS invoice_items;`);
    console.log('Invoice tables dropped.');
  } catch (error) {
    throw new Error('Failed to drop invoice tables: ' + (error instanceof Error ? error.message : String(error)));
  }
  
};

export const setupInvoiceTables = async () =>{
  try {
    const db = await openDatabaseAsync('inventory.db');

    await db.execAsync(`CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT,
        date TEXT,
        total REAL
      );`
    );

    await db.execAsync(`CREATE TABLE IF NOT EXISTS invoice_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_id INTEGER,
        product_id INTEGER,
        quantity INTEGER,
        price REAL,
        FOREIGN KEY (invoice_id) REFERENCES invoices(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      );`
    );
    console.log('Invoice tables created.');
  } catch (error) {
    throw new Error('Failed to create invoice tables: ' + (error instanceof Error ? error.message : String(error)));
  }
}

export const getProductByBarcode = async (
  barcode: string
): Promise<any | null> => {

  if (!db) {
    await setupDatabase();
  }

  if (!db) throw new Error('Database not initialized. Call setupDatabase first.');


  const result = await db.getFirstAsync(
    'SELECT * FROM products WHERE barcode = ?',
    [barcode]
  );
  return result ?? null;
};

export const getAllProducts = async (): Promise<any[]> => {
  if (!db) {
    await setupDatabase();
  }

  if (!db) throw new Error('Database not initialized. Call setupDatabase first.');

  try {
    const result = await db.getAllSync('SELECT * FROM products');
    return result ?? [];
  } catch (error) {
    throw new Error('Failed to fetch products from database: ' + (error instanceof Error ? error.message : String(error)));
  }
};


export const addProductToDB = async (product: Product, callback: () => void) => {
  if (!db) {
    await setupDatabase();
  }

  if (!db) throw new Error('Database not initialized. Call setupDatabase first.');
  try {
    console.log('Adding product to database:', product);
    db.runAsync(
      `INSERT INTO products (name, barcode, price, unit, category, stock_quantity, min_stock) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [product.name, product.barcode, product.price, product.unit, product.category, product.stock_quantity, product.min_stock]
    )
    .then(() => callback())
    .catch((error) => {
        console.error('Failed to insert product', error);
    });
  } catch (error) {
    throw new Error('Failed to add product to database: ' + (error instanceof Error ? error.message : String(error)));
  }
  
};

export const updateProductStock = async (barcode: string, quantityToAdd: number, callback: () => void) => {
  if(!db) {
    await setupDatabase();
  }
  if (!db) throw new Error('Database not initialized. Call setupDatabase first.');
  try {
    db.runAsync(
      'UPDATE products SET stock_quantity = stock_quantity + ? WHERE barcode = ?',
      [quantityToAdd, barcode]
    )
    .then(() => callback())
    .catch((error) => {
        console.error('Failed to insert product', error);
    });
  } catch (error) {
    throw new Error('Failed to update product stock: ' + (error instanceof Error ? error.message : String(error)));
  }
}

export const addInvoiceToDB = async (invoice: Invoice) => {
  if (!invoice || !invoice.customer_name || !invoice.date || !Array.isArray(invoice.items) || invoice.items.length === 0) {
    throw new Error('Invalid invoice data');
  }

  try {
    if (!db) {
      await setupInvoiceTables();
    }
  
    if (!db) throw new Error('Database not initialized. Call setupInvoiceTables first.');

    const result = await db.runAsync(
      `INSERT INTO invoices (customer_name, date, total) VALUES (?, ?, ?)`,
      [invoice.customer_name, invoice.date, invoice.total]
    );

    const invoiceId = result?.lastInsertRowId;
    if (!invoiceId) {
      throw new Error('Failed to retrieve invoice ID');
    }

    for (const item of invoice.items) {
      if (!item.product_id || item.quantity <= 0 || item.price < 0) {
        throw new Error(`Skipping invalid invoice item: ${item}`);
      }

      await db.runAsync(
        `INSERT INTO invoice_items (invoice_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`,
        [invoiceId, item.product_id, item.quantity, item.price]
      );

      //reduce the product stock quantity
      await reduceProductStock(item.product_id, item.quantity);
    }
  } catch (error) {
    console.error('Error adding invoice to database:', error);
  }
};

export const getAllInvoices = async (): Promise<any[]> => {
  if (!db) {
    await setupInvoiceTables();
  }

  if (!db) throw new Error('Database not initialized. Call setupInvoiceTables first.');


  const result = await db.getAllAsync(`SELECT * FROM invoices`);

  return result ?? [];
};

export const getInvoiceById = async (
  invoiceId: number
): Promise<any | null> => {
  if (!db) {
    await setupInvoiceTables();
  }

  if (!db) throw new Error('Database not initialized. Call setupInvoiceTables first.');

  const invoice = await db.getFirstAsync(
    'SELECT * FROM invoices WHERE id = ?',
    [invoiceId]
  );

  return invoice ?? null;
};

export const getInvoiceItemsByInvoiceId = async (
  invoiceId: number
): Promise<any[]> => {
  if (!db) {
    await setupInvoiceTables();
  }

  if (!db) throw new Error('Database not initialized. Call setupInvoiceTables first.');

  const items = await db.getAllAsync(
    'SELECT ii.*, p.name AS product_name FROM invoice_items ii JOIN products p ON ii.product_id = p.id WHERE ii.invoice_id = ?',
    [invoiceId]
  );

  return items ?? [];
};

export const reduceProductStock = async ( productId: number,  quantity: number): Promise<void> => {
  if (!db) {
    await setupDatabase();
  }

  if (!db) throw new Error('Database not initialized. Call setupDatabase first.');

  const product = await db.getFirstAsync<{ stock_quantity: number }>(
    'SELECT stock_quantity FROM products WHERE id = ?',
    [productId]
  );

  if (!product) {
    throw new Error(`Product with ID ${productId} not found.`);
  }

  if (product.stock_quantity < quantity) {
    throw new Error('Insufficient stock quantity.');
  }

  await db.runAsync(
    'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
    [quantity, productId]
  );
};

export const updateProductInDB = async (product: Product) => {
  if(!db) {
    await setupDatabase();
  }
  if (!db) throw new Error('Database not initialized. Call setupDatabase first.');
  try {
    await db.runAsync(
      `UPDATE products SET name = ?, barcode = ?, price = ?, unit = ?, category = ?, stock_quantity = ?, min_stock = ? WHERE id = ?`, 
      [product.name, product.barcode, product.price, product.unit, product.category, product.stock_quantity, product.min_stock, product.id ?? 0]
    )
  } catch (error) {
    throw new Error('Failed to update product in database: ' + (error instanceof Error ? error.message : String(error)));  
  }
}

export const deleteProductFromDB = async (id: number) => {
  if (!db) {
    await setupDatabase();
  }

  if (!db) throw new Error('Database not initialized. Call setupDatabase first.');

  try {
    await db.runAsync(`DELETE FROM products WHERE id = ?`, [id]);
  } catch (error) {
    throw new Error('Failed to delete product from database: ' + (error instanceof Error ? error.message : String(error)));
  }
}