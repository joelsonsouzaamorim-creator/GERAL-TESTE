document.addEventListener('DOMContentLoaded', function () {
  const navTabs = document.querySelectorAll('.nav-tab');
  const metricCards = document.querySelectorAll('.metric-card');
  const searchInput = document.getElementById('pesquisa');
  const clearSearchBtn = document.getElementById('clearSearchBtn');

  const tableBody =
    document.getElementById('cecTableBody') ||
    document.getElementById('divconTableBody');

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

  const CEC_INBOX_KEY = 'caixa_cec_recebidos';
  const CEC_IMPORTED_KEY = 'cec_imported_ids';
  const CEC_STORAGE_KEY = 'cec_processos';

  if (!tableBody) {
    console.error('Tabela não encontrada. Use id="cecTableBody" no HTML.');
    return;
  }

  function getTableRows() {
    return document.querySelectorAll(`#${tableBody.id} tr`);
  }

  function hasActiveSearch() {
    return searchInput && searchInput.value.trim() !== '';
  }

  function safeValue(value) {
    if (value === null || value === undefined) return '-';
    const text = String(value).trim();
    return text ? text.toUpperCase() : '-';
  }

  function rawOrEmpty(value) {
    const text = String(value || '').trim();
    return text === '-' ? '' : text;
  }

  function setupUppercaseInputs() {
    document.querySelectorAll('input:not([readonly]), textarea').forEach(field => {
      field.addEventListener('input', function () {
        this.value = this.value.toUpperCase();
      });
    });
  }

  function statusLabel(status) {
    if (status === 'recebidos') return 'RECEBIDO';
    if (status === 'andamento') return 'EM ANDAMENTO';
    if (status === 'finalizados') return 'FINALIZADO';
    return 'RECEBIDO';
  }

  function updateCounts() {
    const recebidos = document.querySelectorAll(`#${tableBody.id} tr[data-status="recebidos"]`).length;
    const andamento = document.querySelectorAll(`#${tableBody.id} tr[data-status="andamento"]`).length;
    const finalizados = document.querySelectorAll(`#${tableBody.id} tr[data-status="finalizados"]`).length;
    const geral = document.querySelectorAll(`#${tableBody.id} tr`).length;

    const elRecebidos = document.getElementById('countRecebidos');
    const elAndamento = document.getElementById('countAndamento');
    const elFinalizados = document.getElementById('countFinalizados');
    const elGeral = document.getElementById('countGeral');

    if (elRecebidos) elRecebidos.textContent = recebidos;
    if (elAndamento) elAndamento.textContent = andamento;
    if (elFinalizados) elFinalizados.textContent = finalizados;
    if (elGeral) elGeral.textContent = geral;
  }

  function updateNotificationState() {
    if (!notificationList || !notificationBadge || !notificationBtn) return;

    const items = notificationList.querySelectorAll('.notification-item').length;

    notificationBadge.textContent = items;
    notificationBadge.classList.toggle('show', items > 0);
    notificationBtn.classList.toggle('has-alert', items > 0);

    if (items === 0) {
      notificationList.innerHTML = '<div class="notification-empty">NENHUMA NOTIFICAÇÃO NO MOMENTO.</div>';
    }
  }

  function updateSearchInfo() {
    if (searchInfo) {
      searchInfo.classList.toggle('show', hasActiveSearch());
    }
  }

  function applyFilters() {
    const search = searchInput ? searchInput.value.trim().toUpperCase() : '';
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
    if (modal) modal.style.display = 'none';
  }

  function closeEditModal() {
    if (editModal) editModal.style.display = 'none';
    editingRow = null;
  }

  function openProcessModal(row) {
    const setText = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.innerText = safeValue(value);
    };

    setText('modalProcesso', row.children[0]?.innerText);
    setText('modalData', row.children[1]?.innerText);
    setText('modalOrgao', row.children[2]?.innerText);
    setText('modalObjeto', row.children[3]?.innerText);
    setText('modalStatusFluxo', row.children[4]?.innerText);
    setText('modalOrigem', row.dataset.origem);
    setText('modalDestino', row.dataset.destino || 'CEC');
    setText('modalSituacao', row.dataset.situacao);
    setText('modalResponsavel', row.dataset.responsavel);
    setText('modalObservacoes', row.dataset.observacoes);

    if (modal) modal.style.display = 'flex';
  }

  function openEditModal(row) {
    editingRow = row;

    const setValue = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.value = value;
    };

    setValue('editProcesso', rawOrEmpty(row.children[0]?.innerText));
    setValue('editStatusFluxo', rawOrEmpty(row.children[4]?.innerText));
    setValue('editData', rawOrEmpty(row.children[1]?.innerText));
    setValue('editOrgao', rawOrEmpty(row.children[2]?.innerText));
    setValue('editObjeto', rawOrEmpty(row.children[3]?.innerText));
    setValue('editOrigem', rawOrEmpty(row.dataset.origem));
    setValue('editDestino', rawOrEmpty(row.dataset.destino || 'CEC'));
    setValue('editSituacao', rawOrEmpty(row.dataset.situacao));
    setValue('editResponsavel', rawOrEmpty(row.dataset.responsavel));
    setValue('editObservacoes', rawOrEmpty(row.dataset.observacoes));

    if (editModal) editModal.style.display = 'flex';
  }

  function saveEdit() {
    if (!editingRow) return;

    const editData = document.getElementById('editData');
    const editOrgao = document.getElementById('editOrgao');
    const editObjeto = document.getElementById('editObjeto');
    const editOrigem = document.getElementById('editOrigem');
    const editDestino = document.getElementById('editDestino');
    const editSituacao = document.getElementById('editSituacao');
    const editResponsavel = document.getElementById('editResponsavel');
    const editObservacoes = document.getElementById('editObservacoes');

    editingRow.children[1].innerText = safeValue(editData ? editData.value : '');
    editingRow.children[2].innerText = safeValue(editOrgao ? editOrgao.value : '');
    editingRow.children[3].innerText = safeValue(editObjeto ? editObjeto.value : '');

    editingRow.dataset.origem = safeValue(editOrigem ? editOrigem.value : '');
    editingRow.dataset.destino = safeValue(editDestino ? editDestino.value : 'CEC');
    editingRow.dataset.situacao = safeValue(editSituacao ? editSituacao.value : '');
    editingRow.dataset.responsavel = safeValue(editResponsavel ? editResponsavel.value : '');
    editingRow.dataset.observacoes = safeValue(editObservacoes ? editObservacoes.value : '');

    closeEditModal();
    updateCounts();
    applyFilters();
    persistRows();
  }

  function addNotification(numero, orgao, data) {
    if (!notificationList) return;

    const empty = notificationList.querySelector('.notification-empty');
    if (empty) empty.remove();

    const item = document.createElement('div');
    item.className = 'notification-item';
    item.innerHTML = `
      <strong>NOVO PROCESSO RECEBIDO</strong>
      <span><b>PROCESSO:</b> ${safeValue(numero)}</span>
      <span><b>ÓRGÃO:</b> ${safeValue(orgao)}</span>
      <span><b>DATA:</b> ${safeValue(data)}</span>
    `;

    notificationList.prepend(item);
    updateNotificationState();
  }

  function finalizarProcesso(row) {
    row.dataset.status = 'finalizados';
    row.children[4].innerText = 'FINALIZADO';
    updateCounts();
    applyFilters();
    persistRows();
  }

  function iniciarProcesso(row) {
    row.dataset.status = 'andamento';
    row.children[4].innerText = 'EM ANDAMENTO';
    updateCounts();
    applyFilters();
    persistRows();
  }

  function renderActionButtons() {
    document.querySelectorAll('.actions-cell').forEach(cell => {
      const row = cell.closest('tr');
      const status = row.dataset.status || '';

      let botoes = `
        <div class="actions">
          <button class="btn btn-light btn-small btn-detalhes">ABRIR</button>
          <button class="btn btn-primary btn-small btn-editar">EDITAR</button>
      `;

      if (status === 'recebidos') {
        botoes += `<button class="btn btn-warning btn-small btn-receber">RECEBER</button>`;
      }

      if (status !== 'finalizados') {
        botoes += `<button class="btn btn-success btn-small btn-finalizar">FINALIZAR</button>`;
      }

      botoes += `</div>`;
      cell.innerHTML = botoes;
    });

    document.querySelectorAll('.btn-detalhes').forEach(btn => {
      btn.onclick = function () {
        openProcessModal(this.closest('tr'));
      };
    });

    document.querySelectorAll('.btn-editar').forEach(btn => {
      btn.onclick = function () {
        openEditModal(this.closest('tr'));
      };
    });

    document.querySelectorAll('.btn-finalizar').forEach(btn => {
      btn.onclick = function () {
        finalizarProcesso(this.closest('tr'));
      };
    });

    document.querySelectorAll('.btn-receber').forEach(btn => {
      btn.onclick = function () {
        iniciarProcesso(this.closest('tr'));
      };
    });
  }

  function persistRows() {
    const rows = [...document.querySelectorAll(`#${tableBody.id} tr`)].map(row => ({
      numero: row.children[0]?.innerText.trim() || '',
      data: row.children[1]?.innerText.trim() || '',
      orgao: row.children[2]?.innerText.trim() || '',
      objeto: row.children[3]?.innerText.trim() || '',
      status: row.dataset.status || 'recebidos',
      origem: row.dataset.origem || '',
      destino: row.dataset.destino || 'CEC',
      situacao: row.dataset.situacao || '',
      responsavel: row.dataset.responsavel || '',
      observacoes: row.dataset.observacoes || '',
      importedId: row.dataset.importedId || ''
    }));

    localStorage.setItem(CEC_STORAGE_KEY, JSON.stringify(rows));
  }

  function loadPersistedRows() {
    let lista = [];
    try {
      lista = JSON.parse(localStorage.getItem(CEC_STORAGE_KEY) || '[]');
    } catch (e) {
      lista = [];
    }

    if (!Array.isArray(lista)) return;

    lista.forEach(proc => {
      const tr = document.createElement('tr');
      tr.setAttribute('data-status', proc.status || 'recebidos');
      tr.setAttribute('data-origem', proc.origem || '');
      tr.setAttribute('data-destino', proc.destino || 'CEC');
      tr.setAttribute('data-situacao', proc.situacao || '');
      tr.setAttribute('data-responsavel', proc.responsavel || '');
      tr.setAttribute('data-observacoes', proc.observacoes || '');
      tr.setAttribute('data-imported-id', proc.importedId || '');

      tr.innerHTML = `
        <td class="col-processo">${safeValue(proc.numero)}</td>
        <td class="col-data">${safeValue(proc.data)}</td>
        <td class="col-orgao">${safeValue(proc.orgao)}</td>
        <td class="col-objeto">${safeValue(proc.objeto)}</td>
        <td class="col-status">${statusLabel(proc.status || 'recebidos')}</td>
        <td class="col-acao actions-cell"></td>
      `;

      tableBody.appendChild(tr);
    });
  }

  function receberNovoProcesso(dados) {
    const numero = safeValue(dados.numero || dados.nrProcesso || '');
    const data = safeValue(dados.data || dados.dataEnvio || '');
    const orgao = safeValue(dados.orgao || '');
    const objeto = safeValue(dados.objeto || '');
    const origem = safeValue(dados.origem || 'DIVACP');
    const destino = 'CEC';
    const importedId = String(dados.id || '').trim();

    const existe = [...document.querySelectorAll(`#${tableBody.id} tr`)].some(row => {
      return (
        (importedId && row.dataset.importedId === importedId) ||
        row.children[0]?.innerText.trim() === numero
      );
    });

    if (existe) return;

    const tr = document.createElement('tr');
    tr.setAttribute('data-status', 'recebidos');
    tr.setAttribute('data-origem', origem);
    tr.setAttribute('data-destino', destino);
    tr.setAttribute('data-situacao', safeValue(dados.situacao || dados.andamento || ''));
    tr.setAttribute('data-responsavel', safeValue(dados.responsavel || dados.responsavelMinuta || ''));
    tr.setAttribute('data-observacoes', safeValue(dados.observacoes || ''));
    tr.setAttribute('data-imported-id', importedId);

    tr.innerHTML = `
      <td class="col-processo">${numero}</td>
      <td class="col-data">${data === '-' ? '' : data}</td>
      <td class="col-orgao">${orgao === '-' ? '' : orgao}</td>
      <td class="col-objeto">${objeto === '-' ? '' : objeto}</td>
      <td class="col-status">RECEBIDO</td>
      <td class="col-acao actions-cell"></td>
    `;

    tableBody.prepend(tr);

    updateCounts();
    applyFilters();
    addNotification(numero, orgao, data);
    persistRows();
  }

  function getImportedIds() {
    try {
      return JSON.parse(localStorage.getItem(CEC_IMPORTED_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  function saveImportedIds(ids) {
    localStorage.setItem(CEC_IMPORTED_KEY, JSON.stringify(ids));
  }

  function formatDateBRFromISO(dateStr) {
    if (!dateStr || dateStr === '-') return '';
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;

    const m = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[3]}/${m[2]}/${m[1]}`;

    return String(dateStr);
  }

  function carregarProcessosDoDivacp() {
    let lista = [];
    try {
      lista = JSON.parse(localStorage.getItem(CEC_INBOX_KEY) || '[]');
    } catch (e) {
      return;
    }

    if (!Array.isArray(lista) || lista.length === 0) return;

    const importadosIds = getImportedIds();

    const novos = lista.filter(proc => {
      const id = String(proc.id || '').trim();
      if (!id) return false;
      return !importadosIds.includes(id);
    });

    if (novos.length === 0) return;

    novos.forEach(proc => {
      receberNovoProcesso({
        id: proc.id || '',
        numero: proc.nrProcesso || proc.numero || '',
        data: formatDateBRFromISO(proc.dataEnvio || proc.data || ''),
        orgao: proc.orgao || '',
        objeto: proc.objeto || '',
        origem: proc.origem || 'DIVACP',
        situacao: proc.andamento || proc.situacao || '',
        responsavel: proc.responsavelMinuta || proc.responsavel || '',
        observacoes: proc.observacoes || ''
      });

      importadosIds.push(String(proc.id));
    });

    saveImportedIds(importadosIds);
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

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      this.value = this.value.toUpperCase();
      applyFilters();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      applyFilters();
    });
  }

  if (notificationBtn) {
    notificationBtn.addEventListener('click', function (event) {
      event.stopPropagation();
      if (notificationPanel) {
        notificationPanel.classList.toggle('show');
      }
    });
  }

  if (clearNotificationsBtn) {
    clearNotificationsBtn.addEventListener('click', () => {
      if (notificationList) {
        notificationList.innerHTML = '';
        updateNotificationState();
      }
    });
  }

  document.addEventListener('click', function (event) {
    if (!event.target.closest('.notification-wrap') && notificationPanel) {
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
  loadPersistedRows();
  updateCounts();
  updateNotificationState();
  updateSearchInfo();
  setFilter('recebidos');
  carregarProcessosDoDivacp();
  persistRows();

  setInterval(carregarProcessosDoDivacp, 15000);

  window.addEventListener('storage', function (event) {
    if (event.key === CEC_INBOX_KEY) {
      carregarProcessosDoDivacp();
    }
  });
});