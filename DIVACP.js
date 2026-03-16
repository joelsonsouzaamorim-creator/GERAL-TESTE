const loggedUser = 'USUÁRIO LOGADO';
const systemPassword = '1234';

const navTabs = document.querySelectorAll('.nav-tab');
const pages = document.querySelectorAll('.page');

const openProcessBtn = document.getElementById('openProcessBtn');
const openProcessBtnAndamento = document.getElementById('openProcessBtnAndamento');
const openProcessBtnLicitacao = document.getElementById('openProcessBtnLicitacao');
const openProcessBtnDiarios = document.getElementById('openProcessBtnDiarios');
const backToPanelBtn = document.getElementById('backToPanelBtn');
const backToPanelFromDetailsBtn = document.getElementById('backToPanelFromDetailsBtn');
const editProcessBtn = document.getElementById('editProcessBtn');
const deleteProcessBtn = document.getElementById('deleteProcessBtn');
const saveEditProcessBtn = document.getElementById('saveEditProcessBtn');
const cancelEditProcessBtn = document.getElementById('cancelEditProcessBtn');

const detailsViewCard = document.getElementById('detailsViewCard');
const detailsEditCard = document.getElementById('detailsEditCard');
const processForm = document.getElementById('processForm');
const divacpProcessTableBody = document.getElementById('divacpProcessTableBody');
const licitacaoTableBody = document.getElementById('licitacaoTableBody');
const licitacaoProcessoInput = document.getElementById('licitacaoProcessoInput');
const licitacaoAnoInput = document.getElementById('licitacaoAnoInput');
const generateLicitacaoBtn = document.getElementById('generateLicitacaoBtn');
const licitacaoModalidadeButtons = document.querySelectorAll('.licitacao-modalidade');
const filterStatus = document.getElementById('filterStatus');
const toast = document.getElementById('toast');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const andamentoList = document.getElementById('andamentoList');
const andamentoEmpty = document.getElementById('andamentoEmpty');

const nrProcessoInput = document.getElementById('nrProcesso');
const numeroPregaoInput = document.getElementById('numeroPregao');
const valorEstimadoInput = document.getElementById('valorEstimado');
const editValorEstimadoInput = document.getElementById('editValorEstimado');

const sendModalOverlay = document.getElementById('sendModalOverlay');
const closeSendModalBtn = document.getElementById('closeSendModalBtn');
const cancelSendModalBtn = document.getElementById('cancelSendModalBtn');
const confirmSendBtn = document.getElementById('confirmSendBtn');
const sendDestino = document.getElementById('sendDestino');
const sendData = document.getElementById('sendData');

let currentDetailRow = null;
let selectedLicitacaoModalidade = '';
let currentSearch = '';
let processIdCounter = 100;
let currentSendRow = null;

// Lista em memória dos processos encaminhados (para a aba ANDAMENTO)
let andamentoProcessos = [];

// Lista em memória dos processos enviados (mantidos no NR. LICITAÇÃO mesmo após envio)
let processosEnviados = [];

const detailMap = {
  'nr-processo': 'nrProcesso',
  'data-entrada-selic': 'dataEntradaSelic',
  'orgao': 'orgao',
  'objeto': 'objeto',
  'modalidade': 'modalidade',
  'nr-licitacao': 'nrLicitacao',
  'fonte': 'fonte',
  'setor': 'setor',
  'valor-estimado': 'valorEstimado',
  'ano-licitacao': 'anoLicitacao',
  'data-entrada-divcon': 'dataEntradaDivcon',
  'responsavel-minuta': 'responsavelMinuta',
  'status-divcon': 'statusDivcon',
  'itens-lote': 'itensLote',
  'responsavel': 'responsavel',
  'data-inicial': 'dataInicial',
  'data-final': 'dataFinal',
  'data-abertura': 'dataAbertura',
  'hora': 'hora',
  'valor-deserto': 'valorDeserto',
  'valor-estimado-atualizado': 'valorEstimadoAtualizado',
  'andamento': 'andamento',
  'sei-planilha': 'seiPlanilha',
  'valor-adjudicado': 'valorAdjudicado',
  'status': 'status',
  'setor-responsavel': 'setorResponsavel'
};

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(function () {
    toast.classList.remove('show');
  }, 2600);
}

function getDefaultLicitacaoValue() {
  return 'XXX/2026';
}

function applyDefaultLicitacaoValue() {
  if (numeroPregaoInput) {
    numeroPregaoInput.value = getDefaultLicitacaoValue();
  }
}

function getCurrentUserName() {
  return loggedUser;
}

function normalizeModalidade(modalidade) {
  return (modalidade || '').trim().toUpperCase().replace(/\s+/g, ' ');
}

function modalidadeBase(modalidade) {
  const text = normalizeModalidade(modalidade);
  if (text.includes('PREGÃO ELETRÔNICO')) return 'PREGÃO ELETRÔNICO';
  if (text.includes('CONCORRÊNCIA')) return 'CONCORRÊNCIA';
  if (text.includes('CHAMAMENTO PÚBLICO')) return 'CHAMAMENTO PÚBLICO';
  if (text.includes('SELEÇÃO DE CONSULTOR INDIVIDUAL')) return 'SELEÇÃO DE CONSULTOR INDIVIDUAL';
  return text;
}

function isPlaceholderLicitacao(value) {
  const text = (value || '').trim().toUpperCase();
  return text === '' || text === '-' || text.startsWith('XXX/');
}

function getInboxKeyByDestino(destino) {
  const mapa = {
    'DIVCON': 'caixa_divcon_recebidos',
    'CPC': 'caixa_cpc_recebidos',
    'CEC': 'caixa_cec_recebidos',
    'ASSESSORIA': 'caixa_assessoria_recebidos',
    'ARQUIVO': 'caixa_arquivo_recebidos'
  };
  return mapa[destino] || 'caixa_outros_recebidos';
}

function saveProcessToDestino(row, destino, dataEnvio) {
  const inboxKey = getInboxKeyByDestino(destino);
  const listaAtual = JSON.parse(localStorage.getItem(inboxKey) || '[]');

  const processo = {
    id: row.dataset.id || '',
    nrProcesso: row.dataset.nrProcesso || '-',
    dataEntradaSelic: row.dataset.dataEntradaSelic || '-',
    orgao: row.dataset.orgao || '-',
    objeto: row.dataset.objeto || '-',
    modalidade: row.dataset.modalidade || '-',
    nrLicitacao: row.dataset.nrLicitacao || '-',
    fonte: row.dataset.fonte || '-',
    setor: row.dataset.setor || '-',
    valorEstimado: row.dataset.valorEstimado || '-',
    anoLicitacao: row.dataset.anoLicitacao || '-',
    dataEntradaDivcon: dataEnvio || '-',
    responsavelMinuta: row.dataset.responsavelMinuta || '-',
    statusDivcon: 'RECEBIDO DE DIVACP',
    itensLote: row.dataset.itensLote || '-',
    responsavel: row.dataset.responsavel || '-',
    dataInicial: row.dataset.dataInicial || '-',
    dataFinal: row.dataset.dataFinal || '-',
    dataAbertura: row.dataset.dataAbertura || '-',
    hora: row.dataset.hora || '-',
    valorDeserto: row.dataset.valorDeserto || '-',
    valorEstimadoAtualizado: row.dataset.valorEstimadoAtualizado || '-',
    andamento: 'RECEBIDO DA DIVACP EM ' + dataEnvio,
    seiPlanilha: row.dataset.seiPlanilha || '-',
    valorAdjudicado: row.dataset.valorAdjudicado || '-',
    status: row.dataset.status || 'ABERTO',
    setorResponsavel: destino,
    enviadoPor: getCurrentUserName(),
    dataEnvio: dataEnvio,
    origem: 'DIVACP',
    recebidoEm: new Date().toISOString()
  };

  const indiceExistente = listaAtual.findIndex(function (item) {
    return item.id === processo.id && processo.id !== '';
  });

  if (indiceExistente >= 0) {
    listaAtual[indiceExistente] = processo;
  } else {
    listaAtual.push(processo);
  }

  localStorage.setItem(inboxKey, JSON.stringify(listaAtual));

  // Adiciona na lista de andamento em memória
  addAndamentoItem(processo);
}

