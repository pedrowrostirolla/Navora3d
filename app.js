// BANCO DE DADOS LOCAL & ESTADO
let db = {
    currentUser: null,
    users: [
        { username: 'pedrorostirolla', password: 'Rds@2026!' },
        { username: 'dudapaganini', password: 'Couve5flor*' }
    ],
    logs: [],
    clientes: [],
    fornecedores: [],
    categorias: [],
    materiais: [],
    produtos: [],
    suprimentos: [],
    vendas: []
};

// INICIALIZAÇÃO
window.addEventListener('DOMContentLoaded', () => {
    loadDB();
    checkSession();
});

function loadDB() {
    const saved = localStorage.getItem('navora_db');
    if (saved) {
        try {
            db = JSON.parse(saved);
        } catch(e) {
            console.error('Erro ao carregar banco de dados', e);
        }
    }
}

function saveDB() {
    localStorage.setItem('navora_db', JSON.stringify(db));
}

// LOGS DE AUDITORIA
function addLog(action, details) {
    const user = db.currentUser ? db.currentUser.username : 'sistema';
    const timestamp = new Date().toLocaleString('pt-BR');
    db.logs.unshift({ timestamp, user, action, details });
    saveDB();
}

// AUTENTICAÇÃO
function handleLogin(e) {
    e.preventDefault();
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value;
    const errorEl = document.getElementById('login-error');

    const found = db.users.find(x => x.username === u && x.password === p);
    if (found) {
        db.currentUser = found;
        saveDB();
        errorEl.textContent = '';
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');
        document.getElementById('logged-user-name').textContent = found.username;
        addLog('LOGIN', `Usuário ${found.username} entrou no sistema.`);
        initApp();
    } else {
        errorEl.textContent = 'Usuário ou senha inválidos!';
    }
}

function handleLogout() {
    if(db.currentUser) {
        addLog('LOGOUT', `Usuário ${db.currentUser.username} saiu do sistema.`);
    }
    db.currentUser = null;
    saveDB();
    document.getElementById('app-container').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('login-form').reset();
}

function checkSession() {
    if (db.currentUser) {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');
        document.getElementById('logged-user-name').textContent = db.currentUser.username;
        initApp();
    }
}

// NAVEGAÇÃO DE MÓDULOS
function switchModule(moduleName) {
    document.querySelectorAll('.module-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.sidebar-nav .nav-btn, .sidebar-footer .nav-btn').forEach(btn => btn.classList.remove('active'));
    
    const targetSec = document.getElementById(`module-${moduleName}`);
    if (targetSec) targetSec.classList.add('active');

    event.currentTarget.classList.add('active');

    // Atualizar dados do módulo específico
    if (moduleName === 'dashboard') renderDashboard();
    if (moduleName === 'cadastros') renderCadastros();
    if (moduleName === 'produtos') renderProdutos();
    if (moduleName === 'estoque') renderEstoque();
    if (moduleName === 'suprimentos') renderSuprimentos();
    if (moduleName === 'vendas') renderVendas();
    if (moduleName === 'financeiro') renderFinanceiro();
    if (moduleName === 'logs') renderLogs();
}

function initApp() {
    renderDashboard();
    populateSelects();
}

