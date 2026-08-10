// Database Keys
const STORAGE_INSUMOS = 'navora3d_insumos';
const STORAGE_SALES = 'navora3d_sales';
const STORAGE_SUPPLIERS = 'navora3d_suppliers';
const STORAGE_PRODUCTS = 'navora3d_products';

// State Management
let insumos = [];
let sales = [];
let suppliers = [];
let products = [];

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    loadLocalStorageData();
    seedInitialData();
    renderAll();
    calculatePrintCost();
});

// Load Data from LocalStorage
function loadLocalStorageData() {
    insumos = JSON.parse(localStorage.getItem(STORAGE_INSUMOS)) || [];
    sales = JSON.parse(localStorage.getItem(STORAGE_SALES)) || [];
    suppliers = JSON.parse(localStorage.getItem(STORAGE_SUPPLIERS)) || [];
    products = JSON.parse(localStorage.getItem(STORAGE_PRODUCTS)) || [];
}

// Save Data to LocalStorage
function saveData() {
    localStorage.setItem(STORAGE_INSUMOS, JSON.stringify(insumos));
    localStorage.setItem(STORAGE_SALES, JSON.stringify(sales));
    localStorage.setItem(STORAGE_SUPPLIERS, JSON.stringify(suppliers));
    localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(products));
    renderAll();
}

// Seed Demo Data if Empty
function seedInitialData() {
    if (suppliers.length === 0) {
        suppliers = [
            { id: 1, name: '3D Fila', contact: 'Atendimento', phone: '(11) 98888-7777', products: 'PLA, PETG, ABS' },
            { id: 2, name: 'eSUN Brasil', contact: 'Vendas', phone: '(11) 97777-6666', products: 'Filamentos Especiais, Resinas' }
        ];
    }
    if (insumos.length === 0) {
        insumos = [
            { id: 1, name: 'PLA Preto eSUN', type: 'Filamento PLA', supplierId: 2, qty: 850, minQty: 200, cost: 120.00 },
            { id: 2, name: 'PETG Transparente 3D Fila', type: 'Filamento PETG', supplierId: 1, qty: 150, minQty: 300, cost: 110.00 }
        ];
    }
    if (products.length === 0) {
        products = [
            { id: 1, name: 'Suporte de Headset Desk', category: 'Acessórios Tech', insumoId: 1, weight: 110, hours: 4.5, price: 45.00 },
            { id: 2, name: 'Vasinho Geométrico', category: 'Decoração', insumoId: 1, weight: 75, hours: 3.0, price: 35.00 }
        ];
    }
    saveData();
}

// Navigation Tabs Logic
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    document.getElementById(`tab-${tabId}`).classList.add('active');
    event.currentTarget.classList.add('active');

    const titles = {
        'dashboard': 'Dashboard Geral',
        'inventory': 'Controle de Estoque e Insumos',
        'products': 'Catálogo de Produtos Cadastrados',
        'calculator': 'Calculadora de Custos 3D',
        'sales': 'Gestão de Vendas & Pedidos',
        'suppliers': 'Cadastro de Fornecedores',
        'backup': 'Backup e Restauração de Dados'
    };
    document.getElementById('page-title').innerText = titles[tabId];
}

// Render Functions
function renderAll() {
    renderDashboard();
    renderInsumos();
    renderProducts();
    renderSales();
    renderSuppliers();
    populateSelects();
    lucide.createIcons();
}

