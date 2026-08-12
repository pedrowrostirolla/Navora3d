// SISTEMA NAVORA 3D - LÓGICA DE NEGÓCIO COMPLETA
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// ESTADO GLOBAL DA APLICAÇÃO (LOCALSTORAGE)
let appState = {
    clientes: [],
    fornecedores: [],
    categorias: [],
    materiais: [],
    produtos: [],
    estoque: [],
    suprimentos: [],
    vendas: [],
    logs: []
};

// DADOS INICIAIS PADRÃO (CASO O SISTEMA ESTEJA VAZIO)
function carregarDadosIniciais() {
    const saved = localStorage.getItem('navora3d_db');
    if (saved) {
        appState = JSON.parse(saved);
    } else {
        appState = {
            clientes: [
                { id: 1, nome: "João Silva", telefone: "(47) 99999-1111", email: "joao@email.com" }
            ],
            fornecedores: [
                { id: 1, nome: "3D Fila Brasil", contato: "vendas@3dfila.com.br", obs: "Fornecedor Principal" },
                { id: 2, nome: "eSun Filamentos", contato: "contato@esun.com", obs: "Importados" }
            ],
            categorias: [
                { id: 1, nome: "Decoração" },
                { id: 2, nome: "Peças Técnicas" }
            ],
            materiais: [
                { id: 1, nome: "PLA Premium" },
                { id: 2, nome: "PETG HT" }
            ],
            produtos: [
                { id: 1, descricao: "Vaso Espiral Geometrico", categoria: "Decoração", material: "PLA Premium", fornecedor: "3D Fila Brasil", preco: 45.00 }
            ],
            estoque: [
                { id: 1, produtoId: 1, produtoNome: "Vaso Espiral Geometrico", fornecedor: "3D Fila Brasil", qtd: 5 }
            ],
            suprimentos: [
                { id: 1, descricao: "Filamento PLA Preto 1kg", tipo: "Filamento", fornecedor: "3D Fila Brasil", qtdAtual: 1000, qtdMinima: 200, valor: 110.00, frete: 15.00, outros: 0 },
                { id: 2, descricao: "Filamento PETG Transparente 1kg", tipo: "Filamento", fornecedor: "eSun Filamentos", qtdAtual: 850, qtdMinima: 150, valor: 130.00, frete: 10.00, outros: 0 }
            ],
            vendas: [],
            logs: []
        };
        salvarEstado();
    }
}

function salvarEstado() {
    localStorage.setItem('navora3d_db', JSON.stringify(appState));
}

function registrarLog(acao) {
    const dataHora = new Date().toLocaleString('pt-BR');
    appState.logs.unshift({ dataHora, acao });
    if (appState.logs.length > 100) appState.logs.pop();
    salvarEstado();
    renderizarLogs();
}

// INICIALIZAÇÃO E EVENTOS
function initApp() {
    carregarDadosIniciais();
    setupNavigation();
    setupTabs();
    setupForms();
    setupAuth();
    setupBackupControls();
    
    // Atualizar interfaces
    atualizarTodasAsTabelas();
    atualizarSelectsFormularios();
    renderizarDashboard();
}

// AUTENTICAÇÃO
function setupAuth() {
    const loginForm = document.getElementById('login-form');
    const loginScreen = document.getElementById('login-screen');
    const appContainer = document.getElementById('app-container');
    const btnLogout = document.getElementById('btn-logout');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('login-user').value;
        const pass = document.getElementById('login-pass').value;

        if (user === 'admin' && pass === '1234') {
            document.getElementById('login-error').classList.add('hidden');
            loginScreen.classList.add('hidden');
            appContainer.classList.remove('hidden');
            document.getElementById('logged-user-name').innerText = user;
            registrarLog(`Usuário ${user} efetuou login no sistema.`);
        } else {
            document.getElementById('login-error').classList.remove('hidden');
        }
    });

    btnLogout.addEventListener('click', () => {
        appContainer.classList.add('hidden');
        loginScreen.classList.remove('hidden');
        document.getElementById('login-form').reset();
    });
}

// NAVEGAÇÃO ENTRE MÓDULOS
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.module-section');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');

            navButtons.forEach(b => b.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(`module-${target}`).classList.add('active');

            if (target === 'vendas') {
                atualizarSelectsFormularios();
            } else if (target === 'dashboard') {
                renderizarDashboard();
            }
        });
    });
}

