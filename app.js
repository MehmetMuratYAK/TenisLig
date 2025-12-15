
document.addEventListener('DOMContentLoaded', function() {
    // --- FIREBASE BAŞLATMA ---
    const firebaseConfig = {
        apiKey: "AIzaSyCdrG3likzeKwv1YcMZe-9FAiaQxJoYMO8",
        authDomain: "tenisligi-4672a.firebaseapp.com",
        projectId: "tenisligi-4672a",
        storageBucket: "tenisligi-4672a.firebasestorage.app",
        messagingSenderId: "380772240660",
        appId: "1:380772240660:web:39186d8fee6ff35d0c8601"
    };

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const auth = firebase.auth();
    const db = firebase.firestore();
    
  // --- KORT LİSTESİ ---
    const COURT_LIST = [
        "Meşelipark Tenis Kulübü", "Evrensel Tenis", "Esas Tenis ve Spor Kulübü", "Podyum Tenis",
        "Bursa Yenigün Tenis Kortu", "Hüdavendigar Spor Tesisleri", "Yenigün Tenis Akademi",
        "Ertuğrul Sağlam Tenis Kortları", "Altınşehir Gençlik Merkezi", "Nilüfer Hobi Bahçeleri Tenis Sahası",
        "Gd Academy Bursa", "Uni+ Sport Club Tenis Kortları", "Aslanlar Tenis Akademisi", "Ferdi / Bağımsız"
    ];

    // YENİ: Dropdownları doldurma fonksiyonu
    function populateClubDropdowns() {
        const selects = ['register-club', 'edit-club', 'leaderboard-club-filter'];
        
        selects.forEach(id => {
            const el = document.getElementById(id);
            if(!el) return;
            
            // Sıralama filtresi için olanı temizleme (Tüm Kulüpler kalsın diye), diğerlerine option ekle
            COURT_LIST.forEach(court => {
                const opt = document.createElement('option');
                opt.value = court;
                opt.textContent = court;
                el.appendChild(opt);
            });
        });
    }
    // Sayfa yüklenince çalıştır
    populateClubDropdowns();

    // --- GOOGLE APPS SCRIPT İLE MAİL GÖNDERME ---
// Kopyaladığın uzun linki tırnak içine yapıştır:
const MAIL_API_URL = "https://script.google.com/macros/s/AKfycbxHcYdbhFkkm9PK4i8x3Fj3MaNStwPauO4LvJHZHlZqIvgcsWqO_c3naNv3lYIY1eRs/exec"; 

async function sendNotificationEmail(targetUserId, subject, messageHTML) {
    const targetUser = userMap[targetUserId];
    
    // 1. Temel Kontroller: Kullanıcı veya e-posta adresi var mı?
    if (!targetUser || !targetUser.email) {
        console.log("Mail gönderilmedi: Kullanıcı veya e-posta adresi bulunamadı.");
        return;
    }

    // 2. Tercih Kontrolü: Kullanıcı e-posta bildirimini özellikle kapattı mı?
    // Veritabanında bu alan henüz yoksa (undefined) varsayılan olarak gönderim yapılır.
    // Sadece 'false' ise engellenir.
    if (targetUser.emailNotifications === false) {
        console.log(`Mail engellendi: ${targetUser.isim} e-posta bildirimi almak istemiyor.`);
        return;
    }

    const emailData = {
        to: targetUser.email,
        subject: subject,
        body: `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h2 style="color: #c06035;">Tenis Ligi Bildirimi 🎾</h2>
                <p>Merhaba <strong>${targetUser.isim}</strong>,</p>
                <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #c06035; margin: 10px 0;">
                    ${messageHTML}
                </div>
                <p style="font-size: 12px; color: #999;">
                    Bu otomatik bir bildirimdir. 
                    <br>Bildirim ayarlarınızı profil sayfasından yönetebilirsiniz.
                </p>
            </div>
        `
    };

    try {
        // "no-cors" modu, tarayıcının Google'dan dönen yanıtı bloklamasını engeller.
        // Yanıtın içeriğini (ok/fail) okuyamayız ama isteği göndermiş oluruz.
        await fetch(MAIL_API_URL, {
            method: "POST",
            mode: "no-cors", 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(emailData)
        });
        console.log(`Mail isteği gönderildi: ${targetUser.isim}`);
    } catch (error) {
        console.error("Mail gönderme hatası:", error);
    }
}

    // --- ROZET TANIMLARI (GAMIFICATION) ---
    const BADGE_DEFINITIONS = {
        'newbie': { icon: '🐣', name: 'Çaylak', desc: 'Ligdeki ilk maçına çıktın.' },
        'first_win': { icon: '🥇', name: 'İlk Kan', desc: 'Ligdeki ilk galibiyetini aldın.' },
        'hat_trick': { icon: '🔥', name: 'Alev Aldı', desc: 'Üst üste 3 galibiyet serisi.' },
        'unstoppable': { icon: '🚀', name: 'Durdurulamaz', desc: 'Üst üste 5 galibiyet serisi.' },
        'legend_streak': { icon: '🦁', name: 'Ligin Efsanesi', desc: 'Üst üste 10 galibiyet serisi.' },
        'clay_master': { icon: '🧱', name: 'Toprak Ağası', desc: 'Toprak kortta 5 galibiyet.' },
        'hard_hitter': { icon: '🟦', name: 'Beton Delen', desc: 'Sert kortta 5 galibiyet.' },
        'grass_king': { icon: '🌱', name: 'Çim Ustası', desc: 'Çim kortta 5 galibiyet.' },
        'marathon': { icon: '🏃', name: 'Maratoncu', desc: '3 set süren zorlu bir maçı kazandın.' },
        'bagel_master': { icon: '🥯', name: 'Fırıncı', desc: 'Bir seti 6-0 kazandın.' },
        'comeback_kid': { icon: '🪃', name: 'Geri Dönüş', desc: 'İlk seti kaybedip maçı kazandın.' },
        'veteran': { icon: '👴', name: 'Tecrübeli', desc: 'Ligde 20 maç tamamladın.' },
        'champion': { icon: '👑', name: 'Şampiyon', desc: '3000 puana ulaştın.' }
    };
    // --- YARDIMCI: PUANDAN LİG BULMA ---
const getPlayerLeague = (points) => {
    if (points >= 3000) return 'Altın';
    if (points >= 1000) return 'Gümüş';
    return 'Bronz';
};

    // --- YAPAY ZEKA CÜMLE HAVUZU ---
    const AI_PHRASES = {
        intros: [
            "İnanılmaz bir haber!", "Kortlardan son dakika!", "Tenis severler buraya!", 
            "Bursa sallandı!", "Raketler konuştu!", "Gözler bu maçtaydı.", "Nefesler tutuldu."
        ],
        verbs: [
            "sahadan sildi", "rüzgar gibi esti", "duvar ördü", "adeta dans etti", 
            "rakibini çaresiz bıraktı", "kortu dar etti", "tarih yazdı", "müthiş savaştı"
        ],
        adjectives: [
            "efsanevi", "akıl almaz", "muazzam", "kusursuz", 
            "kritik", "heyecan dolu", "destansı", "şok edici"
        ],
        reactions: ["😱", "🔥", "🎾", "👏", "💪", "🤯", "✨", "🚀"],
        closings: [
            "Bu performans konuşulur.", "Ligde dengeler değişiyor.", "Sıradaki rakip kim olacak?", 
            "Formunun zirvesinde.", "Şapka çıkartılır.", "Alkışlar ona gelsin."
        ]
    };

    // --- DEĞİŞKENLER ---
    let userMap = {}; 
    let currentMatchDocId = null; 
    let isLoginMode = true; 
    let listeners = [];
    let isReadOnlyView = false;
    let currentChatId = null;
    let currentChatUnsubscribe = null;
    let returnToTab = null; 
    let matchInteractionListeners = []; // YENİ: Anket ve yorum listener'larını tutmak için

    // --- DOM ELEMENTLERİ (GENEL) ---
    const authScreen = document.getElementById('auth-screen');
    const mainApp = document.getElementById('main-app');
    
    // --- AUTH DOM ELEMENTLERİ ---
    const tabLoginSwitch = document.getElementById('tab-login-switch');
    const tabRegisterSwitch = document.getElementById('tab-register-switch');
    const registerFields = document.getElementById('register-fields');
    const authActionBtn = document.getElementById('auth-action-btn');
    const authError = document.getElementById('auth-error');
    const loginFooterLinks = document.getElementById('login-footer-links');
    
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const fullNameInput = document.getElementById('full-name');
    const courtPreferenceSelect = document.getElementById('court-preference'); 
    const phoneNumberInput = document.getElementById('phone-number');
    const profilePhotoInput = document.getElementById('profile-photo');
    const profilePreview = document.getElementById('profile-preview');

    // --- ŞİFRE SIFIRLAMA ELEMENTLERİ ---
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    const forgotPasswordModal = document.getElementById('forgot-password-modal');
    const resetEmailInput = document.getElementById('reset-email');
    const btnSendResetLink = document.getElementById('btn-send-reset-link');
    const resetMsg = document.getElementById('reset-msg');

    // --- DİĞER DOM ELEMENTLERİ ---
    const challengeForm = document.getElementById('challenge-form');
    const createAdForm = document.getElementById('create-ad-form');
    const opponentSelect = document.getElementById('opponent-select');
    const matchTypeSelect = document.getElementById('match-type-select');
    const wagerPointsInput = document.getElementById('wager-points');
    
    const adMatchTypeSelect = document.getElementById('ad-match-type');
    const adWagerPointsInput = document.getElementById('ad-wager-points');

    const btnShowCreateAd = document.getElementById('btn-show-create-ad');
    const btnShowSpecificChallenge = document.getElementById('btn-show-specific-challenge');
    const submitChallengeBtn = document.getElementById('submit-challenge-btn');
    const submitAdBtn = document.getElementById('submit-ad-btn');
    
    const openRequestsContainer = document.getElementById('lobby-requests-container');
    const scheduledMatchesContainer = document.getElementById('lobby-scheduled-container');
    const announcementsContainer = document.getElementById('lobby-announcements-container'); 
    
    const leaderboardDiv = document.getElementById('leaderboard');
    const chatListContainer = document.getElementById('chat-list-container');
    
    // --- MAÇ AKIŞI DOM ELEMENTLERİ ---
    const myActiveMatchesContainer = document.getElementById('my-active-matches-container');
    const myPendingMatchesContainer = document.getElementById('my-pending-matches-container');
    const myHistoryMatchesContainer = document.getElementById('my-history-matches-container');
    
    const histFilterStart = document.getElementById('hist-filter-start');
    const histFilterEnd = document.getElementById('hist-filter-end');
    const histFilterPlayerName = document.getElementById('hist-filter-player-name');
    const histFilterCourt = document.getElementById('hist-filter-court');
    const btnApplyHistoryFilter = document.getElementById('btn-apply-history-filter');

    // --- FİKSTÜR DOM ELEMENTLERİ ---
    const filtersContainer = document.getElementById('filters-container');
    const filterDateStart = document.getElementById('filter-date-start');
    const filterDateEnd = document.getElementById('filter-date-end');
    const filterCourt = document.getElementById('filter-court');
    const filterPlayer = document.getElementById('filter-player');
    const applyFiltersBtn = document.getElementById('apply-filters-btn');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');

    const fixtureActiveContainer = document.getElementById('fixture-active-container');
    const fixturePendingContainer = document.getElementById('fixture-pending-container');
    const fixtureHistoryContainer = document.getElementById('fixture-history-container');

    // --- EN'LER (BESTS) DOM ELEMENTLERİ ---
    const bestsContainer = document.getElementById('bests-container');
    const bestsFilterSelect = document.getElementById('bests-filter-select');

    // --- GALERİ DOM ELEMENTLERİ (YENİ EKLENDİ) ---
    const galleryGrid = document.getElementById('gallery-grid');
    const galleryFilterDate = document.getElementById('gallery-filter-date');
    const galleryFilterCourt = document.getElementById('gallery-filter-court');
    const galleryFilterPlayer = document.getElementById('gallery-filter-player');
    const btnGalleryFilter = document.getElementById('btn-gallery-filter');
    const btnGalleryClear = document.getElementById('btn-gallery-clear');

    // --- MAÇ DETAY DOM ELEMENTLERİ ---
    const matchDetailView = document.getElementById('match-detail-view');
    const detailMatchInfo = document.getElementById('detail-match-info');
    const detailMatchPhoto = document.getElementById('detail-match-photo');
    const winnerSelect = document.getElementById('winner-select');
    const backToListBtn = document.getElementById('back-to-list-btn');
    const scoreInputSection = document.getElementById('score-input-section');
    const scoreDisplaySection = document.getElementById('score-display-section');
    const actionButtonsContainer = document.getElementById('action-buttons-container');
    const scheduleInputSection = document.getElementById('schedule-input-section');
    
    // --- MAÇ FOTOĞRAF YÜKLEME DOM ---
    const matchResultPhotoInput = document.getElementById('match-result-photo'); 
    const matchUploadPreview = document.getElementById('match-upload-preview'); 
    
    const matchCourtTypeSelect = document.getElementById('match-court-type-select');
    const matchVenueSelect = document.getElementById('match-venue-select');
    
    const matchTimeInput = document.getElementById('match-time-input');
    const saveScheduleBtn = document.getElementById('save-schedule-btn');
    const chatFromMatchBtn = document.getElementById('chat-from-match-btn');

    const notificationContainer = document.getElementById('notification-container');
    const playerStatsModal = document.getElementById('player-stats-modal');
    const startChatBtn = document.getElementById('start-chat-btn'); 
    
    const statsPlayerName = document.getElementById('stats-player-name');
    const statsTotalPoints = document.getElementById('stats-total-points');
    const statsCourtPref = document.getElementById('stats-court-pref');
    const statsPlayerPhoto = document.getElementById('stats-player-photo');
    const statsBadgesGrid = document.getElementById('stats-badges-grid');

    const chatModal = document.getElementById('chat-window-modal');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendMessageBtn = document.getElementById('send-message-btn');
    const chatRecipientName = document.getElementById('chat-recipient-name');
    const closeChatModal = document.getElementById('close-chat-window');
    const clearChatBtn = document.getElementById('clear-chat-btn'); 

    // --- PROFİL EDİT DOM ---
    const editProfilePhotoInput = document.getElementById('edit-profile-photo');
    const editProfilePreview = document.getElementById('edit-profile-preview');
    const editFullNameInput = document.getElementById('edit-full-name');
    const editCourtPreference = document.getElementById('edit-court-preference');
    const editPhoneNumber = document.getElementById('edit-phone-number');
    const editNotificationPreference = document.getElementById('edit-notification-preference');
    const saveProfileBtn = document.getElementById('save-profile-btn');
    const logoutBtnProfile = document.getElementById('logout-btn-profile');
    const myBadgesContainer = document.getElementById('my-badges-container');
    const myPhotosContainer = document.getElementById('my-photos-container'); // YENİ EKLENDİ
    
    // --- İSTATİSTİK DOM ELEMENTLERİ ---
    const statsViewPlayerSelect = document.getElementById('stats-view-player-select');
    const statTotalMatch = document.getElementById('stat-total-match');
    const statTotalWin = document.getElementById('stat-total-win');
    const statTotalPointsDisplay = document.getElementById('stat-total-points'); 
    const chartWinRate = document.getElementById('chart-win-rate');
    const chartSetRate = document.getElementById('chart-set-rate');
    const chartGameRate = document.getElementById('chart-game-rate');
    const barClay = document.getElementById('bar-clay');
    const valClay = document.getElementById('val-clay');
    const barHard = document.getElementById('bar-hard');
    const valHard = document.getElementById('val-hard');
    const barGrass = document.getElementById('bar-grass');
    const valGrass = document.getElementById('val-grass');
    const statFormBadges = document.getElementById('stat-form-badges');

    const navItems = document.querySelectorAll('.nav-item');
    const tabSections = document.querySelectorAll('.tab-section');

    // --- YARDIMCI FONKSİYONLAR ---

// --- YENİ VE GELİŞMİŞ SIKIŞTIRMA FONKSİYONU ---
// Bu fonksiyon fotoğrafı alır, yeniden boyutlandırır ve 
// 1 MB (Firestore sınırı) altına inene kadar sıkıştırır.
const compressAndConvertToBase64 = (file, targetWidth = 1000) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            
            img.onload = () => {
                try {
                    const elem = document.createElement('canvas');
                    
                    // Boyut Orantılama (Aspect Ratio koruma)
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > targetWidth) {
                        height = height * (targetWidth / width);
                        width = targetWidth;
                    }
                    
                    elem.width = width;
                    elem.height = height;
                    
                    const ctx = elem.getContext('2d');
                    if (!ctx) {
                        reject(new Error("Canvas oluşturulamadı."));
                        return;
                    }

                    // Yumuşatma ayarı (daha iyi görüntü için)
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // --- AKILLI SIKIŞTIRMA DÖNGÜSÜ ---
                    let quality = 0.9; // %90 kalite ile başla
                    
                    // DÜZELTME: ctx.toDataURL yerine elem.toDataURL kullanıyoruz
                    let dataUrl = elem.toDataURL('image/jpeg', quality); 
                    
                    const MAX_SIZE = 950000; 

                    while (dataUrl.length > MAX_SIZE && quality > 0.1) {
                        // Eğer dosya hala büyükse kaliteyi %10 düşür ve tekrar dene
                        quality -= 0.1;
                        console.log(`Dosya büyük (${(dataUrl.length/1024).toFixed(0)} KB), sıkıştırılıyor... Yeni Kalite: ${quality.toFixed(1)}`);
                        
                        // DÜZELTME: Burada da elem.toDataURL kullanıyoruz
                        dataUrl = elem.toDataURL('image/jpeg', quality);
                    }
                    
                    console.log(`Sonuç: ${(dataUrl.length/1024).toFixed(0)} KB, Kalite: ${quality.toFixed(1)}`);
                    resolve(dataUrl);

                } catch (error) {
                    console.error("Görsel işleme hatası:", error);
                    reject(error);
                }
            };
            
            img.onerror = (error) => reject(error);
        };
        
        reader.onerror = (error) => reject(error);
    });
};
    
    // HAVA DURUMU FONKSİYONU
    function fetchWeather() {
        const widget = document.getElementById('weather-widget');
        const tempEl = document.getElementById('weather-temp');
        const descEl = document.getElementById('weather-desc');
        const windEl = document.getElementById('weather-wind');

        if (!widget) return;

        const url = 'https://api.open-meteo.com/v1/forecast?latitude=40.1885&longitude=29.0610&current_weather=true&timezone=auto';

        fetch(url)
            .then(response => response.json())
            .then(data => {
                const weather = data.current_weather;
                const temp = Math.round(weather.temperature);
                const wind = Math.round(weather.windspeed);
                const code = weather.weathercode;

                let desc = "Bilinmiyor";
                let icon = "";
                let bgGradient = "linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)"; 

                if (code === 0) { desc = "Açık / Güneşli"; icon = "☀️"; bgGradient = "linear-gradient(135deg, #FFC371 0%, #FF5F6D 100%)"; }
                else if (code >= 1 && code <= 3) { desc = "Parçalı Bulutlu"; icon = "⛅"; bgGradient = "linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)"; }
                else if (code >= 45 && code <= 48) { desc = "Sisli"; icon = "🌫️"; bgGradient = "linear-gradient(135deg, #606c88 0%, #3f4c6b 100%)"; }
                else if (code >= 51 && code <= 67) { desc = "Yağmurlu"; icon = "🌧️"; bgGradient = "linear-gradient(135deg, #373B44 0%, #4286f4 100%)"; }
                else if (code >= 71 && code <= 77) { desc = "Karlı"; icon = "❄️"; bgGradient = "linear-gradient(135deg, #E6DADA 0%, #274046 100%)"; }
                else if (code >= 80 && code <= 82) { desc = "Sağanak Yağış"; icon = "🌦️"; bgGradient = "linear-gradient(135deg, #373B44 0%, #4286f4 100%)"; }
                else if (code >= 95) { desc = "Fırtına"; icon = "⛈️"; bgGradient = "linear-gradient(135deg, #141E30 0%, #243B55 100%)"; }
                else { desc = "Bulutlu"; icon = "☁️"; bgGradient = "linear-gradient(135deg, #757F9A 0%, #D7DDE8 100%)"; }

                tempEl.textContent = `${temp}°C`;
                descEl.textContent = `${icon} ${desc}`;
                windEl.textContent = `💨 ${wind} km/s`;
                widget.style.background = bgGradient;
                widget.style.display = 'block';
            })
            .catch(err => {
                console.error("Hava durumu hatası:", err);
                widget.style.display = 'none';
            });
    }
    
    // --- LİG ROZETİ OLUŞTURUCU ---
    const getLeagueBadgeHTML = (points) => {
        let cls = 'league-bronze';
        let txt = 'BRONZ';
        if (points >= 3000) { cls = 'league-gold'; txt = 'ALTIN'; }
        else if (points >= 1000) { cls = 'league-silver'; txt = 'GÜMÜŞ'; }
        return `<span class="league-badge ${cls}">${txt}</span>`;
    };

    // Fikstür filtresi için
    const setTodayFilters = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`;
        if(filterDateStart) filterDateStart.value = todayStr;
        if(filterDateEnd) filterDateEnd.value = todayStr;
    };

    // Maçlarım Geçmişi filtresi için
    const setHistoryTodayFilters = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`;
        if(histFilterStart) histFilterStart.value = todayStr;
        if(histFilterEnd) histFilterEnd.value = todayStr;
    };

    // YENİ: Galeri için "Bugün" filtresi
    const setGalleryTodayFilters = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`;
        if(galleryFilterDate) galleryFilterDate.value = todayStr;
    };

    // --- YAPAY ZEKA YORUM ÜRETİCİSİ ---
    function getRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

    function generateAICommentary(type, data) {
        const p1 = data.p1Name || 'Oyuncu 1';
        const p2 = data.p2Name || 'Oyuncu 2';
        const winner = data.winnerName;
        const score = data.scoreStr || '';
        const wager = data.wager || 0;
        
        let intro = getRandom(AI_PHRASES.intros);
        let reaction = getRandom(AI_PHRASES.reactions);
        let closing = getRandom(AI_PHRASES.closings);

        if (type === 'new_player') {
            return `👋 <strong>Aramıza Hoşgeldin!</strong> ${intro} <strong>${p1}</strong> lige katıldı. Kortlar yeni bir yetenek kazandı. Başarılar dileriz! ${reaction}`;
        }
        
        if (type === 'badge_earned') {
            return `🎖️ <strong>Rozet Alarmı!</strong> ${p1}, gösterdiği üstün performansla <strong>"${data.badgeName}"</strong> rozetini kazandı! ${reaction} ${closing}`;
        }

        if (type === 'open_ad') {
            if (wager >= 500) return `📢 <strong>BÜYÜK BAHİS!</strong> ${p1} masaya tam <strong>${wager} Puan</strong> koydu! Kendine güvenen var mı? ${reaction}`;
            return `📢 <strong>${p1}</strong> kortlara meydan okuyor! Bir rakip aranıyor. Raketine güvenen çıksın!`;
        }

        if (type === 'match_scheduled') {
            return `📅 <strong>Maç Ayarlandı!</strong> ${p1} ve ${p2} anlaştı. Raketler bilendi, kort rezervasyonu tamam. ${reaction} Heyecanla bekliyoruz!`;
        }

        if (type === 'match_result') {
            const verb = getRandom(AI_PHRASES.verbs);
            const adj = getRandom(AI_PHRASES.adjectives);
            
            if (data.isCrushing) {
                return `😱 <strong>Ezip Geçti!</strong> ${intro} <strong>${winner}</strong>, rakibi ${p1 === winner ? p2 : p1}'i ${verb}! ${adj} bir skorla maçı aldı: ${score}. ${closing} ${reaction}`;
            }
            if (data.isTight) {
                return `🥵 <strong>Nefes Kesen Maç!</strong> ${intro} Gitti geldi, gitti geldi! Sonunda <strong>${winner}</strong> gülen taraf oldu. ${score}. ${adj} bir mücadeleydi. ${reaction}`;
            }
            if (data.isComeback) {
                return `🪃 <strong>Muhteşem Geri Dönüş!</strong> ${intro} <strong>${winner}</strong> geriye düştüğü maçı çevirmeyi bildi! ${verb}. İşte şampiyon ruhu budur! ${score} ${reaction}`;
            }
            
            return `🏆 <strong>Maç Sonucu:</strong> ${intro} <strong>${winner}</strong>, ${p1 === winner ? p2 : p1} karşısında ${adj} bir oyunla kazandı. ${verb}! Skor: ${score}. ${closing} ${reaction}`;
        }
        
        return `${intro} ${p1} ve ${p2} arasında gelişmeler var. ${reaction}`;
    }

    // --- ROZET KONTROL VE DAĞITIM SİSTEMİ ---
    async function checkAndGrantBadges(userId) {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        if(!userDoc.exists) return;
        const userData = userDoc.data();
        
        let currentBadges = userData.badges || [];
        let newBadges = [];

        const stats = await calculateAdvancedStats(userId);
        
        const check = (id, condition) => {
            if (!currentBadges.includes(id) && condition) {
                newBadges.push(id);
                currentBadges.push(id);
            }
        };

        check('newbie', stats.played >= 1);
        check('first_win', stats.won >= 1);
        check('veteran', stats.played >= 20);
        check('champion', userData.toplamPuan >= 3000);
        
        const allMatchesSnap = await db.collection('matches').where('durum','==','Tamamlandı').get();
        let userMatches = [];
        allMatchesSnap.forEach(doc => {
            const d = doc.data();
            if(d.oyuncu1ID === userId || d.oyuncu2ID === userId) userMatches.push(d);
        });
        userMatches.sort((a,b) => (a.tarih?.seconds||0) - (b.tarih?.seconds||0));
        
        let streak = 0;
        let maxStreak = 0;
        userMatches.forEach(m => {
            if(m.kayitliKazananID === userId) { streak++; if(streak>maxStreak) maxStreak=streak; }
            else { streak=0; }
        });

        check('hat_trick', maxStreak >= 3);
        check('unstoppable', maxStreak >= 5);
        check('legend_streak', maxStreak >= 10);

        check('clay_master', stats.clay.won >= 5);
        check('hard_hitter', stats.hard.won >= 5);
        check('grass_king', stats.grass.won >= 5);

        if (newBadges.length > 0) {
            await userRef.update({ badges: currentBadges });
            
            newBadges.forEach(badgeId => {
                const bInfo = BADGE_DEFINITIONS[badgeId];
                db.collection('news').add({
                    type: 'badge_earned',
                    userId: userId,
                    badgeId: badgeId,
                    badgeName: bInfo.name,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
            });
        }
        return newBadges;
    }

    // --- AUTH (GİRİŞ/KAYIT) MANTIĞI ---
    function switchAuthTab(mode) {
        isLoginMode = mode === 'login';
        authError.style.display = 'none';
        authError.textContent = '';
        
        if (isLoginMode) {
            tabLoginSwitch.classList.add('active');
            tabRegisterSwitch.classList.remove('active');
            registerFields.style.display = 'none';
            authActionBtn.textContent = 'Giriş Yap';
            if(loginFooterLinks) loginFooterLinks.style.display = 'block';
        } else {
            tabRegisterSwitch.classList.add('active');
            tabLoginSwitch.classList.remove('active');
            registerFields.style.display = 'block';
            authActionBtn.textContent = 'Kayıt Ol';
            if(loginFooterLinks) loginFooterLinks.style.display = 'none';
        }
    }

    if (tabLoginSwitch) {
        tabLoginSwitch.addEventListener('click', () => switchAuthTab('login'));
        tabRegisterSwitch.addEventListener('click', () => switchAuthTab('register'));
    }

    // Şifre Sıfırlama Modal İşlemleri
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', () => {
            forgotPasswordModal.style.display = 'flex';
            resetMsg.textContent = '';
            resetEmailInput.value = emailInput.value || ''; 
        });
    }

    if (btnSendResetLink) {
        btnSendResetLink.addEventListener('click', () => {
            const email = resetEmailInput.value.trim();
            if (!email) {
                resetMsg.textContent = "Lütfen e-posta adresinizi girin.";
                resetMsg.style.color = "red";
                return;
            }
            
            auth.sendPasswordResetEmail(email)
                .then(() => {
                    resetMsg.textContent = "Sıfırlama bağlantısı gönderildi! E-postanızı kontrol edin.";
                    resetMsg.style.color = "green";
                    setTimeout(() => { forgotPasswordModal.style.display = 'none'; }, 3000);
                })
                .catch((error) => {
                    console.error(error);
                    resetMsg.textContent = "Hata: " + error.message;
                    resetMsg.style.color = "red";
                });
        });
    }

    // --- SOHBET FONKSİYONLARI ---
    function getChatId(uid1, uid2) { return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`; }

    function openChat(targetUserId, targetUserName) {
        const myUid = auth.currentUser.uid;
        currentChatId = getChatId(myUid, targetUserId);
        chatRecipientName.textContent = targetUserName;
        chatMessages.innerHTML = '<p style="text-align:center;color:#999;">Mesajlar yükleniyor...</p>';
        
        chatModal.style.display = 'flex';
        playerStatsModal.style.display = 'none';
        matchDetailView.style.display = 'none';
        
        subscribeToMessages();
    }

    function subscribeToMessages() {
        if (currentChatUnsubscribe) currentChatUnsubscribe();

        db.collection('chats').doc(currentChatId).get().then(docSnap => {
            let clearedTime = null;
            if(docSnap.exists) {
                const data = docSnap.data();
                if(data.clearedAt && data.clearedAt[auth.currentUser.uid]) {
                    clearedTime = data.clearedAt[auth.currentUser.uid];
                }
            }

            let query = db.collection('chats').doc(currentChatId).collection('messages').orderBy('timestamp', 'asc');
            if(clearedTime) { query = query.startAfter(clearedTime); }

            currentChatUnsubscribe = query.onSnapshot(snapshot => {
                chatMessages.innerHTML = '';
                if(snapshot.empty) { 
                    chatMessages.innerHTML = '<p style="text-align:center;color:#999;">Mesaj yok.</p>'; 
                    return; 
                }
                
                snapshot.forEach(doc => {
                    const msg = doc.data();
                    const isMe = msg.senderId === auth.currentUser.uid;
                    const date = msg.timestamp ? msg.timestamp.toDate() : new Date();
                    const timeStr = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                    const msgDiv = document.createElement('div');
                    msgDiv.className = `message-bubble ${isMe ? 'message-sent' : 'message-received'}`;
                    msgDiv.innerHTML = `${msg.text}<span class="message-time">${timeStr}</span>`;
                    chatMessages.appendChild(msgDiv);
                });
                chatMessages.scrollTop = chatMessages.scrollHeight;
            });
        });
    }

  async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text || !currentChatId) return;

    try {
        // 1. Mesajı Veritabanına Kaydet
        await db.collection('chats').doc(currentChatId).collection('messages').add({
            text: text, 
            senderId: auth.currentUser.uid, 
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // 2. Sohbet Üst Bilgisini Güncelle (Son mesaj, zaman vb.)
        await db.collection('chats').doc(currentChatId).set({
            lastMessage: text,
            lastMessageSenderId: auth.currentUser.uid,
            lastMessageTime: firebase.firestore.FieldValue.serverTimestamp(),
            participants: currentChatId.split('_'),
            deletedBy: [] // Yeni mesaj gelince silenlerin listesini sıfırla ki sohbet tekrar görünsün
        }, { merge: true });

        // --- 3. MAİL BİLDİRİMİ (YENİ EKLENEN KISIM) ---
        const parts = currentChatId.split('_');
        const myUid = auth.currentUser.uid;
        
        // Sohbet ID'si "uid1_uid2" şeklindedir. Ben olmayan ID'yi buluyoruz:
        const targetId = parts.find(id => id !== myUid);
        const myName = userMap[myUid]?.isim || 'Bir Oyuncu';

        if (targetId) {
  const subject = "💬 Yeni Mesajın Var";
const body = `
    <p><strong>${myName}</strong> sana bir mesaj gönderdi:</p>
    <blockquote style="border-left: 4px solid #ccc; margin: 10px 0; padding-left: 10px; color: #555; background-color: #f9f9f9; padding: 10px;">
        "${text}"
    </blockquote>
    <p>Cevap vermek için uygulamaya aşağıdaki linkten giriş yapabilirsin:</p>
    <p>
        <a href="https://mehmetmuratyak.github.io/TenisLig/">https://mehmetmuratyak.github.io/TenisLig/</a>
    </p>
`;

            // Maili Gönder
            // Not: Sohbet çok hızlı akarsa bu işlem kotayı (günlük 500) hızlı doldurabilir.
            sendNotificationEmail(targetId, subject, body);
        }
        // ---------------------------------------------

        chatInput.value = ''; // Mesaj kutusunu temizle

    } catch (error) {
        console.error("Mesaj gönderme hatası:", error);
        alert("Mesaj gönderilemedi.");
    }
}

    async function deleteChat(chatId, e) {
        e.stopPropagation();
        if(!confirm("Sohbeti silmek istediğinize emin misiniz?")) return;
        try {
            await db.collection('chats').doc(chatId).set({
                deletedBy: firebase.firestore.FieldValue.arrayUnion(auth.currentUser.uid)
            }, { merge: true });
            loadChatList(); 
        } catch(err) { console.error(err); alert("Silinemedi."); }
    }

    async function clearChatMessages() {
        if(!currentChatId) return;
        if(!confirm("Sohbet geçmişini temizlemek istiyor musunuz?")) return;
        try {
            await db.collection('chats').doc(currentChatId).set({
                clearedAt: { [auth.currentUser.uid]: firebase.firestore.Timestamp.now() }
            }, { merge: true });
            subscribeToMessages();
            alert("Geçmiş temizlendi.");
        } catch(err) { console.error(err); alert("Hata oluştu."); }
    }

    function loadChatList() {
        const myUid = auth.currentUser.uid;
        if(!chatListContainer) return;
        chatListContainer.innerHTML = '<p style="text-align:center;">Yükleniyor...</p>';
        
        db.collection('chats').where('participants', 'array-contains', myUid)
            .orderBy('lastMessageTime', 'desc')
            .get()
            .then(snapshot => {
                chatListContainer.innerHTML = '';
                let hasChats = false;

                snapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.deletedBy && data.deletedBy.includes(myUid)) return;

                    hasChats = true;
                    const chatId = doc.id;
                    const otherId = data.participants.find(id => id !== myUid);
                    const name = userMap[otherId]?.isim || 'Bilinmiyor';
                    const time = data.lastMessageTime ? data.lastMessageTime.toDate().toLocaleDateString('tr-TR') : '';
                    
                    const item = document.createElement('div');
                    item.className = 'chat-list-item';
                    item.innerHTML = `
                        <div style="flex:1;">
                            <div class="chat-list-name">${name}</div>
                            <div class="chat-list-msg">${data.lastMessage}</div>
                        </div>
                        <div class="chat-list-time">${time}</div>
                        <button class="btn-delete-chat" data-id="${chatId}">🗑️</button>
                    `;
                    item.onclick = () => openChat(otherId, name);
                    const delBtn = item.querySelector('.btn-delete-chat');
                    delBtn.onclick = (e) => deleteChat(chatId, e);
                    chatListContainer.appendChild(item);
                });

                if(!hasChats) chatListContainer.innerHTML = '<p style="text-align:center;color:#777;">Henüz sohbetiniz yok.</p>';
            })
            .catch(err => {
                console.error("Sohbet listesi hatası:", err);
                chatListContainer.innerHTML = '<p style="text-align:center;color:red;">Liste yüklenemedi.</p>';
            });
    }

    // --- VERİ ÇEKME VE DİĞERLERİ ---
    function fetchUserMap() {
        return db.collection('users').get().then(snapshot => {
            if (filterPlayer) filterPlayer.innerHTML = '<option value="">Tüm Oyuncular</option>';
            // YENİ: Galeri filtresi için
            if (galleryFilterPlayer) galleryFilterPlayer.innerHTML = '<option value="">Tüm Oyuncular</option>';
            
            if (statsViewPlayerSelect) {
                 while(statsViewPlayerSelect.options.length > 1) {
                    statsViewPlayerSelect.remove(1);
                 }
            }

            snapshot.forEach(doc => {
                const player = doc.data();
                userMap[doc.id] = { 
    isim: player.isim || player.email, 
    email: player.email, 
    uid: doc.id,
    toplamPuan: player.toplamPuan, 
    kortTercihi: player.kortTercihi, 
    telefon: player.telefon,
    fotoURL: player.fotoURL, 
    bildirimTercihi: player.bildirimTercihi || 'ses',
    tenisBaslangic: player.tenisBaslangic || '',
    kulup: player.kulup || 'Belirtilmemiş',
    
    // --- YENİ SATIR ---
    emailNotifications: (player.emailNotifications !== false), // Varsayılan: true (undefined ise true kabul et)
    // ------------------

    macSayisi: player.macSayisi || 0, 
    galibiyetSayisi: player.galibiyetSayisi || 0,
    badges: player.badges || []
};
                if (filterPlayer) {
                    const option = document.createElement('option'); option.value = doc.id; option.textContent = player.isim || player.email; filterPlayer.appendChild(option);
                }
                // YENİ: Galeri filtresi
                if (galleryFilterPlayer) {
                    const option = document.createElement('option'); option.value = doc.id; option.textContent = player.isim || player.email; galleryFilterPlayer.appendChild(option);
                }
                
                if (statsViewPlayerSelect && doc.id !== auth.currentUser?.uid) {
                    const opt = document.createElement('option');
                    opt.value = doc.id;
                    opt.textContent = player.isim || player.email;
                    statsViewPlayerSelect.appendChild(opt);
                }
            });
        });
    }

// --- GÜNCELLENMİŞ SIRALAMA FONKSİYONU ---
    function loadLeaderboard(filterClub = 'all') {
        const leaderboardDiv = document.getElementById('leaderboard');
        if(!leaderboardDiv) return;
        
        leaderboardDiv.innerHTML = '<p style="text-align:center;">Yükleniyor...</p>';

        db.collection('users').orderBy('toplamPuan', 'desc').limit(500).get().then(snapshot => {
            leaderboardDiv.innerHTML = '';
            let rank = 1;
            let displayedCount = 0;

            snapshot.forEach(doc => {
                const player = doc.data();
                
                // --- FİLTRELEME MANTIĞI ---
                // Eğer filtre 'all' değilse ve oyuncunun kulübü filtreyle eşleşmiyorsa atla
                if (filterClub !== 'all' && player.kulup !== filterClub) {
                    return; 
                }

                const photoHTML = player.fotoURL ? `<img src="${player.fotoURL}" class="profile-img-small" style="width:40px; height:40px; border-radius:50%; margin-right:10px; object-fit:cover;">` : '';
                const badgeHTML = getLeagueBadgeHTML(player.toplamPuan);
                
                // Kulüp bilgisini kısaltarak gösterelim
                const clubDisplay = player.kulup ? `<div style="font-size:0.75em; color:#888;">${player.kulup}</div>` : '';

                const playerCard = document.createElement('div');
                playerCard.className = 'player-card';
                playerCard.onclick = () => showPlayerStats(doc.id); 
                
                playerCard.innerHTML = `
                    <div style="width:100%; display:flex; align-items:center; justify-content:space-between;">
                        <div style="display:flex; align-items:center; flex:1; overflow:hidden;">
                            <span style="font-weight:bold; min-width:30px; margin-right:5px; color:#555;">#${rank}</span>
                            ${photoHTML}
                            <div style="overflow:hidden;">
                                <div style="font-weight:600; font-size:1em; line-height:1.2; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                                    ${player.isim || player.email}
                                </div>
                                ${clubDisplay}
                            </div>
                        </div>

                        <div style="display:flex; flex-direction:column; align-items:flex-end; justify-content:center; min-width:85px; margin-left:10px; text-align:right;">
                            <div style="font-weight:bold; color:#c06035; font-size:1.1em; margin-bottom:4px;">${player.toplamPuan} P</div>
                            <div style="transform: scale(0.9); transform-origin: right center;">
                                ${badgeHTML}
                            </div>
                        </div>
                    </div>
                `;
                leaderboardDiv.appendChild(playerCard);
                rank++;
                displayedCount++;
            });

            if (displayedCount === 0) {
                leaderboardDiv.innerHTML = '<p style="text-align:center; padding:20px; color:#777;">Bu kulüpte henüz oyuncu yok.</p>';
            }
        }).catch(err => console.log("Sıralama hatası:", err));
    }

    // --- ORTAK İSTATİSTİK HESAPLAMA MOTORU ---
    function analyzeStats(matches) {
        let playerStats = {}; 
        let courtStats = {};

        Object.keys(userMap).forEach(uid => {
            playerStats[uid] = { 
                id: uid, 
                name: userMap[uid].isim, 
                points: 0,
                wins: 0, 
                matches: 0, 
                setsPlayed: 0, 
                tieBreakWins: 0,
                history: [] 
            };
        });

        matches.forEach(m => {
            if (m.macYeri) {
                courtStats[m.macYeri] = (courtStats[m.macYeri] || 0) + 1;
            }

            const p1 = m.oyuncu1ID;
            const p2 = m.oyuncu2ID;
            const winner = m.kayitliKazananID;
            let time = m.macZamani ? m.macZamani.seconds : (m.tarih ? m.tarih.seconds : 0);

            [p1, p2].forEach(pid => {
                if (playerStats[pid]) {
                    playerStats[pid].matches++;
                    if (pid === winner) {
                        playerStats[pid].wins++;
                    }
                    playerStats[pid].history.push({ time: time, win: (pid === winner) });
                }
            });

            if (m.skor) {
                const s = m.skor;
                const sets = [
                    {p1: s.s1_me, p2: s.s1_opp}, {p1: s.s2_me, p2: s.s2_opp}, {p1: s.s3_me, p2: s.s3_opp}
                ];
                sets.forEach(set => {
                    const s1 = parseInt(set.p1||0);
                    const s2 = parseInt(set.p2||0);
                    if (s1 + s2 > 0) {
                        if (playerStats[m.sonucuGirenID]) playerStats[m.sonucuGirenID].setsPlayed++;
                        const otherId = (m.sonucuGirenID === p1) ? p2 : p1;
                        if (playerStats[otherId]) playerStats[otherId].setsPlayed++;

                        if ((s1 === 7 && s2 === 6) || (s1 === 6 && s2 === 7)) {
                            const tbWinner = (s1 === 7) ? m.sonucuGirenID : otherId;
                            if(playerStats[tbWinner]) playerStats[tbWinner].tieBreakWins++;
                        }
                    }
                });
            }
        });

        let maxWins = { val: 0, p: null };
        let maxMatches = { val: 0, p: null };
        let maxSets = { val: 0, p: null };
        let maxTB = { val: 0, p: null };
        let maxStreak = { val: 0, p: null };

        let maxPointsTotal = { val: -99999, p: null };

        Object.values(userMap).forEach(u => {
            if(u.toplamPuan > maxPointsTotal.val) maxPointsTotal = { val: u.toplamPuan, p: u.isim };
        });

        Object.values(playerStats).forEach(p => {
            if (p.wins > maxWins.val) maxWins = { val: p.wins, p: p.name };
            if (p.matches > maxMatches.val) maxMatches = { val: p.matches, p: p.name };
            if (p.setsPlayed > maxSets.val) maxSets = { val: p.setsPlayed, p: p.name };
            if (p.tieBreakWins > maxTB.val) maxTB = { val: p.tieBreakWins, p: p.name };

            if (p.history.length > 0) {
                p.history.sort((a, b) => a.time - b.time);
                let currentStreak = 0;
                let bestStreak = 0;
                p.history.forEach(h => {
                    if (h.win) { currentStreak++; if (currentStreak > bestStreak) bestStreak = currentStreak; } 
                    else { currentStreak = 0; }
                });
                if (bestStreak > maxStreak.val) maxStreak = { val: bestStreak, p: p.name };
            }
        });

        let bestCourt = { val: 0, name: '-' };
        Object.keys(courtStats).forEach(c => {
            if(courtStats[c] > bestCourt.val) bestCourt = { val: courtStats[c], name: c };
        });

        return { maxPointsTotal, maxWins, maxMatches, maxStreak, maxTB, maxSets, bestCourt };
    }

    // --- EN'LER (THE BESTS) FONKSİYONU ---
    async function loadTheBests(filterType = 'all') {
        if (!bestsContainer) return;
        bestsContainer.innerHTML = '<p style="width:100%; text-align:center; color:#777;">Veriler analiz ediliyor... 📊</p>';

        try {
            const snapshot = await db.collection('matches').where('durum', '==', 'Tamamlandı').get();
            let matches = [];
            snapshot.forEach(doc => matches.push(doc.data()));

            if (filterType === 'month') {
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                
                matches = matches.filter(m => {
                    const d = m.macZamani ? m.macZamani.toDate() : (m.tarih ? m.tarih.toDate() : null);
                    return d && d >= startOfMonth && d <= endOfMonth;
                });
            }

            const stats = analyzeStats(matches);
            
            let legendTitle = "Ligin Efsanesi (Puan)";
            let legendVal = stats.maxPointsTotal.val;
            let legendName = stats.maxPointsTotal.p;

            if (filterType === 'month') {
                legendTitle = "Ayın Lideri (Galibiyet)";
                legendVal = stats.maxWins.val + " Galibiyet";
                legendName = stats.maxWins.p;
            }

            const createCard = (icon, title, value, player) => `
                <div class="best-card">
                    <span class="best-icon">${icon}</span>
                    <div class="best-title">${title}</div>
                    <div class="best-value">${value}</div>
                    <div class="best-player">${player || '-'}</div>
                </div>
            `;

            bestsContainer.innerHTML = `
                ${createCard('👑', legendTitle, legendVal, legendName)}
                ${createCard('🦾', 'Galibiyet Makinesi', stats.maxWins.val + " Galibiyet", stats.maxWins.p)}
                ${createCard('🏃', 'Maratoncu (Maç Sayısı)', stats.maxMatches.val + " Maç", stats.maxMatches.p)}
                ${createCard('🔥', 'Yenilmezlik Serisi', stats.maxStreak.val + " Maç Üst Üste", stats.maxStreak.p)}
                ${createCard('🧱', 'Tie-Break Kralı', stats.maxTB.val + " TB Kazandı", stats.maxTB.p)}
                ${createCard('🥵', 'Set Canavarı', stats.maxSets.val + " Set Oynadı", stats.maxSets.p)}
                ${createCard('📍', 'En Popüler Kort', stats.bestCourt.val + " Maç", stats.bestCourt.name)}
            `;

        } catch (error) {
            console.error("En'ler hatası:", error);
            bestsContainer.innerHTML = '<p style="text-align:center; color:red;">Veriler yüklenemedi.</p>';
        }
    }

    // --- YENİ: GALERİ YÜKLEME SİSTEMİ ---
    function loadGallery() {
        if (!galleryGrid) return;
        galleryGrid.innerHTML = '<p style="text-align:center; width:200%; color:#777;">Fotoğraflar yükleniyor...</p>';

        if (galleryFilterCourt && galleryFilterCourt.options.length === 1) {
            ['Toprak', 'Sert', 'Çim'].forEach(c => { 
                const opt = document.createElement('option'); opt.value = c; opt.textContent = c; 
                galleryFilterCourt.appendChild(opt); 
            });
        }

        const filterDate = galleryFilterDate.value ? new Date(galleryFilterDate.value) : null;
        const filterCrt = galleryFilterCourt.value;
        const filterPlyr = galleryFilterPlayer.value;

        db.collection('matches')
            .where('durum', '==', 'Tamamlandı')
            .orderBy('tarih', 'desc')
            .limit(50)
            .get()
            .then(snapshot => {
                let photos = [];
                snapshot.forEach(doc => {
                    const m = doc.data();
                    if (m.macFotoURL) {
                        const mDate = m.macZamani ? m.macZamani.toDate() : (m.tarih ? m.tarih.toDate() : null);
                        
                        let pass = true;
                        if (filterDate) {
                            if (!mDate || mDate.getDate() !== filterDate.getDate() || mDate.getMonth() !== filterDate.getMonth() || mDate.getFullYear() !== filterDate.getFullYear()) {
                                pass = false;
                            }
                        }
                        if (filterCrt && m.kortTipi !== filterCrt) pass = false;
                        if (filterPlyr && (m.oyuncu1ID !== filterPlyr && m.oyuncu2ID !== filterPlyr)) pass = false;

                        if (pass) {
                            photos.push({ ...m, id: doc.id, dateObj: mDate });
                        }
                    }
                });

                renderGalleryGrid(photos, galleryGrid);
            })
            .catch(err => {
                console.error("Galeri hatası:", err);
                galleryGrid.innerHTML = '<p style="text-align:center; width:200%; color:red;">Yüklenemedi.</p>';
            });
    }

    // --- YENİ: KULLANICI PROFİL FOTOĞRAFLARI ---
    function loadUserPhotos() {
        if (!myPhotosContainer) return;
        myPhotosContainer.innerHTML = '<p style="text-align:center; width:200%; color:#777;">Yükleniyor...</p>';
        const myUid = auth.currentUser.uid;

        const q1 = db.collection('matches').where('oyuncu1ID', '==', myUid).where('durum', '==', 'Tamamlandı').get();
        const q2 = db.collection('matches').where('oyuncu2ID', '==', myUid).where('durum', '==', 'Tamamlandı').get();

        Promise.all([q1, q2]).then(snapshots => {
            let photos = [];
            snapshots.forEach(snap => {
                snap.forEach(doc => {
                    const m = doc.data();
                    if (m.macFotoURL) {
                        photos.push({ ...m, id: doc.id, dateObj: m.macZamani ? m.macZamani.toDate() : (m.tarih ? m.tarih.toDate() : new Date()) });
                    }
                });
            });

            photos = photos.filter((v,i,a)=>a.findIndex(t=>(t.id === v.id))===i);
            photos.sort((a,b) => b.dateObj - a.dateObj);

            renderGalleryGrid(photos, myPhotosContainer);
        });
    }

    function renderGalleryGrid(items, container) {
        container.innerHTML = '';
        if (items.length === 0) {
            container.innerHTML = '<p style="text-align:center; width:200%; color:#999; padding:20px;">Fotoğraf bulunamadı.</p>';
            return;
        }

        items.forEach(item => {
            const p1 = userMap[item.oyuncu1ID]?.isim.split(' ')[0] || '?';
            const p2 = userMap[item.oyuncu2ID]?.isim.split(' ')[0] || '?';
            const dateStr = item.dateObj ? item.dateObj.toLocaleString('tr-TR', { day: 'numeric', month: 'short' }) : '';
            const kort = item.kortTipi || 'Kort';

            const div = document.createElement('div');
            div.className = 'gallery-item';
            div.onclick = () => { returnToTab = (container === myPhotosContainer) ? 'tab-profile' : 'tab-gallery'; showMatchDetail(item.id); };
            
            div.innerHTML = `
                <img src="${item.macFotoURL}" class="gallery-img" loading="lazy">
                <div class="gallery-date-badge">${dateStr}</div>
                <div class="gallery-overlay">
                    <span style="font-weight:bold;">${p1} vs ${p2}</span>
                    <span style="font-size:0.9em; opacity:0.9;">${kort}</span>
                </div>
            `;
            container.appendChild(div);
        });
    }

    function loadOpponents() {
        if(!opponentSelect) return;
        opponentSelect.innerHTML = '<option value="">Rakip Seçin</option>';
        const currentUserID = auth.currentUser.uid;
        Object.values(userMap).forEach(player => {
            if (player.uid !== currentUserID) { 
                const option = document.createElement('option'); option.value = player.uid; option.textContent = `${player.isim || player.email}`; opponentSelect.appendChild(option);
            }
        });
    }

    async function loadAnnouncements() {
        if(!announcementsContainer) return;
        announcementsContainer.innerHTML = `<p style="text-align:center; color:#999; font-style:italic;">🤖 Lig taranıyor...</p>`;
        
        try {
            const matchSnap = await db.collection('matches').where('durum', '==', 'Tamamlandı').orderBy('tarih', 'desc').limit(10).get();
            const adSnap = await db.collection('matches').where('durum', '==', 'Acik_Ilan').orderBy('tarih', 'desc').limit(5).get();
            const scheduledSnap = await db.collection('matches').where('durum', '==', 'Hazır').orderBy('tarih', 'desc').limit(5).get();
            const newsSnap = await db.collection('news').orderBy('timestamp', 'desc').limit(10).get();

            let allItems = [];

            matchSnap.forEach(doc => {
                const m = doc.data();
                const p1 = userMap[m.oyuncu1ID]?.isim || '???';
                const p2 = m.oyuncu2ID ? (userMap[m.oyuncu2ID]?.isim||'???') : '???';
                const winner = userMap[m.kayitliKazananID]?.isim || '???';
                
                let isCrushing = false, isTight = false, isComeback = false;
                if(m.skor) {
                    const s = m.skor;
                    if((s.s1_me==0||s.s1_opp==0) || (s.s2_me==0||s.s2_opp==0)) isCrushing = true;
                    if(s.s3_me || s.s3_opp) isTight = true;
                }
                
                let scoreStr = "";
                if(m.skor) { scoreStr = `${m.skor.s1_me}-${m.skor.s1_opp}, ${m.skor.s2_me}-${m.skor.s2_opp}` + (m.skor.s3_me?`, ${m.skor.s3_me}-${m.skor.s3_opp}`:''); }

                const comment = generateAICommentary('match_result', {
                    p1Name: p1, p2Name: p2, winnerName: winner,
                    scoreStr: scoreStr, isCrushing: isCrushing, isTight: isTight, isComeback: isComeback
                });

                const div = document.createElement('div');
                div.className = 'news-item';
                div.innerHTML = `<div class="news-header"><span class="news-icon">🏆</span><span class="news-date">MAÇ SONUCU</span></div><div class="news-content">${comment}</div>`;
                
                const btnDiv = document.createElement('div'); btnDiv.style.marginTop = '8px';
                const btn = document.createElement('button');
                btn.className = 'btn-chat-small'; btn.style.cssText = 'width: auto; padding: 5px 12px; font-size: 0.8em; background-color: #6c757d; border:none; border-radius:15px; margin:0;'; 
                btn.textContent = 'İncele 🔍';
                btn.onclick = function() { returnToTab='tab-lobby'; showMatchDetail(doc.id); };
                btnDiv.appendChild(btn); div.appendChild(btnDiv);

                allItems.push({
                    date: m.macZamani ? m.macZamani.toDate() : (m.tarih ? m.tarih.toDate() : new Date()),
                    element: div
                });
            });

            adSnap.forEach(doc => {
                const m = doc.data();
                const p1 = userMap[m.oyuncu1ID]?.isim || '???';
                const comment = generateAICommentary('open_ad', { p1Name: p1, wager: m.bahisPuani });
                
                const div = document.createElement('div');
                div.className = 'news-item news-badge';
                div.innerHTML = `<div class="news-header"><span class="news-icon">📢</span><span class="news-date">İLAN</span></div><div class="news-content">${comment}</div>`;
                
                const btnDiv = document.createElement('div'); btnDiv.style.marginTop = '8px';
                const btn = document.createElement('button');
                btn.className = 'btn-chat-small'; btn.style.cssText = 'width: auto; padding: 5px 12px; font-size: 0.8em; background-color: #28a745; border:none; border-radius:15px; margin:0;'; 
                btn.textContent = 'İncele 🔍';
                btn.onclick = function() { returnToTab='tab-lobby'; showMatchDetail(doc.id); };
                btnDiv.appendChild(btn); div.appendChild(btnDiv);

                allItems.push({
                    date: m.tarih ? m.tarih.toDate() : new Date(),
                    element: div
                });
            });

            scheduledSnap.forEach(doc => {
                const m = doc.data();
                const p1 = userMap[m.oyuncu1ID]?.isim || '???';
                const p2 = m.oyuncu2ID ? (userMap[m.oyuncu2ID]?.isim||'???') : '???';
                
                const comment = generateAICommentary('match_scheduled', { p1Name: p1, p2Name: p2 });
                
                const div = document.createElement('div');
                div.className = 'news-item';
                div.style.borderLeft = '4px solid #007bff';
                div.innerHTML = `<div class="news-header"><span class="news-icon">📅</span><span class="news-date">MAÇ AYARLANDI</span></div><div class="news-content">${comment}</div>`;
                
                const btnDiv = document.createElement('div'); btnDiv.style.marginTop = '8px';
                const btn = document.createElement('button');
                btn.className = 'btn-chat-small'; btn.style.cssText = 'width: auto; padding: 5px 12px; font-size: 0.8em; background-color: #007bff; border:none; border-radius:15px; margin:0;'; 
                btn.textContent = 'İncele 🔍';
                btn.onclick = function() { returnToTab='tab-lobby'; showMatchDetail(doc.id); };
                btnDiv.appendChild(btn); div.appendChild(btnDiv);

                allItems.push({
                    date: m.tarih ? m.tarih.toDate() : new Date(),
                    element: div
                });
            });

            newsSnap.forEach(doc => {
                const n = doc.data();
                const p1 = userMap[n.userId]?.isim || 'Bir oyuncu';
                let comment = "";
                let icon = "📰";
                let cls = "";

                if (n.type === 'new_player') {
                    comment = generateAICommentary('new_player', { p1Name: p1 });
                    icon = "👋"; cls = "news-newplayer";
                } else if (n.type === 'badge_earned') {
                    comment = generateAICommentary('badge_earned', { p1Name: p1, badgeName: n.badgeName });
                    icon = "🎖️"; cls = "news-badge";
                }

                const div = document.createElement('div');
                div.className = `news-item ${cls}`;
                div.innerHTML = `<div class="news-header"><span class="news-icon">${icon}</span><span class="news-date">HABER</span></div><div class="news-content">${comment}</div>`;

                allItems.push({
                    date: n.timestamp ? n.timestamp.toDate() : new Date(),
                    element: div
                });
            });

            allItems.sort((a, b) => b.date - a.date);

            announcementsContainer.innerHTML = '';
            allItems.forEach(item => {
                announcementsContainer.appendChild(item.element);
            });
            
            if(allItems.length === 0) announcementsContainer.innerHTML = '<p style="text-align:center;">Henüz haber yok.</p>';

        } catch (e) {
            console.error(e);
            announcementsContainer.innerHTML = '<p style="color:red;">Haberler yüklenemedi.</p>';
        }
    }

  function loadOpenRequests() {
    if(!openRequestsContainer) return;
    openRequestsContainer.innerHTML = '<p style="text-align:center;">Yükleniyor...</p>';
    
    const currentUserID = auth.currentUser.uid;
    const currentUserData = userMap[currentUserID];
    // Kullanıcının mevcut ligini hesapla
    const myLeague = getPlayerLeague(currentUserData ? currentUserData.toplamPuan : 0);

    db.collection('matches').where('durum', '==', 'Acik_Ilan').orderBy('tarih', 'desc').get().then(snapshot => {
          openRequestsContainer.innerHTML = '';
          let hasRequest = false;
          
          snapshot.forEach(doc => {
              const data = doc.data();
              if(data.oyuncu1ID === currentUserID) return; // Kendi ilanını görme
              
              hasRequest = true;
              const p1 = userMap[data.oyuncu1ID];
              const p1Name = p1?.isim || 'Bilinmiyor';
              const kort = p1?.kortTercihi || '-';
              const tarih = data.tarih ? data.tarih.toDate().toLocaleDateString('tr-TR') : '';
              
              // İzin verilen ligleri kontrol et (Eski ilanlarda bu alan olmayabilir, varsayılan hepsi olsun)
              const allowed = data.allowedLeagues || ['Bronz', 'Gümüş', 'Altın'];
              const isEligible = allowed.includes(myLeague);

              // Kart Tasarımı
              const card = document.createElement('div');
              card.className = 'open-request-card';
              
              // Stil: Eğer yetersiz lig ise biraz soluk görünsün
              const opacity = isEligible ? '1' : '0.7';
              card.style.cssText = `background:#fff; border:1px solid #28a745; border-radius:10px; padding:15px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 2px 5px rgba(0,0,0,0.05); opacity:${opacity};`;

              let wagerInfo = data.macTipi === 'Meydan Okuma' ? `<span style="color:#d63384; font-weight:bold;">${data.bahisPuani} Puan</span>` : '<span style="color:#28a745; font-weight:bold;">Dostluk</span>';
              
              // Hangi liglere açık olduğunu gösteren ikonlar
              let leaguesBadge = '';
              if(allowed.includes('Bronz')) leaguesBadge += '🟤 ';
              if(allowed.includes('Gümüş')) leaguesBadge += '⚪ ';
              if(allowed.includes('Altın')) leaguesBadge += '🟡 ';

              // Buton Durumu
              let buttonHTML = '';
              if (isEligible) {
                  buttonHTML = `<button class="btn-accept-request" data-id="${doc.id}" style="width:auto; padding:8px 15px; font-size:0.9em; background-color:#28a745; color:white; border:none; border-radius:5px;">Kabul Et</button>`;
              } else {
                  buttonHTML = `<button disabled style="width:auto; padding:8px 15px; font-size:0.8em; background-color:#ccc; color:#666; border:none; border-radius:5px; cursor:not-allowed;">Ligin Yetmiyor 🔒</button>`;
              }

              card.innerHTML = `
                <div>
                    <div style="font-weight:bold; font-size:1.1em;">${p1Name}</div>
                    <div style="font-size:0.9em; color:#555;">${wagerInfo} | ${kort}</div>
                    <div style="font-size:0.8em; color:#999; margin-top:2px;">Kabul: ${leaguesBadge}</div>
                    <div style="font-size:0.75em; color:#bbb;">${tarih}</div>
                </div>
                ${buttonHTML}
              `;
              
              // Sadece uygunsa tıklama özelliği ekle
              if (isEligible) {
                  card.querySelector('.btn-accept-request').onclick = () => acceptOpenRequest(doc.id, data.bahisPuani, data.macTipi);
              }

              openRequestsContainer.appendChild(card);
          });
          
          if(!hasRequest) openRequestsContainer.innerHTML = '<p style="text-align:center; color:#777; padding:15px;">Şu an açık ilan yok. 🎾</p>';
      });
}

    function loadScheduledMatches() {
        if(!scheduledMatchesContainer) return;
        scheduledMatchesContainer.innerHTML = '<p style="text-align:center;">Yükleniyor...</p>';
        db.collection('matches').where('durum', '==', 'Hazır').get().then(snapshot => {
              scheduledMatchesContainer.innerHTML = '';
              let matches = [];
              snapshot.forEach(doc => { matches.push({ ...doc.data(), id: doc.id }); });
              matches.sort((a, b) => { return (a.macZamani ? a.macZamani.toMillis() : 9999999999999) - (b.macZamani ? b.macZamani.toMillis() : 9999999999999); });

              if(matches.length === 0) { scheduledMatchesContainer.innerHTML = '<p style="text-align:center; color:#777; padding:15px;">Planlanmış maç yok.</p>'; return; }

              matches.forEach(match => {
                  const p1Name = userMap[match.oyuncu1ID]?.isim || 'Bilinmiyor';
                  const p2Name = userMap[match.oyuncu2ID]?.isim || 'Bilinmiyor';
                  const kort = match.macYeri || 'Kort Belirlenmedi';
                  
                  const kortTipi = match.kortTipi ? ` (${match.kortTipi})` : ''; 

                  let timeStr = '<span style="color:#999; font-style:italic;">Zaman bekleniyor</span>';
                  let dateBadge = `<div style="background:#f5f5f5; color:#999; padding:5px 10px; border-radius:8px; text-align:center; margin-right:10px; min-width:45px;"><div style="font-size:1.2em;">?</div></div>`;

                  if (match.macZamani) {
                      const date = match.macZamani.toDate();
                      const day = date.getDate();
                      const month = date.toLocaleString('tr-TR', { month: 'short' });
                      const time = date.toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                      timeStr = `<strong style="color:#333;">${time}</strong>`;
                      dateBadge = `<div style="background:#e3f2fd; color:#0d47a1; padding:5px 10px; border-radius:8px; text-align:center; margin-right:10px; min-width:45px;"><div style="font-size:0.8em; font-weight:bold;">${day}</div><div style="font-size:0.7em;">${month}</div></div>`;
                  }
                  const card = document.createElement('div');
                  card.className = 'lobby-match-card';
                  card.style.cssText = 'background:#fff; border:1px solid #dee2e6; border-left: 4px solid #007bff; border-radius:8px; padding:10px; margin-bottom:10px; display:flex; align-items:center; box-shadow:0 1px 3px rgba(0,0,0,0.05); cursor:pointer;';
                  card.innerHTML = `${dateBadge}<div style="flex-grow:1;"><div style="font-weight:600; font-size:0.95em; color:#333;">${p1Name} <span style="color:#999; font-weight:normal;">vs</span> ${p2Name}</div><div style="font-size:0.85em; color:#666; margin-top:2px;">📍 ${kort}${kortTipi} | ${timeStr}</div></div>`;
                  card.onclick = () => { returnToTab = 'tab-lobby'; isReadOnlyView = (match.oyuncu1ID !== auth.currentUser.uid && match.oyuncu2ID !== auth.currentUser.uid); showMatchDetail(match.id); };
                  scheduledMatchesContainer.appendChild(card);
              });
          });
    }

    async function acceptOpenRequest(matchId, wager, type) {
        if(!confirm("Bu maçı kabul etmek istiyor musun?")) return;
        const myUid = auth.currentUser.uid;
        const me = userMap[myUid];
        if (type === 'Meydan Okuma') {
            if (me.toplamPuan < 0) return alert("Puanın eksiye düştüğü için bahisli maç kabul edemezsin.");
            if (wager > me.toplamPuan * 0.5) return alert(`Bu maç için puanın yetersiz.`);
        }
        try {
            await db.collection('matches').doc(matchId).update({ oyuncu2ID: myUid, durum: 'Hazır' });
            alert("Maç kabul edildi!"); document.querySelector('[data-target="tab-matches"]').click();
        } catch (error) { console.error(error); alert("Hata: Maç kabul edilemedi."); loadOpenRequests(); }
    }

    function loadMyMatchesOverview() {
        if(!myActiveMatchesContainer || !myPendingMatchesContainer || !myHistoryMatchesContainer) return;

        myActiveMatchesContainer.innerHTML = '<p style="text-align:center;">Yükleniyor...</p>';
        myPendingMatchesContainer.innerHTML = '<p style="text-align:center;">Yükleniyor...</p>';
        myHistoryMatchesContainer.innerHTML = '<p style="text-align:center;">Yükleniyor...</p>';

        const currentUserID = auth.currentUser.uid;
        const q1 = db.collection('matches').where('oyuncu1ID', '==', currentUserID).get();
        const q2 = db.collection('matches').where('oyuncu2ID', '==', currentUserID).get();

        if (histFilterCourt && histFilterCourt.options.length === 1) {
            ['Toprak', 'Sert', 'Çim'].forEach(c => { 
                const opt = document.createElement('option'); opt.value = c; opt.textContent = c; 
                histFilterCourt.appendChild(opt); 
            });
        }

        Promise.all([q1, q2]).then(snapshots => {
            let allMatches = [];
            snapshots.forEach(snap => {
                snap.forEach(doc => allMatches.push({ ...doc.data(), id: doc.id }));
            });

            allMatches = allMatches.filter((match, index, self) =>
                index === self.findIndex((t) => (t.id === match.id))
            );

            allMatches.sort((a, b) => { 
                const dateA = a.tarih ? a.tarih.seconds : 0; 
                const dateB = b.tarih ? b.tarih.seconds : 0; 
                return dateB - dateA; 
            });

            const activeMatches = allMatches.filter(m => ['Hazır', 'Sonuç_Bekleniyor'].includes(m.durum));
            const pendingMatches = allMatches.filter(m => ['Bekliyor', 'Acik_Ilan'].includes(m.durum));
            const historyMatches = allMatches.filter(m => m.durum === 'Tamamlandı');

            renderMatchSection(activeMatches, myActiveMatchesContainer, 'active');
            renderMatchSection(pendingMatches, myPendingMatchesContainer, 'pending');
            renderMatchSection(historyMatches.slice(0, 10), myHistoryMatchesContainer, 'history');
        });
    }

    function renderMatchSection(matches, container, type) {
        container.innerHTML = '';
        if (matches.length === 0) {
            let msg = 'Maç bulunamadı.';
            if(type === 'active') msg = '<span style="color:#777; font-style:italic;">Aktif maçınız yok.</span>';
            if(type === 'pending') msg = '<span style="color:#777; font-style:italic;">Bekleyen teklif yok.</span>';
            if(type === 'history') msg = '<span style="color:#777; font-style:italic;">Geçmiş maç bulunamadı.</span>';
            container.innerHTML = `<p style="text-align:center;">${msg}</p>`;
            return;
        }

        matches.forEach(match => {
            const currentUserID = auth.currentUser.uid;
            let titleHTML = '';
            
            if (match.durum === 'Acik_Ilan') { 
                titleHTML = `<strong>AÇIK İLAN</strong> (Henüz rakip yok)`; 
            } else {
                const oid = match.oyuncu1ID === currentUserID ? match.oyuncu2ID : match.oyuncu1ID;
                const oname = userMap[oid]?.isim || 'Bilinmiyor';
                titleHTML = `Rakip: <strong>${oname}</strong>`;
            }

            let dm = match.durum;
            if(dm === 'Sonuç_Bekleniyor') dm = 'Sonuç Onayı 📝';
            else if(dm === 'Hazır') dm = 'Oynanıyor/Hazır 🎾';
            else if(dm === 'Bekliyor') dm = 'Cevap Bekleniyor ⏳';

            let planInfo = "";
            if (match.macZamani && match.macYeri) {
                const d = match.macZamani.toDate().toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' });
                const courtType = match.kortTipi ? ` (${match.kortTipi})` : '';
                planInfo = `<div class="match-plan-info">📅 ${d} - ${match.macYeri}${courtType}</div>`;
            }

            let scoreInfo = "";
            if (match.durum === 'Tamamlandı' && match.skor) {
                const s = match.skor;
                scoreInfo = `<div style="font-size:0.85em; color:#333; margin-top:3px;">Skor: ${s.s1_me}-${s.s1_opp}, ${s.s2_me}-${s.s2_opp}</div>`;
            }

            const card = document.createElement('div'); 
            card.className = 'match-card';
            card.innerHTML = `<p><strong>${match.macTipi}</strong> | ${dm}</p><p>${titleHTML}</p>${scoreInfo}<p>Bahis: ${match.bahisPuani}</p>${planInfo}<button class="match-action-btn" data-id="${match.id}">Detay</button>`;
            
            card.querySelector('.match-action-btn').addEventListener('click', () => { 
                returnToTab = 'tab-matches';
                isReadOnlyView = false;
                showMatchDetail(match.id); 
            });
            container.appendChild(card);
        });
    }

    function filterMyHistoryMatches() {
        const currentUserID = auth.currentUser.uid;
        myHistoryMatchesContainer.innerHTML = '<p style="text-align:center;">Filtreleniyor...</p>';

        const start = histFilterStart.value ? new Date(histFilterStart.value) : null;
        const end = histFilterEnd.value ? new Date(histFilterEnd.value) : null;
        const pName = histFilterPlayerName.value.toLowerCase().trim();
        const court = histFilterCourt.value;

        const q1 = db.collection('matches').where('oyuncu1ID', '==', currentUserID).where('durum', '==', 'Tamamlandı').get();
        const q2 = db.collection('matches').where('oyuncu2ID', '==', currentUserID).where('durum', '==', 'Tamamlandı').get();

        Promise.all([q1, q2]).then(snapshots => {
            let matches = [];
            snapshots.forEach(snap => snap.forEach(doc => matches.push({ ...doc.data(), id: doc.id })));
            
            matches.sort((a, b) => (b.tarih ? b.tarih.seconds : 0) - (a.tarih ? a.tarih.seconds : 0));

            const filtered = matches.filter(m => {
                const mDate = m.macZamani ? m.macZamani.toDate() : (m.tarih ? m.tarih.toDate() : null);
                if (start && (!mDate || mDate < start)) return false;
                if (end) {
                    const e = new Date(end); e.setHours(23,59,59);
                    if (!mDate || mDate > e) return false;
                }
                if (court && m.kortTipi !== court) return false;
                if (pName) {
                    const oid = m.oyuncu1ID === currentUserID ? m.oyuncu2ID : m.oyuncu1ID;
                    const oname = (userMap[oid]?.isim || '').toLowerCase();
                    if (!oname.includes(pName)) return false;
                }
                return true;
            });

            renderMatchSection(filtered, myHistoryMatchesContainer, 'history');
        });
    }

    function loadMatchesForFixture() {
        isReadOnlyView = true;
        
        if(fixtureActiveContainer) fixtureActiveContainer.innerHTML = '<p style="text-align:center;">Yükleniyor...</p>';
        if(fixturePendingContainer) fixturePendingContainer.innerHTML = '<p style="text-align:center;">Yükleniyor...</p>';
        if(fixtureHistoryContainer) fixtureHistoryContainer.innerHTML = '<p style="text-align:center;">Yükleniyor...</p>';

        if (filterCourt && filterCourt.options.length === 1) {
            ['Toprak', 'Sert', 'Çim'].forEach(c => { 
                const opt = document.createElement('option'); opt.value = c; opt.textContent = c; 
                filterCourt.appendChild(opt); 
            });
        }

        db.collection('matches').where('durum', 'in', ['Bekliyor', 'Hazır', 'Sonuç_Bekleniyor']).get().then(snapshot => {
            let activeMatches = [];
            let pendingMatches = [];

            snapshot.forEach(doc => {
                const match = { ...doc.data(), id: doc.id };
                if (['Hazır', 'Sonuç_Bekleniyor'].includes(match.durum)) {
                    activeMatches.push(match);
                } else if (match.durum === 'Bekliyor') {
                    pendingMatches.push(match);
                }
            });

            const sortFn = (a, b) => { 
                const dateA = a.macZamani ? a.macZamani.seconds : (a.tarih ? a.tarih.seconds : 0); 
                const dateB = b.macZamani ? b.macZamani.seconds : (b.tarih ? b.tarih.seconds : 0); 
                return dateB - dateA; 
            };
            activeMatches.sort(sortFn);
            pendingMatches.sort(sortFn);

            renderFixtureSection(activeMatches, fixtureActiveContainer);
            renderFixtureSection(pendingMatches, fixturePendingContainer);
        });

        db.collection('matches').where('durum', '==', 'Tamamlandı').get().then(snapshot => {
            let historyMatches = [];
            
            const fStart = filterDateStart.value ? new Date(filterDateStart.value) : null;
            const fEnd = filterDateEnd.value ? new Date(filterDateEnd.value) : null;
            const fCourt = filterCourt.value; 
            const fPlayer = filterPlayer.value;

            snapshot.forEach(doc => {
                const match = doc.data();
                
                if (fStart || fEnd) {
                    const d = match.macZamani ? match.macZamani.toDate() : (match.tarih ? match.tarih.toDate() : null);
                    if (!d) return; 
                    if (fStart) { fStart.setHours(0,0,0,0); if (d < fStart) return; }
                    if (fEnd) { fEnd.setHours(23,59,59,999); if (d > fEnd) return; }
                }
                if (fCourt && match.kortTipi !== fCourt) return;
                if (fPlayer && match.oyuncu1ID !== fPlayer && match.oyuncu2ID !== fPlayer) return;

                historyMatches.push({ ...match, id: doc.id });
            });

            historyMatches.sort((a, b) => { 
                const dateA = a.macZamani ? a.macZamani.seconds : (a.tarih ? a.tarih.seconds : 0); 
                const dateB = b.macZamani ? b.macZamani.seconds : (b.tarih ? b.tarih.seconds : 0); 
                return dateB - dateA; 
            });

            renderFixtureSection(historyMatches, fixtureHistoryContainer);
        });
    }

    function renderFixtureSection(matches, container) {
        if(!container) return;
        container.innerHTML = '';
        
        if (matches.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:#777; font-size:0.9em; padding:10px;">Veri yok.</p>';
            return;
        }

        matches.forEach(match => {
            const p1 = userMap[match.oyuncu1ID]?.isim || '???';
            const p2 = match.oyuncu2ID ? (userMap[match.oyuncu2ID]?.isim || '???') : 'Bekleniyor';
            
            let dateBadge = `<div style="background:#f5f5f5; color:#999; padding:5px 10px; border-radius:8px; text-align:center; margin-right:10px; min-width:45px; display:flex; flex-direction:column; justify-content:center; align-items:center;">
                                <div style="font-size:1.2em;">?</div>
                             </div>`;
            let timeStr = '';

            if (match.macZamani) {
                const date = match.macZamani.toDate();
                const day = date.getDate();
                const month = date.toLocaleString('tr-TR', { month: 'short' });
                const time = date.toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                
                dateBadge = `<div style="background:#e3f2fd; color:#0d47a1; padding:5px 10px; border-radius:8px; text-align:center; margin-right:10px; min-width:45px;"><div style="font-size:0.9em; font-weight:bold;">${day}</div><div style="font-size:0.7em;">${month}</div></div>`;
                timeStr = `<span style="font-size:0.85em; color:#666; margin-left: 5px;">⏰ ${time}</span>`;
            }

            let statusColor = '#666';
            let statusText = match.durum;
            if(match.durum === 'Hazır') { statusText = 'Oynanıyor / Hazır'; statusColor = '#28a745'; }
            else if(match.durum === 'Bekliyor') { statusText = 'Yanıt Bekliyor'; statusColor = '#ffc107'; }
            else if(match.durum === 'Tamamlandı') { statusText = 'Tamamlandı'; statusColor = '#6c757d'; }
            else if(match.durum === 'Sonuç_Bekleniyor') { statusText = 'Sonuç Onayı'; statusColor = '#17a2b8'; }

            let scoreHTML = '';
            if(match.durum === 'Tamamlandı' && match.skor) {
                const s = match.skor;
                let s3Txt = (s.s3_me || s.s3_opp) ? `, ${s.s3_me}-${s.s3_opp}` : '';
                scoreHTML = `<div style="margin-top:5px; font-size:0.85em; color:#333; font-weight:bold; background:#f8f9fa; padding:2px 5px; border-radius:4px; display:inline-block;">
                                🏁 ${s.s1_me}-${s.s1_opp}, ${s.s2_me}-${s.s2_opp}${s3Txt}
                             </div>`;
            }

            const courtTypeInfo = match.kortTipi ? ` (${match.kortTipi})` : '';
            const courtInfo = match.macYeri ? `<div style="font-size:0.85em; color:#555; margin-top:2px;">📍 ${match.macYeri}${courtTypeInfo}</div>` : '';

            const card = document.createElement('div');
            card.className = 'match-card';
            card.style.display = 'flex';
            card.style.alignItems = 'center';
            
            card.innerHTML = `
                ${dateBadge}
                <div style="flex:1;">
                    <div style="font-size:0.75em; color:${statusColor}; font-weight:bold; text-transform:uppercase; margin-bottom:2px;">${statusText}</div>
                    <div style="font-weight:600; font-size:0.95em; color:#333; line-height:1.2;">
                        ${p1} <span style="color:#999; font-weight:normal;">vs</span> ${p2}
                    </div>
                    ${scoreHTML}
                    ${courtInfo}
                    ${timeStr}
                </div>
                <button class="match-action-btn" data-id="${match.id}">Detay</button>
            `;

            card.querySelector('.match-action-btn').addEventListener('click', () => { 
                returnToTab = 'tab-fixture'; 
                showMatchDetail(match.id); 
            });

            container.appendChild(card);
        });
    }

    function renderBadges(userId, containerId) {
        const container = document.getElementById(containerId);
        if(!container) return;
        container.innerHTML = '...';

        const user = userMap[userId];
        if(!user) { container.innerHTML = ''; return; }
        
        const userBadges = user.badges || [];
        container.innerHTML = '';

        Object.keys(BADGE_DEFINITIONS).forEach(key => {
            const def = BADGE_DEFINITIONS[key];
            const hasBadge = userBadges.includes(key);
            
            const badgeEl = document.createElement('div');
            badgeEl.className = `badge-item ${hasBadge ? 'earned' : 'locked'}`;
            badgeEl.setAttribute('data-desc', def.desc);
            
            badgeEl.innerHTML = `
                <div class="badge-icon">${def.icon}</div>
                <div class="badge-name">${def.name}</div>
            `;
            container.appendChild(badgeEl);
        });
    }

    async function calculateAdvancedStats(userId) {
        const q1 = db.collection('matches').where('oyuncu1ID', '==', userId).where('durum', '==', 'Tamamlandı').get();
        const q2 = db.collection('matches').where('oyuncu2ID', '==', userId).where('durum', '==', 'Tamamlandı').get();
        const [s1, s2] = await Promise.all([q1, q2]);
        
        let allMatches = []; 
        s1.forEach(d => allMatches.push({ ...d.data(), id: d.id })); 
        s2.forEach(d => allMatches.push({ ...d.data(), id: d.id }));
        
        allMatches.sort((a, b) => { 
            const tA = a.tarih ? a.tarih.seconds : 0; 
            const tB = b.tarih ? b.tarih.seconds : 0; 
            return tB - tA; 
        });

        let stats = {
            played: 0, won: 0,
            setsPlayed: 0, setsWon: 0,
            gamesPlayed: 0, gamesWon: 0,
            clay: { played: 0, won: 0 },
            hard: { played: 0, won: 0 },
            grass: { played: 0, won: 0 },
            form: []
        };

        allMatches.forEach(m => {
            stats.played++;
            const isWinner = m.kayitliKazananID === userId;
            if (isWinner) stats.won++;

            if(stats.form.length < 5) stats.form.push(isWinner ? 'W' : 'L');

            let surface = 'other';
            const courtType = (m.kortTipi || '').toLowerCase();
            if(courtType.includes('toprak')) surface = 'clay';
            else if(courtType.includes('sert')) surface = 'hard';
            else if(courtType.includes('çim')) surface = 'grass';
            
            if(surface !== 'other') {
                stats[surface].played++;
                if(isWinner) stats[surface].won++;
            }

            if (m.skor) {
                const s = m.skor; 
                const sets = [
                    {p1: s.s1_me, p2: s.s1_opp}, 
                    {p1: s.s2_me, p2: s.s2_opp}, 
                    {p1: s.s3_me, p2: s.s3_opp, tb: true}
                ];

                sets.forEach(set => {
                    let myG, opG;
                    
                    if (m.sonucuGirenID === userId) {
                        myG = parseInt(set.p1 || 0);
                        opG = parseInt(set.p2 || 0);
                    } else {
                        myG = parseInt(set.p2 || 0);
                        opG = parseInt(set.p1 || 0);
                    }
                    
                    if(myG + opG > 0) {
                        stats.setsPlayed++;
                        if(myG > opG) stats.setsWon++;
                        
                        if(!set.tb) {
                            stats.gamesPlayed += (myG + opG);
                            stats.gamesWon += myG;
                        }
                    }
                });
            }
        });

        return stats;
    }

    async function updateStatsView(targetUserId) {
        if(!targetUserId) targetUserId = auth.currentUser.uid;
        
        statFormBadges.innerHTML = '...';
        
        const user = userMap[targetUserId];
        const stats = await calculateAdvancedStats(targetUserId);

        statTotalMatch.textContent = stats.played;
        statTotalWin.textContent = stats.won;
        statTotalPointsDisplay.textContent = user ? user.toplamPuan : 0;

        const winRate = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;
        const setRate = stats.setsPlayed > 0 ? Math.round((stats.setsWon / stats.setsPlayed) * 100) : 0;
        const gameRate = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;

        updateCircleChart(chartWinRate, winRate);
        updateCircleChart(chartSetRate, setRate);
        updateCircleChart(chartGameRate, gameRate);

        updateBarChart(barClay, valClay, stats.clay);
        updateBarChart(barHard, valHard, stats.hard);
        updateBarChart(barGrass, valGrass, stats.grass);

        statFormBadges.innerHTML = '';
        if(stats.form.length === 0) {
            statFormBadges.innerHTML = '<span style="font-size:0.8em; color:#999;">Veri yok</span>';
        } else {
            stats.form.forEach(res => {
                const b = document.createElement('div');
                b.className = `form-badge ${res==='W'?'form-w':'form-l'}`;
                b.textContent = res === 'W' ? 'G' : 'M';
                statFormBadges.appendChild(b);
            });
        }
    }

    function updateCircleChart(el, percent) {
        el.style.setProperty('--p', percent);
        el.querySelector('span').textContent = `%${percent}`;
    }

    function updateBarChart(barEl, valEl, data) {
        const rate = data.played > 0 ? Math.round((data.won / data.played) * 100) : 0;
        barEl.style.width = `${rate}%`;
        valEl.textContent = `%${rate}`;
    }

    if(statsViewPlayerSelect) {
        statsViewPlayerSelect.addEventListener('change', (e) => {
            e.target.blur();
            const val = e.target.value;
            updateStatsView(val === 'me' ? auth.currentUser.uid : val);
        });
    }

