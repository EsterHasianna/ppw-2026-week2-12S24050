/**
 * api-service.js
 * Data Access Layer: semua pemanggilan HTTP (fetch) dan error handling ada di sini.
 * app.js (Presentation Layer) hanya memanggil fungsi-fungsi dari ApiService.
 */
const ApiService = {
  // Jeda buatan (ms) supaya Loading State terlihat saat belajar/demo.
  // Setelah selesai testing, ubah menjadi 0.
  SIMULATED_DELAY: 0,

  // Endpoint tiruan untuk pengiriman form (mock REST API publik)
  ORDER_ENDPOINT: 'https://jsonplaceholder.typicode.com/posts',

  _sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },

  // Fungsi generik untuk GET data JSON
  async _getJSON(url) {
    try {
      await this._sleep(this.SIMULATED_DELAY);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (err) {
      console.error('[API Network Error]:', err);
      throw err; // dilempar lagi agar app.js bisa menampilkan Error State
    }
  },

  getProfile() {
    return this._getJSON('./data/profile.json');
  },

  getProjects() {
    return this._getJSON('./data/projects.json');
  },

  getServices() {
    return this._getJSON('./data/services.json');
  },

  // HTTP POST: mengirim pesanan layanan sebagai JSON (DTO)
  async submitServiceOrder(payload) {
    try {
      await this._sleep(this.SIMULATED_DELAY);
      const response = await fetch(this.ORDER_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (err) {
      console.error('[API POST Error]:', err);
      throw err;
    }
  },
};