function renderDashboard() {
    const totalRevenue = sales.reduce((sum, s) => sum + s.price, 0);
    const totalProfit = sales.reduce((sum, s) => sum + (s.price - s.totalCost), 0);
    const lowStockItems = insumos.filter(i => i.qty <= i.minQty);

    document.getElementById('stat-revenue').innerText = formatCurrency(totalRevenue);
    document.getElementById('stat-profit').innerText = formatCurrency(totalProfit);
    document.getElementById('stat-sales-count').innerText = sales.length;
    document.getElementById('stat-low-stock').innerText = `${lowStockItems.length} itens`;

    // Table Recent Sales
    const recentSales = [...sales].reverse().slice(0, 5);
    const recentBody = document.getElementById('table-recent-sales');
    recentBody.innerHTML = recentSales.map(s => `
        <tr>
            <td>${s.date}</td>
            <td>${s.customer}</td>
            <td>${s.item}</td>
            <td><strong>${formatCurrency(s.price)}</strong></td>
            <td style="color: var(--green);">${formatCurrency(s.price - s.totalCost)}</td>
        </tr>
    `).join('') || '<tr><td colspan="5">Nenhuma venda registrada.</td></tr>';

    // Stock Alert List
    const alertList = document.getElementById('list-stock-alerts');
    alertList.innerHTML = lowStockItems.map(i => `
        <li class="alert-item">
            <strong>${i.name}</strong> está com estoque baixo! <br>
            Disponível: <strong>${i.qty}g</strong> (Mínimo: ${i.minQty}g)
        </li>
    `).join('') || '<p style="color: var(--text-muted); font-size: 0.85rem;">Todos os insumos estão em níveis adequados.</p>';
}

function renderInsumos() {
    const tbody = document.getElementById('table-insumos');
    tbody.innerHTML = insumos.map(i => {
        const costPerGram = i.cost / 1000;
        const supplierName = suppliers.find(s => s.id == i.supplierId)?.name || 'N/A';
        const isLow = i.qty <= i.minQty;

        return `
            <tr>
                <td><strong>${i.name}</strong></td>
                <td>${i.type}</td>
                <td>${supplierName}</td>
                <td>${i.qty} g/un</td>
                <td>${formatCurrency(costPerGram)}/g</td>
                <td>
                    <span class="badge ${isLow ? 'badge-warning' : 'badge-ok'}">
                        ${isLow ? 'Estoque Baixo' : 'OK'}
                    </span>
                </td>
                <td>
                    <button class="btn-danger-sm" onclick="deleteInsumo(${i.id})"><i data-lucide="trash-2"></i></button>
                </td>
            </tr>
        `;
    }).join('') || '<tr><td colspan="7">Nenhum insumo cadastrado.</td></tr>';
}

function renderProducts() {
    const tbody = document.getElementById('table-products');
    tbody.innerHTML = products.map(p => {
        const insumoName = insumos.find(i => i.id == p.insumoId)?.name || 'N/A';

        return `
            <tr>
                <td><strong>${p.name}</strong></td>
                <td>${p.category}</td>
                <td>${insumoName}</td>
                <td>${p.weight} g</td>
                <td>${p.hours} h</td>
                <td><strong style="color: var(--primary);">${formatCurrency(p.price)}</strong></td>
                <td>
                    <button class="btn-danger-sm" onclick="deleteProduct(${p.id})"><i data-lucide="trash-2"></i></button>
                </td>
            </tr>
        `;
    }).join('') || '<tr><td colspan="7">Nenhum produto cadastrado no catálogo.</td></tr>';
}

function renderSales() {
    const tbody = document.getElementById('table-sales');
    tbody.innerHTML = [...sales].reverse().map(s => {
        const profit = s.price - s.totalCost;
        return `
            <tr>
                <td>${s.date}</td>
                <td>${s.customer}</td>
                <td><strong>${s.item}</strong></td>
                <td>${s.insumoName}</td>
                <td>${s.weight}g</td>
                <td>${formatCurrency(s.totalCost)}</td>
                <td>${formatCurrency(s.price)}</td>
                <td style="color: var(--green); font-weight: bold;">${formatCurrency(profit)}</td>
                <td>
                    <button class="btn-danger-sm" onclick="deleteSale(${s.id})"><i data-lucide="trash-2"></i></button>
                </td>
            </tr>
        `;
    }).join('') || '<tr><td colspan="9">Nenhuma venda realizada.</td></tr>';
}

function renderSuppliers() {
    const tbody = document.getElementById('table-suppliers');
    tbody.innerHTML = suppliers.map(s => `
        <tr>
            <td><strong>${s.name}</strong></td>
            <td>${s.contact || '-'}</td>
            <td>${s.phone || '-'}</td>
            <td>${s.products || '-'}</td>
            <td>
                <button class="btn-danger-sm" onclick="deleteSupplier(${s.id})"><i data-lucide="trash-2"></i></button>
            </td>
        </tr>
    `).join('') || '<tr><td colspan="5">Nenhum fornecedor cadastrado.</td></tr>';
}