// ===== ANDAMENTO: adicionar linha na tabela =====
function addAndamentoItem(processo) {
  const tbody = document.getElementById('andamentoTableBody');

  // Remove linha vazia se existir
  const emptyRow = document.getElementById('andamentoEmptyRow');
  if (emptyRow) emptyRow.remove();

  const tr = document.createElement('tr');
  tr.dataset.andamentoProcesso = JSON.stringify(processo);

  tr.innerHTML =
    '<td>' + (processo.nrProcesso || '-') + '</td>' +
    '<td>' + (processo.dataEntradaSelic || '-') + '</td>' +
    '<td>' + (processo.orgao || '-') + '</td>' +
    '<td class="objeto-cell">' + (processo.objeto || '-') + '</td>' +
    '<td>' + (processo.modalidade || '-') + '</td>' +
    '<td>' + (processo.nrLicitacao || '-') + '</td>' +
    '<td>' + (processo.fonte || '-') + '</td>' +
    '<td>' + (processo.setor || '-') + '</td>' +
    '<td>' + (processo.setorResponsavel || '-') + '</td>' +
    '<td>' + (processo.dataEnvio || '-') + '</td>' +
    '<td class="actions-cell">' +
      '<button class="btn-eye btn-view-andamento" type="button" title="VER DETALHES">👁</button>' +
    '</td>';

  tbody.prepend(tr);
}

function openViewAndamentoModal(processo) {
  const grid = document.getElementById('viewAndamentoGrid');
  const fields = [
    ['NR. PROCESSO', processo.nrProcesso],
    ['DATA ENTRADA SELIC', processo.dataEntradaSelic],
    ['ÓRGÃO', processo.orgao],
    ['MODALIDADE', processo.modalidade],
    ['NR. LICITAÇÃO', processo.nrLicitacao],
    ['FONTE', processo.fonte],
    ['SETOR', processo.setor],
    ['VALOR ESTIMADO', processo.valorEstimado],
    ['ANO LICITAÇÃO', processo.anoLicitacao],
    ['DATA ENTRADA DIVCON/CPC/CEC', processo.dataEntradaDivcon],
    ['RESPONSÁVEL MINUTA', processo.responsavelMinuta],
    ['STATUS DIVCON', processo.statusDivcon],
    ['ITENS/LOTE', processo.itensLote],
    ['RESPONSÁVEL', processo.responsavel],
    ['DATA INICIAL', processo.dataInicial],
    ['DATA FINAL', processo.dataFinal],
    ['DATA DE ABERTURA', processo.dataAbertura],
    ['HORA', processo.hora],
    ['ANDAMENTO', processo.andamento],
    ['VALOR DESERTO/FRACASSADO', processo.valorDeserto],
    ['SEI PLANILHA', processo.seiPlanilha],
    ['VALOR ESTIMADO ATUALIZADO', processo.valorEstimadoAtualizado],
    ['VALOR ADJUDICADO', processo.valorAdjudicado],
    ['STATUS', processo.status],
    ['ENVIADO PARA', processo.setorResponsavel],
    ['DATA DO ENVIO', processo.dataEnvio],
    ['ENVIADO POR', processo.enviadoPor],
    ['SETOR DE ORIGEM', processo.origem]
  ];

  grid.innerHTML =
    '<div class="view-andamento-objeto">' +
      '<div class="detail-label">OBJETO</div>' +
      '<div class="detail-value justified">' + (processo.objeto || '-') + '</div>' +
    '</div>' +
    fields.map(function(f) {
      return '<div class="detail-item">' +
        '<div class="detail-label">' + f[0] + '</div>' +
        '<div class="detail-value">' + (f[1] || '-') + '</div>' +
      '</div>';
    }).join('');

  document.getElementById('viewAndamentoModalOverlay').classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeViewAndamentoModal() {
  document.getElementById('viewAndamentoModalOverlay').classList.remove('show');
  document.body.style.overflow = '';
}

function showPage(pageId) {
  pages.forEach(function (page) {
    page.classList.add('hidden');
  });

  const target = document.getElementById(pageId);
  if (target) {
    target.classList.remove('hidden');
  }

  navTabs.forEach(function (button) {
    button.classList.toggle('active', button.dataset.page === pageId);
  });

  closeAllDropdowns();
  closeAllActionMenus();
}

function closeAllDropdowns() {
  document.querySelectorAll('.profile-dropdown').forEach(function (drop) {
    drop.classList.remove('show');
  });
}

function closeAllActionMenus() {
  document.querySelectorAll('.actions-menu').forEach(function (menu) {
    menu.classList.remove('show');
  });
}

function formatDateBR(value) {
  if (!value) return '-';
  if (typeof value !== 'string') return '-';
  if (value.includes('/')) return value;

  const parts = value.split('-');
  if (parts.length !== 3) return '-';

  return parts[2] + '/' + parts[1] + '/' + parts[0];
}

function formatDateISO(value) {
  if (!value || typeof value !== 'string' || !value.includes('/')) return '';
  const parts = value.split('/');
  if (parts.length !== 3) return '';
  return parts[2] + '-' + parts[1] + '-' + parts[0];
}

function formatDateTimeBR(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'medium'
  }).format(date);
}

function formatCurrencyBR(value) {
  const digits = String(value).replace(/\D/g, '');
  if (!digits) return '';
  const number = Number(digits) / 100;
  return number.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function applyProcessMask(value) {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 21);
  let result = '';

  if (digits.length > 0) result += digits.slice(0, 4);
  if (digits.length > 4) result += '.' + digits.slice(4, 10);
  if (digits.length > 10) result += '.' + digits.slice(10, 15);
  if (digits.length > 15) result += '/' + digits.slice(15, 19);
  if (digits.length > 19) result += '-' + digits.slice(19, 21);

  return result;
}