async function showPlayerStats(userId) {
        try {
            const u = userMap[userId]; if(!u) return;
            statsPlayerName.textContent = u.isim; statsTotalPoints.textContent = u.toplamPuan; statsCourtPref.textContent = u.kortTercihi || '-';
            let infoText = u.kortTercihi || '-';
if (u.kulup) infoText += ` | 🏟️ ${u.kulup}`;
if (u.tenisBaslangic) {
    // Tarihi "Yıl-Ay" formatından daha okunur hale getirebiliriz ama şimdilik direkt yazalım
    infoText += ` | 📅 Başlangıç: ${u.tenisBaslangic}`;
}
            if(statsPlayerPhoto) statsPlayerPhoto.src = u.fotoURL || 'https://via.placeholder.com/120';
            
            renderBadges(userId, 'stats-badges-grid');

            if(startChatBtn) {
                if (userId === auth.currentUser.uid) { startChatBtn.style.display = 'none'; } 
                else { startChatBtn.style.display = 'block'; startChatBtn.onclick = () => openChat(userId, u.isim); }
            }
            playerStatsModal.style.display = 'flex'; 
            
            const stats = await calculateAdvancedStats(userId);
            const matchRate = stats.played > 0 ? ((stats.won / stats.played) * 100).toFixed(0) : 0;
            const setRate = stats.setsPlayed > 0 ? ((stats.setsWon / stats.setsPlayed) * 100).toFixed(0) : 0;
            const gameRate = stats.gamesPlayed > 0 ? ((stats.gamesWon / stats.gamesPlayed) * 100).toFixed(0) : 0;
            
            document.getElementById('pie-match-chart').style.setProperty('--p', matchRate); document.getElementById('text-match-rate').textContent = `%${matchRate}`;
            document.getElementById('pie-set-chart').style.setProperty('--p', setRate); document.getElementById('text-set-rate').textContent = `%${setRate}`;
            document.getElementById('pie-game-chart').style.setProperty('--p', gameRate); document.getElementById('text-game-rate').textContent = `%${gameRate}`;
            
            const h2hBox = document.getElementById('stats-h2h-box');
            if (userId !== auth.currentUser.uid) {
                h2hBox.style.display = 'block'; h2hBox.innerHTML = 'Aramızdaki Maçlar Yükleniyor...';
                const myId = auth.currentUser.uid;
                const q1 = db.collection('matches').where('oyuncu1ID', '==', myId).where('oyuncu2ID', '==', userId).where('durum', '==', 'Tamamlandı').get();
                const q2 = db.collection('matches').where('oyuncu1ID', '==', userId).where('oyuncu2ID', '==', myId).where('durum', '==', 'Tamamlandı').get();
                Promise.all([q1, q2]).then(([s1, s2]) => {
                    let myWins = 0, oppWins = 0;
                    const proc = (d) => { if(d.data().kayitliKazananID === myId) myWins++; else oppWins++; };
                    s1.forEach(proc); s2.forEach(proc);
                    h2hBox.innerHTML = `🆚 Aramızdaki Maçlar: <span style="color:#28a745">Sen ${myWins}</span> - <span style="color:#dc3545">${oppWins} Rakip</span>`;
                });
            } else { h2hBox.style.display = 'none'; }

            const formContainer = document.getElementById('stats-form-badges'); 
            formContainer.innerHTML = '';
            if (stats.form.length === 0) { formContainer.innerHTML = '<span style="font-size:0.8em; color:#999;">Henüz maç yok</span>'; } else {
                stats.form.forEach(result => { const badge = document.createElement('div'); badge.className = `form-badge ${result === 'W' ? 'form-w' : 'form-l'}`; badge.textContent = result === 'W' ? 'G' : 'M'; formContainer.appendChild(badge); });
            }

            // --- YENİ: MAÇ FOTOĞRAFLARI (GALERİ) KISMI ---
            const statsContainer = document.querySelector('#player-stats-modal .stats-container');
            let photosContainer = document.getElementById('player-stats-photos');
            
            // Eğer container yoksa oluştur
            if (!photosContainer) {
                photosContainer = document.createElement('div');
                photosContainer.id = 'player-stats-photos';
                photosContainer.style.marginTop = '20px';
                photosContainer.style.borderTop = '1px solid #eee';
                photosContainer.style.paddingTop = '15px';
                statsContainer.appendChild(photosContainer);
            }
            
            photosContainer.innerHTML = '<p style="text-align:center; color:#999; font-size:0.9em;">Fotoğraflar yükleniyor...</p>';

            const pq1 = db.collection('matches').where('oyuncu1ID', '==', userId).where('durum', '==', 'Tamamlandı').get();
            const pq2 = db.collection('matches').where('oyuncu2ID', '==', userId).where('durum', '==', 'Tamamlandı').get();

            Promise.all([pq1, pq2]).then(snapshots => {
                let photos = [];
                snapshots.forEach(snap => {
                    snap.forEach(doc => {
                        const m = doc.data();
                        if (m.macFotoURL) {
                            photos.push({ ...m, id: doc.id, dateObj: m.macZamani ? m.macZamani.toDate() : (m.tarih ? m.tarih.toDate() : new Date()) });
                        }
                    });
                });

                // Tekrar edenleri temizle ve tarihe göre sırala
                photos = photos.filter((v,i,a)=>a.findIndex(t=>(t.id === v.id))===i);
                photos.sort((a,b) => b.dateObj - a.dateObj);

                if (photos.length === 0) {
                    photosContainer.innerHTML = '<div style="text-align:center; color:#ccc; font-size:0.8em; margin-top:10px;">Bu oyuncunun maç fotoğrafı yok. 📷</div>';
                    return;
                }

                let galleryHTML = '<h4 style="color:#555; text-align:center; border:none; margin-bottom:10px; font-size:0.9em; text-transform:uppercase;">📸 Maç Kareleri</h4><div class="gallery-grid">';
                
                photos.forEach(item => {
                    const dateStr = item.dateObj ? item.dateObj.toLocaleString('tr-TR', { day: 'numeric', month: 'short' }) : '';
                    // Fotoğrafa tıklayınca modalı kapatıp maç detayına yönlendiriyoruz
                    galleryHTML += `
                        <div class="gallery-item" onclick="document.getElementById('player-stats-modal').style.display='none'; showMatchDetail('${item.id}')">
                            <img src="${item.macFotoURL}" class="gallery-img" loading="lazy">
                            <div class="gallery-date-badge">${dateStr}</div>
                        </div>
                    `;
                });
                galleryHTML += '</div>';
                
                photosContainer.innerHTML = galleryHTML;
            });
            // ------------------------------------------------

        } catch (error) { console.error("İstatistik hatası:", error); document.getElementById('stats-form-badges').innerHTML = '<span style="color:red; font-size:0.8em;">Veri alınamadı</span>'; }
    }