function populateSelects() {
    const calcInsumo = document.getElementById('calc-insumo');
    const saleInsumo = document.getElementById('sale-insumo');
    const productInsumo = document.getElementById('product-insumo');
    const supplierSelect = document.getElementById('insumo-supplier');
    const saleProductSelect = document.getElementById('sale-product-select');

    const insumoOptions = insumos.map(i => `<option value="${i.id}">${i.name} (Disponível: ${i.qty}g)</option>`).join('');
    const supplierOptions = suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    const productOptions = '<option value="">-- Venda Avulsa / Personalizada --</option>' + products.map(p => `<option value="${p.id}">${p.name} - ${formatCurrency(p.price)}</option>`).join('');

    if (calcInsumo) calcInsumo.innerHTML = insumoOptions;
    if (saleInsumo) saleInsumo.innerHTML = insumoOptions;
    if (productInsumo) productInsumo.innerHTML = insumoOptions;
    if (supplierSelect) supplierSelect.innerHTML = supplierOptions;
    if (saleProductSelect) saleProductSelect.innerHTML = productOptions;
}

// 3D Printing Cost Calculator logic
function calculatePrintCost() {
    const insumoId = document.getElementById('calc-insumo').value;
    const weight = parseFloat(document.getElementById('calc-weight').value) || 0;
    const hours = parseFloat(document.getElementById('calc-hours').value) || 0;
    const kw = parseFloat(document.getElementById('calc-kw').value) || 0;
    const energyPrice = parseFloat(document.getElementById('calc-energy-price').value) || 0;
    const wearRate = parseFloat(document.getElementById('calc-wear').value) || 0;
    const margin = parseFloat(document.getElementById('calc-margin').value) || 0;

    const selectedInsumo = insumos.find(i => i.id == insumoId);
    const costPerGram = selectedInsumo ? (selectedInsumo.cost / 1000) : 0;

    const materialCost = weight * costPerGram;
    const energyCost = hours * kw * energyPrice;
    const wearCost = hours * wearRate;
    const totalCost = materialCost + energyCost + wearCost;
    const profitValue = totalCost * (margin / 100);
    const finalPrice = totalCost + profitValue;

    document.getElementById('res-material-cost').innerText = formatCurrency(materialCost);
    document.getElementById('res-energy-cost').innerText = formatCurrency(energyCost);
    document.getElementById('res-wear-cost').innerText = formatCurrency(wearCost);
    document.getElementById('res-total-cost').innerText = formatCurrency(totalCost);
    document.getElementById('res-profit-value').innerText = formatCurrency(profitValue);
    document.getElementById('res-final-price').innerText = formatCurrency(finalPrice);
}

// Auto Fill Sale Details when a Product is selected
function autoFillSaleFromProduct() {
    const prodId = document.getElementById('sale-product-select').value;
    if (!prodId) return;

    const prod = products.find(p => p.id == prodId);
    if (prod) {
        document.getElementById('sale-item').value = prod.name;
        document.getElementById('sale-insumo').value = prod.insumoId;
        document.getElementById('sale-weight').value = prod.weight;
        document.getElementById('sale-price').value = prod.price;
        updateSaleCost();
    }
}

// Form Handlers & Stock Updates
function handleSaveInsumo(e) {
    e.preventDefault();
    const newInsumo = {
        id: Date.now(),
        name: document.getElementById('insumo-name').value,
        type: document.getElementById('insumo-type').value,
        supplierId: parseInt(document.getElementById('insumo-supplier').value),
        qty: parseFloat(document.getElementById('insumo-qty').value),
        minQty: parseFloat(document.getElementById('insumo-min').value),
        cost: parseFloat(document.getElementById('insumo-cost').value)
    };

    insumos.push(newInsumo);
    saveData();
    closeModal('modal-insumo');
    document.getElementById('form-insumo').reset();
}

function handleSaveProduct(e) {
    e.preventDefault();
    const newProduct = {
        id: Date.now(),
        name: document.getElementById('product-name').value,
        category: document.getElementById('product-category').value,
        insumoId: parseInt(document.getElementById('product-insumo').value),
        weight: parseFloat(document.getElementById('product-weight').value),
        hours: parseFloat(document.getElementById('product-hours').value),
        price: parseFloat(document.getElementById('product-price').value)
    };

    products.push(newProduct);
    saveData();
    closeModal('modal-product');
    document.getElementById('form-product').reset();
}

