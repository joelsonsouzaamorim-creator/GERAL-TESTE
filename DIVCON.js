const OPERADOR_SENHA = "1234";

const navTabs = document.querySelectorAll('.nav-tab');
const metricCards = document.querySelectorAll('.metric-card');
const searchInput = document.getElementById('pesquisa');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const tableBody = document.getElementById('divconTableBody');
const searchInfo = document.getElementById('searchInfo');

const notificationBtn = document.getElementById('notificationBtn');
const notificationBadge = document.getElementById('notificationBadge');
const notificationPanel = document.getElementById('notificationPanel');
const notificationList = document.getElementById('notificationList');
const clearNotificationsBtn = document.getElementById('clearNotificationsBtn');

const modal = document.getElementById('processModal');
const editModal = document.getElementById('editModal');

let currentFilter = 'recebidos';
let editingRow = null;

function getTableRows() {
  return document.querySelectorAll('#divconTableBody tr');
}

function hasActiveSearch() {
  return searchInput.value.trim() !== '';
}

function safeValue(value) {
  if (!value || !String(value).trim()) return '-';
  return String(value).trim().toUpperCase();
}

function forceUppercaseInput(element) {
  element.value = element.value.toUpperCase();
}

function setupUppercaseInputs() {
  document.querySelectorAll('input:not([readonly]), textarea').forEach(field => {
    field.addEventListener('input', function() {
      forceUppercaseInput(this);
    });
  });
}

function updateCounts() {
  const recebidos = document.querySelectorAll('#divconTableBody tr[data-status="recebidos"]').length;
  const andamento = document.querySelectorAll('#divconTableBody tr[data-status="andamento"]').length;
  const finalizados = document.querySelectorAll('#divconTableBody tr[data-status="finalizados"]').length;
  const geral = document.querySelectorAll('#divconTableBody tr').length;

  document.getElementById('countRecebidos').textContent = recebidos;
  document.getElementById('countAndamento').textContent = andamento;
  document.getElementById('countFinalizados').textContent = finalizados;
  document.getElementById('countGeral').textContent = geral;
}

function updateNotificationState() {
  const items = notificationList.querySelectorAll('.notification-item').length;

  notificationBadge.textContent = items;
  notificationBadge.classList.toggle('show', items > 0);
  notificationBtn.classList.toggle('has-alert', items > 0);

  if (items === 0) {
    notificationList.innerHTML = '<div class="notification-empty">NENHUMA NOTIFICAÇÃO NO MOMENTO.</div>';
  }
}

function updateSearchInfo() {
  searchInfo.classList.toggle('show', hasActiveSearch());
}

function applyFilters() {
  const search = searchInput.value.trim().toUpperCase();
  const rows = getTableRows();
  const searchingAll = search !== '';

  rows.forEach(row => {
    const status = row.dataset.status || '';
    const text = row.innerText.toUpperCase();

    const statusMatch = searchingAll ? true : (currentFilter === 'geral' || status === currentFilter);
    const searchMatch = !search || text.includes(search);

    row.style.display = statusMatch && searchMatch ? '' : 'none';
  });

  updateSearchInfo();
  renderActionButtons();
}

function setFilter(filter) {
  currentFilter = filter;

  navTabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.filter === filter);
  });

  metricCards.forEach(card => {
    card.classList.toggle('active', card.dataset.filter === filter);
  });

  applyFilters();
}

function closeModal() {
  modal.style.display = 'none';
}

function openProcessModal(row) {
  document.getElementById('modalProcesso').innerText = safeValue(row.children[0].innerText);
  document.getElementById('modalData').innerText = safeValue(row.children[1].innerText);
  document.getElementById('modalOrgao').innerText = safeValue(row.children[2].innerText);
  document.getElementById('modalObjeto').innerText = safeValue(row.children[3].innerText);
  document.getElementById('modalStatusFluxo').innerText = safeValue(row.children[4].innerText);

  document.getElementById('modalSituacao').innerText = safeValue(row.dataset.situacao);
  document.getElementById('modalDataJuridico').innerText = safeValue(row.dataset.datajuridico);
  document.getElementById('modalDataOrgao').innerText = safeValue(row.dataset.dataorgao);
  document.getElementById('modalRespCadastro').innerText = safeValue(row.dataset.respcadastro);
  document.getElementById('modalAberturaPregao').innerText = safeValue(row.dataset.aberturapregao);
  document.getElementById('modalRespPublicacao').innerText = safeValue(row.dataset.resppublicacao);
  document.getElementById('modalPregoeiro').innerText = safeValue(row.dataset.pregoeiro);
  document.getElementById('modalStatusDetalhado').innerText = safeValue(row.dataset.statusdetalhado);

  modal.style.display = 'flex';
}

