/* ==========================================================================
   NAVORA 3D - LÓGICA DO SISTEMA E BANCO DE DADOS EM LOCALSTORAGE
   ========================================================================== */

// BASE DE DADOS INICIAL / SEED DE DADOS
const DB_KEY = 'NAVORA_3D_DATABASE_V1';

const INITIAL_DB = {
    users: [
        { user: 'pedrorostirolla', pass: 'Rds@2026!', name: 'Pedro Rostirolla' },
        { user: 'dudapaganini', pass: 'Couve5flor*', name: 'Duda Paganini' }
    ],
    clientes: [
        { id: '1', nome: 'Lucas Andrade', telefone: '(47) 99887-1122', email: 'lucas@email.com' },
        { id: '2', nome: 'Mariana Souza', telefone: '(47) 99112-3344', email: 'mariana@email.com' }
    ],
    fornecedores: [
        { id: '1', nome: 'Voolt3D', contato: '(11) 3344-5566', obs: 'Filamentos PLA e PETG' },
        { id: '2', nome: '3D Fila', contato: '(11) 98877-6655', obs: 'Insumos gerais' }
    ],
    categorias: [
        { id: '1', nome: 'Decoração' },
        { id: '2', nome: 'Peças Técnicas' },
        { id: '3', nome: 'Action Figures' }
    ],
    materiais: [
        { id: '1', nome: 'PLA Premium' },
        { id: '2', nome: 'PETG' },
        { id: '3', nome: 'ABS' }
    ],
    produtos: [
        { id: '1', descricao: 'Vaso Geométrico 15cm', categoriaId: '1', materialId: '1', fornecedorId: '1', precoSugerido: 45.00 },
        { id: '2', descricao: 'Suporte para Headset', categoriaId: '2', materialId: '2', fornecedorId: '2', precoSugerido: 65.00 }
    ],
    estoque: {
        '1': 5,
        '2': 2
    },
    suprimentos: [
        { id: '1', descricao: 'Filamento PLA Preto 1kg', tipo: 'Filamento', fornecedorId: '1', qtd: 1000, qtdMin: 200, valor: 90.00, frete: 15.00, outros: 0.00, total: 105.00 }
    ],
    vendas: [
        {
            id: 'V1001',
            data: '2026-08-10',
            clienteId: '1',
            produtoId: '1',
            suprimentoId: '1',
            quantidade: 2,
            materialId: '1',
            gramas: 120,
            cores: 'Preto, Mármore',
            tempo: '5 horas',
            valorUnit: 45.00,
            desconto: 0,
            valorFinal: 90.00,
            observacao: 'Cliente solicitou acabamento fosco'
        }
    ],
    logs: []
};

// ESTADO GLOBAL DO SISTEMA
let db = {};
let currentUser = null;

// INICIALIZAÇÃO DO SISTEMA
document.addEventListener('DOMContentLoaded', () => {
    loadDatabase();
    setupEventListeners();
});

// CARREGAR/INICIALIZAR BANCO DE DADOS
function loadDatabase() {
    const data = localStorage.getItem(DB_KEY);
    if (!data) {
        db = INITIAL_DB;
        saveDatabase();
    } else {
        db = JSON.parse(data);
    }
}

function saveDatabase() {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
}

// LOGS DO SISTEMA
function addLog(action, details) {
    const log = {
        dataHora: new Date().toLocaleString('pt-BR'),
        usuario: currentUser ? currentUser.user : 'Sistema',
        acao: action,
        detalhes: details
    };
    db.logs.unshift(log);
    saveDatabase();
}