function showMatchDetail(matchDocId) {
        // 1. Ekranı ve sekmeleri temizle
        tabSections.forEach(s => s.style.display = 'none');
        matchDetailView.style.display = 'block';
        currentMatchDocId = matchDocId;
        
        // Önceki kalıntıları sıfırla
        if(matchUploadPreview) { matchUploadPreview.style.display='none'; matchUploadPreview.src=''; }
        if(matchResultPhotoInput) { matchResultPhotoInput.value = ''; }
        if(detailMatchPhoto) { detailMatchPhoto.style.display='none'; detailMatchPhoto.src=''; }
        
        actionButtonsContainer.innerHTML = '';
        document.getElementById('result-message').textContent = '';

        const currentUserID = auth.currentUser.uid;

        db.collection('matches').doc(matchDocId).get().then(doc => {
            const match = doc.data();
            
            // --- KRİTİK DÜZELTME: isParticipant SADECE BURADA TANIMLANIYOR ---
            const isParticipant = (currentUserID === match.oyuncu1ID || currentUserID === match.oyuncu2ID);
            // ------------------------------------------------------------------

            const p1Name = userMap[match.oyuncu1ID]?.isim || '???';
            const p2Name = match.oyuncu2ID ? (userMap[match.oyuncu2ID]?.isim || '???') : 'Henüz Yok';
            
            // Kazanan listesini doldur
            winnerSelect.innerHTML = `<option value="">Kazananı Seçin</option><option value="${match.oyuncu1ID}">${p1Name}</option>`;
            if(match.oyuncu2ID) winnerSelect.innerHTML += `<option value="${match.oyuncu2ID}">${p2Name}</option>`;
            
            // Maç bilgilerini yazdır
            let infoHTML = `<h3>${match.macTipi}</h3><p><strong>${p1Name}</strong> vs <strong>${p2Name}</strong></p><p>Bahis: ${match.bahisPuani} Puan</p>`;
            if(match.durum === 'Acik_Ilan') infoHTML += `<p style="color:orange; font-weight:bold;">Bu bir açık ilandır.</p>`;
            
            const courtType = match.kortTipi ? ` (${match.kortTipi})` : '';
            if(match.macYeri && match.macZamani) {
                const d = match.macZamani.toDate().toLocaleString('tr-TR');
                infoHTML += `<div style="background-color:#e2e6ea; padding:8px; border-radius:5px; margin-top:5px;">📍 <strong>${match.macYeri}${courtType}</strong><br>⏰ <strong>${d}</strong></div>`;
            } else if (match.kortTipi) {
                infoHTML += `<div style="background-color:#e2e6ea; padding:8px; border-radius:5px; margin-top:5px;">Kort Tipi: <strong>${match.kortTipi}</strong></div>`;
            }
            
            if(match.macFotoURL && detailMatchPhoto) {
                detailMatchPhoto.src = match.macFotoURL;
                detailMatchPhoto.style.display = 'block';
            }

            detailMatchInfo.innerHTML = infoHTML;

            // --- FOTOĞRAF ALANI KONTROLÜ ---
            const photoArea = document.getElementById('photo-upload-area');
            const currentPhotoDisplay = document.getElementById('current-match-photo-display');
            const previewImg = document.getElementById('standalone-photo-preview');
            const photoInput = document.getElementById('standalone-photo-input');
            
            if(previewImg) { previewImg.style.display = 'none'; previewImg.src = ''; }
            if(photoInput) photoInput.value = '';

            const isEligibleStatus = ['Hazır', 'Sonuç_Bekleniyor', 'Tamamlandı'].includes(match.durum);

            if (isParticipant && isEligibleStatus && photoArea) {
                photoArea.style.display = 'block';
                if (match.macFotoURL && currentPhotoDisplay) {
                    currentPhotoDisplay.src = match.macFotoURL;
                    currentPhotoDisplay.style.display = 'block';
                } else if(currentPhotoDisplay) {
                    currentPhotoDisplay.style.display = 'none';
                }
                const saveBtn = document.getElementById('btn-save-photo-only');
                if(saveBtn) saveBtn.onclick = () => saveOnlyPhoto(matchDocId);
            } else if (photoArea) {
                photoArea.style.display = 'none';
            }

            // Anket ve Yorumları Yükle
            loadMatchInteractions(matchDocId, match);

            // GİZLENECEK ALANLARI SIFIRLA
            scoreInputSection.style.display = 'none'; 
            scoreDisplaySection.style.display = 'none'; 
            winnerSelect.style.display = 'none'; 
            scheduleInputSection.style.display = 'none'; 
            
            // Sohbet Butonu
            if (chatFromMatchBtn) {
                if (match.oyuncu2ID && isParticipant) {
                    const opponentId = currentUserID === match.oyuncu1ID ? match.oyuncu2ID : match.oyuncu1ID;
                    const opponentName = userMap[opponentId]?.isim || 'Rakip';
                    chatFromMatchBtn.style.display = 'block'; 
                    chatFromMatchBtn.onclick = () => openChat(opponentId, opponentName);
                } else { chatFromMatchBtn.style.display = 'none'; }
            }
            
            // --- DURUMA GÖRE İŞLEMLER ---
            
            // 1. İZLEYİCİ İSE (Sadece Skor Göster)
            if (isReadOnlyView || !isParticipant) {
                if (match.durum === 'Sonuç_Bekleniyor' || match.durum === 'Tamamlandı') {
                    const s = match.skor || {}; scoreDisplaySection.style.display = 'block';
                    let resText = match.durum === 'Tamamlandı' ? `<p style="color:green;">Kazanan: ${userMap[match.kayitliKazananID]?.isim}</p>` : `<p style="color:orange;">Sonuç Onayı Bekleniyor</p>`;
                    scoreDisplaySection.innerHTML = `<div style="background:#f1f1f1; padding:10px; border-radius:5px;"><p><strong>Skor:</strong> ${s.s1_me}-${s.s1_opp}, ${s.s2_me}-${s.s2_opp}, ${s.s3_me}-${s.s3_opp}</p>${resText}</div>`;
                } else { document.getElementById('result-message').textContent = "Bu maç henüz oynanmadı veya sonuç girilmedi."; }
                return; // İzleyici ise burada bitir.
            }
            
            // 2. AÇIK İLAN (İlan Sahibi)
            if (match.durum === 'Acik_Ilan' && currentUserID === match.oyuncu1ID) {
                const dbn = document.createElement('button'); 
                dbn.textContent = 'İlanı Kaldır 🗑️'; 
                dbn.className = 'btn-reject'; 
                dbn.onclick = () => deleteMatch(matchDocId, "İlan kaldırıldı."); 
                actionButtonsContainer.appendChild(dbn); 
                return;
            }

            // 3. BEKLİYOR (Teklif Aşaması)
            if (match.durum === 'Bekliyor') {
                if (currentUserID === match.oyuncu2ID) {
                    // Teklif sana geldiyse
                    const ab = document.createElement('button'); 
                    ab.textContent = 'Kabul Et ✅'; 
                    ab.className = 'btn-accept'; 
                    ab.onclick = () => updateMatchStatus(matchDocId, 'Hazır', "Kabul edildi!");
                    
                    const rb = document.createElement('button'); 
                    rb.textContent = 'Reddet ❌'; 
                    rb.className = 'btn-reject'; 
                    rb.onclick = () => deleteMatch(matchDocId, "Reddedildi."); 
                    
                    actionButtonsContainer.append(ab, rb);

                } else if (currentUserID === match.oyuncu1ID) {
                    // Teklifi sen yaptıysan
                    const wb = document.createElement('button'); 
                    wb.textContent = 'Geri Çek ↩️'; 
                    wb.className = 'btn-withdraw'; 
                    wb.onclick = () => deleteMatch(matchDocId, "Geri çekildi."); 
                    actionButtonsContainer.appendChild(wb);
                }
            } 
// 4. HAZIR (PLANLAMA VE SKOR GİRME - GÜNCELLENMİŞ VERSİYON)
            else if (match.durum === 'Hazır') {
                
                // --- A) PLANLAMA ALANI (Açılır/Kapanır) ---
                scheduleInputSection.style.display = 'block'; 
                scheduleInputSection.innerHTML = `
                    <button id="btn-toggle-schedule" class="btn-purple" style="width:100%; margin-bottom:10px; display:flex; justify-content:center; align-items:center; gap:10px;">
                        <span>📅</span> Maç Planla / Güncelle
                    </button>

                    <div id="schedule-form-container" style="display:none; background:#f8f9fa; padding:10px; border-radius:8px; margin-bottom:15px; border:1px solid #eee;">
                        <h4 style="margin-top:0; margin-bottom:10px; color:#6f42c1; font-size:0.9em; border-bottom:1px solid #ddd; padding-bottom:5px;">Plan Detayları</h4>
                        <label class="input-label">Kort Tipi:</label>
                        <select id="dynamic-court-type">
                            <option value="Toprak">Toprak 🧱</option>
                            <option value="Sert">Sert 🟦</option>
                            <option value="Çim">Çim 🌱</option>
                        </select>
                        <label class="input-label">Kort Seçimi:</label>
                        <select id="dynamic-venue-select"><option value="">Kort Seç</option></select>
                        <label class="input-label">Tarih ve Saat:</label>
                        <input type="datetime-local" id="dynamic-time-input">
                        <button id="dynamic-save-schedule-btn" class="btn-save-schedule" style="margin-top:10px;">Planı Kaydet ✅</button>
                    </div>
                `;

                // Planlama Toggle İşlevi
                const toggleSchedBtn = document.getElementById('btn-toggle-schedule');
                const schedContainer = document.getElementById('schedule-form-container');
                toggleSchedBtn.onclick = () => {
                    const isHidden = schedContainer.style.display === 'none';
                    schedContainer.style.display = isHidden ? 'block' : 'none';
                    toggleSchedBtn.style.opacity = isHidden ? '0.9' : '1';
                };

                // Kort Listesini Doldur
                const dVenueSelect = document.getElementById('dynamic-venue-select');
                COURT_LIST.forEach(c => { 
                    const o = document.createElement('option'); o.value = c; o.textContent = c; 
                    if(match.macYeri === c) o.selected = true; 
                    dVenueSelect.appendChild(o); 
                });
                if(match.kortTipi) document.getElementById('dynamic-court-type').value = match.kortTipi;
                if(match.macZamani) { 
                    const dateVal = new Date(match.macZamani.toDate().getTime() - (match.macZamani.toDate().getTimezoneOffset() * 60000)).toISOString().slice(0,16);
                    document.getElementById('dynamic-time-input').value = dateVal; 
                }
                document.getElementById('dynamic-save-schedule-btn').onclick = () => saveMatchSchedule(matchDocId);


                // --- B) SKOR GİRME ALANI (GÜNCELLENMİŞ: Yer tutucular ve Konumlandırma) ---
                scoreInputSection.style.display = 'block'; 
                
                // NOT: Aşağıdaki inputlarda value="${... || ''}" yaptık. Böylece 0 yerine boş gelir ve placeholder görünür.
                scoreInputSection.innerHTML = `
                    <button id="btn-toggle-score" class="btn-main" style="width:100%; margin-bottom:10px; display:flex; justify-content:center; align-items:center; gap:10px; background: linear-gradient(to right, #ffc107, #ff9800); color:#333;">
                        <span>📝</span> Maç Sonucu Gir
                    </button>

                    <div id="score-form-container" style="display:none; background:#fff3cd; padding:10px; border-radius:8px; margin-bottom:15px; border:1px solid #ffeeba;">
                         <h4 style="margin-top:0; margin-bottom:10px; color:#856404; font-size:0.9em; border-bottom:1px solid #e6dbb9; padding-bottom:5px;">Set Sonuçları</h4>
                         
                         <div class="score-row">
                            <span>1. Set</span>
                            <input type="number" id="s1-me" class="score-box" placeholder="Ben" value="${match.skor?.s1_me || ''}">
                            <input type="number" id="s1-opp" class="score-box" placeholder="Rakip" value="${match.skor?.s1_opp || ''}">
                        </div>
                        <div class="score-row">
                            <span>2. Set</span>
                            <input type="number" id="s2-me" class="score-box" placeholder="Ben" value="${match.skor?.s2_me || ''}">
                            <input type="number" id="s2-opp" class="score-box" placeholder="Rakip" value="${match.skor?.s2_opp || ''}">
                        </div>
                        <div class="score-row">
                            <span>3. Set (Opsiyonel)</span>
                            <input type="number" id="s3-me" class="score-box" placeholder="Ben" value="${match.skor?.s3_me || ''}">
                            <input type="number" id="s3-opp" class="score-box" placeholder="Rakip" value="${match.skor?.s3_opp || ''}">
                        </div>
                        
                        <div id="winner-select-container" style="margin-top: 15px; margin-bottom: 10px;">
                            <label style="font-size:0.85em; color:#856404; font-weight:bold; margin-bottom:5px; display:block;">Kazanan Kim?</label>
                        </div>

                        <button id="dynamic-save-score-btn" class="btn-save" style="margin-top:5px; background-color:#28a745;">Sonucu Kaydet ve Gönder 🚀</button>
                    </div>
                `;

                // --- ÖNEMLİ DEĞİŞİKLİK: Kazanan Seçimini Kutunun İçine Taşıma ---
                const scoreContainer = document.getElementById('score-form-container');
                const winnerContainer = document.getElementById('winner-select-container');
                
                // Sayfanın altındaki winnerSelect'i alıp skor kutusunun içine taşıyoruz
                winnerSelect.style.display = 'block'; // Görünür yap (kutunun içinde görünecek)
                winnerSelect.style.marginBottom = '0'; // Alt boşluğu sıfırla
                winnerContainer.appendChild(winnerSelect);

                // Skor Toggle İşlevi
                const toggleScoreBtn = document.getElementById('btn-toggle-score');
                
                toggleScoreBtn.onclick = () => {
                    const isHidden = scoreContainer.style.display === 'none';
                    scoreContainer.style.display = isHidden ? 'block' : 'none';
                };

                // Skor Kaydetme Eventi
                document.getElementById('dynamic-save-score-btn').onclick = () => saveMatchResult(matchDocId);
            }
            // 5. SONUÇ ONAYI (ONAYLA / DEĞİŞTİR YAPISI)
            else if (match.durum === 'Sonuç_Bekleniyor') {
                const s = match.skor || {};
                
                // Eğer sonucu giren kişi şu an bakan kişi DEĞİLSE (Yani onaylaması gereken kişi)
                if (match.sonucuGirenID !== currentUserID) {
                    
                    // --- DİNAMİK HTML OLUŞTURMA ---
                    // Not: Veritabanında s1_me (Giren Kişi), s1_opp (Rakip) olarak kayıtlı.
                    // Şu an bakan kişi "Rakip" olduğu için değerleri ters çevirerek göstermeliyiz.
                    // Yani Inputlarda "Ben" kısmına veritabanındaki "opp" değerini, "Rakip" kısmına "me" değerini koyacağız.
                    
                    const myS1 = s.s1_opp || 0; const oppS1 = s.s1_me || 0;
                    const myS2 = s.s2_opp || 0; const oppS2 = s.s2_me || 0;
                    const myS3 = s.s3_opp || 0; const oppS3 = s.s3_me || 0;

                    // Kazanan adayını da kontrol et
                    const isWinnerMe = match.adayKazananID === currentUserID;
                    const p1Val = match.oyuncu1ID;
                    const p2Val = match.oyuncu2ID;

                    scoreDisplaySection.style.display = 'block';
                    scoreDisplaySection.innerHTML = `
                        <div style="background:#e3f2fd; padding:15px; border-radius:10px; border:1px solid #bbdefb; text-align:center;">
                            <h4 style="margin-top:0; color:#0d47a1;">📬 Rakibin Skor Girdi</h4>
                            <div style="font-size:1.2em; font-weight:bold; margin-bottom:10px;">
                                ${oppS1}-${myS1}, ${oppS2}-${myS2} ${s.s3_me || s.s3_opp ? `, ${oppS3}-${myS3}` : ''}
                            </div>
                            <div style="font-size:0.9em; color:#555; margin-bottom:15px;">
                                Kazanan Adayı: <strong>${userMap[match.adayKazananID]?.isim || 'Bilinmiyor'}</strong>
                            </div>

                            <button id="btn-toggle-approve" class="btn-main" style="background-color:#007bff; width:100%;">
                                ⚖️ Skoru İncele / Onayla / Değiştir
                            </button>

                            <div id="approve-action-area" style="display:none; margin-top:15px; background:#fff; padding:10px; border-radius:8px; border:1px solid #ddd;">
                                
                                <p style="color:#28a745; font-weight:bold; margin-bottom:5px;">✅ Her şey doğru mu?</p>
                                <button id="btn-quick-approve" class="btn-approve" style="margin-bottom:20px;">Evet, Skoru Onayla</button>
                                
                                <hr style="border-top:1px dashed #ccc; margin-bottom:15px;">

                                <p style="color:#ffc107; font-weight:bold; margin-bottom:10px;">✏️ Yanlışlık mı var? Düzenle ve Gönder:</p>
                                
                                <label class="input-label">Kazanan Kim?</label>
                                <select id="change-winner-select">
                                    <option value="${p1Val}" ${match.adayKazananID === p1Val ? 'selected' : ''}>${userMap[p1Val]?.isim}</option>
                                    <option value="${p2Val}" ${match.adayKazananID === p2Val ? 'selected' : ''}>${userMap[p2Val]?.isim}</option>
                                </select>

                                <div class="score-row">
                                    <span>1. Set</span>
                                    <input type="number" id="c-s1-me" class="score-box" value="${myS1}"> <input type="number" id="c-s1-opp" class="score-box" value="${oppS1}"> </div>
                                <div class="score-row">
                                    <span>2. Set</span>
                                    <input type="number" id="c-s2-me" class="score-box" value="${myS2}">
                                    <input type="number" id="c-s2-opp" class="score-box" value="${oppS2}">
                                </div>
                                <div class="score-row">
                                    <span>3. Set</span>
                                    <input type="number" id="c-s3-me" class="score-box" value="${myS3}">
                                    <input type="number" id="c-s3-opp" class="score-box" value="${oppS3}">
                                </div>

                                <button id="btn-submit-change" class="btn-save" style="background-color:#ff9800; margin-top:10px;">Değişikliği Gönder 🔄</button>
                            </div>
                        </div>
                    `;

                    // --- EVENT LISTENERS ---
                    
                    // 1. Aç/Kapa
                    const tglBtn = document.getElementById('btn-toggle-approve');
                    const actionArea = document.getElementById('approve-action-area');
                    tglBtn.onclick = () => {
                        const isHidden = actionArea.style.display === 'none';
                        actionArea.style.display = isHidden ? 'block' : 'none';
                    };

                    // 2. Onayla (Eski finalizeMatch fonksiyonunu çağırır)
                    document.getElementById('btn-quick-approve').onclick = () => finalizeMatch(matchDocId, match);

                    // 3. Değiştir ve Gönder (Yeni fonksiyon)
                    document.getElementById('btn-submit-change').onclick = () => updateAndResubmitScore(matchDocId);

                } else {
                    // Sonucu Giren Kişi Bekliyor
                    scoreDisplaySection.style.display = 'block';
                    scoreDisplaySection.innerHTML = `
                        <div style="background:#fff3cd; padding:15px; border-radius:10px; border:1px solid #ffeeba; text-align:center;">
                            <h4 style="margin:0; color:#856404;">⏳ Onay Bekleniyor</h4>
                            <p style="margin:5px 0; font-size:0.9em;">Rakibin (${userMap[match.oyuncu1ID === currentUserID ? match.oyuncu2ID : match.oyuncu1ID]?.isim}) sonucu onaylaması veya düzenlemesi bekleniyor.</p>
                            <div style="font-weight:bold; margin-top:10px;">Girilen Skor: ${s.s1_me}-${s.s1_opp}, ${s.s2_me}-${s.s2_opp}</div>
                        </div>
                    `;
                }
            }
            // 6. TAMAMLANDI
            else if (match.durum === 'Tamamlandı') {
                const s = match.skor || {}; scoreDisplaySection.style.display = 'block';
                scoreDisplaySection.innerHTML = `<div style="background:#e8f5e9; padding:10px;"><p>${s.s1_me}-${s.s1_opp}, ${s.s2_me}-${s.s2_opp}, ${s.s3_me}-${s.s3_opp}</p><p>Kazanan: ${userMap[match.kayitliKazananID]?.isim}</p></div>`;
            }
        });
    }

    async function updateMatchStatus(id, st, msg) { await db.collection('matches').doc(id).update({durum:st}); alert(msg); goBackToList(); }
    async function deleteMatch(id, msg) { await db.collection('matches').doc(id).delete(); alert(msg); goBackToList(); }
    
    async function saveMatchSchedule(id) { 
        // Dinamik elementleri seçiyoruz
        const cType = document.getElementById('dynamic-court-type').value;
        const venue = document.getElementById('dynamic-venue-select').value;
        const timeVal = document.getElementById('dynamic-time-input').value;

        if(!cType || !venue || !timeVal) { 
            alert("Lütfen Kort Tipi, Kort Seçimi ve Tarih/Saat bilgilerini eksiksiz girin."); 
            return; 
        }
        
        try {
            await db.collection('matches').doc(id).update({ 
                kortTipi: cType,
                macYeri: venue, 
                macZamani: firebase.firestore.Timestamp.fromDate(new Date(timeVal)) 
            });
            alert("Maç planı başarıyla kaydedildi! ✅"); 
            showMatchDetail(id);
        } catch(e) {
            console.error(e);
            alert("Plan kaydedilirken hata oluştu.");
        }
    }
    