function createActionsButtons() {
  return '' +
    '<div class="row-menu-wrap">' +
      '<button class="menu-trigger" type="button" title="OPÇÕES">⋮</button>' +
      '<div class="actions-menu">' +
        '<button class="menu-item menu-open btn-open" type="button">' +
          '<span class="menu-icon">📂</span>' +
          '<span>ABRIR</span>' +
        '</button>' +
        '<button class="menu-item menu-send btn-send" type="button">' +
          '<span class="menu-icon">📤</span>' +
          '<span>ENVIAR</span>' +
        '</button>' +
        '<button class="menu-item menu-edit btn-edit-row" type="button">' +
          '<span class="menu-icon">✏️</span>' +
          '<span>EDITAR</span>' +
        '</button>' +
        '<button class="menu-item menu-delete btn-delete-row" type="button">' +
          '<span class="menu-icon">🗑️</span>' +
          '<span>EXCLUIR</span>' +
        '</button>' +
      '</div>' +
    '</div>';
}

function fillDetails(row) {
  Object.keys(detailMap).forEach(function (elementSuffix) {
    const datasetKey = detailMap[elementSuffix];
    const target = document.getElementById('detail-' + elementSuffix);
    if (target) {
      target.textContent = row.dataset[datasetKey] || '-';
    }
  });
}

function sortProcessTableByArrival() {
  const rows = Array.from(divacpProcessTableBody.querySelectorAll('tr'));
  rows.sort(function (a, b) {
    const aTime = new Date(a.dataset.createdAt || 0).getTime();
    const bTime = new Date(b.dataset.createdAt || 0).getTime();
    return aTime - bTime;
  });
  rows.forEach(function (row) {
    divacpProcessTableBody.appendChild(row);
  });
}

function applySearchFilter() {
  const rows = Array.from(divacpProcessTableBody.querySelectorAll('tr'));
  const value = (currentSearch || '').trim().toUpperCase();

  rows.forEach(function (row) {
    if (!value) {
      row.style.display = '';
      return;
    }

    const searchable = [
      row.dataset.nrProcesso || '',
      row.dataset.dataEntradaSelic || '',
      row.dataset.orgao || '',
      row.dataset.objeto || '',
      row.dataset.modalidade || '',
      row.dataset.nrLicitacao || '',
      row.dataset.fonte || '',
      row.dataset.setor || ''
    ].join(' ').toUpperCase();

    row.style.display = searchable.includes(value) ? '' : 'none';
  });
}

function rebuildLicitacaoTable() {
  licitacaoTableBody.innerHTML = '';

  if (!selectedLicitacaoModalidade) {
    filterStatus.textContent = 'SELECIONE UMA MODALIDADE';
    return;
  }

  filterStatus.textContent = 'FILTRANDO: ' + selectedLicitacaoModalidade;

  // Processos ainda no painel
  const rowsAtivos = Array.from(divacpProcessTableBody.querySelectorAll('tr'))
    .filter(function (row) {
      return modalidadeBase(row.dataset.modalidade) === selectedLicitacaoModalidade;
    })
    .filter(function (row) {
      return !isPlaceholderLicitacao(row.dataset.nrLicitacao);
    })
    .map(function (row) {
      return {
        id: row.dataset.id || '',
        nrProcesso: row.dataset.nrProcesso || '-',
        nrLicitacao: row.dataset.nrLicitacao || '-',
        orgao: row.dataset.orgao || '-',
        modalidade: row.dataset.modalidade || '-',
        objeto: row.dataset.objeto || '-',
        enviado: false
      };
    });

  // Processos já enviados (removidos do painel mas com licitação válida)
  const rowsEnviados = processosEnviados
    .filter(function (p) {
      return modalidadeBase(p.modalidade) === selectedLicitacaoModalidade;
    })
    .filter(function (p) {
      return !isPlaceholderLicitacao(p.nrLicitacao);
    })
    // Evita duplicatas com os ativos (caso recarregue)
    .filter(function (p) {
      return !rowsAtivos.find(function (a) { return a.id === p.id; });
    })
    .map(function (p) {
      return {
        id: p.id || '',
        nrProcesso: p.nrProcesso || '-',
        nrLicitacao: p.nrLicitacao || '-',
        orgao: p.orgao || '-',
        modalidade: p.modalidade || '-',
        objeto: p.objeto || '-',
        enviado: true
      };
    });

  const todos = rowsAtivos.concat(rowsEnviados);

  todos.sort(function (a, b) {
    const aNumber = parseInt((a.nrLicitacao || '0').split('/')[0], 10) || 0;
    const bNumber = parseInt((b.nrLicitacao || '0').split('/')[0], 10) || 0;
    if (aNumber !== bNumber) return aNumber - bNumber;
    const aYear = parseInt((a.nrLicitacao || '0').split('/')[1], 10) || 0;
    const bYear = parseInt((b.nrLicitacao || '0').split('/')[1], 10) || 0;
    return aYear - bYear;
  });

  todos.forEach(function (item) {
    const tr = document.createElement('tr');
    tr.dataset.processId = item.id;
    if (item.enviado) {
      tr.classList.add('licitacao-row-enviado');
    }
    tr.innerHTML =
      '<td>' + item.nrProcesso + '</td>' +
      '<td>' + item.nrLicitacao + '</td>' +
      '<td>' + item.orgao + '</td>' +
      '<td>' + item.modalidade + '</td>' +
      '<td class="objeto-cell">' + item.objeto + '</td>' +
      '<td>' +
        '<div class="row-actions">' +
          (item.enviado
            ? '<span class="licitacao-enviado-badge">ENVIADO</span>'
            : '<button class="btn btn-light btn-small btn-edit-licitacao" type="button">EDITAR</button>' +
              '<button class="btn btn-danger btn-small btn-delete-licitacao" type="button">EXCLUIR</button>'
          ) +
        '</div>' +
      '</td>';
    licitacaoTableBody.appendChild(tr);
  });
}

function openDetailsFromRow(row) {
  currentDetailRow = row;
  fillDetails(row);
  detailsViewCard.classList.remove('hidden-block');
  detailsEditCard.classList.add('hidden-block');
  editProcessBtn.classList.remove('hidden-block');
  deleteProcessBtn.classList.remove('hidden-block');
  backToPanelFromDetailsBtn.classList.remove('hidden-block');
  saveEditProcessBtn.classList.add('hidden-block');
  cancelEditProcessBtn.classList.add('hidden-block');
  showPage('detalhes-processo');
}

function enterEditMode() {
  if (!currentDetailRow) return;

  document.getElementById('editNrProcesso').value = currentDetailRow.dataset.nrProcesso || '';
  document.getElementById('editDataEntradaSelic').value = formatDateISO(currentDetailRow.dataset.dataEntradaSelic || '');
  document.getElementById('editOrgao').value = currentDetailRow.dataset.orgao || '';
  document.getElementById('editObjeto').value = currentDetailRow.dataset.objeto || '';
  document.getElementById('editModalidade').value = currentDetailRow.dataset.modalidade || '';
  document.getElementById('editNrLicitacao').value = currentDetailRow.dataset.nrLicitacao || '';
  document.getElementById('editFonte').value = currentDetailRow.dataset.fonte || '';
  document.getElementById('editSetor').value = currentDetailRow.dataset.setor || '';
  document.getElementById('editValorEstimado').value = currentDetailRow.dataset.valorEstimado || '';

  detailsViewCard.classList.add('hidden-block');
  detailsEditCard.classList.remove('hidden-block');
  editProcessBtn.classList.add('hidden-block');
  deleteProcessBtn.classList.add('hidden-block');
  backToPanelFromDetailsBtn.classList.add('hidden-block');
  saveEditProcessBtn.classList.remove('hidden-block');
  cancelEditProcessBtn.classList.remove('hidden-block');

  refreshValidationIcons();
}

