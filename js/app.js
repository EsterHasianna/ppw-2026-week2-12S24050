/**
 * app.js
 * Presentation Layer: kontrol DOM, dynamic rendering, dan event.
 * Semua data diambil lewat ApiService (tidak memanggil fetch langsung).
 */
const App = {
  state: {
    projects: [],
    activeCategory: 'Semua',
    keyword: '',
  },
  el: {},

  PLACEHOLDER_IMG:
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="360">' +
        '<rect width="100%" height="100%" fill="#e9ecef"/>' +
        '<text x="50%" y="50%" fill="#6c757d" font-family="sans-serif" font-size="24" ' +
        'text-anchor="middle" dominant-baseline="middle">Gambar belum tersedia</text></svg>'
    ),

  init() {
    this.el.container = document.getElementById('projectsContainer');
    this.el.filterBar = document.getElementById('filterBar');
    this.el.search = document.getElementById('searchInput');
    if (!this.el.container) return;

    this.bindEvents();
    this.loadProjects();
  },

  bindEvents() {
    // Klik tombol filter kategori
    this.el.filterBar.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-category]');
      if (!btn) return;
      this.state.activeCategory = btn.dataset.category;
      this.renderFilters();
      this.renderProjects();
    });

    // Pencarian instan
    this.el.search.addEventListener('input', (e) => {
      this.state.keyword = e.target.value.trim().toLowerCase();
      this.renderProjects();
    });

    // Delegasi event untuk isi container (retry, reset, detail proyek)
    this.el.container.addEventListener('click', (e) => {
      if (e.target.closest('[data-action="retry"]')) {
        this.loadProjects();
        return;
      }
      if (e.target.closest('[data-action="reset"]')) {
        this.resetFilters();
        return;
      }
      const detailBtn = e.target.closest('[data-project-id]');
      if (detailBtn) {
        this.openProjectModal(Number(detailBtn.dataset.projectId));
      }
    });
  },

  // ===== Alur pemuatan data =====
  async loadProjects() {
    this.renderLoading();
    try {
      this.state.projects = await ApiService.getProjects();
      this.renderFilters();
      this.renderProjects();
    } catch (err) {
      this.renderError(err.message);
    }
  },

  // ===== UI STATE 1: Loading (skeleton) =====
  renderLoading() {
    const skeleton = `
      <div class="col-sm-6 col-lg-3">
        <div class="card h-100 border-0 shadow-sm" aria-hidden="true">
          <div class="placeholder-glow">
            <span class="placeholder col-12" style="height: 160px;"></span>
          </div>
          <div class="card-body placeholder-glow">
            <span class="placeholder col-8 mb-2"></span>
            <span class="placeholder col-12"></span>
            <span class="placeholder col-10"></span>
          </div>
        </div>
      </div>`;
    this.el.container.innerHTML = `
      <div class="d-flex align-items-center gap-2 mb-3 text-secondary" role="status">
        <div class="spinner-border spinner-border-sm"></div>
        <span>Memuat proyek...</span>
      </div>
      <div class="row g-4">${skeleton.repeat(4)}</div>`;
    this.el.filterBar.innerHTML = '';
  },

  // ===== UI STATE 4: Error =====
  renderError(message) {
    this.el.container.innerHTML = `
      <div class="alert alert-danger d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3" role="alert">
        <div>
          <strong>Gagal memuat data proyek.</strong><br>
          <small>${this.escapeHTML(message)}</small>
        </div>
        <button type="button" class="btn btn-outline-danger" data-action="retry">
          <i class="bi bi-arrow-clockwise me-1"></i>Coba Lagi
        </button>
      </div>`;
  },

  // ===== UI STATE 3: Empty =====
  renderEmpty() {
    this.el.container.innerHTML = `
      <div class="text-center text-secondary py-5">
        <i class="bi bi-search fs-1 d-block mb-2"></i>
        <p class="mb-3">Tidak ada proyek yang cocok dengan filter atau pencarianmu.</p>
        <button type="button" class="btn btn-outline-primary" data-action="reset">Reset Filter</button>
      </div>`;
  },

  // ===== Filter kategori (dibuat dinamis dari data) =====
  renderFilters() {
    const categories = ['Semua', ...new Set(this.state.projects.map((p) => p.category))];
    this.el.filterBar.innerHTML = categories
      .map((cat) => {
        const active = cat === this.state.activeCategory;
        return `<button type="button"
                  class="btn btn-sm ${active ? 'btn-primary' : 'btn-outline-primary'}"
                  data-category="${this.escapeHTML(cat)}"
                  aria-pressed="${active}">${this.escapeHTML(cat)}</button>`;
      })
      .join('');
  },

  resetFilters() {
    this.state.activeCategory = 'Semua';
    this.state.keyword = '';
    this.el.search.value = '';
    this.renderFilters();
    this.renderProjects();
  },

  getFilteredProjects() {
    const { projects, activeCategory, keyword } = this.state;
    return projects.filter((p) => {
      const matchCategory = activeCategory === 'Semua' || p.category === activeCategory;
      const haystack = [p.title, p.category, ...(p.tags || [])].join(' ').toLowerCase();
      return matchCategory && haystack.includes(keyword);
    });
  },

  // ===== UI STATE 2: Success =====
  renderProjects() {
    const list = this.getFilteredProjects();
    if (list.length === 0) {
      this.renderEmpty();
      return;
    }

    const cards = list.map((p) => this.buildCard(p)).join('');
    this.el.container.innerHTML = `<div class="row g-4">${cards}</div>`;

    // Jika gambar gagal dimuat, pakai placeholder
    this.el.container.querySelectorAll('img[data-fallback]').forEach((img) => {
      img.addEventListener('error', () => { img.src = this.PLACEHOLDER_IMG; }, { once: true });
    });
  },

  buildCard(p) {
    const tags = (p.tags || [])
      .map((t) => `<span class="badge text-bg-light border me-1">${this.escapeHTML(t)}</span>`)
      .join('');
    return `
      <div class="col-sm-6 col-lg-3">
        <article class="card project-card h-100 border-0 shadow-sm">
          <img src="${this.escapeHTML(p.thumbnail)}" data-fallback
               class="card-img-top" style="height:160px;object-fit:cover;"
               alt="${this.escapeHTML(p.title)}">
          <div class="card-body d-flex flex-column">
            <span class="badge text-bg-primary align-self-start mb-2">${this.escapeHTML(p.category)}</span>
            <h3 class="h6 fw-bold">${this.escapeHTML(p.title)}</h3>
            <div class="mb-3">${tags}</div>
            <button type="button" class="btn btn-outline-primary btn-sm mt-auto"
                    data-project-id="${Number(p.id)}">
              Lihat Detail
            </button>
          </div>
        </article>
      </div>`;
  },

  // ===== Universal Modal (HTML modalnya dibuat di Tahap 5) =====
  openProjectModal(projectId) {
    const proj = this.state.projects.find((p) => p.id === projectId);
    const modalEl = document.getElementById('universalProjectModal');
    if (!proj || !modalEl) {
      console.info('Universal modal belum ada di index.html (dikerjakan di Tahap 5).');
      return;
    }

    document.getElementById('projectModalTitle').textContent = proj.title;

    const metrics = Object.entries(proj.metrics || {})
      .map(([k, v]) => `<li><strong>${this.escapeHTML(k)}:</strong> ${this.escapeHTML(v)}</li>`)
      .join('');
    const tags = (proj.tags || [])
      .map((t) => `<span class="badge text-bg-light border me-1">${this.escapeHTML(t)}</span>`)
      .join('');

    document.getElementById('projectModalBody').innerHTML = `
      <img src="${this.escapeHTML(proj.thumbnail)}" class="img-fluid rounded mb-3 w-100"
           alt="${this.escapeHTML(proj.title)}">
      <span class="badge text-bg-primary mb-2">${this.escapeHTML(proj.category)}</span>
      <p class="text-secondary">${this.escapeHTML(proj.description)}</p>
      <div class="mb-3">${tags}</div>
      <ul class="list-unstyled small">${metrics}</ul>
      <a href="${this.escapeHTML(proj.link)}" target="_blank" rel="noopener noreferrer"
         class="btn btn-primary btn-sm">Buka Proyek</a>`;

    bootstrap.Modal.getOrCreateInstance(modalEl).show();
  },

  // ===== Keamanan: cegah DOM-based XSS =====
  escapeHTML(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());

