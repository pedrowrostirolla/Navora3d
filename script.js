// Database Keys
const STORAGE_INSUMOS = 'navora3d_insumos';
const STORAGE_SALES = 'navora3d_sales';
const STORAGE_SUPPLIERS = 'navora3d_suppliers';

// State Management
let insumos = [];
let sales = [];
let suppliers = [];

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
}

// Save Data to LocalStorage
function saveData() {
    localStorage.setItem(STORAGE_INSUMOS, JSON.stringify(insumos));
    localStorage.setItem(STORAGE_SALES, JSON.stringify(sales));
    localStorage.setItem(STORAGE_SUPPLIERS, JSON.stringify(suppliers));
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
        'calculator': 'Calculadora de Custos 3D',
        'sales': 'Gestão de Vendas & Pedidos',
        'suppliers': 'Cadastro de Fornecedores'
    };
    document.getElementById('page-title').innerText = titles[tabId];
}

// Render Functions
function renderAll() {
    renderDashboard();
    renderInsumos();
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
    const insumoSelects = [document.getElementById('calc-insumo'), document.getElementById('sale-insumo')];
    const supplierSelect = document.getElementById('insumo-supplier');

    const insumoOptions = insumos.map(i => `<option value="${i.id}">${i.name} (Disponível: ${i.qty}g)</option>`).join('');
    const supplierOptions = suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');

    insumoSelects.forEach(sel => { if(sel) sel.innerHTML = insumoOptions; });
    if(supplierSelect) supplierSelect.innerHTML = supplierOptions;
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