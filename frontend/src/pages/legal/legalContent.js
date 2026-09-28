// Konten halaman legal TitipIn.
// Edit teks di sini (tanpa perlu menyentuh komponen). Struktur blok:
//   { type: 'p', text }  |  { type: 'ul', items: [] }  |  { type: 'ol', items: [] }
// Tanggal berlaku ditampilkan di bagian atas halaman.

export const CONTACT = {
  email: 'aldosimbolon017@gmail.com',
  whatsapp: '6285361800094',
  whatsappLabel: '+62 853-6180-0094',
  location: 'Medan, Indonesia',
};

export const LEGAL_DOCS = {
  terms: {
    path: '/syarat-ketentuan',
    navLabel: 'Syarat & Ketentuan',
    title: 'Syarat & Ketentuan',
    updated: '28 September 2026',
    intro:
      'Selamat datang di TitipIn. Harap baca Syarat & Ketentuan ini dengan saksama sebelum membuat akun atau memesan barang. Dengan menggunakan TitipIn, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh isi dokumen ini.',
    sections: [
      {
        id: 'penerimaan',
        title: 'Penerimaan Syarat',
        blocks: [
          { type: 'p', text: 'TitipIn adalah platform jasa titip beli (jastip) yang membantu Anda membeli barang dari toko atau marketplace di luar negeri dan mengirimkannya ke Indonesia. Syarat & Ketentuan ini berlaku untuk setiap orang yang mengakses atau menggunakan situs dan layanan TitipIn ("Platform").' },
          { type: 'p', text: 'Anda harus berusia minimal 18 tahun atau telah cakap hukum menurut hukum Indonesia untuk menggunakan Platform. Jika Anda tidak setuju dengan syarat di bawah ini, mohon untuk tidak menggunakan Platform.' },
        ],
      },
      {
        id: 'definisi',
        title: 'Definisi',
        blocks: [
          { type: 'ul', items: [
            '"Kami" berarti TitipIn selaku pengelola Platform.',
            '"Pelanggan" atau "Anda" berarti pengguna terdaftar yang membuat pesanan.',
            '"Pesanan" berarti permintaan pembelian barang yang Anda ajukan melalui Platform.',
            '"Gudang" berarti lokasi penerimaan barang kami di negara asal pembelian.',
            '"Konsolidasi" berarti penggabungan beberapa barang di Gudang menjadi satu pengiriman ke Indonesia.',
            '"Estimasi Biaya" berarti perkiraan total biaya yang dihitung sebelum harga final ditetapkan.',
          ] },
        ],
      },
      {
        id: 'akun',
        title: 'Akun Pengguna',
        blocks: [
          { type: 'ul', items: [
            'Anda wajib memberikan data yang benar, lengkap, dan terbaru saat mendaftar, termasuk nama, email, nomor telepon, dan alamat pengiriman.',
            'Anda bertanggung jawab menjaga kerahasiaan kata sandi dan seluruh aktivitas yang terjadi melalui akun Anda.',
            'Segera hubungi kami jika Anda mengetahui akun digunakan tanpa izin.',
            'Kami berhak menonaktifkan atau menangguhkan akun yang melanggar Syarat & Ketentuan, memberikan data palsu, atau menyalahgunakan layanan.',
          ] },
        ],
      },
      {
        id: 'layanan',
        title: 'Layanan dan Alur Pesanan',
        blocks: [
          { type: 'p', text: 'Saat ini TitipIn melayani pembelian dari enam negara/wilayah: Tiongkok, Amerika Serikat, Singapura, Inggris, Korea Selatan, dan Hong Kong. Alur umum sebuah pesanan adalah sebagai berikut:' },
          { type: 'ol', items: [
            'Menunggu Harga: Anda mengirim detail barang (tautan, varian, jumlah, catatan) dan alamat tujuan.',
            'Menunggu Pembayaran: kami menghitung dan menetapkan biaya, lalu Anda melakukan pembayaran tahap 1.',
            'Dibeli: setelah pembayaran terverifikasi, kami membeli barang dari penjual.',
            'Di Gudang: barang tiba di Gudang luar negeri. Anda dapat melakukan Konsolidasi.',
            'Customs: barang diproses bea cukai Indonesia.',
            'Dikirim: barang dikirim ke alamat Anda melalui kurir domestik.',
            'Selesai: barang diterima Pelanggan.',
          ] },
          { type: 'p', text: 'Status Pesanan dapat berubah sewaktu-waktu dan dapat dipantau melalui halaman detail pesanan serta notifikasi di akun Anda.' },
        ],
      },
      {
        id: 'biaya',
        title: 'Biaya dan Perhitungan Harga',
        blocks: [
          { type: 'p', text: 'Total biaya sebuah pesanan terdiri dari beberapa komponen berikut:' },
          { type: 'ul', items: [
            'Harga barang, dikonversi ke Rupiah menggunakan kurs yang berlaku di Platform.',
            'Biaya layanan TitipIn, berupa persentase dari nilai barang.',
            'Ongkos kirim internasional, berdasarkan negara asal dan berat barang.',
            'Bea masuk, PPN impor, dan PPh impor sesuai ketentuan kepabeanan dan perpajakan yang berlaku. Tarif PPh dapat berbeda bagi Pelanggan yang memiliki NPWP.',
            'Ongkos kirim domestik dari Indonesia ke alamat Anda.',
          ] },
          { type: 'p', text: 'Kalkulator harga pada halaman utama hanya memberikan perkiraan. Kurs, tarif layanan, dan ongkos kirim dapat berubah sewaktu-waktu. Angka yang mengikat adalah biaya yang tercantum pada halaman pesanan setelah kami menetapkan harga.' },
        ],
      },
      {
        id: 'pembayaran',
        title: 'Pembayaran',
        blocks: [
          { type: 'ul', items: [
            'Pembayaran dilakukan dalam Rupiah melalui metode yang tersedia di Platform, seperti transfer bank, dompet digital, atau QRIS.',
            'Pembayaran dilakukan dalam dua tahap. Tahap 1 mencakup harga barang, biaya layanan, ongkos kirim internasional, serta bea dan pajak. Tahap 2 mencakup ongkos kirim domestik.',
            'Kami baru membeli barang setelah pembayaran tahap 1 terverifikasi.',
            'Pengiriman domestik dilakukan setelah pembayaran tahap 2 diselesaikan.',
            'Apabila biaya aktual (misalnya berat aktual, bea, atau pajak) berbeda dari estimasi, kami akan menyesuaikannya dan menjelaskan selisihnya pada halaman pesanan.',
          ] },
        ],
      },
      {
        id: 'pengiriman',
        title: 'Pembelian, Pengiriman, dan Konsolidasi',
        blocks: [
          { type: 'ul', items: [
            'Pembelian bergantung pada ketersediaan stok dan harga dari penjual. Jika barang habis atau harga berubah, kami akan menghubungi Anda untuk konfirmasi.',
            'Anda dapat meminta pengecekan kondisi barang saat tiba di Gudang melalui catatan pesanan.',
            'Konsolidasi bersifat opsional. Setelah Anda memilih Konsolidasi & Kirim, barang diproses menuju customs dan tidak dapat dibatalkan.',
            'Estimasi waktu pengiriman bersifat perkiraan. Waktu tempuh bergantung pada pihak ketiga seperti penjual, kurir, dan bea cukai, sehingga tidak dapat kami jamin.',
          ] },
        ],
      },
      {
        id: 'barang-terlarang',
        title: 'Barang Terlarang dan Dibatasi',
        blocks: [
          { type: 'p', text: 'Anda dilarang memesan barang yang dilarang atau dibatasi oleh hukum Indonesia maupun hukum negara asal, termasuk namun tidak terbatas pada:' },
          { type: 'ul', items: [
            'Narkotika, psikotropika, dan obat-obatan keras tanpa izin resmi.',
            'Senjata, amunisi, bahan peledak, dan bahan berbahaya lainnya.',
            'Barang palsu atau hasil pelanggaran hak kekayaan intelektual.',
            'Konten pornografi dan barang yang melanggar kesusilaan.',
            'Satwa atau tumbuhan yang dilindungi.',
            'Minuman beralkohol, produk tembakau, dan barang lain yang memerlukan izin impor khusus.',
          ] },
          { type: 'p', text: 'Kami berhak menolak atau membatalkan pesanan yang melanggar ketentuan ini. Jika barang ditahan atau disita otoritas akibat pelanggaran tersebut, seluruh biaya dan risikonya menjadi tanggung jawab Pelanggan.' },
        ],
      },
      {
        id: 'pembatalan',
        title: 'Pembatalan dan Pengembalian Dana',
        blocks: [
          { type: 'ul', items: [
            'Pesanan dapat dibatalkan tanpa biaya selama belum dibayar atau belum berstatus Dibeli.',
            'Setelah barang dibeli, pesanan tidak dapat dibatalkan, kecuali penjual membatalkan pesanan atau barang tidak tersedia. Dalam kondisi tersebut kami mengembalikan dana yang telah Anda bayarkan untuk barang tersebut.',
            'Pengembalian dana diproses ke metode pembayaran atau rekening yang Anda tentukan, paling lambat 14 hari kerja setelah pembatalan disetujui.',
            'Jika barang yang diterima rusak, cacat, atau tidak sesuai pesanan, laporkan kepada kami maksimal 2 x 24 jam setelah barang diterima, disertai foto atau video unboxing. Kami akan membantu mengajukan klaim kepada penjual, dengan hasil yang mengikuti kebijakan penjual.',
            'Kami tidak menerima pengembalian karena alasan berubah pikiran setelah barang dibeli.',
          ] },
        ],
      },
      {
        id: 'kewajiban',
        title: 'Kewajiban Pelanggan',
        blocks: [
          { type: 'ul', items: [
            'Mencantumkan tautan, varian, ukuran, dan jumlah barang dengan benar dan lengkap.',
            'Memberikan alamat tujuan dan nomor telepon yang aktif dan akurat.',
            'Mengisi NPWP dengan benar apabila ingin menggunakan tarif pajak yang sesuai.',
            'Tidak menggunakan Platform untuk tujuan melawan hukum, penipuan, atau merugikan pihak lain.',
          ] },
        ],
      },
      {
        id: 'tanggung-jawab',
        title: 'Batasan Tanggung Jawab',
        blocks: [
          { type: 'p', text: 'TitipIn bertindak sebagai perantara yang membelikan dan mengirimkan barang atas permintaan Pelanggan. Sejauh diizinkan oleh hukum, kami tidak bertanggung jawab atas:' },
          { type: 'ul', items: [
            'Keterlambatan atau kerusakan yang disebabkan oleh penjual, kurir, bea cukai, atau pihak ketiga lain di luar kendali kami.',
            'Perbedaan deskripsi, kualitas, atau spesifikasi barang yang berasal dari penjual.',
            'Perubahan kebijakan bea masuk dan pajak oleh pemerintah setelah pesanan dibuat.',
            'Kejadian di luar kendali wajar (force majeure), seperti bencana alam, gangguan sistem, atau kebijakan pemerintah.',
          ] },
          { type: 'p', text: 'Tanggung jawab kami atas suatu pesanan, jika ada, dibatasi sebesar nilai pesanan yang bersangkutan.' },
        ],
      },
      {
        id: 'kekayaan-intelektual',
        title: 'Hak Kekayaan Intelektual',
        blocks: [
          { type: 'p', text: 'Nama, logo, tampilan, dan konten pada Platform merupakan milik TitipIn atau pemberi lisensinya. Anda tidak diperkenankan menyalin, memodifikasi, atau menggunakannya untuk kepentingan komersial tanpa izin tertulis dari kami.' },
        ],
      },
      {
        id: 'perubahan',
        title: 'Perubahan Syarat & Ketentuan',
        blocks: [
          { type: 'p', text: 'Kami dapat memperbarui Syarat & Ketentuan ini dari waktu ke waktu. Versi terbaru selalu tersedia di halaman ini dengan tanggal pembaruan yang diperbarui. Dengan tetap menggunakan Platform setelah perubahan berlaku, Anda dianggap menyetujui versi terbaru.' },
        ],
      },
      {
        id: 'hukum',
        title: 'Hukum yang Berlaku dan Penyelesaian Sengketa',
        blocks: [
          { type: 'p', text: 'Syarat & Ketentuan ini diatur oleh hukum Republik Indonesia. Setiap sengketa akan diupayakan diselesaikan secara musyawarah untuk mufakat. Apabila tidak tercapai kesepakatan, sengketa diselesaikan melalui pengadilan yang berwenang di wilayah Jakarta.' },
        ],
      },
      {
        id: 'kontak',
        title: 'Kontak',
        blocks: [
          { type: 'p', text: 'Pertanyaan mengenai Syarat & Ketentuan dapat disampaikan melalui kontak berikut.' },
          { type: 'contact' },
        ],
      },
    ],
  },

  privacy: {
    path: '/kebijakan-privasi',
    navLabel: 'Kebijakan Privasi',
    title: 'Kebijakan Privasi',
    updated: '28 September 2026',
    intro:
      'TitipIn menghargai privasi Anda. Kebijakan Privasi ini menjelaskan data pribadi apa yang kami kumpulkan, untuk apa kami menggunakannya, dengan siapa kami membagikannya, dan hak Anda atas data tersebut, sejalan dengan Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi.',
    sections: [
      {
        id: 'data-dikumpulkan',
        title: 'Data yang Kami Kumpulkan',
        blocks: [
          { type: 'ul', items: [
            'Data akun: nama, alamat email, nomor telepon, dan kata sandi. Kata sandi disimpan dalam bentuk terenkripsi (hash), bukan teks asli.',
            'Data alamat pengiriman: nama penerima, nomor telepon, alamat lengkap, kota, provinsi, dan kode pos.',
            'NPWP (opsional): digunakan untuk perhitungan pajak impor.',
            'Data pesanan: tautan produk, varian, jumlah, harga, catatan pesanan, riwayat status, serta metode dan waktu pembayaran.',
            'Data komunikasi: catatan yang Anda kirim pada pesanan dan notifikasi yang kami kirimkan kepada Anda.',
            'Data teknis: token sesi login pada penyimpanan lokal peramban, serta catatan akses server (seperti alamat IP dan waktu akses) yang dapat dicatat oleh penyedia infrastruktur kami.',
          ] },
          { type: 'p', text: 'Kami tidak menyimpan nomor kartu, PIN, atau kata sandi rekening maupun dompet digital Anda.' },
        ],
      },
      {
        id: 'tujuan',
        title: 'Tujuan Penggunaan Data',
        blocks: [
          { type: 'ul', items: [
            'Membuat dan mengelola akun Anda.',
            'Memproses pesanan, termasuk pembelian, konsolidasi, pengurusan customs, dan pengiriman.',
            'Menghitung biaya, bea, dan pajak yang sesuai.',
            'Mengirim notifikasi mengenai status pesanan dan pembayaran.',
            'Memberikan dukungan pelanggan dan menanggapi pertanyaan atau klaim.',
            'Menjaga keamanan Platform serta mencegah penipuan dan penyalahgunaan.',
            'Memenuhi kewajiban hukum dan permintaan resmi dari otoritas yang berwenang.',
          ] },
        ],
      },
      {
        id: 'pembagian',
        title: 'Pembagian Data kepada Pihak Ketiga',
        blocks: [
          { type: 'p', text: 'Kami tidak menjual data pribadi Anda. Data hanya dibagikan seperlunya kepada pihak berikut untuk menjalankan layanan:' },
          { type: 'ul', items: [
            'Mitra logistik dan kurir domestik (nama penerima, nomor telepon, dan alamat pengiriman).',
            'Otoritas kepabeanan dan perpajakan, untuk keperluan deklarasi impor, termasuk NPWP bila diberikan.',
            'Penjual atau marketplace di luar negeri, sebatas data yang diperlukan untuk memproses pembelian.',
            'Penyedia pembayaran, untuk memverifikasi transaksi.',
            'Penyedia infrastruktur teknologi (hosting dan basis data) yang memproses data atas nama kami.',
            'Aparat penegak hukum atau lembaga pemerintah, apabila diwajibkan oleh peraturan perundang-undangan.',
          ] },
        ],
      },
      {
        id: 'keamanan',
        title: 'Penyimpanan dan Keamanan Data',
        blocks: [
          { type: 'ul', items: [
            'Kata sandi di-hash sebelum disimpan, dan sesi login menggunakan token yang memiliki masa berlaku.',
            'Akses data dibatasi berdasarkan peran: Pelanggan hanya dapat melihat data miliknya sendiri, sedangkan akses admin dibatasi untuk keperluan operasional.',
            'Komunikasi antara peramban dan server dilindungi koneksi terenkripsi (HTTPS).',
            'Data disimpan pada layanan komputasi awan yang dapat berlokasi di luar Indonesia, misalnya di Singapura.',
          ] },
          { type: 'p', text: 'Tidak ada sistem yang sepenuhnya kebal dari risiko. Karena itu, mohon jaga kerahasiaan kata sandi Anda dan segera hubungi kami jika menduga terjadi akses tanpa izin.' },
        ],
      },
      {
        id: 'retensi',
        title: 'Masa Penyimpanan Data',
        blocks: [
          { type: 'p', text: 'Data Anda disimpan selama akun aktif dan selama diperlukan untuk menjalankan layanan. Setelah itu, data transaksi tertentu dapat tetap kami simpan sepanjang diperlukan untuk memenuhi kewajiban hukum, penyelesaian sengketa, atau penegakan perjanjian, lalu dihapus atau dianonimkan.' },
        ],
      },
      {
        id: 'hak',
        title: 'Hak Anda',
        blocks: [
          { type: 'p', text: 'Sesuai peraturan yang berlaku, Anda berhak untuk:' },
          { type: 'ul', items: [
            'Mengakses dan memperoleh salinan data pribadi Anda.',
            'Memperbarui data, seperti nama, nomor telepon, NPWP, alamat, dan kata sandi melalui halaman Profil.',
            'Meminta penghapusan atau pembatasan pemrosesan data, sepanjang tidak bertentangan dengan kewajiban hukum kami.',
            'Menarik persetujuan pemrosesan data atau mengajukan keberatan.',
          ] },
          { type: 'p', text: 'Untuk menggunakan hak tersebut, hubungi kami melalui kontak di bawah. Kami akan menanggapi dalam jangka waktu yang wajar.' },
        ],
      },
      {
        id: 'penyimpanan-lokal',
        title: 'Penyimpanan Lokal dan Layanan Pihak Ketiga',
        blocks: [
          { type: 'ul', items: [
            'Kami menggunakan penyimpanan lokal (local storage) peramban untuk menyimpan token sesi login. Token dihapus saat Anda keluar dari akun.',
            'Kami tidak menggunakan cookie pelacakan untuk iklan.',
            'Halaman kami memuat font dari Google Fonts, sehingga alamat IP Anda dapat diterima oleh penyedia tersebut saat halaman dibuka.',
          ] },
        ],
      },
      {
        id: 'anak',
        title: 'Pengguna di Bawah Umur',
        blocks: [
          { type: 'p', text: 'Layanan TitipIn tidak ditujukan bagi anak di bawah 18 tahun. Jika kami mengetahui data pengguna di bawah umur terkumpul tanpa persetujuan yang sah, kami akan menghapusnya.' },
        ],
      },
      {
        id: 'perubahan',
        title: 'Perubahan Kebijakan',
        blocks: [
          { type: 'p', text: 'Kebijakan ini dapat diperbarui sewaktu-waktu. Versi terbaru selalu tersedia di halaman ini beserta tanggal pembaruannya. Untuk perubahan yang penting, kami akan memberi tahu Anda melalui Platform.' },
        ],
      },
      {
        id: 'kontak',
        title: 'Hubungi Kami',
        blocks: [
          { type: 'p', text: 'Pertanyaan, permintaan, atau keluhan terkait data pribadi dapat disampaikan melalui:' },
          { type: 'contact' },
        ],
      },
    ],
  },
};
