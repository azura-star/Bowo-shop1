const defaultMenu = [
  { id: 1, nama: 'Nasi Goreng Spesial', harga: 12000, ada: true },
  { id: 2, nama: 'Mie Ayam Pangsit', harga: 10000, ada: true },
  { id: 3, nama: 'Es Teh Manis', harga: 4000, ada: true },
  { id: 4, nama: 'Roti Bakar Cokelat', harga: 7000, ada: false }
];

let keranjang = [];
let idPesananAktif = null; // Menyimpan ID pesanan yang sedang dibuat siswa

// Render Menu Pelanggan
function renderMenuPelanggan() {
  const container = document.getElementById('menu-list');
  if (!container) return;

  if (!localStorage.getItem('daftarMenuKantin')) {
    localStorage.setItem('daftarMenuKantin', JSON.stringify(defaultMenu));
  }

  const daftarMenu = JSON.parse(localStorage.getItem('daftarMenuKantin')) || defaultMenu;
  container.innerHTML = '';

  daftarMenu.forEach(item => {
    const div = document.createElement('div');
    
    if (item.ada) {
      div.className = 'menu-item';
      div.innerHTML = `
        <div class="menu-info">
          <h4>${item.nama}</h4>
          <span class="price">Rp ${item.harga.toLocaleString('id-ID')}</span>
        </div>
        <button class="btn-add" onclick="tambahKeKeranjang('${item.nama}', ${item.harga})">+ Tambah</button>
      `;
    } else {
      div.className = 'menu-item disabled';
      div.innerHTML = `
        <div class="menu-info">
          <h4>${item.nama} <span class="badge-out">SLOT OUT</span></h4>
          <span class="price">Rp ${item.harga.toLocaleString('id-ID')}</span>
        </div>
        <button class="btn-add btn-disabled" disabled>Habis</button>
      `;
    }
    container.appendChild(div);
  });
}

function tambahKeKeranjang(nama, harga) {
  const itemAda = keranjang.find(item => item.nama === nama);
  if (itemAda) {
    itemAda.jumlah += 1;
  } else {
    keranjang.push({ nama, harga, jumlah: 1 });
  }
  updateTampilanKeranjang();
}

// Fungsi Mengurangi Jumlah Makanan di Keranjang (Jika Kelebihan)
function kurangiDariKeranjang(nama) {
  const itemAda = keranjang.find(item => item.nama === nama);
  if (itemAda) {
    itemAda.jumlah -= 1;
    if (itemAda.jumlah <= 0) {
      keranjang = keranjang.filter(item => item.nama !== nama);
    }
  }
  updateTampilanKeranjang();
}

function updateTampilanKeranjang() {
  const listKeranjang = document.getElementById('cart-items');
  const totalText = document.getElementById('total-price');
  if (!listKeranjang) return;

  listKeranjang.innerHTML = '';
  let totalHarga = 0;

  if (keranjang.length === 0) {
    listKeranjang.innerHTML = '<li class="empty-cart">Keranjang masih kosong.</li>';
    if (totalText) totalText.textContent = 'Rp 0';
    return;
  }

  keranjang.forEach((item) => {
    const subtotal = item.harga * item.jumlah;
    totalHarga += subtotal;
    const li = document.createElement('li');
    li.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px dashed #222;';
    
    li.innerHTML = `
      <span>${item.nama} (${item.jumlah}x)</span>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="color: var(--gold-bright);">Rp ${subtotal.toLocaleString('id-ID')}</span>
        <button onclick="kurangiDariKeranjang('${item.nama}')" style="background: #ff4d4d; color: #fff; border: none; width: 22px; height: 22px; border-radius: 4px; cursor: pointer; font-weight: bold;">-</button>
        <button onclick="tambahKeKeranjang('${item.nama}', ${item.harga})" style="background: #28a745; color: #fff; border: none; width: 22px; height: 22px; border-radius: 4px; cursor: pointer; font-weight: bold;">+</button>
      </div>
    `;
    listKeranjang.appendChild(li);
  });
  if (totalText) totalText.textContent = `Rp ${totalHarga.toLocaleString('id-ID')}`;
}

function simpanPesanan(event) {
  event.preventDefault();

  const nama = document.getElementById('nama').value.trim();
  const kelas = document.getElementById('kelas').value.trim();
  const catatan = document.getElementById('catatan').value.trim() || '-';

  if (!nama || !kelas) {
    alert('Mohon isi Nama dan Kelas terlebih dahulu!');
    return;
  }

  if (keranjang.length === 0) {
    alert('Keranjang belanja masih kosong!');
    return;
  }

  const total = keranjang.reduce((sum, item) => sum + (item.harga * item.jumlah), 0);

  idPesananAktif = Date.now(); // Buat ID unik pesanan ini

  const pesananBaru = {
    id: idPesananAktif,
    nama,
    kelas,
    catatan,
    items: [...keranjang],
    total,
    waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  };

  const daftarPesanan = JSON.parse(localStorage.getItem('pesananKantin')) || [];
  daftarPesanan.push(pesananBaru);
  localStorage.setItem('pesananKantin', JSON.stringify(daftarPesanan));

  tampilkanNotaPribadi(pesananBaru);

  // Sembunyikan form & menu agar siswa tahu pesanan sudah dikirim
  alert('Pesanan berhasil dikirim ke kantin!');
}

function tampilkanNotaPribadi(pesanan) {
  const notaSection = document.getElementById('nota-section');
  const detailNota = document.getElementById('detail-nota');
  if (!notaSection) return;

  notaSection.style.display = 'block';

  let rincian = '';
  pesanan.items.forEach(i => {
    rincian += `<li>${i.nama} (${i.jumlah}x)</li>`;
  });

  detailNota.innerHTML = `
    <div style="font-size: 0.85rem; background: #181818; padding: 10px; border-radius: 6px;">
      <p><strong>Nama:</strong> ${pesanan.nama} (${pesanan.kelas})</p>
      <p><strong>Catatan:</strong> ${pesanan.catatan}</p>
      <ul style="margin: 6px 0; padding-left: 15px; color: #ccc;">${rincian}</ul>
      <p style="color: var(--gold-main); margin-top: 6px;"><strong>Total Tagihan: Rp ${pesanan.total.toLocaleString('id-ID')}</strong></p>
    </div>
  `;
}

// Fitur Membatalkan Pesanan yang Telah Dibuat
function batalkanPesananAktif() {
  if (!idPesananAktif) return;

  if (confirm('Yakin ingin membatalkan pesanan ini?')) {
    let daftarPesanan = JSON.parse(localStorage.getItem('pesananKantin')) || [];
    
    // Hapus pesanan berdasarkan ID uniknya dari localStorage agar hilang juga di Admin
    daftarPesanan = daftarPesanan.filter(p => p.id !== idPesananAktif);
    localStorage.setItem('pesananKantin', JSON.stringify(daftarPesanan));

    // Sembunyikan nota & reset keranjang
    document.getElementById('nota-section').style.display = 'none';
    keranjang = [];
    idPesananAktif = null;
    updateTampilanKeranjang();

    alert('Pesanan berhasil dibatalkan.');
  }
}

document.addEventListener('DOMContentLoaded', renderMenuPelanggan);