// NAVEGAÇÃO DE TABS EM CADASTROS
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// MODAIS
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// ATUALIZAÇÃO DOS SELECTS DROPDOWN (INCLUINDO SUPRIMENTOS)
function atualizarSelectsFormularios() {
    // Select Clientes Vendas
    const selectClienteVenda = document.getElementById('venda-cliente');
    const selectClienteFin = document.getElementById('fin-cliente');
    let optsCli = '<option value="">Selecione um Cliente...</option>';
    appState.clientes.forEach(c => { optsCli += `<option value="${c.nome}">${c.nome}</option>`; });
    selectClienteVenda.innerHTML = optsCli;
    selectClienteFin.innerHTML = '<option value="">Todos os Clientes</option>' + optsCli;

    // Select Produtos Vendas
    const selectProdVenda = document.getElementById('venda-produto');
    const selectProdFin = document.getElementById('fin-produto');
    let optsProd = '<option value="">Selecione um Produto...</option>';
    appState.produtos.forEach(p => { optsProd += `<option value="${p.id}">${p.descricao}</option>`; });
    selectProdVenda.innerHTML = optsProd;
    selectProdFin.innerHTML = '<option value="">Todos os Produtos</option>' + optsProd;

    // SELECT SUPRIMENTOS - CORREÇÃO SOLICITADA
    const selectSupVenda = document.getElementById('venda-suprimento');
    let optsSup = '<option value="">Selecione o Suprimento Utilizado...</option>';
    appState.suprimentos.forEach(s => {
        optsSup += `<option value="${s.id}">${s.descricao} (Estoque: ${s.qtdAtual}g/un)</option>`;
    });
    selectSupVenda.innerHTML = optsSup;

    // Select Materiais Vendas & Modais
    const selectMatVenda = document.getElementById('venda-material');
    const selectMatProd = document.getElementById('prod-material');
    let optsMat = '<option value="">Selecione um Material...</option>';
    appState.materiais.forEach(m => { optsMat += `<option value="${m.nome}">${m.nome}</option>`; });
    selectMatVenda.innerHTML = optsMat;
    if (selectMatProd) selectMatProd.innerHTML = optsMat;

    // Select Fornecedores em Modais
    const selectFornProd = document.getElementById('prod-fornecedor');
    const selectFornSup = document.getElementById('sup-fornecedor');
    const selectFornFiltroEstoque = document.getElementById('filtro-estoque-forn');
    let optsForn = '<option value="">Selecione um Fornecedor...</option>';
    appState.fornecedores.forEach(f => { optsForn += `<option value="${f.nome}">${f.nome}</option>`; });
    if (selectFornProd) selectFornProd.innerHTML = optsForn;
    if (selectFornSup) selectFornSup.innerHTML = optsForn;
    if (selectFornFiltroEstoque) selectFornFiltroEstoque.innerHTML = '<option value="">Todos os Fornecedores</option>' + optsForn;

    // Select Categoria em Modal Produto
    const selectCatProd = document.getElementById('prod-categoria');
    let optsCat = '<option value="">Selecione uma Categoria...</option>';
    appState.categorias.forEach(c => { optsCat += `<option value="${c.nome}">${c.nome}</option>`; });
    if (selectCatProd) selectCatProd.innerHTML = optsCat;
}

// CORREÇÃO E ATUALIZAÇÃO DO FORNECEDOR DO SUPRIMENTO EM VENDAS
function atualizarFornecedorSuprimentoVenda() {
    const supId = document.getElementById('venda-suprimento').value;
    const inputFornecedor = document.getElementById('venda-suprimento-fornecedor');

    if (!supId) {
        inputFornecedor.value = '';
        return;
    }

    const suprimentoEncontrado = appState.suprimentos.find(s => s.id == supId);
    if (suprimentoEncontrado) {
        inputFornecedor.value = suprimentoEncontrado.fornecedor || 'Não informado';
    } else {
        inputFornecedor.value = '';
    }
}

function autopreencherValorProduto() {
    const prodId = document.getElementById('venda-produto').value;
    const prod = appState.produtos.find(p => p.id == prodId);
    if (prod && prod.preco) {
        document.getElementById('venda-valor-unit').value = prod.preco;
        calcularValorFinalVenda();
    }
}