// CONFIGURAÇÃO DE EVENTOS
function setupEventListeners() {
    // Form de Login
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('login-user').value.trim();
        const pass = document.getElementById('login-pass').value.trim();

        const auth = db.users.find(u => u.user === user && u.pass === pass);
        if (auth) {
            currentUser = auth;
            document.getElementById('login-screen').classList.add('hidden');
            document.getElementById('app-container').classList.remove('hidden');
            document.getElementById('logged-user-name').innerText = currentUser.name;
            document.getElementById('login-error').classList.add('hidden');
            
            addLog('LOGIN', 'Usuário efetuou login no sistema.');
            initSystemViews();
        } else {
            document.getElementById('login-error').classList.remove('hidden');
        }
    });

    // Deslogar
    document.getElementById('btn-logout').addEventListener('click', () => {
        addLog('LOGOUT', 'Usuário deslogou do sistema.');
        currentUser = null;
        document.getElementById('app-container').classList.add('hidden');
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('login-form').reset();
    });

    // Navegação entre Módulos
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const targetModule = btn.getAttribute('data-target');
            document.querySelectorAll('.module-section').forEach(sec => sec.classList.remove('active'));
            document.getElementById(`module-${targetModule}`).classList.add('active');

            renderAll();
        });
    });

    // Abas de Cadastros
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(tab.getAttribute('data-tab')).classList.add('active');
        });
    });

    // Modal Logs
    document.getElementById('btn-logs').addEventListener('click', () => {
        renderLogs();
        openModal('modal-logs');
    });

    // Exportar Backup JSON
    document.getElementById('btn-export-json').addEventListener('click', exportBackupJSON);

    // Importar Backup JSON
    document.getElementById('import-json-file').addEventListener('change', importBackupJSON);

    // SUBMITS DE FORMULÁRIOS

    // Form Cliente
    document.getElementById('form-cliente').addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('cli-id').value;
        const nome = document.getElementById('cli-nome').value;
        const telefone = document.getElementById('cli-telefone').value;
        const email = document.getElementById('cli-email').value;

        if (id) {
            const index = db.clientes.findIndex(c => c.id === id);
            db.clientes[index] = { id, nome, telefone, email };
            addLog('ALTERAÇÃO', `Cliente alterado: ${nome}`);
        } else {
            const newId = Date.now().toString();
            db.clientes.push({ id: newId, nome, telefone, email });
            addLog('INCLUSÃO', `Cliente cadastrado: ${nome}`);
        }
        saveDatabase();
        closeModal('modal-cliente');
        renderAll();
    });

    // Form Fornecedor
    document.getElementById('form-fornecedor').addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('forn-id').value;
        const nome = document.getElementById('forn-nome').value;
        const contato = document.getElementById('forn-contato').value;
        const obs = document.getElementById('forn-obs').value;

        if (id) {
            const index = db.fornecedores.findIndex(f => f.id === id);
            db.fornecedores[index] = { id, nome, contato, obs };
            addLog('ALTERAÇÃO', `Fornecedor alterado: ${nome}`);
        } else {
            const newId = Date.now().toString();
            db.fornecedores.push({ id: newId, nome, contato, obs });
            addLog('INCLUSÃO', `Fornecedor cadastrado: ${nome}`);
        }
        saveDatabase();
        closeModal('modal-fornecedor');
        renderAll();
    });

    // Form Categoria
    document.getElementById('form-categoria').addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('cat-id').value;
        const nome = document.getElementById('cat-nome').value;

        if (id) {
            const index = db.categorias.findIndex(c => c.id === id);
            db.categorias[index] = { id, nome };
            addLog('ALTERAÇÃO', `Categoria alterada: ${nome}`);
        } else {
            const newId = Date.now().toString();
            db.categorias.push({ id: newId, nome });
            addLog('INCLUSÃO', `Categoria cadastrada: ${nome}`);
        }
        saveDatabase();
        closeModal('modal-categoria');
        renderAll();
    });

    // Form Material
    document.getElementById('form-material').addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('mat-id').value;
        const nome = document.getElementById('mat-nome').value;

        if (id) {
            const index = db.materiais.findIndex(m => m.id === id);
            db.materiais[index] = { id, nome };
            addLog('ALTERAÇÃO', `Material alterado: ${nome}`);
        } else {
            const newId = Date.now().toString();
            db.materiais.push({ id: newId, nome });
            addLog('INCLUSÃO', `Material cadastrado: ${nome}`);
        }
        saveDatabase();
        closeModal('modal-material');
        renderAll();
    });

    // Form Produto
    document.getElementById('form-produto').addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('prod-id').value;
        const descricao = document.getElementById('prod-descricao').value;
        const categoriaId = document.getElementById('prod-categoria').value;
        const materialId = document.getElementById('prod-material').value;
        const fornecedorId = document.getElementById('prod-fornecedor').value;
        const precoSugerido = parseFloat(document.getElementById('prod-preco').value) || 0;

        if (id) {
            const index = db.produtos.findIndex(p => p.id === id);
            db.produtos[index] = { id, descricao, categoriaId, materialId, fornecedorId, precoSugerido };
            addLog('ALTERAÇÃO', `Produto alterado: ${descricao}`);
        } else {
            const newId = Date.now().toString();
            db.produtos.push({ id: newId, descricao, categoriaId, materialId, fornecedorId, precoSugerido });
            db.estoque[newId] = 0; // Inicializa estoque zerado
            addLog('INCLUSÃO', `Produto cadastrado: ${descricao}`);
        }
        saveDatabase();
        closeModal('modal-produto');
        renderAll();
    });

    // Form Ajuste Estoque
    document.getElementById('form-ajuste-estoque').addEventListener('submit', (e) => {
        e.preventDefault();
        const prodId = document.getElementById('est-prod-id').value;
        const novaQtd = parseInt(document.getElementById('est-prod-qtd').value) || 0;

        db.estoque[prodId] = novaQtd;
        const prod = db.produtos.find(p => p.id === prodId);
        addLog('ALTERAÇÃO', `Estoque do produto ${prod ? prod.descricao : ''} ajustado para ${novaQtd}`);

        saveDatabase();
        closeModal('modal-ajuste-estoque');
        renderAll();
    });

    // Form Suprimentos
    document.getElementById('form-suprimento').addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('sup-id').value;
        const descricao = document.getElementById('sup-descricao').value;
        const tipo = document.getElementById('sup-tipo').value;
        const fornecedorId = document.getElementById('sup-fornecedor').value;
        const qtd = parseFloat(document.getElementById('sup-qtd').value) || 0;
        const qtdMin = parseFloat(document.getElementById('sup-qtd-min').value) || 0;
        const valor = parseFloat(document.getElementById('sup-valor').value) || 0;
        const frete = parseFloat(document.getElementById('sup-frete').value) || 0;
        const outros = parseFloat(document.getElementById('sup-outros').value) || 0;
        const total = valor + frete + outros;

        if (id) {
            const index = db.suprimentos.findIndex(s => s.id === id);
            db.suprimentos[index] = { id, descricao, tipo, fornecedorId, qtd, qtdMin, valor, frete, outros, total };
            addLog('ALTERAÇÃO', `Suprimento alterado: ${descricao}`);
        } else {
            const newId = Date.now().toString();
            db.suprimentos.push({ id: newId, descricao, tipo, fornecedorId, qtd, qtdMin, valor, frete, outros, total });
            addLog('INCLUSÃO', `Suprimento cadastrado: ${descricao}`);
        }
        saveDatabase();
        closeModal('modal-suprimento');
        renderAll();
    });

    // Form Vendas
    document.getElementById('form-venda').addEventListener('submit', (e) => {
        e.preventDefault();
        const clienteId = document.getElementById('venda-cliente').value;
        const produtoId = document.getElementById('venda-produto').value;
        const suprimentoId = document.getElementById('venda-suprimento').value;
        const quantidade = parseInt(document.getElementById('venda-quantidade').value) || 1;
        const materialId = document.getElementById('venda-material').value;
        const gramas = parseFloat(document.getElementById('venda-gramas').value) || 0;
        const cores = document.getElementById('venda-cores').value;
        const tempo = document.getElementById('venda-tempo').value;
        const valorUnit = parseFloat(document.getElementById('venda-valor-unit').value) || 0;
        const desconto = parseFloat(document.getElementById('venda-desconto').value) || 0;
        const valorFinal = valorUnit * quantidade * (1 - (desconto / 100));
        const observacao = document.getElementById('venda-obs').value;

        const novaVenda = {
            id: 'V' + Math.floor(1000 + Math.random() * 9000),
            data: new Date().toISOString().split('T')[0],
            clienteId,
            produtoId,
            suprimentoId,
            quantidade,
            materialId,
            gramas,
            cores,
            tempo,
            valorUnit,
            desconto,
            valorFinal,
            observacao
        };

        db.vendas.unshift(novaVenda);

        // Debitar estoque de produtos acabados (se houver)
        if (db.estoque[produtoId] !== undefined && db.estoque[produtoId] >= quantidade) {
            db.estoque[produtoId] -= quantidade;
        }

        // DEBITAR A QUANTIDADE DO SUPRIMENTO VINCULADO
        const supIndex = db.suprimentos.findIndex(s => s.id === suprimentoId);
        if (supIndex !== -1) {
            const sup = db.suprimentos[supIndex];
            // Se a quantidade do suprimento estiver cadastrada em Unidades/Kg (<= 50), converte gramas para Kg.
            // Se estiver em gramas (> 50), abate diretamente.
            let consumo = gramas;
            if (sup.qtd <= 50) {
                consumo = gramas / 1000;
            }
            db.suprimentos[supIndex].qtd = Math.max(0, Number((sup.qtd - consumo).toFixed(2)));
        }

        const prod = db.produtos.find(p => p.id === produtoId);
        addLog('INCLUSÃO', `Venda realizada #${novaVenda.id} - Produto: ${prod ? prod.descricao : ''}`);

        saveDatabase();
        document.getElementById('form-venda').reset();
        alert('Venda registrada e estoque de suprimento atualizado com sucesso!');
        renderAll();
    });
}