function openEditModal(row) {
  editingRow = row;

  document.getElementById('editProcesso').value = safeValue(row.children[0].innerText);
  document.getElementById('editStatusFluxo').value = safeValue(row.children[4].innerText);
  document.getElementById('editData').value = safeValue(row.children[1].innerText) === '-' ? '' : safeValue(row.children[1].innerText);
  document.getElementById('editOrgao').value = safeValue(row.children[2].innerText) === '-' ? '' : safeValue(row.children[2].innerText);
  document.getElementById('editObjeto').value = safeValue(row.children[3].innerText) === '-' ? '' : safeValue(row.children[3].innerText);

  document.getElementById('editSituacao').value = safeValue(row.dataset.situacao) === '-' ? '' : safeValue(row.dataset.situacao);
  document.getElementById('editDataJuridico').value = safeValue(row.dataset.datajuridico) === '-' ? '' : safeValue(row.dataset.datajuridico);
  document.getElementById('editDataOrgao').value = safeValue(row.dataset.dataorgao) === '-' ? '' : safeValue(row.dataset.dataorgao);
  document.getElementById('editRespCadastro').value = safeValue(row.dataset.respcadastro) === '-' ? '' : safeValue(row.dataset.respcadastro);
  document.getElementById('editAberturaPregao').value = safeValue(row.dataset.aberturapregao) === '-' ? '' : safeValue(row.dataset.aberturapregao);
  document.getElementById('editRespPublicacao').value = safeValue(row.dataset.resppublicacao) === '-' ? '' : safeValue(row.dataset.resppublicacao);
  document.getElementById('editPregoeiro').value = safeValue(row.dataset.pregoeiro) === '-' ? '' : safeValue(row.dataset.pregoeiro);
  document.getElementById('editStatusDetalhado').value = safeValue(row.dataset.statusdetalhado) === '-' ? '' : safeValue(row.dataset.statusdetalhado);

  editModal.style.display = 'flex';
}

function closeEditModal() {
  editModal.style.display = 'none';
  editingRow = null;
}

function saveEdit() {
  if (!editingRow) return;

  editingRow.children[1].innerText = document.getElementById('editData').value.trim().toUpperCase();
  editingRow.children[2].innerText = document.getElementById('editOrgao').value.trim().toUpperCase();
  editingRow.children[3].innerText = document.getElementById('editObjeto').value.trim().toUpperCase();

  editingRow.dataset.situacao = document.getElementById('editSituacao').value.trim().toUpperCase();
  editingRow.dataset.datajuridico = document.getElementById('editDataJuridico').value.trim().toUpperCase();
  editingRow.dataset.dataorgao = document.getElementById('editDataOrgao').value.trim().toUpperCase();
  editingRow.dataset.respcadastro = document.getElementById('editRespCadastro').value.trim().toUpperCase();
  editingRow.dataset.aberturapregao = document.getElementById('editAberturaPregao').value.trim().toUpperCase();
  editingRow.dataset.resppublicacao = document.getElementById('editRespPublicacao').value.trim().toUpperCase();
  editingRow.dataset.pregoeiro = document.getElementById('editPregoeiro').value.trim().toUpperCase();
  editingRow.dataset.statusdetalhado = document.getElementById('editStatusDetalhado').value.trim().toUpperCase();

  closeEditModal();
  applyFilters();
}

function playNotificationSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(988, audioContext.currentTime + 0.08);

    gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.18, audioContext.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.35);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.36);
  } catch (error) {}
}

function addNotification(processo, orgao, data) {
  const empty = notificationList.querySelector('.notification-empty');
  if (empty) {
    notificationList.innerHTML = '';
  }

  const item = document.createElement('div');
  item.className = 'notification-item';
  item.innerHTML = `
    <strong>NOVO PROCESSO CHEGOU AO SETOR</strong>
    <span>PROCESSO: ${safeValue(processo)}</span>
    <span>ÓRGÃO: ${safeValue(orgao)}</span>
    <span>DATA: ${safeValue(data)}</span>
  `;

  notificationList.prepend(item);
  updateNotificationState();
  playNotificationSound();
}

function statusLabel(status) {
  if (status === 'recebidos') return 'RECEBIDO';
  if (status === 'andamento') return 'EM ANDAMENTO';
  if (status === 'finalizados') return 'FINALIZADO';
  return String(status).toUpperCase();
}