function exitEditMode() {
  detailsViewCard.classList.remove('hidden-block');
  detailsEditCard.classList.add('hidden-block');
  editProcessBtn.classList.remove('hidden-block');
  deleteProcessBtn.classList.remove('hidden-block');
  backToPanelFromDetailsBtn.classList.remove('hidden-block');
  saveEditProcessBtn.classList.add('hidden-block');
  cancelEditProcessBtn.classList.add('hidden-block');
}

function updateRowVisibleColumns(row) {
  row.children[0].textContent = row.dataset.nrProcesso || '-';
  row.children[1].textContent = row.dataset.dataEntradaSelic || '-';
  row.children[2].textContent = row.dataset.orgao || '-';
  row.children[3].textContent = row.dataset.objeto || '-';
  row.children[4].textContent = row.dataset.modalidade || '-';
  row.children[5].textContent = row.dataset.nrLicitacao || '-';
  row.children[6].textContent = row.dataset.fonte || '-';
  row.children[7].textContent = row.dataset.setor || '-';
}

function selectLicitacaoModalidade(modalidade) {
  selectedLicitacaoModalidade = modalidadeBase(modalidade);

  licitacaoModalidadeButtons.forEach(function (button) {
    button.classList.toggle(
      'active',
      modalidadeBase(button.dataset.modalidade) === selectedLicitacaoModalidade
    );
  });

  rebuildLicitacaoTable();
}

function generateNextLicitacaoNumber(year, modalidadeSelecionada) {
  const rows = Array.from(divacpProcessTableBody.querySelectorAll('tr'));
  const usedNumbers = [];

  // Conta os do painel
  rows.forEach(function (row) {
    const value = row.dataset.nrLicitacao || '';
    const rowBase = modalidadeBase(row.dataset.modalidade);
    if (rowBase !== modalidadeSelecionada) return;
    if (!value || value === '-' || !value.includes('/')) return;
    if (value.toUpperCase().startsWith('XXX/')) return;
    const parts = value.split('/');
    if (String(parts[1]) !== String(year)) return;
    const parsed = parseInt(parts[0], 10);
    if (!isNaN(parsed)) usedNumbers.push(parsed);
  });

  // Conta os já enviados
  processosEnviados.forEach(function (p) {
    const value = p.nrLicitacao || '';
    const rowBase = modalidadeBase(p.modalidade);
    if (rowBase !== modalidadeSelecionada) return;
    if (!value || value === '-' || !value.includes('/')) return;
    if (value.toUpperCase().startsWith('XXX/')) return;
    const parts = value.split('/');
    if (String(parts[1]) !== String(year)) return;
    const parsed = parseInt(parts[0], 10);
    if (!isNaN(parsed)) usedNumbers.push(parsed);
  });

  usedNumbers.sort(function (a, b) { return a - b; });

  let nextAvailable = 1;
  for (let i = 0; i < usedNumbers.length; i++) {
    if (usedNumbers[i] === nextAvailable) {
      nextAvailable += 1;
    } else if (usedNumbers[i] > nextAvailable) {
      break;
    }
  }

  return String(nextAvailable).padStart(3, '0') + '/' + year;
}

function findProcessRowByNumber(processNumber) {
  const rows = Array.from(divacpProcessTableBody.querySelectorAll('tr'));
  return rows.find(function (row) {
    return (row.dataset.nrProcesso || '').toUpperCase() === processNumber.toUpperCase();
  }) || null;
}

function findProcessRowById(id) {
  const rows = Array.from(divacpProcessTableBody.querySelectorAll('tr'));
  return rows.find(function (row) {
    return (row.dataset.id || '') === id;
  }) || null;
}

function confirmDeleteWithPassword(processo) {
  const confirmation = window.confirm('TEM CERTEZA QUE DESEJA EXCLUIR ' + processo + '?');
  if (!confirmation) return null;

  const senha = window.prompt('INFORME A SENHA PARA CONFIRMAR A EXCLUSÃO:') || '';
  if (senha !== systemPassword) {
    showToast('SENHA INCORRETA. EXCLUSÃO CANCELADA.');
    return null;
  }

  return getCurrentUserName();
}

function confirmEditUser() {
  return getCurrentUserName();
}

function setStatusIcon(iconId, ok, warn) {
  const icon = document.getElementById(iconId);
  if (!icon) return;

  icon.className = 'status-icon';

  if (ok) {
    icon.textContent = '✔';
    icon.classList.add('ok');
  } else if (warn) {
    icon.textContent = '⚠';
    icon.classList.add('warn');
  } else {
    icon.textContent = '✔';
    icon.classList.add('neutral');
  }
}