function calcularValorFinalVenda() {
    const qtd = parseFloat(document.getElementById('venda-quantidade').value) || 1;
    const unit = parseFloat(document.getElementById('venda-valor-unit').value) || 0;
    const desc = parseFloat(document.getElementById('venda-desconto').value) || 0;

    let subtotal = qtd * unit;
    let total = subtotal - (subtotal * (desc / 100));
    document.getElementById('venda-valor-final').value = total.toFixed(2);
}

// REGISTRO E SUBMISSÃO DE FORMULÁRIOS
function setupForms() {
    // Form Cliente
    document.getElementById('form-cliente').addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('cli-id').value;
        const nome = document.getElementById('cli-nome').value;
        const telefone = document.getElementById('cli-telefone').value;
        const email = document.getElementById('cli-email').value;

        if (id) {
            const index = appState.clientes.findIndex(c => c.id == id);
            appState.clientes[index] = { id: parseInt(id), nome, telefone, email };
            registrarLog(`Cliente '${nome}' atualizado.`);
        } else {
            const newId = Date.now();
            appState.clientes.push({ id: newId, nome, telefone, email });
            registrarLog(`Novo cliente '${nome}' cadastrado.`);
        }
        salvarEstado();
        renderizarClientes();
        closeModal('modal-cliente');
        e.target.reset();
        atualizarSelectsFormularios();
    });

    // Form Fornecedor
    document.getElementById('form-fornecedor').addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('forn-id').value;
        const nome = document.getElementById('forn-nome').value;
        const contato = document.getElementById('forn-contato').value;
        const obs = document.getElementById('forn-obs').value;

        if (id) {
            const index = appState.fornecedores.findIndex(f => f.id == id);
            appState.fornecedores[index] = { id: parseInt(id), nome, contato, obs };
            registrarLog(`Fornecedor '${nome}' atualizado.`);
        } else {
            appState.fornecedores.push({ id: Date.now(), nome, contato, obs });
            registrarLog(`Novo fornecedor '${nome}' cadastrado.`);
        }
        salvarEstado();
        renderizarFornecedores();
        closeModal('modal-fornecedor');
        e.target.reset();
        atualizarSelectsFormularios();
    });

    // Form Categoria
    document.getElementById('form-categoria').addEventListener('submit', (e) => {
        e.preventDefault();
        const nome = document.getElementById('cat-nome').value;
        appState.categorias.push({ id: Date.now(), nome });
        salvarEstado();
        renderizarCategorias();
        closeModal('modal-categoria');
        e.target.reset();
        atualizarSelectsFormularios();
        registrarLog(`Nova categoria '${nome}' cadastrada.`);
    });

    // Form Material
    document.getElementById('form-material').addEventListener('submit', (e) => {
        e.preventDefault();
        const nome = document.getElementById('mat-nome').value;
        appState.materiais.push({ id: Date.now(), nome });
        salvarEstado();
        renderizarMateriais();
        closeModal('modal-material');
        e.target.reset();
        atualizarSelectsFormularios();
        registrarLog(`Novo material '${nome}' cadastrado.`);
    });

    // Form Produto
    document.getElementById('form-produto').addEventListener('submit', (e) => {
        e.preventDefault();
        const descricao = document.getElementById('prod-descricao').value;
        const categoria = document.getElementById('prod-categoria').value;
        const material = document.getElementById('prod-material').value;
        const fornecedor = document.getElementById('prod-fornecedor').value;
        const preco = parseFloat(document.getElementById('prod-preco').value) || 0;

        const prodId = Date.now();
        appState.produtos.push({ id: prodId, descricao, categoria, material, fornecedor, preco });
        appState.estoque.push({ id: Date.now(), produtoId: prodId, produtoNome: descricao, fornecedor, qtd: 0 });

        salvarEstado();
        renderizarProdutos();
        renderizarEstoque();
        closeModal('modal-produto');
        e.target.reset();
        atualizarSelectsFormularios();
        registrarLog(`Novo produto '${descricao}' cadastrado.`);
    });

    // Form Suprimento
    document.getElementById('form-suprimento').addEventListener('submit', (e) => {
        e.preventDefault();
        const descricao = document.getElementById('sup-descricao').value;
        const tipo = document.getElementById('sup-tipo').value;
        const fornecedor = document.getElementById('sup-fornecedor').value;
        const qtdAtual = parseFloat(document.getElementById('sup-qtd-atual').value) || 0;
        const qtdMinima = parseFloat(document.getElementById('sup-qtd-minima').value) || 0;
        const valor = parseFloat(document.getElementById('sup-valor').value) || 0;
        const frete = parseFloat(document.getElementById('sup-frete').value) || 0;
        const outros = parseFloat(document.getElementById('sup-outros').value) || 0;

        appState.suprimentos.push({
            id: Date.now(),
            descricao,
            tipo,
            fornecedor,
            qtdAtual,
            qtdMinima,
            valor,
            frete,
            outros
        });

        salvarEstado();
        renderizarSuprimentos();
        closeModal('modal-suprimento');
        e.target.reset();
        atualizarSelectsFormularios();
        registrarLog(`Suprimento '${descricao}' cadastrado no estoque.`);
    });

    // FORMULARIO DE VENDA - PROCESSAMENTO COMPLETO
    document.getElementById('form-venda').addEventListener('submit', (e) => {
        e.preventDefault();

        const cliente = document.getElementById('venda-cliente').value;
        const prodId = document.getElementById('venda-produto').value;
        const supId = document.getElementById('venda-suprimento').value;
        const fornSup = document.getElementById('venda-suprimento-fornecedor').value;
        const qtd = parseInt(document.getElementById('venda-quantidade').value) || 1;
        const material = document.getElementById('venda-material').value;
        const gramas = parseFloat(document.getElementById('venda-gramas').value) || 0;
        const cores = document.getElementById('venda-cores').value;
        const tempo = document.getElementById('venda-tempo').value;
        const valorUnit = parseFloat(document.getElementById('venda-valor-unit').value) || 0;
        const desconto = parseFloat(document.getElementById('venda-desconto').value) || 0;
        const valorFinal = parseFloat(document.getElementById('venda-valor-final').value) || 0;
        const obs = document.getElementById('venda-obs').value;

        const prodObj = appState.produtos.find(p => p.id == prodId);
        const supObj = appState.suprimentos.find(s => s.id == supId);

        if (!supObj) {
            alert('Por favor, selecione um suprimento válido.');
            return;
        }

        // Debitar Gramas do Suprimento Utilizado
        if (supObj.qtdAtual < gramas) {
            if (!confirm(`Atenção: A quantidade de suprimento disponível (${supObj.qtdAtual}g) é menor que o utilizado (${gramas}g). Deseja continuar mesmo assim?`)) {
                return;
            }
        }
        supObj.qtdAtual = Math.max(0, supObj.qtdAtual - gramas);

        // Atualizar Estoque do Produto se existir
        const itemEstoque = appState.estoque.find(e => e.produtoId == prodId);
        if (itemEstoque && itemEstoque.qtd >= qtd) {
            itemEstoque.qtd -= qtd;
        }

        const novaVenda = {
            id: 'VND-' + Date.now().toString().slice(-6),
            data: new Date().toLocaleDateString('pt-BR'),
            rawDate: new Date().toISOString(),
            cliente,
            produtoId: prodId,
            produtoNome: prodObj ? prodObj.descricao : 'Produto Personalizado',
            suprimentoId: supId,
            suprimentoNome: supObj.descricao,
            fornecedorSuprimento: fornSup,
            quantidade: qtd,
            material,
            gramas,
            cores,
            tempo,
            valorUnit,
            desconto,
            valorFinal,
            obs
        };

        appState.vendas.unshift(novaVenda);
        salvarEstado();

        registrarLog(`Venda ${novaVenda.id} finalizada para ${cliente} no valor de R$ ${valorFinal.toFixed(2)}.`);
        alert('Venda lançada com sucesso! O suprimento utilizado foi debitado automaticamente.');

        e.target.reset();
        document.getElementById('venda-suprimento-fornecedor').value = '';
        atualizarTodasAsTabelas();
        renderizarDashboard();
    });
}

