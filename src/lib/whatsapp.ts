/**
 * WhatsApp Notification Helper using Fonnte API
 */
export async function sendWhatsAppMessage(target: string, message: string, fileUrl?: string): Promise<{ success: boolean; data?: any; error?: string }> {
  const token = process.env.FONNTE_TOKEN;

  // Bersihkan format nomor HP (contoh: 0812... menjadi 62812...)
  let formattedTarget = target.trim().replace(/[^0-9]/g, '');
  if (formattedTarget.startsWith('0')) {
    formattedTarget = '62' + formattedTarget.slice(1);
  }

  // Jika token Fonnte tidak diatur, cetak pesan di console (Simulasi Mode Development)
  if (!token) {
    console.log(`\n--- [WHATSAPP SIMULATION] ---`);
    console.log(`Penerima : ${formattedTarget} (${target})`);
    console.log(`Pesan    : ${message}`);
    if (fileUrl) {
      console.log(`Lampiran : ${fileUrl}`);
    }
    console.log(`-----------------------------\n`);
    return { success: true, data: { detail: "Simulasi berhasil dijalankan (Token Fonnte belum dikonfigurasi di .env)" } };
  }

  try {
    const formData = new FormData();
    formData.append('target', formattedTarget);
    formData.append('message', message);
    if (fileUrl) {
      formData.append('url', fileUrl);
      formData.append('file', fileUrl);
    }

    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': token
      },
      body: formData
    });

    const result = await response.json();
    
    if (response.ok && result.status === true) {
      return { success: true, data: result };
    } else {
      return { success: false, error: result.detail || "Gagal mengirim pesan via Fonnte" };
    }
  } catch (err: any) {
    console.error("Gagal mengirim WhatsApp:", err);
    return { success: false, error: err.message || "Terjadi kesalahan koneksi" };
  }
}