// POPULAR SELECTS GLOBAIS
function populateSelects() {
    // Clientes
    const selCliente = document.getElementById('venda-cliente');
    const filtFinCli = document.getElementById('filt-fin-cliente');
    if(selCliente) selCliente.innerHTML = '<option value="">Selecione...</option>' + db.clientes.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    if(filtFinCli) filtFinCli.innerHTML = '<option value="">Todos</option>' + db.clientes.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

    // Fornecedores
    const selForn = document.getElementById('produto-fornecedor');
    const selSupForn = document.getElementById('sup-fornecedor');
    const filtEstForn = document.getElementById('filtro-estoque-forn');
    const fornOptions = '<option value="">Selecione...</option>' + db.fornecedores.map(f => `<option value="${f.id}">${f.name}</option>`).join('');
    if(selForn) selForn.innerHTML = fornOptions;
    if(selSupForn) selSupForn.innerHTML = fornOptions;
    if(filtEstForn) filtEstForn.innerHTML = '<option value="">Todos os Fornecedores</option>' + db.fornecedores.map(f => `<option value="${f.id}">${f.name}</option>`).join('');

    // Categorias
    const selCat = document.getElementById('produto-categoria');
    if(selCat) selCat.innerHTML = '<option value="">Selecione...</option>' + db.categorias.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');

    // Materiais
    const selMat = document.getElementById('produto-material');
    const selVendaMat = document.getElementById('venda-material');
    const matOptions = '<option value="">Selecione...</option>' + db.materiais.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
    if(selMat) selMat.innerHTML = matOptions;
    if(selVendaMat) selVendaMat.innerHTML = matOptions;

    // Produtos
    const selProd = document.getElementById('venda-produto');
    const filtFinProd = document.getElementById('filt-fin-produto');
    const prodOptions = '<option value="">Selecione...</option>' + db.produtos.map(p => `<option value="${p.id}">${p.description}</option>`).join('');
    if(selProd) selProd.innerHTML = prodOptions;
    if(filtFinProd) filtFinProd.innerHTML = '<option value="">Todos</option>' + db.produtos.map(p => `<option value="${p.id}">${p.description}</option>`).join('');
}