function handleSaveSale(e) {
    e.preventDefault();
    const insumoId = document.getElementById('sale-insumo').value;
    const weight = parseFloat(document.getElementById('sale-weight').value);
    const extraCost = parseFloat(document.getElementById('sale-extra-cost').value) || 0;
    const price = parseFloat(document.getElementById('sale-price').value);

    const targetInsumo = insumos.find(i => i.id == insumoId);
    if (!targetInsumo) return alert('Selecione um insumo válido!');

    if (targetInsumo.qty < weight) {
        if (!confirm('A quantidade de insumo usada é maior do que a disponível no estoque. Deseja continuar assim mesmo?')) {
            return;
        }
    }

    // Deduct Stock
    targetInsumo.qty -= weight;

    const materialCost = weight * (targetInsumo.cost / 1000);
    const totalCost = materialCost + extraCost;

    const newSale = {
        id: Date.now(),
        date: new Date().toLocaleDateString('pt-BR'),
        customer: document.getElementById('sale-customer').value,
        item: document.getElementById('sale-item').value,
        insumoName: targetInsumo.name,
        weight: weight,
        totalCost: totalCost,
        price: price
    };

    sales.push(newSale);
    saveData();
    closeModal('modal-sale');
    document.getElementById('form-sale').reset();
}

function handleSaveSupplier(e) {
    e.preventDefault();
    const newSupplier = {
        id: Date.now(),
        name: document.getElementById('supplier-name').value,
        contact: document.getElementById('supplier-contact').value,
        phone: document.getElementById('supplier-phone').value,
        products: document.getElementById('supplier-products').value
    };

    suppliers.push(newSupplier);
    saveData();
    closeModal('modal-supplier');
    document.getElementById('form-supplier').reset();
}

function updateSaleCost() {
    const insumoId = document.getElementById('sale-insumo').value;
    const weight = parseFloat(document.getElementById('sale-weight').value) || 0;
    const targetInsumo = insumos.find(i => i.id == insumoId);

    if (targetInsumo) {
        const cost = weight * (targetInsumo.cost / 1000);
        document.getElementById('sale-material-cost-display').innerText = formatCurrency(cost);
    }
}

// Delete Handlers
function deleteInsumo(id) {
    if (confirm('Tem certeza que deseja excluir este insumo?')) {
        insumos = insumos.filter(i => i.id !== id);
        saveData();
    }
}

function deleteProduct(id) {
    if (confirm('Tem certeza que deseja excluir este produto do catálogo?')) {
        products = products.filter(p => p.id !== id);
        saveData();
    }
}

function deleteSale(id) {
    if (confirm('Tem certeza que deseja remover esta venda?')) {
        sales = sales.filter(s => s.id !== id);
        saveData();
    }
}

function deleteSupplier(id) {
    if (confirm('Tem certeza que deseja excluir este fornecedor?')) {
        suppliers = suppliers.filter(s => s.id !== id);
        saveData();
    }
}

// Backup & Import/Export JSON Logic
function exportDataJSON() {
    const backupData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        insumos: insumos,
        products: products,
        suppliers: suppliers,
        sales: sales
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `navora3d_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function importDataJSON(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (importedData.insumos && importedData.sales && importedData.suppliers && importedData.products) {
                if (confirm('Deseja substituir todos os seus dados atuais pelo arquivo de backup selecionado?')) {
                    insumos = importedData.insumos;
                    products = importedData.products;
                    suppliers = importedData.suppliers;
                    sales = importedData.sales;
                    saveData();
                    alert('Backup restaurado com sucesso!');
                }
            } else {
                alert('O arquivo selecionado não contém uma estrutura de backup válida do Navora 3D.');
            }
        } catch (err) {
            alert('Erro ao ler o arquivo JSON de backup.');
        }
    };
    fileReader.readAsText(event.target.files[0]);
}

// Modal Helpers
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Utility Formatter
function formatCurrency(val) {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}