function refreshValidationIcons() {
  const nrProcesso = (document.getElementById('nrProcesso') || {}).value ? document.getElementById('nrProcesso').value.trim() : '';
  const dataEntradaSelic = (document.getElementById('dataEntradaSelic') || {}).value ? document.getElementById('dataEntradaSelic').value.trim() : '';
  const orgao = (document.getElementById('orgao') || {}).value ? document.getElementById('orgao').value.trim() : '';
  const modalidade = (document.getElementById('modalidadeFonte') || {}).value ? document.getElementById('modalidadeFonte').value.trim() : '';
  const numeroPregao = (document.getElementById('numeroPregao') || {}).value ? document.getElementById('numeroPregao').value.trim() : '';
  const fonteCadastro = (document.getElementById('fonteCadastro') || {}).value ? document.getElementById('fonteCadastro').value.trim() : '';
  const setorCadastro = (document.getElementById('setorCadastro') || {}).value ? document.getElementById('setorCadastro').value.trim() : '';
  const valorEstimado = (document.getElementById('valorEstimado') || {}).value ? document.getElementById('valorEstimado').value.trim() : '';
  const objeto = (document.getElementById('objeto') || {}).value ? document.getElementById('objeto').value.trim() : '';

  setStatusIcon('statusNrProcesso', nrProcesso.length >= 10, nrProcesso.length > 0 && nrProcesso.length < 10);
  setStatusIcon('statusDataEntradaSelic', !!dataEntradaSelic, false);
  setStatusIcon('statusOrgao', orgao.length >= 2, orgao.length > 0 && orgao.length < 2);
  setStatusIcon('statusModalidade', !!modalidade, false);
  setStatusIcon('statusNumeroPregao', !!numeroPregao, false);
  setStatusIcon('statusFonteCadastro', fonteCadastro.length >= 2, fonteCadastro.length > 0 && fonteCadastro.length < 2);
  setStatusIcon('statusSetorCadastro', !!setorCadastro, false);
  setStatusIcon('statusValorEstimado', valorEstimado.startsWith('R$') && valorEstimado.length > 4, valorEstimado.length > 0 && !(valorEstimado.startsWith('R$') && valorEstimado.length > 4));

  const editNrProcesso = document.getElementById('editNrProcesso');
  const editDataEntradaSelic = document.getElementById('editDataEntradaSelic');
  const editOrgao = document.getElementById('editOrgao');
  const editModalidade = document.getElementById('editModalidade');
  const editNrLicitacao = document.getElementById('editNrLicitacao');
  const editFonte = document.getElementById('editFonte');
  const editSetor = document.getElementById('editSetor');
  const editValorEstimado = document.getElementById('editValorEstimado');
  const editObjeto = document.getElementById('editObjeto');

  if (editNrProcesso) {
    setStatusIcon('statusEditNrProcesso', editNrProcesso.value.trim().length >= 10, editNrProcesso.value.trim().length > 0 && editNrProcesso.value.trim().length < 10);
  }
  if (editDataEntradaSelic) {
    setStatusIcon('statusEditDataEntradaSelic', !!editDataEntradaSelic.value.trim(), false);
  }
  if (editOrgao) {
    setStatusIcon('statusEditOrgao', editOrgao.value.trim().length >= 2, editOrgao.value.trim().length > 0 && editOrgao.value.trim().length < 2);
  }
  if (editModalidade) {
    setStatusIcon('statusEditModalidade', !!editModalidade.value.trim(), false);
  }
  if (editNrLicitacao) {
    setStatusIcon('statusEditNrLicitacao', !!editNrLicitacao.value.trim(), false);
  }
  if (editFonte) {
    setStatusIcon('statusEditFonte', editFonte.value.trim().length >= 2, editFonte.value.trim().length > 0 && editFonte.value.trim().length < 2);
  }
  if (editSetor) {
    setStatusIcon('statusEditSetor', !!editSetor.value.trim(), false);
  }
  if (editValorEstimado) {
    const ev = editValorEstimado.value.trim();
    setStatusIcon('statusEditValorEstimado', ev.startsWith('R$') && ev.length > 4, ev.length > 0 && !(ev.startsWith('R$') && ev.length > 4));
  }

  if (licitacaoProcessoInput) {
    setStatusIcon('statusLicitacaoProcesso', licitacaoProcessoInput.value.trim().length >= 10, licitacaoProcessoInput.value.trim().length > 0 && licitacaoProcessoInput.value.trim().length < 10);
  }
  if (licitacaoAnoInput) {
    setStatusIcon('statusLicitacaoAno', !!licitacaoAnoInput.value.trim(), false);
  }

  const objetoField = document.getElementById('objeto');
  if (objetoField) {
    if (objeto.length === 0) {
      objetoField.style.borderColor = '#e5e7eb';
    } else if (objeto.length < 5) {
      objetoField.style.borderColor = '#f59e0b';
    } else {
      objetoField.style.borderColor = '#16a34a';
    }
  }

  if (editObjeto) {
    const editValue = editObjeto.value.trim();
    if (editValue.length === 0) {
      editObjeto.style.borderColor = '#e5e7eb';
    } else if (editValue.length < 5) {
      editObjeto.style.borderColor = '#f59e0b';
    } else {
      editObjeto.style.borderColor = '#16a34a';
    }
  }
}