// ================= MÓDULO: CADASTROS =================
function switchCadastroTab(tabName) {
    document.querySelectorAll('.sub-tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.sub-tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`cad-tab-${tabName}`).classList.add('active');
    event.currentTarget.classList.add('active');
    renderCadastros();
}

function renderCadastros() {
    // Clientes
    const tbCli = document.getElementById('table-clientes-body');
    tbCli.innerHTML = db.clientes.map(c => `
        <tr>
            <td>${c.name}</td>
            <td>${c.phone || '-'}</td>
            <td>${c.email || '-'}</td>
            <td>
                <button class="btn-secondary" onclick="editCliente(${c.id})"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-danger" onclick="deleteCliente(${c.id})"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');

    // Fornecedores
    const tbForn = document.getElementById('table-fornecedores-body');
    tbForn.innerHTML = db.fornecedores.map(f => `
        <tr>
            <td>${f.name}</td>
            <td>${f.contact || '-'}</td>
            <td>${f.phone || '-'}</td>
            <td>
                <button class="btn-secondary" onclick="editFornecedor(${f.id})"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-danger" onclick="deleteFornecedor(${f.id})"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');

    // Categorias
    const tbCat = document.getElementById('table-categorias-body');
    tbCat.innerHTML = db.categorias.map(cat => `
        <tr>
            <td>${cat.name}</td>
            <td>
                <button class="btn-secondary" onclick="editCategoria(${cat.id})"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-danger" onclick="deleteCategoria(${cat.id})"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');

    // Materiais
    const tbMat = document.getElementById('table-materiais-body');
    tbMat.innerHTML = db.materiais.map(m => `
        <tr>
            <td>${m.name}</td>
            <td>
                <button class="btn-secondary" onclick="editMaterial(${m.id})"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-danger" onclick="deleteMaterial(${m.id})"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

// CRUD Clientes
function saveCliente(e) {
    e.preventDefault();
    const id = document.getElementById('cliente-id').value;
    const name = document.getElementById('cliente-nome').value;
    const phone = document.getElementById('cliente-tel').value;
    const email = document.getElementById('cliente-email').value;

    if (id) {
        const item = db.clientes.find(x => x.id == id);
        item.name = name; item.phone = phone; item.email = email;
        addLog('EDITAR', `Cliente editado: ${name}`);
    } else {
        const newId = Date.now();
        db.clientes.push({ id: newId, name, phone, email });
        addLog('INSERIR', `Novo cliente cadastrado: ${name}`);
    }
    saveDB(); resetClienteForm(); renderCadastros(); populateSelects();
}
function editCliente(id) {
    const c = db.clientes.find(x => x.id == id);
    document.getElementById('cliente-id').value = c.id;
    document.getElementById('cliente-nome').value = c.name;
    document.getElementById('cliente-tel').value = c.phone;
    document.getElementById('cliente-email').value = c.email;
    document.getElementById('form-cliente-title').textContent = 'Editar Cliente';
}
function deleteCliente(id) {
    const c = db.clientes.find(x => x.id == id);
    if(confirm('Deseja excluir este cliente?')) {
        db.clientes = db.clientes.filter(x => x.id != id);
        addLog('EXCLUIR', `Cliente excluído: ${c.name}`);
        saveDB(); renderCadastros(); populateSelects();
    }
}
function resetClienteForm() {
    document.getElementById('form-cliente').reset();
    document.getElementById('cliente-id').value = '';
    document.getElementById('form-cliente-title').textContent = 'Novo Cliente';
}

// CRUD Fornecedores
function saveFornecedor(e) {
    e.preventDefault();
    const id = document.getElementById('fornecedor-id').value;
    const name = document.getElementById('fornecedor-nome').value;
    const contact = document.getElementById('fornecedor-contato').value;
    const phone = document.getElementById('fornecedor-tel').value;

    if (id) {
        const item = db.fornecedores.find(x => x.id == id);
        item.name = name; item.contact = contact; item.phone = phone;
        addLog('EDITAR', `Fornecedor editado: ${name}`);
    } else {
        const newId = Date.now();
        db.fornecedores.push({ id: newId, name, contact, phone });
        addLog('INSERIR', `Novo fornecedor cadastrado: ${name}`);
    }
    saveDB(); resetFornecedorForm(); renderCadastros(); populateSelects();
}
function editFornecedor(id) {
    const f = db.fornecedores.find(x => x.id == id);
    document.getElementById('fornecedor-id').value = f.id;
    document.getElementById('fornecedor-nome').value = f.name;
    document.getElementById('fornecedor-contato').value = f.contact;
    document.getElementById('fornecedor-tel').value = f.phone;
    document.getElementById('form-fornecedor-title').textContent = 'Editar Fornecedor';
}
function deleteFornecedor(id) {
    const f = db.fornecedores.find(x => x.id == id);
    if(confirm('Deseja excluir este fornecedor?')) {
        db.fornecedores = db.fornecedores.filter(x => x.id != id);
        addLog('EXCLUIR', `Fornecedor excluído: ${f.name}`);
        saveDB(); renderCadastros(); populateSelects();
    }
}
function resetFornecedorForm() {
    document.getElementById('form-fornecedor').reset();
    document.getElementById('fornecedor-id').value = '';
    document.getElementById('form-fornecedor-title').textContent = 'Novo Fornecedor';
}

// CRUD Categorias
function saveCategoria(e) {
    e.preventDefault();
    const id = document.getElementById('categoria-id').value;
    const name = document.getElementById('categoria-nome').value;

    if (id) {
        const item = db.categorias.find(x => x.id == id);
        item.name = name;
        addLog('EDITAR', `Categoria editada: ${name}`);
    } else {
        const newId = Date.now();
        db.categorias.push({ id: newId, name });
        addLog('INSERIR', `Nova categoria cadastrada: ${name}`);
    }
    saveDB(); resetCategoriaForm(); renderCadastros(); populateSelects();
}
function editCategoria(id) {
    const cat = db.categorias.find(x => x.id == id);
    document.getElementById('categoria-id').value = cat.id;
    document.getElementById('categoria-nome').value = cat.name;
    document.getElementById('form-categoria-title').textContent = 'Editar Categoria';
}
function deleteCategoria(id) {
    const cat = db.categorias.find(x => x.id == id);
    if(confirm('Deseja excluir esta categoria?')) {
        db.categorias = db.categorias.filter(x => x.id != id);
        addLog('EXCLUIR', `Categoria excluída: ${cat.name}`);
        saveDB(); renderCadastros(); populateSelects();
    }
}
function resetCategoriaForm() {
    document.getElementById('form-categoria').reset();
    document.getElementById('categoria-id').value = '';
    document.getElementById('form-categoria-title').textContent = 'Nova Categoria';
}

// CRUD Materiais
function saveMaterial(e) {
    e.preventDefault();
    const id = document.getElementById('material-id').value;
    const name = document.getElementById('material-nome').value;

    if (id) {
        const item = db.materiais.find(x => x.id == id);
        item.name = name;
        addLog('EDITAR', `Material editado: ${name}`);
    } else {
        const newId = Date.now();
        db.materiais.push({ id: newId, name });
        addLog('INSERIR', `Novo material cadastrado: ${name}`);
    }
    saveDB(); resetMaterialForm(); renderCadastros(); populateSelects();
}
function editMaterial(id) {
    const m = db.materiais.find(x => x.id == id);
    document.getElementById('material-id').value = m.id;
    document.getElementById('material-nome').value = m.name;
    document.getElementById('form-material-title').textContent = 'Editar Material';
}
function deleteMaterial(id) {
    const m = db.materiais.find(x => x.id == id);
    if(confirm('Deseja excluir este material?')) {
        db.materiais = db.materiais.filter(x => x.id != id);
        addLog('EXCLUIR', `Material excluído: ${m.name}`);
        saveDB(); renderCadastros(); populateSelects();
    }
}
function resetMaterialForm() {
    document.getElementById('form-material').reset();
    document.getElementById('material-id').value = '';
    document.getElementById('form-material-title').textContent = 'Novo Material';
}

// ================= MÓDULO: PRODUTOS =================
function renderProdutos() {
    populateSelects();
    const tb = document.getElementById('table-produtos-body');
    tb.innerHTML = db.produtos.map(p => {
        const cat = db.categorias.find(c => c.id == p.categoryId)?.name || '-';
        const mat = db.materiais.find(m => m.id == p.materialId)?.name || '-';
        const forn = db.fornecedores.find(f => f.id == p.supplierId)?.name || '-';
        const preco = p.suggestedPrice ? `R$ ${Number(p.suggestedPrice).toFixed(2)}` : '-';
        return `
            <tr>
                <td>${p.description}</td>
                <td>${cat}</td>
                <td>${mat}</td>
                <td>${forn}</td>
                <td>${preco}</td>
                <td>
                    <button class="btn-secondary" onclick="editProduto(${p.id})"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-danger" onclick="deleteProduto(${p.id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    }).join('');
}

function saveProduto(e) {
    e.preventDefault();
    const id = document.getElementById('produto-id').value;
    const description = document.getElementById('produto-descricao').value;
    const categoryId = document.getElementById('produto-categoria').value;
    const materialId = document.getElementById('produto-material').value;
    const supplierId = document.getElementById('produto-fornecedor').value;
    const suggestedPrice = document.getElementById('produto-preco').value;

    if (id) {
        const p = db.produtos.find(x => x.id == id);
        p.description = description; p.categoryId = categoryId; p.materialId = materialId; p.supplierId = supplierId; p.suggestedPrice = suggestedPrice;
        addLog('EDITAR', `Produto editado: ${description}`);
    } else {
        const newId = Date.now();
        db.produtos.push({ id: newId, description, categoryId, materialId, supplierId, suggestedPrice });
        // Inicializar estoque do produto
        if(!db.estoque) db.estoque = {};
        db.estoque[newId] = { quantity: 0 };
        addLog('INSERIR', `Novo produto cadastrado: ${description}`);
    }
    saveDB(); resetProdutoForm(); renderProdutos();
}

function editProduto(id) {
    const p = db.produtos.find(x => x.id == id);
    document.getElementById('produto-id').value = p.id;
    document.getElementById('produto-descricao').value = p.description;
    document.getElementById('produto-categoria').value = p.categoryId;
    document.getElementById('produto-material').value = p.materialId;
    document.getElementById('produto-fornecedor').value = p.supplierId;
    document.getElementById('produto-preco').value = p.suggestedPrice || '';
    document.getElementById('form-produto-title').textContent = 'Editar Produto';
}

function deleteProduto(id) {
    const p = db.produtos.find(x => x.id == id);
    if(confirm('Deseja excluir este produto?')) {
        db.produtos = db.produtos.filter(x => x.id != id);
        if(db.estoque && db.estoque[id]) delete db.estoque[id];
        addLog('EXCLUIR', `Produto excluído: ${p.description}`);
        saveDB(); renderProdutos();
    }
}

function resetProdutoForm() {
    document.getElementById('form-produto').reset();
    document.getElementById('produto-id').value = '';
    document.getElementById('form-produto-title').textContent = 'Cadastrar Novo Produto';
}

// ================= MÓDULO: ESTOQUE =================
function renderEstoque() {
    const filterProd = document.getElementById('filtro-estoque-prod').value.toLowerCase();
    const filterForn = document.getElementById('filtro-estoque-forn').value;

    const tb = document.getElementById('table-estoque-body');
    let html = '';

    db.produtos.forEach(p => {
        if (filterProd && !p.description.toLowerCase().includes(filterProd)) return;
        if (filterForn && p.supplierId != filterForn) return;

        if(!db.estoque) db.estoque = {};
        if(!db.estoque[p.id]) db.estoque[p.id] = { quantity: 0 };

        const qtd = db.estoque[p.id].quantity;
        const fornecedor = db.fornecedores.find(f => f.id == p.supplierId)?.name || 'Desconhecido';
        const valorUnit = p.suggestedPrice ? `R$ ${Number(p.suggestedPrice).toFixed(2)}` : 'R$ 0,00';

        let statusBadge = `<span class="badge badge-success">Normal</span>`;
        if (qtd <= 0) statusBadge = `<span class="badge badge-danger">Esgotado</span>`;
        else if (qtd <= 3) statusBadge = `<span class="badge badge-warning">Baixo</span>`;

        html += `
            <tr>
                <td>${p.description}</td>
                <td><b>${qtd}</b></td>
                <td>${statusBadge}</td>
                <td>${fornecedor}</td>
                <td>${valorUnit}</td>
                <td>
                    <button class="btn-secondary" onclick="ajustarEstoque(${p.id})"><i class="fa-solid fa-sliders"></i> Ajustar</button>
                </td>
            </tr>
        `;
    });
    tb.innerHTML = html;
}

function ajustarEstoque(productId) {
    const p = db.produtos.find(x => x.id == productId);
    const atual = db.estoque[productId]?.quantity || 0;
    const novoQtd = prompt(`Ajuste pontual de estoque para "${p.description}".\nQuantidade atual: ${atual}\nDigite a nova quantidade total:`, atual);
    
    if (novoQtd !== null && !isNaN(novoQtd)) {
        db.estoque[productId].quantity = Number(novoQtd);
        addLog('ESTOQUE', `Ajuste manual de estoque do produto ${p.description} para ${novoQtd} unidades.`);
        saveDB();
        renderEstoque();
    }
}

// ================= MÓDULO: SUPRIMENTOS =================
function calcSupTotal() {
    const qtd = Number(document.getElementById('sup-qtd').value) || 0;
    const valor = Number(document.getElementById('sup-valor').value) || 0;
    const frete = Number(document.getElementById('sup-frete').value) || 0;
    const outros = Number(document.getElementById('sup-outros').value) || 0;
    
    const total = valor + frete + outros;
    document.getElementById('sup-total').value = total.toFixed(2);
}

function renderSuprimentos() {
    populateSelects();
    const tb = document.getElementById('table-suprimentos-body');
    tb.innerHTML = db.suprimentos.map(s => {
        const forn = db.fornecedores.find(f => f.id == s.supplierId)?.name || '-';
        return `
            <tr>
                <td>${s.description}</td>
                <td>${s.type}</td>
                <td>${forn}</td>
                <td>${s.quantity}</td>
                <td>${s.minStock}</td>
                <td>R$ ${Number(s.total).toFixed(2)}</td>
                <td>
                    <button class="btn-secondary" onclick="editSuprimento(${s.id})"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-danger" onclick="deleteSuprimento(${s.id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    }).join('');
}

function saveSuprimento(e) {
    e.preventDefault();
    const id = document.getElementById('suprimento-id').value;
    const description = document.getElementById('sup-descricao').value;
    const type = document.getElementById('sup-tipo').value;
    const supplierId = document.getElementById('sup-fornecedor').value;
    const quantity = Number(document.getElementById('sup-qtd').value);
    const minStock = Number(document.getElementById('sup-min').value);
    const value = Number(document.getElementById('sup-valor').value);
    const freight = Number(document.getElementById('sup-frete').value);
    const others = Number(document.getElementById('sup-outros').value);
    const total = value + freight + others;

    if (id) {
        const s = db.suprimentos.find(x => x.id == id);
        s.description = description; s.type = type; s.supplierId = supplierId; s.quantity = quantity; s.minStock = minStock; s.value = value; s.freight = freight; s.others = others; s.total = total;
        addLog('EDITAR', `Suprimento editado: ${description}`);
    } else {
        const newId = Date.now();
        db.suprimentos.push({ id: newId, description, type, supplierId, quantity, minStock, value, freight, others, total });
        addLog('INSERIR', `Novo suprimento cadastrado: ${description}`);
    }
    saveDB(); resetSuprimentoForm(); renderSuprimentos();
}

function editSuprimento(id) {
    const s = db.suprimentos.find(x => x.id == id);
    document.getElementById('suprimento-id').value = s.id;
    document.getElementById('sup-descricao').value = s.description;
    document.getElementById('sup-tipo').value = s.type;
    document.getElementById('sup-fornecedor').value = s.supplierId;
    document.getElementById('sup-qtd').value = s.quantity;
    document.getElementById('sup-min').value = s.minStock;
    document.getElementById('sup-valor').value = s.value;
    document.getElementById('sup-frete').value = s.freight;
    document.getElementById('sup-outros').value = s.others;
    document.getElementById('sup-total').value = s.total.toFixed(2);
    document.getElementById('form-suprimento-title').textContent = 'Editar Suprimento';
}

function deleteSuprimento(id) {
    const s = db.suprimentos.find(x => x.id == id);
    if(confirm('Deseja excluir este suprimento?')) {
        db.suprimentos = db.suprimentos.filter(x => x.id != id);
        addLog('EXCLUIR', `Suprimento excluído: ${s.description}`);
        saveDB(); renderSuprimentos();
    }
}

function resetSuprimentoForm() {
    document.getElementById('form-suprimento').reset();
    document.getElementById('suprimento-id').value = '';
    document.getElementById('sup-total').value = '';
    document.getElementById('form-suprimento-title').textContent = 'Novo Suprimento';
}

// ================= MÓDULO: VENDAS =================
function calcVendaTotal() {
    const qtd = Number(document.getElementById('venda-qtd').value) || 1;
    const valorUnit = Number(document.getElementById('venda-valor').value) || 0;
    const desconto = Number(document.getElementById('venda-desconto').value) || 0;

    const subtotal = qtd * valorUnit;
    const totalFinal = subtotal - (subtotal * (desconto / 100));
    document.getElementById('venda-final').value = totalFinal.toFixed(2);
}

function renderVendas() {
    populateSelects();
    const tb = document.getElementById('table-vendas-body');
    tb.innerHTML = db.vendas.map(v => {
        const cliente = db.clientes.find(c => c.id == v.clientId)?.name || '-';
        const produto = db.produtos.find(p => p.id == v.productId)?.description || '-';
        return `
            <tr>
                <td>${v.date}</td>
                <td>${cliente}</td>
                <td>${produto}</td>
                <td>${v.quantity}</td>
                <td>R$ ${Number(v.finalValue).toFixed(2)}</td>
                <td>
                    <button class="btn-secondary" onclick="editVenda(${v.id})"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-danger" onclick="deleteVenda(${v.id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    }).join('');
}

function saveVenda(e) {
    e.preventDefault();
    const id = document.getElementById('venda-id').value;
    const clientId = document.getElementById('venda-cliente').value;
    const productId = document.getElementById('venda-produto').value;
    const quantity = Number(document.getElementById('venda-qtd').value);
    const materialId = document.getElementById('venda-material').value;
    const grams = Number(document.getElementById('venda-gramas').value);
    const colors = document.getElementById('venda-cores').value;
    const creationTime = document.getElementById('venda-tempo').value;
    const value = Number(document.getElementById('venda-valor').value);
    const discount = Number(document.getElementById('venda-desconto').value);
    const finalValue = Number(document.getElementById('venda-final').value);
    const observation = document.getElementById('venda-obs').value;
    const date = new Date().toLocaleDateString('pt-BR');

    if (id) {
        const v = db.vendas.find(x => x.id == id);
        v.clientId = clientId; v.productId = productId; v.quantity = quantity; v.materialId = materialId; v.grams = grams; v.colors = colors; v.creationTime = creationTime; v.value = value; v.discount = discount; v.finalValue = finalValue; v.observation = observation;
        addLog('EDITAR', `Venda editada (ID: ${id})`);
    } else {
        const newId = Date.now();
        db.vendas.push({ id: newId, date, clientId, productId, quantity, materialId, grams, colors, creationTime, value, discount, finalValue, observation });
        
        // Dar baixa no estoque automaticamente
        if(!db.estoque) db.estoque = {};
        if(!db.estoque[productId]) db.estoque[productId] = { quantity: 0 };
        db.estoque[productId].quantity = Math.max(0, db.estoque[productId].quantity - quantity);

        addLog('INSERIR', `Nova venda registrada para cliente ID ${clientId}`);
    }
    saveDB(); resetVendaForm(); renderVendas(); renderDashboard();
}

function editVenda(id) {
    const v = db.vendas.find(x => x.id == id);
    document.getElementById('venda-id').value = v.id;
    document.getElementById('venda-cliente').value = v.clientId;
    document.getElementById('venda-produto').value = v.productId;
    document.getElementById('venda-qtd').value = v.quantity;
    document.getElementById('venda-material').value = v.materialId;
    document.getElementById('venda-gramas').value = v.grams;
    document.getElementById('venda-cores').value = v.colors;
    document.getElementById('venda-tempo').value = v.creationTime;
    document.getElementById('venda-valor').value = v.value;
    document.getElementById('venda-desconto').value = v.discount;
    document.getElementById('venda-final').value = v.finalValue.toFixed(2);
    document.getElementById('venda-obs').value = v.observation || '';
    document.getElementById('form-venda-title').textContent = 'Editar Venda';
}

function deleteVenda(id) {
    if(confirm('Deseja excluir esta venda?')) {
        const v = db.vendas.find(x => x.id == id);
        db.vendas = db.vendas.filter(x => x.id != id);
        addLog('EXCLUIR', `Venda excluída (ID: ${id})`);
        saveDB(); renderVendas(); renderDashboard();
    }
}

function resetVendaForm() {
    document.getElementById('form-venda').reset();
    document.getElementById('venda-id').value = '';
    document.getElementById('venda-final').value = '';
    document.getElementById('form-venda-title').textContent = 'Nova Venda';
}

// ================= MÓDULO: FINANCEIRO =================
function renderFinanceiro() {
    const inicio = document.getElementById('filt-fin-inicio').value;
    const fim = document.getElementById('filt-fin-fim').value;
    const cliId = document.getElementById('filt-fin-cliente').value;
    const prodId = document.getElementById('filt-fin-produto').value;

    let filtered = db.vendas.filter(v => {
        // Filtro de cliente e produto
        if (cliId && v.clientId != cliId) return false;
        if (prodId && v.productId != prodId) return false;

        // Filtro de data (formato DD/MM/AAAA no item vs YYYY-MM-DD no input)
        if (inicio || fim) {
            const parts = v.date.split('/');
            const vDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
            if (inicio && vDate < new Date(inicio)) return false;
            if (fim && vDate > new Date(fim)) return false;
        }
        return true;
    });

    let faturamentoTotal = filtered.reduce((acc, item) => acc + Number(item.finalValue), 0);
    let lucroEstimado = faturamentoTotal * 0.55; // Estimativa padrão de lucro 55% em impressão 3D

    document.getElementById('fin-faturamento').textContent = `R$ ${faturamentoTotal.toFixed(2)}`;
    document.getElementById('fin-lucro').textContent = `R$ ${lucroEstimado.toFixed(2)}`;

    const tb = document.getElementById('table-financeiro-body');
    tb.innerHTML = filtered.map(v => {
        const cliente = db.clientes.find(c => c.id == v.clientId)?.name || '-';
        const produto = db.produtos.find(p => p.id == v.productId)?.description || '-';
        return `
            <tr>
                <td>${v.date}</td>
                <td>${cliente}</td>
                <td>${produto}</td>
                <td>${v.quantity}</td>
                <td>R$ ${Number(v.finalValue).toFixed(2)}</td>
                <td>
                    <button class="btn-primary" onclick="openPrintModal(${v.id})"><i class="fa-solid fa-file-pdf"></i> PDF Resumo</button>
                </td>
            </tr>
        `;
    }).join('');
}

// PDF / IMPRESSÃO RESUMO DA VENDA
function openPrintModal(vendaId) {
    const v = db.vendas.find(x => x.id == vendaId);
    const cliente = db.clientes.find(c => c.id == v.clientId)?.name || '-';
    const produto = db.produtos.find(p => p.id == v.productId)?.description || '-';
    const material = db.materiais.find(m => m.id == v.materialId)?.name || '-';

    document.getElementById('print-data-emissao').textContent = `Emitido em: ${new Date().toLocaleString('pt-BR')}`;
    document.getElementById('print-body-content').innerHTML = `
        <p><b>ID da Venda:</b> #${v.id}</p>
        <p><b>Data:</b> ${v.date}</p>
        <p><b>Cliente:</b> ${cliente}</p>
        <p><b>Produto:</b> ${produto}</p>
        <p><b>Quantidade:</b> ${v.quantity}</p>
        <p><b>Material Utilizado:</b> ${material}</p>
        <p><b>Gramagem:</b> ${v.grams}g</p>
        <p><b>Cores:</b> ${v.colors}</p>
        <p><b>Tempo de Criação:</b> ${v.creationTime}</p>
        <p><b>Valor Unitário:</b> R$ ${Number(v.value).toFixed(2)}</p>
        <p><b>Desconto:</b> ${v.discount}%</p>
        <p><b>Valor Final:</b> R$ ${Number(v.finalValue).toFixed(2)}</p>
        <p><b>Observações:</b> ${v.observation || 'Nenhuma'}</p>
    `;
    document.getElementById('print-modal').classList.remove('hidden');
}

function closePrintModal() {
    document.getElementById('print-modal').classList.add('hidden');
}

// ================= MÓDULO: LOGS =================
function renderLogs() {
    const tb = document.getElementById('table-logs-body');
    tb.innerHTML = db.logs.map(l => `
        <tr>
            <td>${l.timestamp}</td>
            <td><b>${l.user}</b></td>
            <td><span class="badge badge-success">${l.action}</span></td>
            <td>${l.details}</td>
        </tr>
    `).join('');
}

// ================= MÓDULO: DASHBOARD =================
function renderDashboard() {
    let fatTotal = db.vendas.reduce((acc, item) => acc + Number(item.finalValue), 0);
    let lucroEst = fatTotal * 0.55;
    let totalVendas = db.vendas.length;

    document.getElementById('dash-faturamento').textContent = `R$ ${fatTotal.toFixed(2)}`;
    document.getElementById('dash-lucro').textContent = `R$ ${lucroEst.toFixed(2)}`;
    document.getElementById('dash-total-vendas').textContent = totalVendas;

    const tb = document.getElementById('dash-last-sales-table');
    const lastSales = [...db.vendas].slice(0, 5);
    tb.innerHTML = lastSales.map(v => {
        const cliente = db.clientes.find(c => c.id == v.clientId)?.name || '-';
        const produto = db.produtos.find(p => p.id == v.productId)?.description || '-';
        const lucroItem = Number(v.finalValue) * 0.55;
        return `
            <tr>
                <td>${v.date}</td>
                <td>${cliente}</td>
                <td>${produto}</td>
                <td>R$ ${Number(v.finalValue).toFixed(2)}</td>
                <td>R$ ${lucroItem.toFixed(2)}</td>
            </tr>
        `;
    }).join('');
}

// ================= BACKUP & RESTORE =================
function exportBackup() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `navora_3d_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    addLog('BACKUP', 'Backup do banco de dados exportado em JSON.');
}

function importBackup(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            if (imported && imported.users && imported.vendas) {
                db = imported;
                saveDB();
                alert('Backup restaurado com sucesso!');
                addLog('RESTORE', 'Backup do banco de dados importado e restaurado.');
                initApp();
            } else {
                alert('Arquivo de backup inválido.');
            }
        } catch(err) {
            alert('Erro ao ler arquivo JSON.');
        }
    };
    reader.readAsText(file);
}