async function saveMatchResult(id) {
    // 1. Validasyon: Kazanan seçili mi?
    if (!winnerSelect.value) { 
        alert("Lütfen kazananı seçin!"); 
        return; 
    }

    // 2. Skor Inputlarından Değerleri Al
    const s1m = parseInt(document.getElementById('s1-me').value) || 0;
    const s1o = parseInt(document.getElementById('s1-opp').value) || 0;
    const s2m = parseInt(document.getElementById('s2-me').value) || 0;
    const s2o = parseInt(document.getElementById('s2-opp').value) || 0;
    const s3m = parseInt(document.getElementById('s3-me').value) || 0;
    const s3o = parseInt(document.getElementById('s3-opp').value) || 0;

    // 3. Veritabanı Güncelleme Objesi Hazırla
    let updateData = {
        durum: 'Sonuç_Bekleniyor',
        adayKazananID: winnerSelect.value,
        sonucuGirenID: auth.currentUser.uid,
        skor: {
            s1_me: s1m, s1_opp: s1o, 
            s2_me: s2m, s2_opp: s2o, 
            s3_me: s3m, s3_opp: s3o
        },
        skorTarihi: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        // 4. Veritabanını Güncelle
        await db.collection('matches').doc(id).update(updateData);

        // --- 5. MAİL BİLDİRİMİ (YENİ EKLENEN KISIM) ---
        // Maç verisini çekip rakibi bulmamız gerekiyor
        const docSnap = await db.collection('matches').doc(id).get();
        if (docSnap.exists) {
            const matchData = docSnap.data();
            const myUid = auth.currentUser.uid;
            
            // Rakip kim? (Ben P1 isem rakip P2, değilsem tam tersi)
            const targetId = (matchData.oyuncu1ID === myUid) ? matchData.oyuncu2ID : matchData.oyuncu1ID;
            const myName = userMap[myUid]?.isim || 'Rakibin';

            // Mail İçeriği
// app.js içinde saveMatchResult fonksiyonunu bul ve 'body' kısmını değiştir:

const subject = "📝 Maç Sonucu Girildi - Onay Bekliyor";
const body = `
    <p><strong>${myName}</strong> oynadığınız maçın skorunu sisteme girdi.</p>
    <div style="background-color:#e3f2fd; padding:10px; border-radius:5px; border:1px solid #bbdefb; margin:10px 0;">
        <p style="font-size:16px; font-weight:bold; margin:0;">
            Girilen Skor: ${s1m}-${s1o}, ${s2m}-${s2o} ${s3m + s3o > 0 ? ', ' + s3m + '-' + s3o : ''}
        </p>
        <p style="margin:5px 0 0 0; font-size:12px; color:#555;">(Not: Skorlar girilen kişinin bakış açısındandır)</p>
    </div>
    <p>Skoru onaylamak veya itiraz etmek (değiştirmek) için aşağıdaki linke tıkla:</p>
    <p>
        <a href="https://mehmetmuratyak.github.io/TenisLig/">https://mehmetmuratyak.github.io/TenisLig/</a>
    </p>
`;

            // Maili Gönder
            sendNotificationEmail(targetId, subject, body);
        }
        // ---------------------------------------------

        alert("Sonuç girildi, onay bekleniyor. ⏳ Rakibine bildirim gönderildi.");
        showMatchDetail(id);

    } catch (e) {
        console.error("Sonuç kaydetme hatası:", e);
        alert("Sonuç kaydedilemedi: " + e.message);
    }
}
    // --- EKSİK OLAN FONKSİYON ---