// RENDERIZAÇÃO DAS TABELAS
function atualizarTodasAsTabelas() {
    renderizarClientes();
    renderizarFornecedores();
    renderizarCategorias();
    renderizarMateriais();
    renderizarProdutos();
    renderizarEstoque();
    renderizarSuprimentos();
    renderizarFinanceiro();
    renderizarLogs();
}

function renderizarClientes() {
    const body = document.getElementById('body-clientes');
    body.innerHTML = appState.clientes.map(c => `
        <tr>
            <td>${c.nome}</td>
            <td>${c.telefone || '-'}</td>
            <td>${c.email || '-'}</td>
            <td>
                <button class="action-btn delete" onclick="excluirItem('clientes', ${c.id})"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function renderizarFornecedores() {
    const body = document.getElementById('body-fornecedores');
    body.innerHTML = appState.fornecedores.map(f => `
        <tr>
            <td>${f.nome}</td>
            <td>${f.contato || '-'}</td>
            <td>${f.obs || '-'}</td>
            <td>
                <button class="action-btn delete" onclick="excluirItem('fornecedores', ${f.id})"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function renderizarCategorias() {
    const body = document.getElementById('body-categorias');
    body.innerHTML = appState.categorias.map(c => `
        <tr>
            <td>${c.nome}</td>
            <td><button class="action-btn delete" onclick="excluirItem('categorias', ${c.id})"><i class="fa-solid fa-trash"></i></button></td>
        </tr>
    `).join('');
}

function renderizarMateriais() {
    const body = document.getElementById('body-materiais');
    body.innerHTML = appState.materiais.map(m => `
        <tr>
            <td>${m.nome}</td>
            <td><button class="action-btn delete" onclick="excluirItem('materiais', ${m.id})"><i class="fa-solid fa-trash"></i></button></td>
        </tr>
    `).join('');
}

function renderizarProdutos() {
    const body = document.getElementById('body-produtos');
    body.innerHTML = appState.produtos.map(p => `
        <tr>
            <td>${p.descricao}</td>
            <td>${p.categoria}</td>
            <td>${p.material}</td>
            <td>${p.fornecedor}</td>
            <td>R$ ${(p.preco || 0).toFixed(2)}</td>
            <td><button class="action-btn delete" onclick="excluirItem('produtos', ${p.id})"><i class="fa-solid fa-trash"></i></button></td>
        </tr>
    `).join('');
}

function renderizarEstoque() {
    const body = document.getElementById('body-estoque');
    body.innerHTML = appState.estoque.map(e => `
        <tr>
            <td>${e.produtoNome}</td>
            <td>${e.fornecedor}</td>
            <td><strong>${e.qtd} un</strong></td>
            <td>${e.qtd > 0 ? '<span style="color:var(--success-color)">Em Estoque</span>' : '<span style="color:var(--danger-color)">Sem Estoque</span>'}</td>
            <td>
                <button class="btn btn-sm btn-outline" onclick="ajustarEstoque(${e.id}, 1)">+1</button>
                <button class="btn btn-sm btn-outline" onclick="ajustarEstoque(${e.id}, -1)">-1</button>
            </td>
        </tr>
    `).join('');
}

function ajustarEstoque(id, delta) {
    const item = appState.estoque.find(e => e.id == id);
    if (item) {
        item.qtd = Math.max(0, item.qtd + delta);
        salvarEstado();
        renderizarEstoque();
    }
}

function renderizarSuprimentos() {
    const body = document.getElementById('body-suprimentos');
    body.innerHTML = appState.suprimentos.map(s => {
        const totalCusto = (s.valor || 0) + (s.frete || 0) + (s.outros || 0);
        const alertaEstoque = s.qtdAtual <= s.qtdMinima ? 'style="color:var(--danger-color); font-weight:bold;"' : '';

        return `
            <tr>
                <td>${s.descricao}</td>
                <td>${s.tipo}</td>
                <td>${s.fornecedor}</td>
                <td ${alertaEstoque}>${s.qtdAtual} g/un</td>
                <td>${s.qtdMinima} g/un</td>
                <td>R$ ${s.valor.toFixed(2)}</td>
                <td>R$ ${s.frete.toFixed(2)}</td>
                <td>R$ ${s.outros.toFixed(2)}</td>
                <td><strong>R$ ${totalCusto.toFixed(2)}</strong></td>
                <td><button class="action-btn delete" onclick="excluirItem('suprimentos', ${s.id})"><i class="fa-solid fa-trash"></i></button></td>
            </tr>
        `;
    }).join('');
}

function renderizarFinanceiro() {
    const body = document.getElementById('body-financeiro');
    body.innerHTML = appState.vendas.map(v => `
        <tr>
            <td><strong>${v.id}</strong></td>
            <td>${v.data}</td>
            <td>${v.cliente}</td>
            <td>${v.produtoNome}</td>
            <td>${v.quantidade}</td>
            <td>R$ ${v.valorFinal.toFixed(2)}</td>
            <td>
                <button class="btn btn-sm btn-outline" onclick="alert('Suprimento utilizado: ${v.suprimentoNome}\\nFornecedor: ${v.fornecedorSuprimento}\\nGramas: ${v.gramas}g\\nObs: ${v.obs}')"><i class="fa-solid fa-eye"></i> Detalhes</button>
            </td>
        </tr>
    `).join('');
}

function renderizarLogs() {
    const body = document.getElementById('body-logs');
    body.innerHTML = appState.logs.map(l => `
        <tr>
            <td><small>${l.dataHora}</small></td>
            <td>${l.acao}</td>
        </tr>
    `).join('');
}

function renderizarDashboard() {
    const totalFaturamento = appState.vendas.reduce((acc, v) => acc + v.valorFinal, 0);
    const totalVendas = appState.vendas.length;
    const lucroEstimado = totalFaturamento * 0.45; // Estimativa média de margem 45%

    document.getElementById('dash-faturamento').innerText = `R$ ${totalFaturamento.toFixed(2)}`;
    document.getElementById('dash-lucro').innerText = `R$ ${lucroEstimado.toFixed(2)}`;
    document.getElementById('dash-qtd-vendas').innerText = totalVendas;

    const bodyUltimas = document.getElementById('dash-ultimas-vendas');
    bodyUltimas.innerHTML = appState.vendas.slice(0, 5).map(v => `
        <tr>
            <td>${v.data}</td>
            <td>${v.cliente}</td>
            <td>${v.produtoNome}</td>
            <td>R$ ${v.valorFinal.toFixed(2)}</td>
            <td><span style="color:var(--success-color)">R$ ${(v.valorFinal * 0.45).toFixed(2)}</span></td>
        </tr>
    `).join('');
}

// EXCLUSÃO DE ITENS
function excluirItem(colecao, id) {
    if (confirm('Tem certeza que deseja excluir este item?')) {
        appState[colecao] = appState[colecao].filter(item => item.id != id);
        salvarEstado();
        atualizarTodasAsTabelas();
        atualizarSelectsFormularios();
        registrarLog(`Item excluído da coleção '${colecao}'.`);
    }
}

// FILTROS DE TABELAS
function filterTable(tableId, query) {
    const rows = document.querySelectorAll(`#${tableId} tbody tr`);
    const q = query.toLowerCase();
    rows.forEach(r => {
        const text = r.innerText.toLowerCase();
        r.style.display = text.includes(q) ? '' : 'none';
    });
}

function filtrarEstoque() {
    const prod = document.getElementById('filtro-estoque-prod').value.toLowerCase();
    const forn = document.getElementById('filtro-estoque-forn').value;
    const status = document.getElementById('filtro-estoque-status').value;

    const rows = document.querySelectorAll('#tbl-estoque tbody tr');
    rows.forEach(r => {
        const text = r.innerText.toLowerCase();
        const matchesProd = text.includes(prod);
        const matchesForn = forn === '' || text.includes(forn.toLowerCase());
        let matchesStatus = true;
        if (status === 'ok') matchesStatus = text.includes('em estoque');
        if (status === 'zero') matchesStatus = text.includes('sem estoque');

        r.style.display = (matchesProd && matchesForn && matchesStatus) ? '' : 'none';
    });
}

function filtrarFinanceiro() {
    const cli = document.getElementById('fin-cliente').value;
    const prodId = document.getElementById('fin-produto').value;

    const rows = document.querySelectorAll('#tbl-financeiro tbody tr');
    rows.forEach(r => {
        const text = r.innerText;
        const matchesCli = cli === '' || text.includes(cli);
        r.style.display = matchesCli ? '' : 'none';
    });
}

// RESTAURAÇÃO E BACKUP JSON
function setupBackupControls() {
    document.getElementById('btn-export-json').addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `navora3d_backup_${Date.now()}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        registrarLog('Backup dos dados exportado com sucesso.');
    });

    document.getElementById('import-json-file').addEventListener('change', (e) => {
        const fileReader = new FileReader();
        fileReader.onload = (event) => {
            try {
                const importedData = JSON.parse(event.target.result);
                if (importedData && typeof importedData === 'object') {
                    appState = importedData;
                    salvarEstado();
                    atualizarTodasAsTabelas();
                    atualizarSelectsFormularios();
                    renderizarDashboard();
                    alert('Backup restaurado com sucesso!');
                    registrarLog('Backup dos dados restaurado via JSON.');
                }
            } catch (err) {
                alert('Erro ao carregar o arquivo JSON. Verifique a estrutura.');
            }
        };
        if (e.target.files[0]) {
            fileReader.readAsText(e.target.files[0]);
        }
    });
}