function getActionHtmlByContext(rowStatus) {
  if (currentFilter === 'geral' || hasActiveSearch()) {
    return `
      <div class="actions">
        <button class="btn btn-primary btn-small btn-open">ABRIR</button>
      </div>
    `;
  }

  if (currentFilter === 'recebidos' && rowStatus === 'recebidos') {
    return `
      <div class="actions">
        <button class="btn btn-primary btn-small btn-open">ABRIR</button>
        <button class="btn btn-success btn-small btn-receber">RECEBER</button>
      </div>
    `;
  }

  if (currentFilter === 'andamento' && rowStatus === 'andamento') {
    return `
      <div class="actions">
        <button class="btn btn-primary btn-small btn-open">ABRIR</button>
        <button class="btn btn-warning btn-small btn-editar">EDITAR</button>
        <button class="btn btn-danger btn-small btn-finalizar">FINALIZAR</button>
      </div>
    `;
  }

  return `
    <div class="actions">
      <button class="btn btn-primary btn-small btn-open">ABRIR</button>
    </div>
  `;
}

function renderActionButtons() {
  getTableRows().forEach(row => {
    const actionCell = row.querySelector('.actions-cell');
    actionCell.innerHTML = getActionHtmlByContext(row.dataset.status);
  });

  bindActionButtons();
}

function moverParaAndamento(row) {
  row.dataset.status = 'andamento';
  row.children[4].innerText = 'EM ANDAMENTO';
  updateCounts();
  applyFilters();
}

function finalizarProcesso(row) {
  const senha = prompt('DIGITE A SENHA DO OPERADOR PARA FINALIZAR O PROCESSO:');

  if (senha === null) return;

  if (senha !== OPERADOR_SENHA) {
    alert('SENHA DO OPERADOR INCORRETA.');
    return;
  }

  row.dataset.status = 'finalizados';
  row.children[4].innerText = 'FINALIZADO';
  updateCounts();
  applyFilters();
}

function bindActionButtons() {
  document.querySelectorAll('.btn-open').forEach(btn => {
    btn.onclick = function() {
      const row = this.closest('tr');
      openProcessModal(row);
    };
  });

  document.querySelectorAll('.btn-receber').forEach(btn => {
    btn.onclick = function() {
      const row = this.closest('tr');
      moverParaAndamento(row);
    };
  });

  document.querySelectorAll('.btn-editar').forEach(btn => {
    btn.onclick = function() {
      const row = this.closest('tr');
      openEditModal(row);
    };
  });

  document.querySelectorAll('.btn-finalizar').forEach(btn => {
    btn.onclick = function() {
      const row = this.closest('tr');
      finalizarProcesso(row);
    };
  });
}

function receberNovoProcesso(dados) {
  const numero = safeValue(dados.numero || '');
  const data = safeValue(dados.data || '');
  const orgao = safeValue(dados.orgao || '');
  const objeto = safeValue(dados.objeto || '');
  const status = 'recebidos';

  const tr = document.createElement('tr');
  tr.setAttribute('data-status', status);
  tr.setAttribute('data-situacao', safeValue(dados.situacao || '').replace('-', ''));
  tr.setAttribute('data-datajuridico', safeValue(dados.dataEnvioJuridico || '').replace('-', ''));
  tr.setAttribute('data-dataorgao', safeValue(dados.dataEnvioOrgao || '').replace('-', ''));
  tr.setAttribute('data-respcadastro', safeValue(dados.respoCadastrCompras || '').replace('-', ''));
  tr.setAttribute('data-aberturapregao', safeValue(dados.aberturaPregao || '').replace('-', ''));
  tr.setAttribute('data-resppublicacao', safeValue(dados.responsavelPublicacao || '').replace('-', ''));
  tr.setAttribute('data-pregoeiro', safeValue(dados.pregoeiro || '').replace('-', ''));
  tr.setAttribute('data-statusdetalhado', safeValue(dados.statusDetalhado || '').replace('-', ''));

  tr.innerHTML = `
    <td class="col-processo">${numero}</td>
    <td class="col-data">${data === '-' ? '' : data}</td>
    <td class="col-orgao">${orgao === '-' ? '' : orgao}</td>
    <td class="col-objeto">${objeto === '-' ? '' : objeto}</td>
    <td class="col-status">${statusLabel(status)}</td>
    <td class="col-acao actions-cell"></td>
  `;

  tableBody.prepend(tr);

  updateCounts();
  applyFilters();
  addNotification(numero, orgao, data);
}

window.receberNovoProcesso = receberNovoProcesso;
window.closeModal = closeModal;
window.closeEditModal = closeEditModal;
window.saveEdit = saveEdit;

navTabs.forEach(tab => {
  tab.addEventListener('click', () => setFilter(tab.dataset.filter));
});