// INICIALIZAR RENDERIZAÇÕES DIVERSAS
function initSystemViews() {
    renderSelectDropdowns();
    renderAll();
}

function renderAll() {
    renderDashboard();
    renderClientes();
    renderFornecedores();
    renderCategorias();
    renderMateriais();
    renderProdutos();
    renderEstoque();
    renderSuprimentos();
    renderFinanceiro();
    renderSelectDropdowns();
}

// POPULAR SELECTS/DROPDOWNS
function renderSelectDropdowns() {
    // Selects de Categorias
    const selectCat = document.getElementById('prod-categoria');
    selectCat.innerHTML = db.categorias.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');

    // Selects de Materiais
    const selectMat = document.getElementById('prod-material');
    const selectVendaMat = document.getElementById('venda-material');
    const matOptions = db.materiais.map(m => `<option value="${m.id}">${m.nome}</option>`).join('');
    selectMat.innerHTML = matOptions;
    selectVendaMat.innerHTML = matOptions;

    // Selects de Fornecedores
    const selectFornProd = document.getElementById('prod-fornecedor');
    const selectFornSup = document.getElementById('sup-fornecedor');
    const selectFornEst = document.getElementById('filtro-estoque-forn');
    const fornOptions = db.fornecedores.map(f => `<option value="${f.id}">${f.nome}</option>`).join('');
    selectFornProd.innerHTML = fornOptions;
    selectFornSup.innerHTML = fornOptions;
    selectFornEst.innerHTML = `<option value="">Todos os Fornecedores</option>` + fornOptions;

    // Selects de Clientes (Vendas e Financeiro)
    const selectCliVenda = document.getElementById('venda-cliente');
    const selectCliFin = document.getElementById('fin-cliente');
    const cliOptions = db.clientes.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');
    selectCliVenda.innerHTML = cliOptions;
    selectCliFin.innerHTML = `<option value="">Todos os Clientes</option>` + cliOptions;

    // Selects de Produtos (Vendas e Financeiro)
    const selectProdVenda = document.getElementById('venda-produto');
    const selectProdFin = document.getElementById('fin-produto');
    const prodOptions = db.produtos.map(p => `<option value="${p.id}">${p.descricao}</option>`).join('');
    selectProdVenda.innerHTML = prodOptions;
    selectProdFin.innerHTML = `<option value="">Todos os Produtos</option>` + prodOptions;

    // Select de Suprimentos (Vendas)
    const selectSupVenda = document.getElementById('venda-suprimento');
    if (selectSupVenda) {
        selectSupVenda.innerHTML = db.suprimentos.map(s => `<option value="${s.id}">${s.descricao} (Disponível: ${s.qtd})</option>`).join('');
        atualizarFornecedorSuprimentoVenda();
    }

    autopreencherValorProduto();
}

