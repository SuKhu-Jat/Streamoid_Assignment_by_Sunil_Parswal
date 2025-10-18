document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:8000';

    const uploadForm = document.getElementById('upload-form');
    const searchForm = document.getElementById('search-form');
    const resetBtn = document.getElementById('reset-btn');
    const uploadResultsEl = document.getElementById('upload-results');
    const tableBody = document.getElementById('products-table-body');
    const productsTable = document.getElementById('products-table');
    const tablePlaceholder = document.getElementById('table-placeholder');
    const paginationControls = document.getElementById('pagination-controls');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const pageInfoEl = document.getElementById('page-info');
    const uploadBtn = document.getElementById('upload-btn');
    const searchBtn = document.getElementById('search-btn');

    let currentPage = 1;
    let totalPages = 1;
    let currentSearchParams = new URLSearchParams();

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
    };

    const fetchProducts = async (page = 1, params = new URLSearchParams(), fetchAll = false) => {
        searchBtn.disabled = true;
        
        if (fetchAll) {
            params = new URLSearchParams({ all: '1' });
        }

        const isSearch = Array.from(params.keys()).filter(k => k !== 'all' && k !== 'page' && k !== 'limit').length > 0;
        const endpoint = isSearch ? '/products/search' : '/products';

        if (!isSearch && !fetchAll) {
            params.set('page', page);
            params.set('limit', 9);
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}?${params.toString()}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();

            if (isSearch) {
                const limit = 9;
                const totalItems = data.length;
                const totalPages = Math.ceil(totalItems / limit) || 1; 
                const startIndex = (page - 1) * limit;
                
                const paginatedProducts = data.slice(startIndex, startIndex + limit); 
                
                renderProducts(paginatedProducts, 'search'); 
                renderPagination({
                    currentPage: page,
                    totalPages: totalPages,
                    totalItems: totalItems 
                });

            } else {
                renderProducts(data.products, 'browse'); 
                renderPagination(data);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
            tablePlaceholder.innerHTML = `<div class="text-center py-16">
                <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <h3 class="mt-2 text-sm font-medium text-slate-900">Connection Error</h3>
                <p class="mt-1 text-sm text-slate-500">Could not connect to the backend. Is the server running?</p>
            </div>`;
            tablePlaceholder.classList.remove('hidden');
            productsTable.classList.add('hidden');
            paginationControls.classList.add('hidden');
        } finally {
            searchBtn.disabled = false;
        }
    };

    const renderProducts = (products, context = 'browse') => {
        tableBody.innerHTML = '';
        productsTable.classList.add('hidden'); 
        paginationControls.classList.add('hidden'); 

        if (!products || products.length === 0) {
            if (context === 'search') {
                tablePlaceholder.innerHTML = `<div class="text-center py-16">
                    <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <h3 class="mt-2 text-sm font-medium text-slate-900">No Products Found</h3>
                    <p class="mt-1 text-sm text-slate-500">Your search returned no results. Try adjusting your filters.</p>
                </div>`;
                tablePlaceholder.classList.remove('hidden');
            } else if (context === 'upload') {
                tablePlaceholder.classList.add('hidden');
            } else {
      
                tablePlaceholder.innerHTML = `<div class="text-center py-16">
                    <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <h3 class="mt-2 text-sm font-medium text-slate-900">No Products To Display</h3>
                    <p class="mt-1 text-sm text-slate-500">Upload a CSV file to get started.</p>
                </div>`;
                tablePlaceholder.classList.remove('hidden');
            }
            return;
        }

        tablePlaceholder.classList.add('hidden');
        productsTable.classList.remove('hidden');
        products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">${product.sku}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-700">${product.name}</td>
                <td class="px-6 py-4 whitespace-nowGrap text-sm text-slate-600">${product.brand}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">${product.color || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">${product.size}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-semibold">${formatCurrency(product.price)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-semibold">${formatCurrency(product.mrp)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">${product.quantity}</td>
            `;
            tableBody.appendChild(row);
        });
    };

    const renderPagination = (data) => {
        if (!data.totalItems || data.totalItems <= 9) {
             paginationControls.classList.add('hidden');
             return;
        }
        paginationControls.classList.remove('hidden');
        currentPage = data.currentPage;
        totalPages = data.totalPages;
        pageInfoEl.textContent = `Page ${currentPage} of ${totalPages}`;
        prevPageBtn.disabled = currentPage <= 1;
        nextPageBtn.disabled = currentPage >= totalPages;
    };

    const renderUploadResults = (data) => {
        let html = `<div class="bg-green-50 border border-green-200 text-green-800 p-3 rounded-lg"><span class="font-semibold">Success:</span> Stored ${data.stored} new products.</div>`;
        if (data.failed && data.failed.length > 0) {
            html += `<div class="mt-2 bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg"><span class="font-semibold">Failures:</span> ${data.failed.length} rows failed to import.</div>`;
            html += `<ul class="list-disc list-inside text-red-600 mt-1 max-h-32 overflow-y-auto pl-4">`;
            data.failed.forEach(item => {
                html += `<li class="text-xs">SKU ${item.row.sku || 'N/A'}: ${item.reason}</li>`;
            });
            html += `</ul>`;
        }
        uploadResultsEl.innerHTML = html;
    };

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        
        uploadBtn.disabled = true;
        uploadResultsEl.innerHTML = '';
        const fileInput = document.getElementById('csv-file');
        if (!fileInput.files[0]) {
            uploadBtn.disabled = false;
            return;
        }
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);

        try {
            const response = await fetch(`${API_BASE_URL}/upload`, {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) throw new Error(result.error || 'Upload failed');

            renderUploadResults(result);

            if (result.products && result.products.length > 0) {
                searchForm.reset(); 
                currentSearchParams = new URLSearchParams(); 
                renderProducts(result.products, 'upload'); 
                renderPagination(result);
            } else {
                renderProducts([], 'upload'); 
            }

        } catch (error) {
            console.error('Upload error:', error);
            uploadResultsEl.innerHTML = `<div class="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg"><span class="font-semibold">Error:</span> ${error.message}</div>`;
        } finally {
            uploadBtn.disabled = false;
            fileInput.value = ''; 
        }
    });
    
  
    fetchProducts(1, new URLSearchParams());

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(searchForm);
        const params = new URLSearchParams();
        for (const [key, value] of formData.entries()) {
            if (value) {
                params.set(key, value);
            }
        }
        currentSearchParams = params;
        fetchProducts(1, currentSearchParams);
    });

    resetBtn.addEventListener('click', () => {
        searchForm.reset();
        currentSearchParams = new URLSearchParams();
        fetchProducts(1, currentSearchParams);
    });

    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            fetchProducts(currentPage - 1, currentSearchParams);
        }
    });

    nextPageBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            fetchProducts(currentPage + 1, currentSearchParams);
        }
    });
});