function openSendModal(row) {
  currentSendRow = row;

  document.getElementById('sendModalNrProcesso').textContent = row.dataset.nrProcesso || '-';
  document.getElementById('sendModalOrgao').textContent = row.dataset.orgao || '-';
  document.getElementById('sendModalModalidade').textContent = row.dataset.modalidade || '-';
  document.getElementById('sendModalNrLicitacao').textContent = row.dataset.nrLicitacao || '-';

  sendDestino.value = '';
  sendData.value = new Date().toISOString().split('T')[0];

  sendModalOverlay.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeSendModal() {
  sendModalOverlay.classList.remove('show');
  document.body.style.overflow = '';
  currentSendRow = null;
}

function applyUpperCaseInputBehavior(selector) {
  document.querySelectorAll(selector).forEach(function (field) {
    field.addEventListener('input', function (event) {
      if (
        event.target.id === 'valorEstimado' ||
        event.target.id === 'editValorEstimado' ||
        event.target.id === 'nrProcesso' ||
        event.target.id === 'editNrProcesso'
      ) {
        return;
      }

      const start = event.target.selectionStart;
      const end = event.target.selectionEnd;
      event.target.value = event.target.value.toUpperCase();

      if (typeof start === 'number' && typeof end === 'number') {
        event.target.setSelectionRange(start, end);
      }

      refreshValidationIcons();
    });
  });
}

function openEditFromRow(row) {
  openDetailsFromRow(row);
  enterEditMode();
}

function deleteProcessRow(row) {
  const processNumber = row.dataset.nrProcesso || '';
  const usuario = confirmDeleteWithPassword(processNumber);
  if (!usuario) return;

  if (currentDetailRow && currentDetailRow.dataset.id === row.dataset.id) {
    currentDetailRow = null;
  }

  row.remove();

  rebuildLicitacaoTable();
  applySearchFilter();
  closeAllActionMenus();
  showToast('PROCESSO EXCLUÍDO COM SUCESSO. O NÚMERO DA LICITAÇÃO FICOU DISPONÍVEL NOVAMENTE.');
}

applyUpperCaseInputBehavior('#processForm input[type="text"], #processForm textarea, #editProcessForm input[type="text"], #editProcessForm textarea, #searchInput');

if (nrProcessoInput) {
  nrProcessoInput.addEventListener('input', function (event) {
    event.target.value = applyProcessMask(event.target.value);
    refreshValidationIcons();
  });
}

if (licitacaoProcessoInput) {
  licitacaoProcessoInput.addEventListener('input', function (event) {
    event.target.value = applyProcessMask(event.target.value);
    refreshValidationIcons();
  });
}

const editNrProcessoField = document.getElementById('editNrProcesso');
if (editNrProcessoField) {
  editNrProcessoField.addEventListener('input', function (event) {
    event.target.value = applyProcessMask(event.target.value);
    refreshValidationIcons();
  });
}

if (valorEstimadoInput) {
  valorEstimadoInput.addEventListener('input', function (event) {
    event.target.value = formatCurrencyBR(event.target.value);
    refreshValidationIcons();
  });
}

if (editValorEstimadoInput) {
  editValorEstimadoInput.addEventListener('input', function (event) {
    event.target.value = formatCurrencyBR(event.target.value);
    refreshValidationIcons();
  });
}

const dataEntradaSelicEl = document.getElementById('dataEntradaSelic');
if (dataEntradaSelicEl) dataEntradaSelicEl.addEventListener('input', refreshValidationIcons);

const orgaoEl = document.getElementById('orgao');
if (orgaoEl) orgaoEl.addEventListener('input', refreshValidationIcons);

const modalidadeFonteEl = document.getElementById('modalidadeFonte');
if (modalidadeFonteEl) modalidadeFonteEl.addEventListener('change', refreshValidationIcons);

const numeroPregaoEl = document.getElementById('numeroPregao');
if (numeroPregaoEl) numeroPregaoEl.addEventListener('input', refreshValidationIcons);

const fonteCadastroEl = document.getElementById('fonteCadastro');
if (fonteCadastroEl) fonteCadastroEl.addEventListener('input', refreshValidationIcons);

const setorCadastroEl = document.getElementById('setorCadastro');
if (setorCadastroEl) setorCadastroEl.addEventListener('change', refreshValidationIcons);

const objetoEl = document.getElementById('objeto');
if (objetoEl) objetoEl.addEventListener('input', refreshValidationIcons);

const editDataEntradaSelicEl = document.getElementById('editDataEntradaSelic');
if (editDataEntradaSelicEl) editDataEntradaSelicEl.addEventListener('input', refreshValidationIcons);

const editOrgaoEl = document.getElementById('editOrgao');
if (editOrgaoEl) editOrgaoEl.addEventListener('input', refreshValidationIcons);

const editModalidadeEl = document.getElementById('editModalidade');
if (editModalidadeEl) editModalidadeEl.addEventListener('change', refreshValidationIcons);

const editNrLicitacaoEl = document.getElementById('editNrLicitacao');
if (editNrLicitacaoEl) editNrLicitacaoEl.addEventListener('input', refreshValidationIcons);

const editFonteEl = document.getElementById('editFonte');
if (editFonteEl) editFonteEl.addEventListener('input', refreshValidationIcons);

const editSetorEl = document.getElementById('editSetor');
if (editSetorEl) editSetorEl.addEventListener('change', refreshValidationIcons);

const editObjetoEl = document.getElementById('editObjeto');
if (editObjetoEl) editObjetoEl.addEventListener('input', refreshValidationIcons);

if (licitacaoAnoInput) {
  licitacaoAnoInput.addEventListener('input', refreshValidationIcons);
}

document.querySelectorAll('.profile-avatar').forEach(function (avatar) {
  avatar.addEventListener('click', function (event) {
    event.stopPropagation();
    const dropdown = avatar.parentElement.querySelector('.profile-dropdown');
    const isOpen = dropdown.classList.contains('show');
    closeAllDropdowns();
    if (!isOpen) dropdown.classList.add('show');
  });
});

document.querySelectorAll('.logoutBtn').forEach(function (btn) {
  btn.addEventListener('click', function () {
    showToast('SESSÃO ENCERRADA.');
    closeAllDropdowns();
  });
});

if (searchInput) {
  searchInput.addEventListener('input', function () {
    currentSearch = searchInput.value || '';
    applySearchFilter();
  });
}

if (clearSearchBtn) {
  clearSearchBtn.addEventListener('click', function () {
    currentSearch = '';
    searchInput.value = '';
    applySearchFilter();
  });
}

licitacaoModalidadeButtons.forEach(function (button) {
  button.addEventListener('click', function () {
    selectLicitacaoModalidade(button.dataset.modalidade);
  });
});

if (generateLicitacaoBtn) {
  generateLicitacaoBtn.addEventListener('click', function () {
    const processNumber = (licitacaoProcessoInput.value || '').trim().toUpperCase();
    const year = (licitacaoAnoInput.value || '').trim();

    if (!selectedLicitacaoModalidade) {
      showToast('SELECIONE UMA MODALIDADE.');
      return;
    }

    if (!processNumber) {
      showToast('INFORME O NR. PROCESSO CADASTRADO.');
      return;
    }

    if (!year) {
      showToast('INFORME O ANO.');
      return;
    }

    const row = findProcessRowByNumber(processNumber);

    if (!row) {
      showToast('NR. PROCESSO NÃO ENCONTRADO NO CADASTRO.');
      return;
    }

    const processBase = modalidadeBase(row.dataset.modalidade);

    if (!processBase) {
      showToast('ESSE PROCESSO ESTÁ SEM MODALIDADE CADASTRADA.');
      return;
    }

    if (processBase !== selectedLicitacaoModalidade) {
      showToast('ESSE PROCESSO NÃO PERTENCE A ' + selectedLicitacaoModalidade + '. ELE PERTENCE A ' + processBase + '.');
      return;
    }

    if (!isPlaceholderLicitacao(row.dataset.nrLicitacao)) {
      showToast('ESSE PROCESSO JÁ POSSUI NÚMERO DE LICITAÇÃO.');
      return;
    }

    const newLicitacaoNumber = generateNextLicitacaoNumber(year, selectedLicitacaoModalidade);

    row.dataset.nrLicitacao = newLicitacaoNumber;
    row.dataset.anoLicitacao = year;

    updateRowVisibleColumns(row);

    if (currentDetailRow && currentDetailRow.dataset.nrProcesso === row.dataset.nrProcesso) {
      fillDetails(row);
    }

    rebuildLicitacaoTable();
    licitacaoProcessoInput.value = '';
    refreshValidationIcons();
    showToast('LICITAÇÃO GERADA: ' + newLicitacaoNumber);
  });
}

if (closeSendModalBtn) {
  closeSendModalBtn.addEventListener('click', closeSendModal);
}

if (cancelSendModalBtn) {
  cancelSendModalBtn.addEventListener('click', closeSendModal);
}

if (sendModalOverlay) {
  sendModalOverlay.addEventListener('click', function (event) {
    if (event.target === sendModalOverlay) {
      closeSendModal();
    }
  });
}

document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape' && sendModalOverlay.classList.contains('show')) {
    closeSendModal();
  }
  if (event.key === 'Escape') {
    closeAllActionMenus();
  }
});

if (confirmSendBtn) {
  confirmSendBtn.addEventListener('click', function () {
    if (!currentSendRow) return;

    const destino = (sendDestino.value || '').trim().toUpperCase();
    const dataEnvio = sendData.value ? formatDateBR(sendData.value) : '-';

    if (!destino) {
      showToast('SELECIONE O DESTINO DO ENVIO.');
      return;
    }

    if (!sendData.value) {
      showToast('INFORME A DATA DO ENVIO.');
      return;
    }

    saveProcessToDestino(currentSendRow, destino, dataEnvio);

    // Guarda dados do processo enviado para manter no NR. LICITAÇÃO
    processosEnviados.push({
      id: currentSendRow.dataset.id || '',
      nrProcesso: currentSendRow.dataset.nrProcesso || '-',
      nrLicitacao: currentSendRow.dataset.nrLicitacao || '-',
      orgao: currentSendRow.dataset.orgao || '-',
      modalidade: currentSendRow.dataset.modalidade || '-',
      objeto: currentSendRow.dataset.objeto || '-',
      anoLicitacao: currentSendRow.dataset.anoLicitacao || '-'
    });

    const processoEnviado = currentSendRow.dataset.nrProcesso || '-';

    if (currentDetailRow && currentDetailRow.dataset.id === currentSendRow.dataset.id) {
      currentDetailRow = null;
      showPage('divacp');
    }

    currentSendRow.remove();
    rebuildLicitacaoTable();
    applySearchFilter();

    closeSendModal();
    showToast('PROCESSO ENVIADO PARA ' + destino + ' COM SUCESSO.');
  });
}

