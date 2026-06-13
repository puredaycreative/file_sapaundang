import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Konfigurasi Environment (Sesuaikan dengan .env Anda)
const BACKEND_URL = "https://www.puredayinvitation.com";
const HOST_TEMPLATE = "http://localhost:3004";
const API = `${BACKEND_URL}/api`;

// --- FUNGSI TETAP SAMA (DARI SKRIP REACT ANDA) ---

function formatIndonesianDate(dateTimeString) {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    const options = {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false,
        timeZoneName: 'short'
    };
    try {
        return date.toLocaleString('id-ID', options);
    } catch (error) {
        return date.toLocaleDateString();
    }
}

function formatIndonesianDateonly(dateTimeString) {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    try {
        return date.toLocaleString('id-ID', options);
    } catch (error) {
        return date.toLocaleDateString('id-ID', options);
    }
}

// const pisahkanDataLengkap = (fullString) => {
//     if (!fullString) return { nama_lengkap: '', nama_bapak: '', nama_ibu: '', alamat: '', ig: '' };
//     const bagian = fullString.split('|').map(item => item.trim());
//     const namaDanOrangTua = bagian[0] || "";
//     const alamat = bagian[1] || "";
//     const ig = bagian[2] || "";
//     const regex = /\s\((.*?)\s*&\s*(.*?)\)/;
//     const match = namaDanOrangTua.match(regex);
//     let nama_lengkap = namaDanOrangTua;
//     let nama_bapak = '';
//     let nama_ibu = '';
//     if (match) {
//         nama_bapak = match[1].trim(); 
//         nama_ibu = match[2].trim(); 
//         nama_lengkap = namaDanOrangTua.replace(match[0], '').trim();
//     }
//     return { nama_lengkap, nama_bapak, nama_ibu, alamat, ig };
// };

// --- END FUNGSI ---


const pisahkanDataLengkap = (fullString) => {
    if (!fullString) return { nama_lengkap: '', prefixdepan: '', nama_bapak: '', nama_ibu: '', alamat: '', ig: '' };

    const bagian = fullString.split('|').map(item => item.trim());
    const rawNama = bagian[0] || "";
    const alamat = bagian[1] || "";
    const ig = bagian[2] || "";

   const regex = /^(.*?)\s*\(\s*(?:\*(.*?)\*)?\s*(.*?)\s*&\s*(.*?)\s*\)/;
    const match = rawNama.match(regex);

    const nama_lengkap = match ? match[1].trim() : rawNama;
    const prefixdepan = match ? (match[2] ? match[2].trim() : '') : '';
    const nama_bapak = match ? match[3].trim() : '';
    const nama_ibu = match ? match[4].trim() : '';

    return { nama_lengkap, prefixdepan, nama_bapak, nama_ibu, alamat, ig };
};