metricCards.forEach(card => {
  card.addEventListener('click', () => setFilter(card.dataset.filter));
});

searchInput.addEventListener('input', function() {
  this.value = this.value.toUpperCase();
  applyFilters();
});

clearSearchBtn.addEventListener('click', () => {
  searchInput.value = '';
  applyFilters();
});

notificationBtn.addEventListener('click', (event) => {
  event.stopPropagation();
  notificationPanel.classList.toggle('show');
});

clearNotificationsBtn.addEventListener('click', () => {
  notificationList.innerHTML = '';
  updateNotificationState();
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.notification-wrap')) {
    notificationPanel.classList.remove('show');
  }

  if (event.target === modal) {
    closeModal();
  }

  if (event.target === editModal) {
    closeEditModal();
  }
});

setupUppercaseInputs();
updateCounts();
updateNotificationState();
updateSearchInfo();
setFilter('recebidos');

// ===== INTEGRAÇÃO COM DIVACP =====
// Chave usada pelo DIVACP ao enviar processos para o DIVCON
const DIVCON_INBOX_KEY = 'caixa_divcon_recebidos';
// Chave para controlar quais IDs já foram importados (evita duplicatas)
const DIVCON_IMPORTED_KEY = 'divcon_imported_ids';

function getImportedIds() {
  try {
    return JSON.parse(localStorage.getItem(DIVCON_IMPORTED_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

function saveImportedIds(ids) {
  localStorage.setItem(DIVCON_IMPORTED_KEY, JSON.stringify(ids));
}

function formatDateBRFromISO(dateStr) {
  if (!dateStr || dateStr === '-') return '';
  // Já está em DD/MM/AAAA
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
  // Tenta converter de YYYY-MM-DD
  const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return m[3] + '/' + m[2] + '/' + m[1];
  return dateStr;
}

function criarLinhaDoProcessoDivacp(proc) {
  const tr = document.createElement('tr');
  tr.setAttribute('data-status', 'recebidos');
  tr.setAttribute('data-situacao', proc.statusDivcon || '');
  tr.setAttribute('data-datajuridico', '');
  tr.setAttribute('data-dataorgao', formatDateBRFromISO(proc.dataEnvio || ''));
  tr.setAttribute('data-respcadastro', proc.responsavelMinuta || '');
  tr.setAttribute('data-aberturapregao', formatDateBRFromISO(proc.dataAbertura || ''));
  tr.setAttribute('data-resppublicacao', proc.responsavel || '');
  tr.setAttribute('data-pregoeiro', '');
  tr.setAttribute('data-statusdetalhado', proc.andamento || '');
  tr.setAttribute('data-divacp-id', proc.id || '');

  const numero = (proc.nrProcesso || '').toUpperCase();
  const data = formatDateBRFromISO(proc.dataEntradaSelic || proc.dataEnvio || '');
  const orgao = (proc.orgao || '').toUpperCase();
  const objeto = (proc.objeto || '').toUpperCase();

  tr.innerHTML = `
    <td class="col-processo">${numero}</td>
    <td class="col-data">${data}</td>
    <td class="col-orgao">${orgao}</td>
    <td class="col-objeto">${objeto}</td>
    <td class="col-status">RECEBIDO</td>
    <td class="col-acao actions-cell"></td>
  `;

  return tr;
}

function carregarProcessosDoDivacp() {
  let lista = [];
  try {
    lista = JSON.parse(localStorage.getItem(DIVCON_INBOX_KEY) || '[]');
  } catch (e) {
    return;
  }

  if (!Array.isArray(lista) || lista.length === 0) return;

  const importadosIds = getImportedIds();
  const novos = lista.filter(proc => proc.id && !importadosIds.includes(proc.id));

  if (novos.length === 0) return;

  novos.forEach(proc => {
    const tr = criarLinhaDoProcessoDivacp(proc);
    tableBody.prepend(tr);
    importadosIds.push(proc.id);
    // Gera notificação para cada novo processo
    addNotification(proc.nrProcesso || '-', proc.orgao || '-', formatDateBRFromISO(proc.dataEnvio || ''));
  });

  saveImportedIds(importadosIds);
  updateCounts();
  applyFilters();
}

// Carrega ao inicializar
carregarProcessosDoDivacp();

// Verifica novos processos do DIVACP a cada 15 segundos (polling)
setInterval(carregarProcessosDoDivacp, 15000);

// Também escuta o evento de storage para atualizações em tempo real (mesma aba ou outra aba)
window.addEventListener('storage', function(event) {
  if (event.key === DIVCON_INBOX_KEY) {
    carregarProcessosDoDivacp();
  }
});