document.addEventListener('click', function (event) {
  if (!event.target.closest('.profile-menu')) {
    closeAllDropdowns();
  }

  if (!event.target.closest('.row-menu-wrap')) {
    closeAllActionMenus();
  }

  if (event.target.classList.contains('menu-trigger')) {
    event.stopPropagation();
    const wrap = event.target.closest('.row-menu-wrap');
    const menu = wrap ? wrap.querySelector('.actions-menu') : null;
    const isOpen = menu && menu.classList.contains('show');

    closeAllActionMenus();

    if (menu && !isOpen) {
      menu.classList.add('show');
    }
    return;
  }

  if (event.target.classList.contains('btn-send') || event.target.closest('.btn-send')) {
    const btn = event.target.classList.contains('btn-send') ? event.target : event.target.closest('.btn-send');
    const row = btn.closest('tr');
    closeAllActionMenus();
    if (row) {
      openSendModal(row);
    }
  }

  if (event.target.classList.contains('btn-open')) {
    const row = event.target.closest('tr');
    closeAllActionMenus();
    if (row && row.dataset) {
      openDetailsFromRow(row);
    }
  }

  if (event.target.classList.contains('btn-edit-row')) {
    const row = event.target.closest('tr');
    closeAllActionMenus();
    if (row) {
      openEditFromRow(row);
    }
  }

  if (event.target.classList.contains('btn-delete-row')) {
    const row = event.target.closest('tr');
    closeAllActionMenus();
    if (row) {
      deleteProcessRow(row);
    }
  }

  if (event.target.classList.contains('btn-edit-licitacao')) {
    const licitacaoRow = event.target.closest('tr');
    const processId = licitacaoRow ? (licitacaoRow.dataset.processId || '') : '';
    const processRow = findProcessRowById(processId);

    if (!processRow) {
      showToast('PROCESSO NÃO ENCONTRADO PARA EDIÇÃO.');
      return;
    }

    const usuario = confirmEditUser();
    if (!usuario) return;

    const atual = processRow.dataset.nrLicitacao || '';
    const novoNumero = (window.prompt('INFORME O NOVO NR. LICITAÇÃO:', atual) || '').trim().toUpperCase();

    if (!novoNumero) {
      showToast('EDIÇÃO CANCELADA.');
      return;
    }

    processRow.dataset.nrLicitacao = novoNumero;
    processRow.dataset.anoLicitacao = novoNumero.includes('/') ? novoNumero.split('/').pop() : '-';
    updateRowVisibleColumns(processRow);

    if (currentDetailRow && currentDetailRow.dataset.id === processRow.dataset.id) {
      fillDetails(processRow);
    }

    rebuildLicitacaoTable();
    showToast('NR. LICITAÇÃO EDITADO COM SUCESSO.');
  }

  if (event.target.classList.contains('btn-delete-licitacao')) {
    const licitacaoRow = event.target.closest('tr');
    const processId = licitacaoRow ? (licitacaoRow.dataset.processId || '') : '';
    const processRow = findProcessRowById(processId);

    if (!processRow) {
      showToast('PROCESSO NÃO ENCONTRADO PARA EXCLUSÃO.');
      return;
    }

    const numeroAnterior = processRow.dataset.nrLicitacao || '-';
    const usuario = confirmDeleteWithPassword(processRow.dataset.nrProcesso);
    if (!usuario) return;

    processRow.dataset.nrLicitacao = getDefaultLicitacaoValue();
    processRow.dataset.anoLicitacao = '-';
    updateRowVisibleColumns(processRow);

    if (currentDetailRow && currentDetailRow.dataset.id === processRow.dataset.id) {
      fillDetails(processRow);
    }

    rebuildLicitacaoTable();
    showToast('NR. LICITAÇÃO EXCLUÍDO COM SUCESSO.');
  }
});

navTabs.forEach(function (button) {
  button.addEventListener('click', function () {
    showPage(button.dataset.page);
  });
});

// Botão CADASTRAR PROCESSO em todas as abas
function goToCadastro() {
  applyDefaultLicitacaoValue();
  showPage('cadastro-processo');
  refreshValidationIcons();
}

if (openProcessBtn) {
  openProcessBtn.addEventListener('click', goToCadastro);
}
if (openProcessBtnAndamento) {
  openProcessBtnAndamento.addEventListener('click', goToCadastro);
}
if (openProcessBtnLicitacao) {
  openProcessBtnLicitacao.addEventListener('click', goToCadastro);
}
if (openProcessBtnDiarios) {
  openProcessBtnDiarios.addEventListener('click', goToCadastro);
}

if (backToPanelBtn) {
  backToPanelBtn.addEventListener('click', function () {
    showPage('divacp');
  });
}

if (backToPanelFromDetailsBtn) {
  backToPanelFromDetailsBtn.addEventListener('click', function () {
    exitEditMode();
    showPage('divacp');
  });
}

const sendFromDetailsBtn = document.getElementById('sendFromDetailsBtn');
if (sendFromDetailsBtn) {
  sendFromDetailsBtn.addEventListener('click', function () {
    if (!currentDetailRow) return;
    openSendModal(currentDetailRow);
  });
}

if (editProcessBtn) {
  editProcessBtn.addEventListener('click', function () {
    enterEditMode();
  });
}

if (cancelEditProcessBtn) {
  cancelEditProcessBtn.addEventListener('click', function () {
    exitEditMode();
  });
}

if (deleteProcessBtn) {
  deleteProcessBtn.addEventListener('click', function () {
    if (!currentDetailRow) return;

    const processNumber = currentDetailRow.dataset.nrProcesso || '';
    const usuario = confirmDeleteWithPassword(processNumber);
    if (!usuario) return;

    currentDetailRow.remove();
    currentDetailRow = null;

    rebuildLicitacaoTable();
    applySearchFilter();
    showPage('divacp');
    showToast('PROCESSO EXCLUÍDO COM SUCESSO. O NÚMERO DA LICITAÇÃO FICOU DISPONÍVEL NOVAMENTE.');
  });
}