// ATUALIZAR FORNECEDOR DO SUPRIMENTO NA TELA DE VENDA
function atualizarFornecedorSuprimentoVenda() {
    const supId = document.getElementById('venda-suprimento').value;
    const sup = db.suprimentos.find(s => s.id === supId);
    if (sup) {
        const forn = db.fornecedores.find(f => f.id === sup.fornecedorId);
        document.getElementById('venda-suprimento-fornecedor').value = forn ? forn.nome : 'Não informado';
    } else {
        document.getElementById('venda-suprimento-fornecedor').value = '';
    }
}

function autopreencherValorProduto() {
    const prodId = document.getElementById('venda-produto').value;
    const prod = db.produtos.find(p => p.id === prodId);
    if (prod && prod.precoSugerido) {
        document.getElementById('venda-valor-unit').value = prod.precoSugerido.toFixed(2);
    } else {
        document.getElementById('venda-valor-unit').value = '';
    }
    calcularValorFinalVenda();
}

function calcularValorFinalVenda() {
    const qtd = parseInt(document.getElementById('venda-quantidade').value) || 1;
    const valorUnit = parseFloat(document.getElementById('venda-valor-unit').value) || 0;
    const desc = parseFloat(document.getElementById('venda-desconto').value) || 0;

    const total = (valorUnit * qtd) * (1 - (desc / 100));
    document.getElementById('venda-valor-final').value = total.toFixed(2);
}