app.get('/more/:slug', async (req, res) => {
    const { slug } = req.params;
    const guestName = req.query.to || 'Tamu Undangan';

    try {
        // 1. Ambil data invitation
        const invRes = await axios.get(`${API}/invitations/${slug}`);
        const invitation = invRes.data;

        // 2. Ambil komentar
        const commentRes = await axios.get(`${API}/comments/public/${invitation.id}`);
        const comments = commentRes.data || [];

        // 3. Ambil data template
        const tmplRes = await axios.get(`${API}/templates/${invitation.template_id}`);
  
        const { filename } = tmplRes.data;
        console.log(filename)
        const nameWithoutExt = filename.replace(/\.html?$/i, '');

        // 4. Ambil file HTML template
        const fileRes = await axios.get(`${HOST_TEMPLATE}/${nameWithoutExt}/${filename}`);
        console.log(`${HOST_TEMPLATE}/${nameWithoutExt}/${filename}`)
        let htmlContent = fileRes.data;
       

        // 5. Olah aset
        const gallery = invitation.gallery_images || [];
        const foto_pria = gallery[0] || "";
        const foto_wanita = gallery[1] || "";
        const galeri3 = gallery[2] || "";
        const galeri4 = gallery[3] || "";
        const galeri5 = gallery[4] || "";
        const galeri6 = gallery[5] || "";
        const galeri7 = gallery[6] || "";
        const galeri8 = gallery[7] || "";
        const galeri9 = gallery[8] || "";
        const galeri10 = gallery[9] || "";
        const galeri11 = gallery[10] || "";
        const galeri12 = gallery[11] || "";

        const galeri_lain = gallery.slice(2);

        // 6. Buat HTML galeri
        const galleryHtml = galeri_lain
            .map(url => `
                <div class="slider-item" style="max-width: 500px; margin: 0 auto;">
                    <img src="${url}" />
                </div>`)
            .join("");

        // 7. Buat HTML Event Times
        // const eventTimesHTML = Array.isArray(invitation.event_times)
        //     ? invitation.event_times
        //         .map(et => `
        //             <div class="event-item">
        //                 <h4>${et.name}</h4>
        //                 <p>${et.allTime ? "Jam Bebas" : `${et.time} - ${et.isUntilFinish ? "Selesai" : et.endTime}`}</p>
        //                 <p><small>${et.description || ""}</small></p>
        //                 <small>${et.location || ""}</small>
        //                 ${et.map_url ? `<p><a href="${et.map_url}" class="btn-maps-link animate-up" target="_blank">Buka di Google Maps</a></p>` : ""}
        //             </div>`)
        //         .join("")
        //     : "";
        const eventTimesHTML = Array.isArray(invitation.event_times)
    ? invitation.event_times
        .map(et => {
            // Logika untuk menentukan format waktu
            let timeDisplay = "";
            if (et.allTime) {
                timeDisplay = "Jam Bebas";
            } else if (et.isUntilFinish) {
                timeDisplay = `${et.time} - Selesai`;
            } else if (et.time && et.endTime) {
                timeDisplay = `${et.time} - ${et.endTime}`;
            } else {
                // Jika hanya ada et.time dan tidak memenuhi kondisi di atas
                timeDisplay = et.time || "";
            }

            return `
            <div class="event-item">
                <h4>${et.name}</h4>
                <p>${timeDisplay}</p>
                <p><small>${et.description || ""}</small></p>
                <small>${et.location || ""}</small>
                ${et.map_url ? `<p><a href="${et.map_url}" class="btn-maps-link animate-up" target="_blank">Buka di Google Maps</a></p>` : ""}
            </div>`;
        })
        .join("")
    : "";

        // 8. Buat HTML Bank Card
  const bankCardHTML = Array.isArray(invitation.bank_accounts)
    ? invitation.bank_accounts
          .map((ba, index) => {
              // Membuat ID unik yang aman (menggunakan index agar tidak error jika bank_name kosong)
              const accountId = `data-${index}`;
              const isAddress = !ba.bank_name || ba.bank_name.trim() === "";

              // TAMPILAN JIKA ALAMAT (bank_name kosong)
              if (isAddress) {
                  return `
                    <div class="address-card">
                        <p class="address-title">Kirim Kado Kesini</p>
                        <button class="copy-address-btn" onclick="copyText('${accountId}', '')">
                            <i class="fas fa-map-marker-alt"></i> Salin Alamat
                        </button>
                        
                        <p class="receiver-name">
                            ${ba.account_name || ''}
                        </p>
                        
                        <p id="${accountId}" class="address-detail-text">
                            ${ba.account_number || "Alamat Tidak Ditemukan"}
                        </p>
                    </div>`;
              }

              // TAMPILAN JIKA BANK (bank_name terisi)
              return `
                <div class="bank-accounts-cards">
                    <button class="copy-btn" onclick="copyText('${accountId}', '')">
                        <i class="fas fa-copy"></i> Salin
                    </button>
                    
                    <p class="bank-name">
                        ${ba.bank_name}
                    </p>
                    <p class="bank-name">
                        ${ba.account_name || ''}
                    </p>
                    
                    <p id="${accountId}" class="account-number-text">
                        ${ba.account_number || "Nomor Tidak Ditemukan"}
                    </p>
                </div>`;
          })
          .join("")
    : "";
        // 9. Pemrosesan Data Orang Tua & IG
        const hasilPria = pisahkanDataLengkap(invitation.instagram_groom);
        const hasilWanita = pisahkanDataLengkap(invitation.instagram_bride);

        console.log(invitation.instagram_groom)

// Cek apakah hasilPria.prefixdepan ada isinya
if (hasilPria.prefixdepan) {
    htmlContent = htmlContent.replace(/Putra dari Bapak/gi, hasilPria.prefixdepan);
}

// Cek apakah hasilWanita.prefixdepan ada isinya
if (hasilWanita.prefixdepan) {
    htmlContent = htmlContent.replace(/Putri dari Bapak/gi, hasilWanita.prefixdepan);
}


        // 10. Buat HTML Comments
        const commentsHTML = comments.map(c => {
            const attendanceStatus = c.will_attend === 'yes' ? 'Hadir' : 'Tidak Hadir';
            const formattedDate = formatIndonesianDate(c.created_at);
            return `
                <div class="comment-card">
                    <div class="comment-header">
                        <span class="comment-author">
                            <strong class="author-name">${c.guest_name}</strong> 
                            <span class="attendance-status">(${attendanceStatus})</span>
                        </span>
                    </div>
                    <p class="comment-message">${c.message}</p>
                    <p class="comment-date">${formattedDate}</p>
                </div>`;
        }).join("");

                const loveStoryHTML = Array.isArray(invitation.love_story)
  ? invitation.love_story
      .map((story, index) => {
          const imgHTML = story.img_story 
            ? `<div class="ls-card-img"><img src="${story.img_story}" alt="${story.title_story || 'Story'}"></div>` 
            : '';

          return `
            <div class="ls-item">
                <div class="ls-icon-heart"></div>
                <div class="ls-card">
                    ${imgHTML}
                    <h3 class="ls-card-title">${story.title_story || ''}</h3>
                    <p class="ls-card-body">
                        ${story.text_story || ''}
                    </p>
                </div>
            </div>`;
      })
      .join("")
  : "";

        // 11. Replacements
        const replacements = {
            "{{id}}": invitation.id,
            "{{nama_tamu}}": guestName,
            "{{nama_pria}}": invitation.groom_name,
            "{{nama_wanita}}": invitation.bride_name,
            "{{nama_pria_lengkap}}": hasilPria.nama_lengkap,
            "{{nama_bapak_pria}}": hasilPria.nama_bapak,
            "{{nama_ibu_pria}}": hasilPria.nama_ibu,
            "{{alamat_pria}}": hasilPria.alamat,
            "{{ig_pria}}": hasilPria.ig,
            "{{nama_wanita_lengkap}}": hasilWanita.nama_lengkap,
            "{{nama_bapak_wanita}}": hasilWanita.nama_bapak,
            "{{nama_ibu_wanita}}": hasilWanita.nama_ibu,
            "{{alamat_wanita}}": hasilWanita.alamat,
            "{{ig_wanita}}": hasilWanita.ig,
            "{{tanggal_acara}}": invitation.event_date,
            "{{tanggal_acara_baca}}": formatIndonesianDateonly(invitation.event_date),
            "{{cover}}": invitation.cover_image,
            "{{rsvp}}": invitation.rsvp,
             "{{lovestori}}": loveStoryHTML,
            "{{bank_details_table}}": bankCardHTML,
            "{{foto_pria}}": foto_pria,
            "{{foto_wanita}}": foto_wanita,
            "{{galeri}}": galleryHtml,
            "{{galeri3}}": galeri3, "{{galeri4}}": galeri4, "{{galeri5}}": galeri5,
            "{{galeri6}}": galeri6, "{{galeri7}}": galeri7, "{{galeri8}}": galeri8,
            "{{galeri9}}": galeri9, "{{galeri10}}": galeri10, "{{galeri11}}": galeri11,
            "{{galeri12}}": galeri12,
            "{{waktu_acara}}": invitation.event_time,
            "{{music}}": `https://img.puredayinvitation.com/music/${invitation.music_file}`,
            "{{event_times}}": eventTimesHTML,
            "{{comments}}": commentsHTML
        };

        for (const key in replacements) {
            htmlContent = htmlContent.replace(new RegExp(key, "g"), replacements[key] || "");
        }

        // 12. Menambahkan logic Local Storage (Client-side script injection)
        const storageScript = `
            <script>
                localStorage.setItem('invitationId', '${invitation.id}');
            </script>
        </body>`;
        htmlContent = htmlContent.replace('</body>', storageScript);

        res.send(htmlContent);

    } catch (err) {
        console.error("Error:", err.message);
        res.status(404).send("<h1>404 - Undangan Tidak Ditemukan</h1>");
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});