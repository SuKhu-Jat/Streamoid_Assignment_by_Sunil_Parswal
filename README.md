# Product Catalog Manager

A modern web application for managing product catalogs with CSV upload capabilities, advanced search functionality, and a responsive user interface.

![Product Catalog Manager]

## 🌟 Features

- **CSV Upload & Processing**
  - Easy upload of product data through CSV files
  - Automatic data validation and error reporting
  - Bulk product import with detailed success/failure feedback

- **Advanced Search & Filtering**
  - Search by brand name
  - Filter by color
  - Price range filtering
  - Real-time results update

- **Smart Pagination**
  - Server-side pagination for browsing
  - Client-side pagination for search results
  - 9 items per page for optimal viewing

- **Responsive Design**
  - Modern, clean interface with Tailwind CSS
  - Mobile-friendly layout
  - Smooth transitions and animations

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SuKhu-Jat/Streamoid_Assignment_by_Sunil_Parswal.git
   cd Streamoid_Assignment_by_Sunil_Parswal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```
   This command starts the backend server, which will be listening for requests.   

4. **Access the application**
   Navigate to the project folder and open the index.html file in your web browser to use the application.
   

## 🔍 Using the Application

### Uploading Products
1. Click "Choose File" to select your CSV file
2. Click "Upload and Process"
3. View the upload results summary
4. Products will automatically appear in the table

### Searching Products
1. Enter brand name to search by brand
2. Enter color to filter by color
3. Use min/max price fields to filter by price range
4. Click "Search" to apply filters
5. Use "Reset" to clear all filters

### Navigating Results
- Use Previous/Next buttons to navigate pages
- Current page and total pages are displayed
- Each page shows 9 products

## 🛠️ API Endpoints

### GET `/products`
- Get paginated list of products
- Query params: `page`, `limit`
- Returns: products list with pagination info

### GET `/products/search`
- Search products with filters
- Query params: `brand`, `color`, `minPrice`, `maxPrice`
- Returns: filtered products list

### POST `/upload`
- Upload and process CSV file
- Body: form-data with CSV file
- Returns: processing results with success/failure counts

## ⚙️ Data Validation

The application performs the following validations:

- Required fields must be present (sku, name, brand, mrp, price)
- SKU must be unique
- Price cannot exceed MRP
- Numbers must be valid

## 👨‍💻 Author

**Sunil Parswal**