function calcularTotalSuprimento() {
    const v = parseFloat(document.getElementById('sup-valor').value) || 0;
    const f = parseFloat(document.getElementById('sup-frete').value) || 0;
    const o = parseFloat(document.getElementById('sup-outros').value) || 0;
    document.getElementById('sup-total').value = (v + f + o).toFixed(2);
}

// 1. DASHBOARD
function renderDashboard() {
    let faturamento = 0;
    let lucroEstimado = 0;

    db.vendas.forEach(v => {
        faturamento += v.valorFinal;
        // Estimativa de custo baseada na gramatura (Média R$ 0.10/grama) + R$ 2.00 energia/desgaste
        const custoEstimado = (v.gramas * 0.10) + 2.00;
        lucroEstimado += (v.valorFinal - custoEstimado);
    });

    document.getElementById('dash-faturamento').innerText = `R$ ${faturamento.toFixed(2)}`;
    document.getElementById('dash-lucro').innerText = `R$ ${lucroEstimado.toFixed(2)}`;
    document.getElementById('dash-qtd-vendas').innerText = db.vendas.length;

    const bodyUltimas = document.getElementById('dash-ultimas-vendas');
    bodyUltimas.innerHTML = db.vendas.slice(0, 5).map(v => {
        const cli = db.clientes.find(c => c.id === v.clienteId);
        const prod = db.produtos.find(p => p.id === v.produtoId);
        const custoEst = (v.gramas * 0.10) + 2.00;
        const lucro = v.valorFinal - custoEst;

        return `
            <tr>
                <td>${v.data}</td>
                <td>${cli ? cli.nome : 'N/A'}</td>
                <td>${prod ? prod.descricao : 'N/A'}</td>
                <td>R$ ${v.valorFinal.toFixed(2)}</td>
                <td class="text-success" style="color: var(--success); font-weight:600;">R$ ${lucro.toFixed(2)}</td>
            </tr>
        `;
    }).join('');
}