// ===== TAHAP 6: Form layanan (Fetch POST), Toast, dan localStorage =====
Object.assign(App, {
  STORAGE_KEY: 'ester_service_orders',

  initOrderForm() {
    const form = document.getElementById('layananForm');
    if (!form) return;
    this.el.orderBadge = document.getElementById('orderBadge');
    this.el.orderHistory = document.getElementById('orderHistory');
    this.renderOrderBadge();

    form.addEventListener('submit', async (e) => {
      e.preventDefault(); // hentikan reload halaman
      form.classList.add('was-validated');
      if (!form.checkValidity()) return; // validasi HTML5 tetap berjalan

      // Serialisasi form menjadi objek JSON (DTO)
      const payload = Object.fromEntries(new FormData(form).entries());
      payload.submittedAt = new Date().toISOString();

      const btn = form.querySelector('[type="submit"]');
      const originalHTML = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Mengirim...';

      try {
        await ApiService.submitServiceOrder(payload);
        this.saveOrderToLocalStorage(payload);
        this.showToast('Sukses!', 'Permintaan layanan berhasil diproses oleh API.', 'success');
        form.reset();
        form.classList.remove('was-validated');
      } catch (err) {
        this.showToast('Gagal', 'Permintaan gagal dikirim: ' + err.message, 'danger');
      } finally {
        btn.disabled = false;
        btn.innerHTML = originalHTML;
      }
    });
  },

  // ===== Toast Bootstrap =====
  showToast(title, message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'alert');
    el.innerHTML = `
      <div class="toast-header text-bg-${type}">
        <strong class="me-auto">${this.escapeHTML(title)}</strong>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Tutup"></button>
      </div>
      <div class="toast-body">${this.escapeHTML(message)}</div>`;
    container.appendChild(el);
    el.addEventListener('hidden.bs.toast', () => el.remove());
    new bootstrap.Toast(el, { delay: 4000 }).show();
  },

  // ===== Persistensi di sisi klien (localStorage) =====
  getOrders() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  },

  saveOrderToLocalStorage(order) {
    const orders = this.getOrders();
    orders.push({ localId: Date.now(), ...order });
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(orders));
    this.renderOrderBadge();
  },

  renderOrderBadge() {
    const orders = this.getOrders();
    if (this.el.orderBadge) {
      this.el.orderBadge.textContent = `Riwayat pesanan: ${orders.length}`;
    }
    if (this.el.orderHistory) {
      this.el.orderHistory.innerHTML = orders
        .slice(-3)
        .reverse()
        .map((o) => `<li class="small text-secondary">${this.escapeHTML(o.nama || 'Tanpa nama')} &middot; ${this.escapeHTML(new Date(o.submittedAt).toLocaleString('id-ID'))}</li>`)
        .join('');
    }
  },
});

document.addEventListener('DOMContentLoaded', () => App.initOrderForm());