async function updateAndResubmitScore(matchId) {
    const winnerSelect = document.getElementById('change-winner-select');
    
    if(!winnerSelect.value) { 
        alert("Lütfen kazananı seçin!"); 
        return; 
    }

    // 1. Düzeltme ekranındaki inputlardan verileri alıyoruz
    const s1m = parseInt(document.getElementById('c-s1-me').value) || 0;
    const s1o = parseInt(document.getElementById('c-s1-opp').value) || 0;
    const s2m = parseInt(document.getElementById('c-s2-me').value) || 0;
    const s2o = parseInt(document.getElementById('c-s2-opp').value) || 0;
    const s3m = parseInt(document.getElementById('c-s3-me').value) || 0;
    const s3o = parseInt(document.getElementById('c-s3-opp').value) || 0;

    // 2. Mantık: Sen skoru düzelttiğin için artık "Sonucu Giren Kişi" (sonucuGirenID) SEN oluyorsun.
    // Veritabanındaki 's1_me' senin skorun, 's1_opp' rakibin skoru olarak güncelleniyor.
    const myUid = firebase.auth().currentUser.uid;

    const updateData = {
        durum: 'Sonuç_Bekleniyor', // Durum hala aynı kalır
        adayKazananID: winnerSelect.value, // Yeni seçilen kazanan
        sonucuGirenID: myUid, // ÖNEMLİ: Sonucu giren artık sensin, rakibin onayına düşecek.
        skor: {
            s1_me: s1m,   // Senin tarafına girdiğin sayı
            s1_opp: s1o,  // Rakip tarafına girdiğin sayı
            s2_me: s2m,
            s2_opp: s2o,
            s3_me: s3m,
            s3_opp: s3o
        }
    };

    try {
        await firebase.firestore().collection('matches').doc(matchId).update(updateData);
        alert("Düzeltme başarıyla gönderildi! Şimdi rakibinin onayı bekleniyor. 🔄");
        
        // Sayfayı yenileyerek yeni durumu (bekleme ekranını) göster
        showMatchDetail(matchId); 
    } catch (e) {
        console.error("Güncelleme Hatası:", e);
        alert("Değişiklik kaydedilirken bir hata oluştu.");
    }
}

    async function finalizeMatch(id, m) {
        const wid = m.adayKazananID, lid = m.oyuncu1ID===wid?m.oyuncu2ID:m.oyuncu1ID;
        let wg=0, lg=0;
        if(m.skor) {
            const s=m.skor, isRW = m.sonucuGirenID===wid;
            const s1w = isRW?parseInt(s.s1_me):parseInt(s.s1_opp); const s1l = isRW?parseInt(s.s1_opp):parseInt(s.s1_me);
            const s2w = isRW?parseInt(s.s2_me):parseInt(s.s2_opp); const s2l = isRW?parseInt(s.s2_opp):parseInt(s.s2_me);
            wg = s1w+s2w; lg = s1l+s2l;
        }
        const bonusW = wg*5, bonusL = lg*5;
        if(m.macTipi==='Meydan Okuma') {
            await db.collection('users').doc(wid).update({ toplamPuan: firebase.firestore.FieldValue.increment(m.bahisPuani+bonusW), galibiyetSayisi: firebase.firestore.FieldValue.increment(1), macSayisi: firebase.firestore.FieldValue.increment(1) });
            await db.collection('users').doc(lid).update({ toplamPuan: firebase.firestore.FieldValue.increment(-m.bahisPuani+bonusL), macSayisi: firebase.firestore.FieldValue.increment(1) });
        } else {
            await db.collection('users').doc(wid).update({ toplamPuan: firebase.firestore.FieldValue.increment(50+bonusW), galibiyetSayisi: firebase.firestore.FieldValue.increment(1), macSayisi: firebase.firestore.FieldValue.increment(1) });
            await db.collection('users').doc(lid).update({ toplamPuan: firebase.firestore.FieldValue.increment(50+bonusL), macSayisi: firebase.firestore.FieldValue.increment(1) });
        }
        await db.collection('matches').doc(id).update({durum:'Tamamlandı', kayitliKazananID:wid});
        
        await checkAndGrantBadges(wid);
        await checkAndGrantBadges(lid);

        alert("Onaylandı ve Rozetler Kontrol Edildi!"); goBackToList(); loadLeaderboard();
    }

    function goBackToList() {
        // [YENİ] Etkileşim dinleyicilerini temizle
        matchInteractionListeners.forEach(unsubscribe => unsubscribe());
        matchInteractionListeners = [];

        matchDetailView.style.display='none';
        if (returnToTab) {
            tabSections.forEach(s => s.style.display = 'none');
            document.getElementById(returnToTab).style.display = 'block';
            navItems.forEach(n => n.classList.remove('active'));
            const navItem = document.querySelector(`.nav-item[data-target="${returnToTab}"]`);
            if(navItem) navItem.classList.add('active');
            if (returnToTab === 'tab-matches') loadMyMatchesOverview();
            if (returnToTab === 'tab-fixture') loadMatchesForFixture();
            // YENİ: Galeri sekmesine dönüş
            if (returnToTab === 'tab-gallery') loadGallery();
            // YENİ: Profil sekmesine dönüş (fotoları da yükle)
            if (returnToTab === 'tab-profile') loadUserPhotos();

            returnToTab = null;
        } else {
            document.getElementById('tab-lobby').style.display = 'block';
            document.querySelector('[data-target="tab-lobby"]').classList.add('active');
        }
    }

    function setupNotifications(userId) {
        listeners.forEach(u => u()); listeners = [];
        listeners.push(db.collection('matches').where('oyuncu1ID','==',userId).onSnapshot({includeMetadataChanges:true}, s=>handleSnapshot(s,userId,'p1')));
        listeners.push(db.collection('matches').where('oyuncu2ID','==',userId).onSnapshot({includeMetadataChanges:true}, s=>handleSnapshot(s,userId,'p2')));
        listeners.push(db.collection('chats').where('participants','array-contains',userId).onSnapshot({includeMetadataChanges:true}, s => {
            s.docChanges().forEach(change => {
                if (change.type === 'modified') {
                    const data = change.doc.data();
                    if (data.lastMessageSenderId && data.lastMessageSenderId !== userId) {
                        if (chatModal.style.display === 'flex' && currentChatId === change.doc.id) return;
                        const senderId = data.participants.find(id => id !== userId);
                        const senderName = userMap[senderId]?.isim || 'Biri';
                        showNotification(`💬 ${senderName}: ${data.lastMessage}`, 'info');
                    }
                }
            });
        }));
    }
    function handleSnapshot(snapshot, userId, role) {
        snapshot.docChanges().forEach(change => {
            const d = change.doc.data();
            if (change.doc.metadata.hasPendingWrites) return;
            if (change.type === 'added' && d.tarih && (new Date()-d.tarih.toDate())<30000 && role==='p2' && d.durum==='Bekliyor') showNotification(`${userMap[d.oyuncu1ID]?.isim||'Biri'} sana meydan okudu!`, 'info');
            if (change.type === 'modified') {
                const opp = role==='p1'?userMap[d.oyuncu2ID]?.isim:userMap[d.oyuncu1ID]?.isim;
                if (d.durum==='Hazır') {
                   const msg = role==='p1' ? 'Teklifin kabul edildi!' : 'Maç eşleşmesi sağlandı!';
                   showNotification(msg, 'success');
                }
                if (d.durum==='Sonuç_Bekleniyor' && d.sonucuGirenID!==userId) showNotification(`${opp} sonucu girdi.`, 'warning');
                if (d.durum==='Tamamlandı') showNotification(`Maç tamamlandı!`, 'success');
            }
        });
    }
    function showNotification(msg, type='info') {
        const t = document.createElement('div'); t.className=`notification-toast ${type}`;
        t.innerHTML = `<span>${msg}</span><button onclick="this.parentElement.remove()" style="background:none;border:none;color:#fff;">&times;</button>`;
        notificationContainer.appendChild(t); setTimeout(()=>t.remove(), 5000);
        const u = userMap[auth.currentUser?.uid];
        if(u?.bildirimTercihi==='ses') { try { const a=new (window.AudioContext||window.webkitAudioContext)(); const o=a.createOscillator(); const g=a.createGain(); o.connect(g); g.connect(a.destination); o.type='sine'; o.frequency.value=880; g.gain.value=0.1; o.start(); o.stop(a.currentTime+0.2); } catch(e){} }
        else if(u?.bildirimTercihi==='titresim' && navigator.vibrate) navigator.vibrate([200,100,200]);
    }

    if(sendMessageBtn) { sendMessageBtn.onclick = sendMessage; }
    if(chatInput) { chatInput.addEventListener('keypress', function(e) { if (e.key === 'Enter') sendMessage(); }); }
    if(closeChatModal) { closeChatModal.onclick = () => { chatModal.style.display = 'none'; if (currentChatUnsubscribe) currentChatUnsubscribe(); }; }
    if (clearChatBtn) clearChatBtn.addEventListener('click', clearChatMessages);

    auth.onAuthStateChanged(user => {
        if (user) {
            authScreen.style.display = 'none'; mainApp.style.display = 'flex'; 
            tabSections.forEach(s => s.style.display = 'none'); document.getElementById('tab-lobby').style.display = 'block';
            navItems.forEach(n => n.classList.remove('active')); document.querySelector('[data-target="tab-lobby"]').classList.add('active');

            fetchWeather();

            fetchUserMap().then(() => { 
                loadLeaderboard(); 
                loadOpponents(); 
                loadMyMatchesOverview(); 
                loadOpenRequests();
                loadScheduledMatches(); 
                loadAnnouncements(); 
                setupNotifications(user.uid); 
                
                // --- YENİ: BAKIM FONKSİYONUNU ÇAĞIR ---
                runLeagueMaintenance(); // <-- BURAYA EKLENDİ
                initSpamWarning();
            });
        } else { 
            authScreen.style.display = 'flex'; mainApp.style.display = 'none'; listeners.forEach(u=>u());
            switchAuthTab('login');
        }
    });

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-target');
            
            matchDetailView.style.display = 'none';

            tabSections.forEach(section => section.style.display = 'none');
            document.getElementById(targetId).style.display = 'block';
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            if (targetId === 'tab-stats') {
                updateStatsView(auth.currentUser.uid);
            }
            else if (targetId === 'tab-fixture') { setTodayFilters(); loadMatchesForFixture(); }
            else if (targetId === 'tab-matches') { setHistoryTodayFilters(); loadMyMatchesOverview(); }
            else if (targetId === 'tab-bests') { loadTheBests(bestsFilterSelect.value); }
            else if (targetId === 'tab-chat') { loadChatList(); }
            else if (targetId === 'tab-rankings') { loadLeaderboard(); }
            else if (targetId === 'tab-lobby') { loadOpenRequests(); loadScheduledMatches(); loadAnnouncements(); }
            // YENİ: Galeri sekmesine tıklandığında
            else if (targetId === 'tab-gallery') { setGalleryTodayFilters(); loadGallery(); }
            // YENİ: Profil sekmesine tıklandığında
            else if (targetId === 'tab-profile') {
                const u = userMap[auth.currentUser.uid];
                if(u) {
                    editFullNameInput.value = u.isim || ''; 
                    editPhoneNumber.value = u.telefon || ''; 
                    editCourtPreference.value = u.kortTercihi || 'Her İkisi'; 
                    document.getElementById('edit-start-date').value = u.tenisBaslangic || '';
        document.getElementById('edit-club').value = u.kulup || '';
                    if(editNotificationPreference) editNotificationPreference.value = u.bildirimTercihi || 'ses';
                    if(editProfilePreview) editProfilePreview.src = u.fotoURL || 'https://via.placeholder.com/100';
                    const emailCheckbox = document.getElementById('edit-email-notify');
        if(emailCheckbox) {
            emailCheckbox.checked = (u.emailNotifications !== false);
        }
                    renderBadges(auth.currentUser.uid, 'my-badges-container');
                    loadUserPhotos(); // YENİ: Kullanıcı fotolarını yükle
                }
            }
        });
    });

    // --- GÜNCELLENEN EVENT LISTENERLAR ---
    if(btnApplyHistoryFilter) btnApplyHistoryFilter.addEventListener('click', filterMyHistoryMatches);
    if(bestsFilterSelect) bestsFilterSelect.addEventListener('change', (e) => loadTheBests(e.target.value));

    // YENİ: Galeri Buton Listener'ları
    if(btnGalleryFilter) btnGalleryFilter.addEventListener('click', loadGallery);
    if(btnGalleryClear) btnGalleryClear.addEventListener('click', () => {
        galleryFilterDate.value = ''; 
        galleryFilterCourt.value = ''; 
        galleryFilterPlayer.value = ''; 
        loadGallery(); 
    });

    // Diğer Event Listenerlar
  if(saveProfileBtn) saveProfileBtn.addEventListener('click', async ()=>{ 
    const btn = saveProfileBtn;
    btn.disabled = true;
    btn.textContent = "İşleniyor...";

    try {
        const f = editProfilePhotoInput.files[0]; 
        let url = userMap[auth.currentUser.uid].fotoURL; 
        
        // Profil için 600px genişlik yeterli, döngü bunu KB seviyesine indirir.
        if(f) url = await compressAndConvertToBase64(f, 600);
        
        await db.collection('users').doc(auth.currentUser.uid).update({
            isim: editFullNameInput.value, 
            telefon: editPhoneNumber.value, 
            kortTercihi: editCourtPreference.value, 
            bildirimTercihi: editNotificationPreference.value,
            emailNotifications: document.getElementById('edit-email-notify').checked,
            tenisBaslangic: document.getElementById('edit-start-date').value,
    kulup: document.getElementById('edit-club').value,
            fotoURL: url
        });
        
        alert("Profil güncellendi! ✅"); 
        location.reload(); 

    } catch (error) {
        console.error("Hata:", error);
        alert("Hata: " + error.message);
        btn.disabled = false;
        btn.textContent = "Kaydet ve Güncelle";
    }
});
    
    document.querySelectorAll('.close-modal').forEach(b=>b.onclick=function(){this.closest('.modal').style.display='none'});
    window.onclick=e=>{if(e.target.classList.contains('modal'))e.target.style.display='none'};
    
    if(btnShowCreateAd) btnShowCreateAd.addEventListener('click', () => { createAdForm.style.display='block'; challengeForm.style.display='none'; });
    if(btnShowSpecificChallenge) btnShowSpecificChallenge.addEventListener('click', () => { challengeForm.style.display='block'; createAdForm.style.display='none'; loadOpponents(); });
    matchTypeSelect.addEventListener('change', e=>{wagerPointsInput.style.display=e.target.value==='Meydan Okuma'?'block':'none'});
    adMatchTypeSelect.addEventListener('change', e=>{adWagerPointsInput.style.display=e.target.value==='Meydan Okuma'?'block':'none'});
    backToListBtn.addEventListener('click', goBackToList);

    // --- ANA GİRİŞ/KAYIT BUTONU ---
    if (authActionBtn) {
        authActionBtn.addEventListener('click', async () => {
            const email = emailInput.value;
            const password = passwordInput.value;
            
            if (!email || !password) {
                authError.textContent = "E-posta ve şifre zorunludur.";
                authError.style.display = 'block';
                return;
            }

            if (isLoginMode) {
                // GİRİŞ YAP
                auth.signInWithEmailAndPassword(email, password)
                    .catch(e => {
                        authError.style.display = 'block';
                        authError.textContent = "Giriş Hatası: " + e.message;
                    });
            } else {
                // KAYIT OL
try {
                const c = await auth.createUserWithEmailAndPassword(email, password);
                let url = null;
                
                if(profilePhotoInput.files[0]) url = await compressAndConvertToBase64(profilePhotoInput.files[0], 800, 0.8);
                
                await db.collection('users').doc(c.user.uid).set({
                    email: email,
                    isim: fullNameInput.value || email.split('@')[0],
                    kortTercihi: courtPreferenceSelect.value || 'Farketmez',
                    telefon: phoneNumberInput.value || '',
                    tenisBaslangic: document.getElementById('register-start-date').value || '',
    kulup: document.getElementById('register-club').value || '',
                    fotoURL: url,
                    toplamPuan: 1000,
                    bildirimTercihi: 'ses',
                    
                    // BURASI EKLENDİ: İlk kayıtta varsayılan olarak TRUE (Onaylı) yapıyoruz.
                    emailNotifications: true, 

                    macSayisi: 0,
                    galibiyetSayisi: 0,
                    badges: [],
                    kayitTari: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                // ... (news koleksiyonuna ekleme kodları aynı kalacak) ...

            } catch(e) {
                authError.style.display = 'block';
                authError.textContent = "Kayıt Hatası: " + e.message;
            }
        }
    });
}

submitChallengeBtn.addEventListener('click', async () => {
        // 1. Form verilerini al
        const oid = opponentSelect.value;
        const mt = matchTypeSelect.value;
        let wp = parseInt(wagerPointsInput.value);

        // 2. Kontroller (Validasyon)
        if (!oid) return alert("Lütfen bir rakip seçin!");
        
        // Bahis kontrolü
        if (mt === 'Meydan Okuma' && (isNaN(wp) || wp < 50 || wp % 50 !== 0)) {
            return alert("Bahis puanı en az 50 olmalı ve 50'nin katları olmalıdır!");
        }

        const me = userMap[auth.currentUser.uid];
        const op = userMap[oid]; // Rakip bilgisi

        // Puan yetersizliği kontrolü
        if (mt === 'Meydan Okuma') {
            if (me.toplamPuan < 0) return alert("Puanın eksiye düştüğü için bahisli maç teklif edemezsin.");
            if (op.toplamPuan < 0) return alert("Rakibin puanı eksi olduğu için bahisli maç kabul edemez.");
            if (wp > me.toplamPuan * 0.5) return alert("Maksimum bahis, toplam puanının yarısı olabilir.");
            if (wp > op.toplamPuan * 0.5) return alert("Bu bahis miktarı rakibin puan limitini aşıyor.");
        }

        try {
            // 3. Veritabanına Ekle
            await db.collection('matches').add({
                oyuncu1ID: auth.currentUser.uid,
                oyuncu2ID: oid,
                macTipi: mt,
                bahisPuani: wp || 0,
                durum: 'Bekliyor',
                tarih: firebase.firestore.FieldValue.serverTimestamp(),
                kayitliKazananID: null
            });

            // --- 4. MAİL BİLDİRİMİ (YENİ KISIM) ---
            const senderName = me.isim || 'Bir oyuncu';
            const mailSubject = "⚔️ Meydan Okuma Geldi!";
            
            // Mail içeriği (HTML)
// app.js içinde submitChallengeBtn listener'ını bul ve 'mailBody' kısmını değiştir:

const mailBody = `
    <p><strong>${senderName}</strong> sana özel bir maç teklifi gönderdi.</p>
    <div style="background-color:#fff3cd; padding:10px; border-radius:5px; border:1px solid #ffeeba; margin:10px 0;">
        <p><strong>Maç Tipi:</strong> ${mt}</p>
        <p><strong>Bahis:</strong> ${wp || 0} Puan</p>
    </div>
    <p>Teklifi kabul etmek veya reddetmek için uygulamaya aşağıdaki adresten gidebilirsin:</p>
    <p>
        <a href="https://mehmetmuratyak.github.io/TenisLig/">https://mehmetmuratyak.github.io/TenisLig/</a>
    </p>
`;

            // Daha önce eklediğimiz Google Apps Script fonksiyonunu çağırıyoruz
            sendNotificationEmail(oid, mailSubject, mailBody);
            // -------------------------------------

            // 5. Başarılı İşlem Sonrası
            alert("Teklif başarıyla gönderildi! Rakibine mail ile haber verildi. 📨");
            challengeForm.style.display = 'none';
            
            // Maçlarım sekmesine yönlendir
            document.querySelector('[data-target="tab-matches"]').click();

        } catch (error) {
            console.error("Teklif gönderme hatası:", error);
            alert("Bir hata oluştu: " + error.message);
        }
    });
submitAdBtn.addEventListener('click', async () => {
        // 1. Verileri Al
        const mt = adMatchTypeSelect.value; 
        let wp = parseInt(adWagerPointsInput.value);

        // Lig Seçimlerini Al (Checkboxlar)
        const checkboxes = document.querySelectorAll('input[name="allowed-leagues"]:checked');
        const allowedLeagues = Array.from(checkboxes).map(cb => cb.value);

        // 2. Validasyonlar (Kontroller)
        if (allowedLeagues.length === 0) {
            return alert("Lütfen bu ilanı kabul edebilecek en az bir lig seçin!");
        }

        if(mt === 'Meydan Okuma' && (isNaN(wp)||wp<50||wp%50!==0)) {
            return alert("Bahis puanı en az 50 ve 50'nin katları olmalıdır!");
        }
        
        const me = userMap[auth.currentUser.uid];
        
        // Puan Kontrolü
        if (mt === 'Meydan Okuma') {
            if (me.toplamPuan < 0) return alert("Puanın eksiye düştüğü için bahisli ilan açamazsın.");
            if (wp > me.toplamPuan * 0.5) return alert("Maksimum bahis toplam puanının yarısı olabilir.");
        }

        try {
            // 3. Veritabanına Kaydet
            await db.collection('matches').add({ 
                oyuncu1ID: auth.currentUser.uid, 
                oyuncu2ID: null, // Açık ilan olduğu için rakip henüz yok
                macTipi: mt, 
                bahisPuani: wp || 0, 
                durum: 'Acik_Ilan', 
                tarih: firebase.firestore.FieldValue.serverTimestamp(), 
                kayitliKazananID: null,
                allowedLeagues: allowedLeagues
            });

            // --- 4. TOPLU MAİL BİLDİRİMİ (YENİ KISIM) ---
            const myName = me.isim || 'Bir oyuncu';
            const leagueText = allowedLeagues.join(', ');
            
// app.js içinde submitAdBtn listener'ını bul ve 'body' kısmını değiştir:

const subject = "📢 Yeni Kort İlanı!";
const body = `
    <p><strong>${myName}</strong> herkese açık bir maç ilanı oluşturdu!</p>
    <div style="background-color:#f8f9fa; padding:10px; border-left:4px solid #28a745; margin:10px 0;">
        <p><strong>Maç Tipi:</strong> ${mt}</p>
        <p><strong>Bahis:</strong> ${wp || 0} Puan</p>
        <p><strong>Kabul Edebilen Ligler:</strong> ${leagueText}</p>
    </div>
    <p>Kendine güveniyorsan hemen uygulamaya girip ilanı kabul et:</p>
    <p>
        <a href="https://mehmetmuratyak.github.io/TenisLig/">https://mehmetmuratyak.github.io/TenisLig/</a>
    </p>
`;

            // Döngü: Sistemdeki herkesi gez ve mail at (Kendin hariç)
            const allUserIds = Object.keys(userMap);
            console.log(`Toplam ${allUserIds.length - 1} kişiye mail gönderimi başlıyor...`);

            allUserIds.forEach(uid => {
                if (uid !== auth.currentUser.uid) {
                    // Her kullanıcıya mail fonksiyonunu tetikle
                    // Not: Google Script tarafında "no-cors" kullandığımız için 
                    // burası "fire and forget" (gönder ve unut) mantığıyla çalışır, uygulamayı dondurmaz.
                    sendNotificationEmail(uid, subject, body);
                }
            });
            // ---------------------------------------------

            // 5. Arayüzü Temizle ve Yönlendir
            alert("İlan başarıyla yayınlandı ve oyunculara mail gönderildi! 📢"); 
            createAdForm.style.display = 'none'; 
            
            // Lobiye dönüp ilanları yenile
            loadOpenRequests(); 
            document.querySelector('[data-target="tab-lobby"]').click(); 

        } catch (error) {
            console.error("İlan oluşturma hatası:", error);
            alert("Hata oluştu: " + error.message);
        }
    });
    if(applyFiltersBtn) applyFiltersBtn.addEventListener('click', () => loadMatchesForFixture());
    if(clearFiltersBtn) clearFiltersBtn.addEventListener('click', () => { filterDateStart.value = ''; filterDateEnd.value = ''; filterCourt.value = ''; filterPlayer.value = ''; loadMatchesForFixture(); });
    if(logoutBtnProfile) logoutBtnProfile.addEventListener('click', ()=> { if(confirm("Çıkış yapmak istediğinize emin misiniz?")) { auth.signOut(); window.location.reload(); } });
    
    // --- ÖNİZLEME (Kayıt Ekranı) ---
    if (profilePhotoInput) { 
        profilePhotoInput.addEventListener('change', async (e) => { 
            const file = e.target.files[0]; 
            if(file) { 
                const base64 = await compressAndConvertToBase64(file, 800, 0.8); 
                if(profilePreview) profilePreview.src = base64; 
            } 
        }); 
    }
    
    // --- ÖNİZLEME (Profil Düzenleme Ekranı) ---
    if (editProfilePhotoInput) { 
        editProfilePhotoInput.addEventListener('change', async (e) => { 
            const file = e.target.files[0]; 
            if(file) { 
                const base64 = await compressAndConvertToBase64(file, 800, 0.8); 
                if(editProfilePreview) editProfilePreview.src = base64; 
            } 
        }); 
    }
    
    // --- MAÇ SONUCU FOTOĞRAF ÖNİZLEME ---
    if(matchResultPhotoInput) {
        matchResultPhotoInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if(file) {
                const base64 = await compressAndConvertToBase64(file, 1024, 0.8);
                if(matchUploadPreview) {
                    matchUploadPreview.src = base64;
                    matchUploadPreview.style.display = 'inline-block';
                }
            }
        });
    }
    // --- YENİ: ANKET VE YORUM FONKSİYONLARI ---

    function loadMatchInteractions(matchId, matchData) {
        const container = document.getElementById('match-interactions-container');
        const myUid = auth.currentUser.uid;
        
        // Eğer maç "Açık İlan" ise veya henüz oyuncu 2 yoksa etkileşimi gizle
        if (matchData.durum === 'Acik_Ilan' || !matchData.oyuncu2ID) {
            container.style.display = 'none';
            return;
        }
        container.style.display = 'block';

        // İsimleri al
        const p1Name = userMap[matchData.oyuncu1ID]?.isim || 'Oyuncu 1';
        const p2Name = userMap[matchData.oyuncu2ID]?.isim || 'Oyuncu 2';

        // --- 1. ANKET SİSTEMİ ---
        const pollLoading = document.getElementById('poll-loading');
        const votingArea = document.getElementById('poll-voting-area');
        const resultsArea = document.getElementById('poll-results-area');
        const btnP1 = document.getElementById('btn-vote-p1');
        const btnP2 = document.getElementById('btn-vote-p2');

        // Buton isimlerini ayarla
        btnP1.textContent = `Oy: ${p1Name}`;
        btnP2.textContent = `Oy: ${p2Name}`;
        
        btnP1.onclick = () => castVote(matchId, 'p1', p1Name);
        btnP2.onclick = () => castVote(matchId, 'p2', p2Name);

        // Anket verisini dinle
        const votesRef = db.collection('matches').doc(matchId).collection('votes');
        
        // Listener'ı global diziye ekle ki sayfa değişince kapansın
        const voteUnsub = votesRef.onSnapshot(snapshot => {
            if(pollLoading) pollLoading.style.display = 'none';
            let p1Votes = 0;
            let p2Votes = 0;
            let iVoted = false;

            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.choice === 'p1') p1Votes++;
                else if (data.choice === 'p2') p2Votes++;
                
                // GÜNCELLEME: Hem Doküman ID'sine hem de veri içindeki userId alanına bakıyoruz
                if (doc.id === myUid || data.userId === myUid) {
                    iVoted = true;
                }
            });

            const total = p1Votes + p2Votes;
            
            // Eğer maç bitmişse veya ben oy vermişsem sonuçları göster
            if (matchData.durum === 'Tamamlandı' || iVoted) {
                if(votingArea) votingArea.style.display = 'none';
                if(resultsArea) resultsArea.style.display = 'block';

                const p1Perc = total > 0 ? Math.round((p1Votes / total) * 100) : 0;
                const p2Perc = total > 0 ? Math.round((p2Votes / total) * 100) : 0;

                const nameP1 = document.getElementById('poll-name-p1');
                const nameP2 = document.getElementById('poll-name-p2');
                if(nameP1) nameP1.textContent = p1Name;
                if(nameP2) nameP2.textContent = p2Name;
                
                const percP1 = document.getElementById('poll-perc-p1');
                const percP2 = document.getElementById('poll-perc-p2');
                if(percP1) percP1.textContent = `%${p1Perc} (${p1Votes})`;
                if(percP2) percP2.textContent = `%${p2Perc} (${p2Votes})`;
                
                const barP1 = document.getElementById('poll-bar-p1');
                const barP2 = document.getElementById('poll-bar-p2');
                if(barP1) barP1.style.width = `${p1Perc}%`;
                if(barP2) barP2.style.width = `${p2Perc}%`;
                
                const totalVotes = document.getElementById('poll-total-votes');
                if(totalVotes) totalVotes.textContent = total;
            } else {
                // Oy vermediysem butonları göster
                if(votingArea) votingArea.style.display = 'block';
                if(resultsArea) resultsArea.style.display = 'none';
            }
        });
        matchInteractionListeners.push(voteUnsub);


        // --- 2. YORUM SİSTEMİ ---
        const commentsList = document.getElementById('match-comments-list');
        const btnSend = document.getElementById('btn-send-match-comment');
        const inputComment = document.getElementById('match-comment-input');

        // Event listener tekrarını önlemek için önce temizleyip sonra ekleyebiliriz veya onclick kullanırız
        if(btnSend) btnSend.onclick = () => sendMatchComment(matchId, inputComment);

        const commentsRef = db.collection('matches').doc(matchId).collection('comments').orderBy('timestamp', 'asc');
        
        const commentUnsub = commentsRef.onSnapshot(snapshot => {
            if(!commentsList) return;
            commentsList.innerHTML = '';
            if (snapshot.empty) {
                commentsList.innerHTML = '<p style="text-align:center; color:#999; font-size:0.9em;">İlk yorumu sen yap! 👇</p>';
                return;
            }

            snapshot.forEach(doc => {
                const c = doc.data();
                const timeStr = c.timestamp ? c.timestamp.toDate().toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit', day:'numeric', month:'numeric' }) : '';
                const isMe = c.userId === myUid;
                
                const div = document.createElement('div');
                div.className = 'comment-item';
                if(isMe) div.style.borderLeft = '3px solid #c06035';

                div.innerHTML = `
                    <div class="comment-header">
                        <span class="comment-author">${c.userName}</span>
                        <span>${timeStr}</span>
                    </div>
                    <div class="comment-text">${c.text}</div>
                `;
                commentsList.appendChild(div);
            });
            commentsList.scrollTop = commentsList.scrollHeight;
        });
        matchInteractionListeners.push(commentUnsub);
    }

    async function castVote(matchId, choice, playerName) {
        try {
            await db.collection('matches').doc(matchId).collection('votes').doc(auth.currentUser.uid).set({
                choice: choice,
                userId: auth.currentUser.uid, // GÜNCELLEME: ID'yi içeriye de kaydediyoruz
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            // İstersen buraya bir bildirim ekleyebilirsin
            // alert("Oyunuz kaydedildi!"); 
        } catch (error) {
            console.error("Oy verme hatası:", error);
            alert("Oy verirken bir hata oluştu.");
        }
    }

    async function sendMatchComment(matchId, inputEl) {
        const text = inputEl.value.trim();
        if (!text) return;

        const myUser = userMap[auth.currentUser.uid];
        const userName = myUser ? myUser.isim : 'Bilinmeyen';

        try {
            inputEl.value = ''; // Inputu temizle
            await db.collection('matches').doc(matchId).collection('comments').add({
                text: text,
                userId: auth.currentUser.uid,
                userName: userName,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error("Yorum hatası:", error);
            alert("Yorum gönderilemedi.");
        }
    }
    // --- YENİ FOTOĞRAF İŞLEVLERİ ---

// 1. Dosya seçilince önizleme yapma
const standaloneInput = document.getElementById('standalone-photo-input');
if(standaloneInput) {
    standaloneInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Mevcut sıkıştırma fonksiyonunu kullanıyoruz
            const base64 = await compressAndConvertToBase64(file, 1024, 0.8);
            const preview = document.getElementById('standalone-photo-preview');
            preview.src = base64;
            preview.style.display = 'inline-block';
        }
    });
}

// 2. Sadece fotoğrafı kaydetme fonksiyonu
async function saveOnlyPhoto(matchId) {
    const input = document.getElementById('standalone-photo-input');
    const file = input.files[0];

    if (!file) {
        alert("Lütfen önce bir fotoğraf seçin.");
        return;
    }

    const btn = document.getElementById('btn-save-photo-only');
    btn.textContent = "Yükleniyor...";
    btn.disabled = true;

    try {
        const photoUrl = await compressAndConvertToBase64(file, 1024, 0.8);
        
        await db.collection('matches').doc(matchId).update({
            macFotoURL: photoUrl
        });

        alert("Fotoğraf başarıyla güncellendi! 📸");
        
        // Görüntüyü yenile
        showMatchDetail(matchId); 
        
    } catch (error) {
        console.error("Fotoğraf yükleme hatası:", error);
        alert("Fotoğraf yüklenirken bir hata oluştu.");
    } finally {
        btn.textContent = "Fotoğrafı Kaydet 💾";
        btn.disabled = false;
    }
}

// --- OTOMATİK LİG BAKIM VE TEMİZLİK FONKSİYONU ---
async function runLeagueMaintenance() {
    console.log("Lig bakımı başlatılıyor...");
    const now = new Date();
    const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000; // 5 Günün milisaniye karşılığı

    try {
        // --- KURAL 1 & 2: 'Hazır' statüsündeki maçların kontrolü ---
        // 1. Tarih/Kort girilmemiş ve onaylanalı 5 gün geçmiş.
        // 2. Maç tarihi üzerinden 5 gün geçmiş ama skor girilmemiş.
        
        const readySnap = await db.collection('matches').where('durum', '==', 'Hazır').get();
        
        const batch = db.batch(); // Toplu işlem başlatıyoruz (Performans için)
        let operationCount = 0;

        readySnap.forEach(doc => {
            const m = doc.data();
            const matchId = doc.id;
            const matchRef = db.collection('matches').doc(matchId);

            // Tarih verilerini JS Date objesine çevir
            const createdDate = m.tarih ? m.tarih.toDate() : null;
            const scheduledDate = m.macZamani ? m.macZamani.toDate() : null;

            // KURAL 1: Maç onaylanmış (Hazır) ama tarih/kort belirlenmemiş (macZamani yok)
            if (!scheduledDate && createdDate) {
                if ((now - createdDate) > FIVE_DAYS_MS) {
                    console.log(`Maç İptal (Planlama Yapılmadı): ${matchId}`);
                    batch.delete(matchRef); // Veya batch.update(matchRef, {durum: 'İptal'});
                    operationCount++;
                }
            }

            // KURAL 2: Maç tarihi belirlenmiş ama üzerinden 5 gün geçmiş (Skor girilmemiş ki hala 'Hazır'da)
            if (scheduledDate) {
                if ((now - scheduledDate) > FIVE_DAYS_MS) {
                    console.log(`Maç İptal (Oynanmadı/Skor Girilmedi): ${matchId}`);
                    batch.delete(matchRef);
                    operationCount++;
                }
            }
        });

        // --- KURAL 3: 'Sonuç_Bekleniyor' statüsündeki maçların otomatik onayı ---
        // Skor girilmiş ama karşı taraf 5 gündür onaylamamış.
        
        const pendingSnap = await db.collection('matches').where('durum', '==', 'Sonuç_Bekleniyor').get();
        
        // Bu işlem puan hesaplaması gerektirdiği için batch yerine tek tek işlem yapacağız (finalizeMatch mantığı)
        // Döngü içinde async/await kullanacağız.
        for (const doc of pendingSnap.docs) {
            const m = doc.data();
            const matchId = doc.id;
            
            // Skor girilme tarihi yoksa (eski maçlar için) maç zamanını veya oluşturma tarihini baz al (fallback)
            const scoreDate = m.skorTarihi ? m.skorTarihi.toDate() : (m.macZamani ? m.macZamani.toDate() : m.tarih.toDate());

            if ((now - scoreDate) > FIVE_DAYS_MS) {
                console.log(`Otomatik Onay: ${matchId}`);
                
                // --- finalizeMatch mantığının kopyası (UI bağımsız) ---
                const wid = m.adayKazananID;
                const lid = m.oyuncu1ID === wid ? m.oyuncu2ID : m.oyuncu1ID;
                
                let wg = 0, lg = 0;
                if(m.skor) {
                    const s = m.skor;
                    // Skoru giren kişi kazanan mıydı kontrol et
                    const isEntryByWinner = m.sonucuGirenID === wid;
                    
                    // Setleri topla
                    const s1w = isEntryByWinner ? parseInt(s.s1_me) : parseInt(s.s1_opp);
                    const s1l = isEntryByWinner ? parseInt(s.s1_opp) : parseInt(s.s1_me);
                    const s2w = isEntryByWinner ? parseInt(s.s2_me) : parseInt(s.s2_opp);
                    const s2l = isEntryByWinner ? parseInt(s.s2_opp) : parseInt(s.s2_me);
                    wg = s1w + s2w; 
                    lg = s1l + s2l;
                }

                const bonusW = wg * 5; 
                const bonusL = lg * 5;

                // Puanları Dağıt
                if(m.macTipi === 'Meydan Okuma') {
                    batch.update(db.collection('users').doc(wid), { 
                        toplamPuan: firebase.firestore.FieldValue.increment(m.bahisPuani + bonusW),
                        galibiyetSayisi: firebase.firestore.FieldValue.increment(1),
                        macSayisi: firebase.firestore.FieldValue.increment(1)
                    });
                    batch.update(db.collection('users').doc(lid), { 
                        toplamPuan: firebase.firestore.FieldValue.increment(-m.bahisPuani + bonusL),
                        macSayisi: firebase.firestore.FieldValue.increment(1)
                    });
                } else {
                    batch.update(db.collection('users').doc(wid), { 
                        toplamPuan: firebase.firestore.FieldValue.increment(50 + bonusW),
                        galibiyetSayisi: firebase.firestore.FieldValue.increment(1),
                        macSayisi: firebase.firestore.FieldValue.increment(1)
                    });
                    batch.update(db.collection('users').doc(lid), { 
                        toplamPuan: firebase.firestore.FieldValue.increment(50 + bonusL),
                        macSayisi: firebase.firestore.FieldValue.increment(1)
                    });
                }

                // Maç durumunu güncelle
                batch.update(db.collection('matches').doc(matchId), {
                    durum: 'Tamamlandı', 
                    kayitliKazananID: wid,
                    onayTipi: 'Otomatik' // Bilgi amaçlı
                });
                
                // Rozet kontrolünü burada çağıramıyoruz (async karmaşası olmasın diye), 
                // ama bir sonraki girişlerinde zaten sistem kontrol edecektir.
                operationCount++;
            }
        }

        // Tüm işlemleri veritabanına uygula
        if (operationCount > 0) {
            await batch.commit();
            console.log(`${operationCount} adet bakım işlemi uygulandı.`);
        } else {
            console.log("Bakım gerektiren maç bulunamadı.");
        }

    } catch (error) {
        console.error("Lig bakımı sırasında hata:", error);
    }
}

// --- YENİ HESAP SİLME FONKSİYONU ---
async function deleteAccount() {
    // 1. Güvenlik Onayı
    if(!confirm("⚠️ DİKKAT: Hesabınızı silmek üzeresiniz!\n\nBu işlem geri alınamaz. Tüm maç geçmişiniz, puanlarınız ve fotoğraflarınız silinecektir.\n\nDevam etmek istiyor musunuz?")) return;
    
    // 2. İkinci Onay (Yanlışlıkla basmaları önlemek için)
    const verification = prompt("Silme işlemini onaylamak için lütfen aşağıya 'SİL' yazın:");
    if (verification !== 'SİL') {
        alert("İşlem iptal edildi. Doğru kelimeyi girmediniz.");
        return;
    }

    const user = auth.currentUser;
    const uid = user.uid;
    const btn = document.getElementById('btn-delete-account');
    
    try {
        btn.disabled = true;
        btn.textContent = "Siliniyor...";

        // A) Firestore'dan Kullanıcı Verisini Sil
        await db.collection('users').doc(uid).delete();

        // B) Firebase Authentication'dan Kullanıcıyı Sil
        // Not: Eğer kullanıcı uzun süredir giriş yapmadıysa Firebase güvenlik gereği
        // yeniden giriş yapmasını isteyebilir. Bu durumda catch bloğu çalışır.
        await user.delete();

        alert("Hesabınız başarıyla silindi. Sizi özleyeceğiz! 👋");
        window.location.reload(); // Giriş ekranına atar

    } catch (error) {
        console.error("Hesap silme hatası:", error);
        
        if (error.code === 'auth/requires-recent-login') {
            alert("Güvenlik gereği, hesabınızı silmek için oturumunuzu tazelemeniz gerekiyor. Lütfen Çıkış Yapıp tekrar giriş yapın ve tekrar deneyin.");
        } else {
            alert("Bir hata oluştu: " + error.message);
        }
        
        btn.disabled = false;
        btn.textContent = "Hesabımı Kalıcı Olarak Sil";
    }
}

// Listener'ı Tanımla (app.js'in alt kısmındaki listener bloklarına ekleyin)
const btnDeleteAccount = document.getElementById('btn-delete-account');
if(btnDeleteAccount) {
    btnDeleteAccount.addEventListener('click', deleteAccount);
}
// Spam Uyarısı Yönetimi
function initSpamWarning() {
    const alertBox = document.getElementById('email-spam-alert');
    const closeBtn = document.getElementById('btn-close-spam-alert');
    
    // LocalStorage kontrolü: Kullanıcı daha önce kapattı mı?
    const isDismissed = localStorage.getItem('tenisLigi_spamAlertDismissed');

    if (!isDismissed && alertBox) {
        alertBox.style.display = 'flex'; // Kartı göster
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            // Karta tıklanınca gizle
            alertBox.style.display = 'none';
            // Tarayıcı hafızasına "kapattı" diye not al
            localStorage.setItem('tenisLigi_spamAlertDismissed', 'true');
        });
    }
}

// Bu fonksiyonu uygulama başlarken çalıştırın.
// auth.onAuthStateChanged bloğunun içine, "setupNotifications" çağrısının altına ekleyebilirsiniz.
// Örnek:
/*
    fetchUserMap().then(() => { 
        loadLeaderboard(); 
        // ... diğer yüklemeler ...
        setupNotifications(user.uid); 
        runLeagueMaintenance();
        
        initSpamWarning(); // <--- BURAYA EKLEYİN
    });
*/

// Sıralama Filtresi Değişince
    const leaderboardFilter = document.getElementById('leaderboard-club-filter');
    if (leaderboardFilter) {
        leaderboardFilter.addEventListener('change', (e) => {
            loadLeaderboard(e.target.value);
        });
    }

});