// 2. CADASTROS
function renderClientes() {
    document.getElementById('body-clientes').innerHTML = db.clientes.map(c => `
        <tr>
            <td>${c.nome}</td>
            <td>${c.telefone || '-'}</td>
            <td>${c.email || '-'}</td>
            <td>
                <button class="btn btn-outline btn-sm" onclick="editCliente('${c.id}')"><i class="fa-solid fa-pen"></i></button>
                <button class="btn btn-danger btn-sm" onclick="deleteRecord('clientes', '${c.id}', '${c.nome}')"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function editCliente(id) {
    const c = db.clientes.find(item => item.id === id);
    if (!c) return;
    document.getElementById('cli-id').value = c.id;
    document.getElementById('cli-nome').value = c.nome;
    document.getElementById('cli-telefone').value = c.telefone;
    document.getElementById('cli-email').value = c.email;
    document.getElementById('modal-cliente-title').innerText = 'Editar Cliente';
    openModal('modal-cliente');
}

function renderFornecedores() {
    document.getElementById('body-fornecedores').innerHTML = db.fornecedores.map(f => `
        <tr>
            <td>${f.nome}</td>
            <td>${f.contato || '-'}</td>
            <td>${f.obs || '-'}</td>
            <td>
                <button class="btn btn-outline btn-sm" onclick="editFornecedor('${f.id}')"><i class="fa-solid fa-pen"></i></button>
                <button class="btn btn-danger btn-sm" onclick="deleteRecord('fornecedores', '${f.id}', '${f.nome}')"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function editFornecedor(id) {
    const f = db.fornecedores.find(item => item.id === id);
    if (!f) return;
    document.getElementById('forn-id').value = f.id;
    document.getElementById('forn-nome').value = f.nome;
    document.getElementById('forn-contato').value = f.contato;
    document.getElementById('forn-obs').value = f.obs;
    document.getElementById('modal-fornecedor-title').innerText = 'Editar Fornecedor';
    openModal('modal-fornecedor');
}

function renderCategorias() {
    document.getElementById('body-categorias').innerHTML = db.categorias.map(c => `
        <tr>
            <td>${c.nome}</td>
            <td>
                <button class="btn btn-outline btn-sm" onclick="editCategoria('${c.id}')"><i class="fa-solid fa-pen"></i></button>
                <button class="btn btn-danger btn-sm" onclick="deleteRecord('categorias', '${c.id}', '${c.nome}')"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function editCategoria(id) {
    const c = db.categorias.find(item => item.id === id);
    if (!c) return;
    document.getElementById('cat-id').value = c.id;
    document.getElementById('cat-nome').value = c.nome;
    document.getElementById('modal-categoria-title').innerText = 'Editar Categoria';
    openModal('modal-categoria');
}

function renderMateriais() {
    document.getElementById('body-materiais').innerHTML = db.materiais.map(m => `
        <tr>
            <td>${m.nome}</td>
            <td>
                <button class="btn btn-outline btn-sm" onclick="editMaterial('${m.id}')"><i class="fa-solid fa-pen"></i></button>
                <button class="btn btn-danger btn-sm" onclick="deleteRecord('materiais', '${m.id}', '${m.nome}')"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function editMaterial(id) {
    const m = db.materiais.find(item => item.id === id);
    if (!m) return;
    document.getElementById('mat-id').value = m.id;
    document.getElementById('mat-nome').value = m.nome;
    document.getElementById('modal-material-title').innerText = 'Editar Material';
    openModal('modal-material');
}

// 3. PRODUTOS
function renderProdutos() {
    document.getElementById('body-produtos').innerHTML = db.produtos.map(p => {
        const cat = db.categorias.find(c => c.id === p.categoriaId);
        const mat = db.materiais.find(m => m.id === p.materialId);
        const forn = db.fornecedores.find(f => f.id === p.fornecedorId);

        return `
            <tr>
                <td><strong>${p.descricao}</strong></td>
                <td>${cat ? cat.nome : '-'}</td>
                <td>${mat ? mat.nome : '-'}</td>
                <td>${forn ? forn.nome : '-'}</td>
                <td>R$ ${p.precoSugerido ? p.precoSugerido.toFixed(2) : '0.00'}</td>
                <td>
                    <button class="btn btn-outline btn-sm" onclick="editProduto('${p.id}')"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn btn-danger btn-sm" onclick="deleteRecord('produtos', '${p.id}', '${p.descricao}')"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    }).join('');
}

function editProduto(id) {
    const p = db.produtos.find(item => item.id === id);
    if (!p) return;
    document.getElementById('prod-id').value = p.id;
    document.getElementById('prod-descricao').value = p.descricao;
    document.getElementById('prod-categoria').value = p.categoriaId;
    document.getElementById('prod-material').value = p.materialId;
    document.getElementById('prod-fornecedor').value = p.fornecedorId;
    document.getElementById('prod-preco').value = p.precoSugerido;
    document.getElementById('modal-produto-title').innerText = 'Editar Produto';
    openModal('modal-produto');
}

// 4. ESTOQUE
function renderEstoque() {
    filtrarEstoque();
}

function filtrarEstoque() {
    const filtroProd = document.getElementById('filtro-estoque-prod').value.toLowerCase();
    const filtroForn = document.getElementById('filtro-estoque-forn').value;
    const filtroStatus = document.getElementById('filtro-estoque-status').value;

    const lista = db.produtos.filter(p => {
        const matchProd = p.descricao.toLowerCase().includes(filtroProd);
        const matchForn = filtroForn === '' || p.fornecedorId === filtroForn;
        
        const qtd = db.estoque[p.id] || 0;
        let matchStatus = true;
        if (filtroStatus === 'ok') matchStatus = (qtd > 0);
        if (filtroStatus === 'zero') matchStatus = (qtd === 0);

        return matchProd && matchForn && matchStatus;
    });

    document.getElementById('body-estoque').innerHTML = lista.map(p => {
        const forn = db.fornecedores.find(f => f.id === p.fornecedorId);
        const qtd = db.estoque[p.id] || 0;
        const badgeClass = qtd > 0 ? 'badge-success' : 'badge-danger';
        const badgeText = qtd > 0 ? 'Disponível' : 'Sem Estoque';

        return `
            <tr>
                <td><strong>${p.descricao}</strong></td>
                <td>${forn ? forn.nome : 'N/A'}</td>
                <td><strong>${qtd} un</strong></td>
                <td><span class="badge ${badgeClass}">${badgeText}</span></td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="abrirAjusteEstoque('${p.id}', '${p.descricao}', ${qtd})">
                        <i class="fa-solid fa-sliders"></i> Ajustar Estoque
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function abrirAjusteEstoque(id, descricao, qtdAtual) {
    document.getElementById('est-prod-id').value = id;
    document.getElementById('est-prod-nome').value = descricao;
    document.getElementById('est-prod-qtd').value = qtdAtual;
    openModal('modal-ajuste-estoque');
}

// 5. SUPRIMENTOS
function renderSuprimentos() {
    document.getElementById('body-suprimentos').innerHTML = db.suprimentos.map(s => {
        const forn = db.fornecedores.find(f => f.id === s.fornecedorId);
        const abaixoMin = s.qtd <= s.qtdMin;
        const badgeClass = abaixoMin ? 'badge-danger' : 'badge-success';

        return `
            <tr>
                <td><strong>${s.descricao}</strong></td>
                <td>${s.tipo}</td>
                <td>${forn ? forn.nome : '-'}</td>
                <td><span class="badge ${badgeClass}">${s.qtd}</span></td>
                <td>${s.qtdMin}</td>
                <td>R$ ${s.valor.toFixed(2)}</td>
                <td>R$ ${s.frete.toFixed(2)}</td>
                <td>R$ ${s.outros.toFixed(2)}</td>
                <td><strong>R$ ${s.total.toFixed(2)}</strong></td>
                <td>
                    <button class="btn btn-outline btn-sm" onclick="editSuprimento('${s.id}')"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn btn-danger btn-sm" onclick="deleteRecord('suprimentos', '${s.id}', '${s.descricao}')"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    }).join('');
}

function editSuprimento(id) {
    const s = db.suprimentos.find(item => item.id === id);
    if (!s) return;
    document.getElementById('sup-id').value = s.id;
    document.getElementById('sup-descricao').value = s.descricao;
    document.getElementById('sup-tipo').value = s.tipo;
    document.getElementById('sup-fornecedor').value = s.fornecedorId;
    document.getElementById('sup-qtd').value = s.qtd;
    document.getElementById('sup-qtd-min').value = s.qtdMin;
    document.getElementById('sup-valor').value = s.valor;
    document.getElementById('sup-frete').value = s.frete;
    document.getElementById('sup-outros').value = s.outros;
    document.getElementById('sup-total').value = s.total;
    document.getElementById('modal-suprimento-title').innerText = 'Editar Suprimento';
    openModal('modal-suprimento');
}

// 6. FINANCEIRO
function renderFinanceiro() {
    filtrarFinanceiro();
}

function filtrarFinanceiro() {
    const dataInicio = document.getElementById('fin-data-inicio').value;
    const dataFim = document.getElementById('fin-data-fim').value;
    const clienteId = document.getElementById('fin-cliente').value;
    const produtoId = document.getElementById('fin-produto').value;

    const vendasFiltradas = db.vendas.filter(v => {
        let matchData = true;
        if (dataInicio && v.data < dataInicio) matchData = false;
        if (dataFim && v.data > dataFim) matchData = false;

        let matchCli = clienteId === '' || v.clienteId === clienteId;
        let matchProd = produtoId === '' || v.produtoId === produtoId;

        return matchData && matchCli && matchProd;
    });

    document.getElementById('body-financeiro').innerHTML = vendasFiltradas.map(v => {
        const cli = db.clientes.find(c => c.id === v.clienteId);
        const prod = db.produtos.find(p => p.id === v.produtoId);

        return `
            <tr>
                <td><strong>#${v.id}</strong></td>
                <td>${v.data}</td>
                <td>${cli ? cli.nome : 'N/A'}</td>
                <td>${prod ? prod.descricao : 'N/A'}</td>
                <td>${v.quantidade}</td>
                <td><strong>R$ ${v.valorFinal.toFixed(2)}</strong></td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="imprimirComprovantePDF('${v.id}')">
                        <i class="fa-solid fa-file-pdf"></i> Exportar PDF
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteRecord('vendas', '${v.id}', 'Venda #${v.id}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// GERAR / EXPORTAR COMPROVANTE PDF
function imprimirComprovantePDF(vendaId) {
    const v = db.vendas.find(venda => venda.id === vendaId);
    if (!v) return;

    const cli = db.clientes.find(c => c.id === v.clienteId);
    const prod = db.produtos.find(p => p.id === v.produtoId);
    const mat = db.materiais.find(m => m.id === v.materialId);
    const sup = db.suprimentos.find(s => s.id === v.suprimentoId);
    const fornSup = sup ? db.fornecedores.find(f => f.id === sup.fornecedorId) : null;

    const receiptHtml = `
        <p><strong>Número da Venda:</strong> #${v.id}</p>
        <p><strong>Data:</strong> ${v.data}</p>
        <p><strong>Cliente:</strong> ${cli ? cli.nome : 'N/A'}</p>
        <p><strong>Contato:</strong> ${cli ? cli.telefone : 'N/A'}</p>
        <hr>
        <p><strong>Produto:</strong> ${prod ? prod.descricao : 'N/A'}</p>
        <p><strong>Suprimento Utilizado:</strong> ${sup ? sup.descricao : 'N/A'} (Fornecedor: ${fornSup ? fornSup.nome : 'N/A'})</p>
        <p><strong>Material:</strong> ${mat ? mat.nome : 'N/A'}</p>
        <p><strong>Quantidade de Peças:</strong> ${v.quantidade}</p>
        <p><strong>Gramas Utilizadas:</strong> ${v.gramas}g</p>
        <p><strong>Cores:</strong> ${v.cores}</p>
        <p><strong>Tempo de Criação:</strong> ${v.tempo}</p>
        <p><strong>Observações:</strong> ${v.observacao || 'Nenhuma'}</p>
        <hr>
        <h4>Valor Total: R$ ${v.valorFinal.toFixed(2)} (Desconto: ${v.desconto}%)</h4>
    `;

    document.getElementById('receipt-body').innerHTML = receiptHtml;
    window.print();
}

// EXCLUSÃO GENÉRICA DE REGISTROS
function deleteRecord(entity, id, name) {
    if (confirm(`Tem certeza que deseja excluir "${name}"?`)) {
        if (entity === 'vendas') {
            db.vendas = db.vendas.filter(item => item.id !== id);
        } else if (entity === 'estoque') {
            delete db.estoque[id];
        } else {
            db[entity] = db[entity].filter(item => item.id !== id);
        }
        
        addLog('EXCLUSÃO', `Excluiu do módulo ${entity}: ${name}`);
        saveDatabase();
        renderAll();
    }
}

// LOGS DO SISTEMA
function renderLogs() {
    document.getElementById('body-logs').innerHTML = db.logs.map(l => `
        <tr>
            <td>${l.dataHora}</td>
            <td><strong>${l.usuario}</strong></td>
            <td><span class="badge badge-warning">${l.acao}</span></td>
            <td>${l.detalhes}</td>
        </tr>
    `).join('');
}

// BACKUP E RESTAURAÇÃO (JSON)
function exportBackupJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `NAVORA3D_BACKUP_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    addLog('BACKUP', 'Exportou arquivo de backup JSON do sistema.');
}

function importBackupJSON(e) {
    const fileReader = new FileReader();
    fileReader.onload = function (event) {
        try {
            const importedDb = JSON.parse(event.target.result);
            if (importedDb.users && importedDb.produtos) {
                db = importedDb;
                saveDatabase();
                addLog('RESTAURAÇÃO', 'Restaurou dados através de arquivo JSON.');
                alert('Backup restaurado com sucesso!');
                renderAll();
            } else {
                alert('Arquivo de backup inválido!');
            }
        } catch (err) {
            alert('Erro ao processar o arquivo JSON.');
        }
    };
    if (e.target.files[0]) {
        fileReader.readAsText(e.target.files[0]);
    }
}

// MASK & FUNÇÃO DE FILTRO NAS TABELAS
function filterTable(tableId, query) {
    const table = document.getElementById(tableId);
    const trs = table.querySelectorAll('tbody tr');
    const q = query.toLowerCase();

    trs.forEach(tr => {
        const text = tr.innerText.toLowerCase();
        tr.style.display = text.includes(q) ? '' : 'none';
    });
}

// ABRE/FECHA MODAL
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    // Limpa formulários internos caso existam
    const form = document.querySelector(`#${modalId} form`);
    if (form && modalId !== 'modal-ajuste-estoque') {
        form.reset();
        const hiddenId = form.querySelector('input[type="hidden"]');
        if (hiddenId) hiddenId.value = '';
    }
}