if (saveEditProcessBtn) {
  saveEditProcessBtn.addEventListener('click', function () {
    if (!currentDetailRow) return;

    const usuario = confirmEditUser();
    if (!usuario) return;

    const nrProcesso = document.getElementById('editNrProcesso').value.trim();
    const dataEntradaSelic = document.getElementById('editDataEntradaSelic').value;
    const orgao = document.getElementById('editOrgao').value.trim().toUpperCase() || '-';
    const objeto = document.getElementById('editObjeto').value.trim().toUpperCase() || '-';
    const modalidade = document.getElementById('editModalidade').value.trim().toUpperCase() || '-';
    const nrLicitacao = document.getElementById('editNrLicitacao').value.trim().toUpperCase() || '-';
    const fonte = document.getElementById('editFonte').value.trim().toUpperCase() || '-';
    const setor = document.getElementById('editSetor').value.trim().toUpperCase() || '-';
    const valorEstimado = document.getElementById('editValorEstimado').value.trim() || '-';

    if (!nrProcesso) {
      showToast('INFORME O NÚMERO DO PROCESSO.');
      return;
    }

    const anterior = currentDetailRow.dataset.nrProcesso || '-';

    currentDetailRow.dataset.nrProcesso = nrProcesso;
    currentDetailRow.dataset.dataEntradaSelic = formatDateBR(dataEntradaSelic);
    currentDetailRow.dataset.orgao = orgao;
    currentDetailRow.dataset.objeto = objeto;
    currentDetailRow.dataset.modalidade = modalidade;
    currentDetailRow.dataset.nrLicitacao = nrLicitacao || '-';
    currentDetailRow.dataset.fonte = fonte;
    currentDetailRow.dataset.setor = setor;
    currentDetailRow.dataset.valorEstimado = valorEstimado;
    currentDetailRow.dataset.anoLicitacao = !isPlaceholderLicitacao(nrLicitacao) && nrLicitacao.includes('/') ? nrLicitacao.split('/').pop() : '-';

    updateRowVisibleColumns(currentDetailRow);
    fillDetails(currentDetailRow);

    rebuildLicitacaoTable();
    applySearchFilter();
    exitEditMode();
    showToast('PROCESSO EDITADO COM SUCESSO.');
  });
}

if (processForm) {
  processForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const nrProcesso = document.getElementById('nrProcesso').value.trim();
    const dataEntradaSelic = document.getElementById('dataEntradaSelic').value;
    const orgao = document.getElementById('orgao').value.trim().toUpperCase() || '-';
    const objeto = document.getElementById('objeto').value.trim().toUpperCase() || '-';
    const modalidade = document.getElementById('modalidadeFonte').value.trim().toUpperCase() || '-';
    const nrLicitacaoInput = document.getElementById('numeroPregao').value.trim().toUpperCase();
    const nrLicitacao = nrLicitacaoInput || getDefaultLicitacaoValue();
    const fonte = document.getElementById('fonteCadastro').value.trim().toUpperCase() || '-';
    const setor = document.getElementById('setorCadastro').value.trim().toUpperCase() || 'DIVACP';
    const valorEstimado = document.getElementById('valorEstimado').value.trim() || '-';
    const usuario = getCurrentUserName();

    if (!nrProcesso) {
      showToast('INFORME O NÚMERO DO PROCESSO.');
      return;
    }

    const now = new Date();
    const createdAt = now.toISOString();
    const processId = 'proc-' + processIdCounter++;
    const anoLicitacao = !isPlaceholderLicitacao(nrLicitacao) && nrLicitacao.includes('/') ? nrLicitacao.split('/').pop() : '-';

    divacpProcessTableBody.insertAdjacentHTML(
      'beforeend',
      '<tr ' +
        'data-id="' + processId + '" ' +
        'data-created-at="' + createdAt + '" ' +
        'data-nr-processo="' + nrProcesso + '" ' +
        'data-data-entrada-selic="' + formatDateBR(dataEntradaSelic) + '" ' +
        'data-orgao="' + orgao + '" ' +
        'data-objeto="' + objeto + '" ' +
        'data-modalidade="' + (modalidade || '-') + '" ' +
        'data-nr-licitacao="' + nrLicitacao + '" ' +
        'data-fonte="' + fonte + '" ' +
        'data-setor="' + setor + '" ' +
        'data-valor-estimado="' + valorEstimado + '" ' +
        'data-ano-licitacao="' + anoLicitacao + '" ' +
        'data-data-entrada-divcon="-" ' +
        'data-responsavel-minuta="-" ' +
        'data-status-divcon="-" ' +
        'data-itens-lote="-" ' +
        'data-responsavel="-" ' +
        'data-data-inicial="-" ' +
        'data-data-final="-" ' +
        'data-data-abertura="-" ' +
        'data-hora="-" ' +
        'data-valor-deserto="-" ' +
        'data-valor-estimado-atualizado="-" ' +
        'data-andamento="-" ' +
        'data-sei-planilha="-" ' +
        'data-valor-adjudicado="-" ' +
        'data-status="ABERTO" ' +
        'data-setor-responsavel="' + setor + '">' +
          '<td>' + nrProcesso + '</td>' +
          '<td>' + formatDateBR(dataEntradaSelic) + '</td>' +
          '<td>' + orgao + '</td>' +
          '<td class="objeto-cell">' + objeto + '</td>' +
          '<td>' + (modalidade || '-') + '</td>' +
          '<td>' + nrLicitacao + '</td>' +
          '<td>' + fonte + '</td>' +
          '<td>' + setor + '</td>' +
          '<td class="actions-cell">' + createActionsButtons() + '</td>' +
      '</tr>'
    );

    sortProcessTableByArrival();
    rebuildLicitacaoTable();
    applySearchFilter();
    processForm.reset();
    applyDefaultLicitacaoValue();
    refreshValidationIcons();
    showToast('PROCESSO CADASTRADO COM SUCESSO.');
    showPage('divacp');
  });
}

applyDefaultLicitacaoValue();
sortProcessTableByArrival();
rebuildLicitacaoTable();
applySearchFilter();
refreshValidationIcons();

// Botão olho - ANDAMENTO
document.addEventListener('click', function(event) {
  if (event.target.classList.contains('btn-view-andamento')) {
    const tr = event.target.closest('tr');
    if (!tr) return;
    try {
      const processo = JSON.parse(tr.dataset.andamentoProcesso || '{}');
      openViewAndamentoModal(processo);
    } catch(e) {}
  }
});

const closeViewAndamentoBtn = document.getElementById('closeViewAndamentoBtn');
const closeViewAndamentoFooterBtn = document.getElementById('closeViewAndamentoFooterBtn');
const viewAndamentoModalOverlay = document.getElementById('viewAndamentoModalOverlay');

if (closeViewAndamentoBtn) closeViewAndamentoBtn.addEventListener('click', closeViewAndamentoModal);
if (closeViewAndamentoFooterBtn) closeViewAndamentoFooterBtn.addEventListener('click', closeViewAndamentoModal);
if (viewAndamentoModalOverlay) {
  viewAndamentoModalOverlay.addEventListener('click', function(e) {
    if (e.target === viewAndamentoModalOverlay) closeViewAndamentoModal();
  });
}

document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape' && viewAndamentoModalOverlay && viewAndamentoModalOverlay.classList.contains('show')) {
    closeViewAndamentoModal();
  }
});

// ===== FILTROS DIÁRIOS =====
document.querySelectorAll('.diario-filtro-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.diario-filtro-btn').forEach(function(b) {
      b.classList.remove('active');
    });
    btn.classList.add('active');

    const filtro = btn.dataset.filtro;
    const rows = document.querySelectorAll('#diariosTableBody tr');
    rows.forEach(function(row) {
      if (filtro === 'TODOS' || filtro === 'GERAL') {
        row.style.display = '';
      } else {
        row.style.display = (row.dataset.diarioStatus === filtro) ? '' : 'none';
      }
    });
  });
});