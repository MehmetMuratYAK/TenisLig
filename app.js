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
        "Gd Academy Bursa", "Uni+ Sport Club Tenis Kortları", "Aslanlar Tenis Akademisi"
    ];

    // --- DEĞİŞKENLER ---
    let userMap = {}; 
    let currentMatchDocId = null; 
    let isLoginMode = true; 
    let listeners = [];
    let isReadOnlyView = false;
    let currentChatId = null;
    let currentChatUnsubscribe = null;
    let returnToTab = null; 

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

    const matchDetailView = document.getElementById('match-detail-view');
    const detailMatchInfo = document.getElementById('detail-match-info');
    const winnerSelect = document.getElementById('winner-select');
    const backToListBtn = document.getElementById('back-to-list-btn');
    const scoreInputSection = document.getElementById('score-input-section');
    const scoreDisplaySection = document.getElementById('score-display-section');
    const actionButtonsContainer = document.getElementById('action-buttons-container');
    const scheduleInputSection = document.getElementById('schedule-input-section');
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
    
    // --- YENİ İSTATİSTİK DOM ELEMENTLERİ ---
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
    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
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
            await db.collection('chats').doc(currentChatId).collection('messages').add({
                text: text, senderId: auth.currentUser.uid, timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            await db.collection('chats').doc(currentChatId).set({
                lastMessage: text,
                lastMessageSenderId: auth.currentUser.uid,
                lastMessageTime: firebase.firestore.FieldValue.serverTimestamp(),
                participants: currentChatId.split('_'),
                deletedBy: [] 
            }, { merge: true });

            chatInput.value = '';
        } catch (error) { console.error("Hata:", error); alert("Mesaj gönderilemedi."); }
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
            
            // Stats dropdown temizliği ve tekrar doldurulması
            if (statsViewPlayerSelect) {
                 while(statsViewPlayerSelect.options.length > 1) {
                    statsViewPlayerSelect.remove(1);
                 }
            }

            snapshot.forEach(doc => {
                const player = doc.data();
                userMap[doc.id] = { 
                    isim: player.isim || player.email, email: player.email, uid: doc.id,
                    toplamPuan: player.toplamPuan, kortTercihi: player.kortTercihi, telefon: player.telefon,
                    fotoURL: player.fotoURL, bildirimTercihi: player.bildirimTercihi || 'ses',
                    macSayisi: player.macSayisi || 0, galibiyetSayisi: player.galibiyetSayisi || 0
                };
                if (filterPlayer) {
                    const option = document.createElement('option'); option.value = doc.id; option.textContent = player.isim || player.email; filterPlayer.appendChild(option);
                }
                
                // İstatistik Dropdown'ını doldur (Kendisi hariç)
                if (statsViewPlayerSelect && doc.id !== auth.currentUser?.uid) {
                    const opt = document.createElement('option');
                    opt.value = doc.id;
                    opt.textContent = player.isim || player.email;
                    statsViewPlayerSelect.appendChild(opt);
                }
            });
        });
    }

    function loadLeaderboard() {
        db.collection('users').orderBy('toplamPuan', 'desc').limit(500).get().then(snapshot => {
            if(leaderboardDiv) leaderboardDiv.innerHTML = '';
            let rank = 1;
            snapshot.forEach(doc => {
                const player = doc.data();
                const kort = player.kortTercihi || 'Bilinmiyor';
                const photoHTML = player.fotoURL ? `<img src="${player.fotoURL}" class="profile-img-small" style="width:40px; height:40px; border-radius:50%; margin-right:10px; object-fit:cover;">` : '';
                const played = player.macSayisi || 0;
                const won = player.galibiyetSayisi || 0;
                const winRate = played > 0 ? Math.round((won / played) * 100) : 0;
                
                const playerCard = document.createElement('div');
                playerCard.className = 'player-card';
                // Sıralamada karta basınca yine modal açılabilir, hızlı önizleme için
                playerCard.onclick = () => showPlayerStats(doc.id); 
                
                playerCard.innerHTML = `
                    <div style="width:100%;">
                        <div style="display:flex; align-items:center;">
                            <span style="font-weight:bold; min-width:35px; display:inline-block;">#${rank}</span>
                            ${photoHTML}
                            <div style="flex-grow:1;">
                                <div style="font-weight:bold;">${player.isim || player.email}</div>
                                <div style="font-size:0.85em; color:#666;">${player.toplamPuan} Puan</div>
                            </div>
                            <div class="pie-chart" style="--p:${winRate}"><span>%${winRate}</span></div>
                        </div>
                        <div style="font-size:0.8em; color:#888; margin-top:5px; padding-left:45px;">
                            ${kort}
                        </div>
                    </div>
                `;
                leaderboardDiv.appendChild(playerCard);
                rank++;
            });
        }).catch(err => console.log("Sıralama hatası:", err));
    }

    // --- ORTAK İSTATİSTİK HESAPLAMA MOTORU ---
    // Bu fonksiyon verilen maç listesine göre en'leri hesaplar.
    function analyzeStats(matches) {
        let playerStats = {}; 
        let courtStats = {};

        // Kullanıcıları başlat
        Object.keys(userMap).forEach(uid => {
            playerStats[uid] = { 
                id: uid, 
                name: userMap[uid].isim, 
                points: 0, // Bu maç listesi içindeki performans puanı (Basitçe galibiyet sayısı gibi düşünülebilir veya userMap'ten çekilmez çünkü aylık hesapta sıfırlanmalı)
                wins: 0, 
                matches: 0, 
                setsPlayed: 0, 
                tieBreakWins: 0,
                history: [] 
            };
        });

        matches.forEach(m => {
            // Kort İstatistiği
            if (m.macYeri) {
                courtStats[m.macYeri] = (courtStats[m.macYeri] || 0) + 1;
            }

            // Oyuncu İstatistikleri
            const p1 = m.oyuncu1ID;
            const p2 = m.oyuncu2ID;
            const winner = m.kayitliKazananID;
            let time = m.macZamani ? m.macZamani.seconds : (m.tarih ? m.tarih.seconds : 0);

            [p1, p2].forEach(pid => {
                if (playerStats[pid]) {
                    playerStats[pid].matches++;
                    if (pid === winner) {
                        playerStats[pid].wins++;
                        // Aylık hesaplamada "Puan" yerine Galibiyet sayısı baz alınır, çünkü puan kümülatiftir.
                    }
                    playerStats[pid].history.push({ time: time, win: (pid === winner) });
                }
            });

            // Set ve Tie-Break Analizi
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

        // En'leri Bul
        let maxWins = { val: 0, p: null };
        let maxMatches = { val: 0, p: null };
        let maxSets = { val: 0, p: null };
        let maxTB = { val: 0, p: null };
        let maxStreak = { val: 0, p: null };

        // Puan Lideri: Eğer 'Tüm Zamanlar' ise userMap'teki toplam puan. Eğer aylıksa o ayki galibiyet sayısı.
        // Ancak 'En'ler' ekranında genellikle 'Ligin Efsanesi' toplam puandır.
        // Biz burada generic bir obje dönüyoruz.
        let maxPointsTotal = { val: -99999, p: null };

        // Tüm zamanlar puan liderini userMap'ten bulalım (Aylık filtrede kullanılmaz genelde ama dursun)
        Object.values(userMap).forEach(u => {
            if(u.toplamPuan > maxPointsTotal.val) maxPointsTotal = { val: u.toplamPuan, p: u.isim };
        });

        Object.values(playerStats).forEach(p => {
            if (p.wins > maxWins.val) maxWins = { val: p.wins, p: p.name };
            if (p.matches > maxMatches.val) maxMatches = { val: p.matches, p: p.name };
            if (p.setsPlayed > maxSets.val) maxSets = { val: p.setsPlayed, p: p.name };
            if (p.tieBreakWins > maxTB.val) maxTB = { val: p.tieBreakWins, p: p.name };

            // Seri Hesaplama
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

    // --- YENİ EN'LER (THE BESTS) FONKSİYONU ---
    async function loadTheBests(filterType = 'all') {
        if (!bestsContainer) return;
        bestsContainer.innerHTML = '<p style="width:100%; text-align:center; color:#777;">Veriler analiz ediliyor... 📊</p>';

        try {
            const snapshot = await db.collection('matches').where('durum', '==', 'Tamamlandı').get();
            let matches = [];
            snapshot.forEach(doc => matches.push(doc.data()));

            // Filtreleme
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

            // Eğer filtre "Bu Ay" ise, "Ligin Efsanesi" (Toplam Puan) mantıklı değildir, 
            // bunun yerine o ay en çok kazanan gösterilebilir veya gizlenebilir.
            // Ancak UI bütünlüğü için "Ligin Efsanesi"ni "Ayın Oyuncusu" (En çok kazanan) olarak değiştirelim.
            
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

    function loadOpponents() {
        if(!opponentSelect) return;
        opponentSelect.innerHTML = '<option value="">Rakip Seçin</option>';
        const currentUserID = auth.currentUser.uid;
        db.collection('users').get().then(snapshot => {
            snapshot.forEach(doc => {
                if (doc.id !== currentUserID) { 
                    const player = doc.data();
                    const option = document.createElement('option'); option.value = doc.id; option.textContent = `${player.isim || player.email}`; opponentSelect.appendChild(option);
                }
            });
        });
    }

    function generateAdvancedAIComment(matchData, p1Name, p2Name) {
        const type = matchData.durum;
        const wager = matchData.bahisPuani || 0;
        const score = matchData.skor || {};
        const winnerId = matchData.kayitliKazananID;
        
        let winnerName = "Biri";
        let loserName = "Diğeri";
        if (winnerId) {
            winnerName = (winnerId === matchData.oyuncu1ID) ? p1Name : p2Name;
            loserName = (winnerId === matchData.oyuncu1ID) ? p2Name : p1Name;
        }

        const comments = {
            'Acik_Ilan': [`📢 <strong>${p1Name}</strong> kortlara meydan okuyor!`, `👀 <strong>${p1Name}</strong> dişli bir rakip arıyor.`, `🎾 Raketler konuşsun! <strong>${p1Name}</strong> partner arıyor.`],
            'Acik_Ilan_HighWager': [`💰 <strong>${p1Name}</strong> masaya büyük koydu! <strong>${wager} Puan</strong>`, `🔥 Ligde bahisler yükseliyor!`],
            'Bekliyor': [`⚔️ <strong>${p1Name}</strong>, <strong>${p2Name}</strong> kişisine meydan okudu!`, `📩 <strong>${p2Name}</strong>'in telefonuna bildirim düştü.`],
            'Hazır': [`🤝 Ve anlaşma sağlandı! <strong>${p1Name}</strong> ile <strong>${p2Name}</strong> maçı kesinleşti.`, `📅 Randevu deftere yazıldı.`],
            'Sonuç_Bekleniyor': [`📝 Maç bitti, skor onayı bekleniyor...`, `⏳ Nefesler tutuldu, maç sonucu sisteme girildi.`],
            'Tamamlandı_Generic': [`🏆 Kazanan: <strong>${winnerName}</strong>!`, `✨ <strong>${winnerName}</strong> günü galibiyetle kapattı.`],
            'Tamamlandı_Crushing': [`😱 Aman Allah'ım! <strong>${winnerName}</strong> rakibine kortu dar etti!`, `🌪️ Kortta fırtına vardı: <strong>${winnerName}</strong>!`],
            'Tamamlandı_Tight': [`🥵 Ne maçtı ama! <strong>${winnerName}</strong> zor da olsa kazandı.`, `⚖️ Gitti geldi, sonunda <strong>${winnerName}</strong> güldü.`]
        };

        let selectedCategory = [];
        if (type === 'Acik_Ilan') selectedCategory = (wager >= 500) ? comments['Acik_Ilan_HighWager'] : comments['Acik_Ilan'];
        else if (type === 'Bekliyor') selectedCategory = comments['Bekliyor'];
        else if (type === 'Hazır') selectedCategory = comments['Hazır'];
        else if (type === 'Sonuç_Bekleniyor') selectedCategory = comments['Sonuç_Bekleniyor'];
        else if (type === 'Tamamlandı') {
            const s3 = (score.s3_me && score.s3_opp) ? 1 : 0;
            const isCrushing = [score.s1_me, score.s1_opp, score.s2_me, score.s2_opp].some(val => val == 0 || val == 1);
            if (s3) selectedCategory = comments['Tamamlandı_Tight'];
            else if (isCrushing) selectedCategory = comments['Tamamlandı_Crushing'];
            else selectedCategory = comments['Tamamlandı_Generic'];
        }

        if (!selectedCategory || selectedCategory.length === 0) return `🎾 <strong>${p1Name}</strong> vs <strong>${p2Name}</strong>`;
        const randomIndex = Math.floor(Math.random() * selectedCategory.length);
        return selectedCategory[randomIndex];
    }

    async function loadAnnouncements() {
        if(!announcementsContainer) return;
        announcementsContainer.innerHTML = `<p style="text-align:center; color:#999; font-style:italic;">🤖 Veriler analiz ediliyor...</p>`;
        
        try {
            // 1. Önce Geçen Ayın En'lerini Hesapla ve Ekle
            const now = new Date();
            const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
            
            // Verimlilik için sadece tarih filtresi yapmadan tamamlananları çekip JS'de filtreliyoruz (Basitlik)
            const snapAll = await db.collection('matches').where('durum', '==', 'Tamamlandı').get();
            let prevMonthMatches = [];
            snapAll.forEach(doc => {
                const d = doc.data();
                const date = d.macZamani ? d.macZamani.toDate() : (d.tarih ? d.tarih.toDate() : null);
                if (date && date >= startOfPrevMonth && date <= endOfPrevMonth) {
                    prevMonthMatches.push(d);
                }
            });

            let prevMonthHTML = '';
            if (prevMonthMatches.length > 0) {
                const stats = analyzeStats(prevMonthMatches);
                const monthName = startOfPrevMonth.toLocaleString('tr-TR', { month: 'long' });
                
                if (stats.maxWins.p) {
                    prevMonthHTML = `
                        <div class="lobby-card" style="background: linear-gradient(135deg, #ffd700 0%, #fffbe0 100%); border-left: 4px solid #ffc107; margin-bottom:10px;">
                            <h4 style="color:#b78900; margin-bottom:5px;">🏆 Geçen Ayın En'leri (${monthName})</h4>
                            <div style="font-size:0.9em; color:#555;">
                                👑 <strong>${stats.maxWins.p}</strong> (${stats.maxWins.val} Galibiyet)<br>
                                🔥 <strong>${stats.maxStreak.p}</strong> (${stats.maxStreak.val} Seri)<br>
                                🏃 <strong>${stats.maxMatches.p}</strong> (${stats.maxMatches.val} Maç)
                            </div>
                        </div>
                    `;
                }
            } else {
                // Geçen ay maç yoksa boş döndür
                prevMonthHTML = '';
            }

            // 2. Normal Haber Akışını Çek
            const snapshot = await db.collection('matches').orderBy('tarih', 'desc').limit(15).get();
            
            announcementsContainer.innerHTML = prevMonthHTML; // Önce özel kartı ekle
            
            let hasNews = false;
            snapshot.forEach(doc => {
                hasNews = true;
                const m = doc.data();
                const p1 = userMap[m.oyuncu1ID]?.isim || 'Gizli Oyuncu';
                const p2 = m.oyuncu2ID ? (userMap[m.oyuncu2ID]?.isim || 'Rakip') : '???';
                const comment = generateAdvancedAIComment(m, p1, p2);
                let icon = '🎾';
                if (m.durum === 'Acik_Ilan') icon = '📢';
                else if (m.durum === 'Tamamlandı') icon = '🏆';

                let dateStr = '';
                if (m.tarih) {
                    const d = m.tarih.toDate();
                    dateStr = d.toLocaleDateString('tr-TR');
                }
                const item = document.createElement('div');
                item.style.cssText = 'padding:12px; border-bottom:1px solid #eee; font-size:0.95em; line-height:1.5; animation: fadeIn 0.5s;';
                item.innerHTML = `<div style="margin-bottom:4px; display:flex; justify-content:space-between; align-items:center;"><span style="font-size:1.2em;">${icon}</span><span style="font-size:0.75em; color:#bbb;">${dateStr}</span></div><div style="color:#444;">${comment}</div>`;
                
                const btnDiv = document.createElement('div'); btnDiv.style.marginTop = '8px';
                const detailBtn = document.createElement('button'); detailBtn.textContent = 'İncele 🔍';
                detailBtn.className = 'btn-chat-small'; detailBtn.style.cssText = 'padding: 5px 12px; font-size: 0.8em; width: auto; margin:0; background-color: #6c757d; border:none; border-radius:15px;';
                detailBtn.onclick = function() { returnToTab = 'tab-lobby'; showMatchDetail(doc.id); };
                btnDiv.appendChild(detailBtn); item.appendChild(btnDiv);
                announcementsContainer.appendChild(item);
            });
            
            if(!hasNews && prevMonthHTML === '') announcementsContainer.innerHTML = '<p style="text-align:center; color:#777;">Henüz dedikodu yok.</p>';

        } catch (error) {
            console.error("Duyuru hatası:", error);
            announcementsContainer.innerHTML = '<p style="text-align:center; color:red;">Haberler yüklenemedi.</p>';
        }
    }

    function loadOpenRequests() {
        if(!openRequestsContainer) return;
        openRequestsContainer.innerHTML = '<p style="text-align:center;">Yükleniyor...</p>';
        const currentUserID = auth.currentUser.uid;
        db.collection('matches').where('durum', '==', 'Acik_Ilan').orderBy('tarih', 'desc').get().then(snapshot => {
              openRequestsContainer.innerHTML = '';
              let hasRequest = false;
              snapshot.forEach(doc => {
                  const data = doc.data();
                  if(data.oyuncu1ID === currentUserID) return;
                  hasRequest = true;
                  const p1 = userMap[data.oyuncu1ID];
                  const p1Name = p1?.isim || 'Bilinmiyor';
                  const kort = p1?.kortTercihi || '-';
                  const tarih = data.tarih ? data.tarih.toDate().toLocaleDateString('tr-TR') : '';
                  const card = document.createElement('div');
                  card.className = 'open-request-card';
                  card.style.cssText = 'background:#fff; border:1px solid #28a745; border-radius:10px; padding:15px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 2px 5px rgba(0,0,0,0.05);';
                  let wagerInfo = data.macTipi === 'Meydan Okuma' ? `<span style="color:#d63384; font-weight:bold;">${data.bahisPuani} Puan</span>` : '<span style="color:#28a745; font-weight:bold;">Dostluk</span>';
                  card.innerHTML = `<div><div style="font-weight:bold; font-size:1.1em;">${p1Name}</div><div style="font-size:0.9em; color:#555;">${wagerInfo} | ${kort}</div><div style="font-size:0.8em; color:#999;">${tarih}</div></div><button class="btn-accept-request" data-id="${doc.id}" style="width:auto; padding:8px 15px; font-size:0.9em; background-color:#28a745; color:white; border:none; border-radius:5px;">Kabul Et</button>`;
                  card.querySelector('.btn-accept-request').onclick = () => acceptOpenRequest(doc.id, data.bahisPuani, data.macTipi);
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
                  card.innerHTML = `${dateBadge}<div style="flex-grow:1;"><div style="font-weight:600; font-size:0.95em; color:#333;">${p1Name} <span style="color:#999; font-weight:normal;">vs</span> ${p2Name}</div><div style="font-size:0.85em; color:#666; margin-top:2px;">📍 ${kort} | ${timeStr}</div></div>`;
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

    // --- YENİLENMİŞ MAÇ YÜKLEME SİSTEMİ (MAÇLARIM) ---
    function loadMyMatchesOverview() {
        if(!myActiveMatchesContainer || !myPendingMatchesContainer || !myHistoryMatchesContainer) return;

        myActiveMatchesContainer.innerHTML = '<p style="text-align:center;">Yükleniyor...</p>';
        myPendingMatchesContainer.innerHTML = '<p style="text-align:center;">Yükleniyor...</p>';
        myHistoryMatchesContainer.innerHTML = '<p style="text-align:center;">Yükleniyor...</p>';

        const currentUserID = auth.currentUser.uid;
        const q1 = db.collection('matches').where('oyuncu1ID', '==', currentUserID).get();
        const q2 = db.collection('matches').where('oyuncu2ID', '==', currentUserID).get();

        // Geçmiş filtresi için kort listesini doldur
        if (histFilterCourt && histFilterCourt.options.length === 1) {
            COURT_LIST.forEach(c => { 
                const opt = document.createElement('option'); opt.value = c; opt.textContent = c; 
                histFilterCourt.appendChild(opt); 
            });
        }

        Promise.all([q1, q2]).then(snapshots => {
            let allMatches = [];
            snapshots.forEach(snap => {
                snap.forEach(doc => allMatches.push({ ...doc.data(), id: doc.id }));
            });

            // Tekrarları temizle
            allMatches = allMatches.filter((match, index, self) =>
                index === self.findIndex((t) => (t.id === match.id))
            );

            // Tarihe göre sırala
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
            // Geçmiş için ilk 10 taneyi gösterelim, filtre ile hepsi taranır
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
                planInfo = `<div class="match-plan-info">📅 ${d} - ${match.macYeri}</div>`;
            }

            // Skor Gösterimi
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

        // Basitlik için tüm geçmişi çekip JS ile filtreliyoruz
        const q1 = db.collection('matches').where('oyuncu1ID', '==', currentUserID).where('durum', '==', 'Tamamlandı').get();
        const q2 = db.collection('matches').where('oyuncu2ID', '==', currentUserID).where('durum', '==', 'Tamamlandı').get();

        Promise.all([q1, q2]).then(snapshots => {
            let matches = [];
            snapshots.forEach(snap => snap.forEach(doc => matches.push({ ...doc.data(), id: doc.id })));
            
            // Tarih sıralaması
            matches.sort((a, b) => (b.tarih ? b.tarih.seconds : 0) - (a.tarih ? a.tarih.seconds : 0));

            const filtered = matches.filter(m => {
                const mDate = m.macZamani ? m.macZamani.toDate() : (m.tarih ? m.tarih.toDate() : null);
                if (start && (!mDate || mDate < start)) return false;
                if (end) {
                    const e = new Date(end); e.setHours(23,59,59);
                    if (!mDate || mDate > e) return false;
                }
                if (court && m.macYeri !== court) return false;
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

    // --- FİKSTÜR YÜKLEME FONKSİYONU ---
    function loadMatchesForFixture() {
        isReadOnlyView = true;
        
        // Containerları Temizle
        if(fixtureActiveContainer) fixtureActiveContainer.innerHTML = '<p style="text-align:center;">Yükleniyor...</p>';
        if(fixturePendingContainer) fixturePendingContainer.innerHTML = '<p style="text-align:center;">Yükleniyor...</p>';
        if(fixtureHistoryContainer) fixtureHistoryContainer.innerHTML = '<p style="text-align:center;">Yükleniyor...</p>';

        // Kort filtresi dolumu
        if (filterCourt && filterCourt.options.length === 1) {
            COURT_LIST.forEach(c => { 
                const opt = document.createElement('option'); opt.value = c; opt.textContent = c; 
                filterCourt.appendChild(opt); 
            });
        }

        // --- 1. SORGULA: AKTİF VE BEKLEYEN (FİLTRESİZ) ---
        // 'Bekliyor', 'Hazır', 'Sonuç_Bekleniyor' olanları çek
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

            // Sıralama
            const sortFn = (a, b) => { 
                const dateA = a.macZamani ? a.macZamani.seconds : (a.tarih ? a.tarih.seconds : 0); 
                const dateB = b.macZamani ? b.macZamani.seconds : (b.tarih ? b.tarih.seconds : 0); 
                return dateB - dateA; 
            };
            activeMatches.sort(sortFn);
            pendingMatches.sort(sortFn);

            // Render
            renderFixtureSection(activeMatches, fixtureActiveContainer);
            renderFixtureSection(pendingMatches, fixturePendingContainer);
        });

        // --- 2. SORGULA: TAMAMLANAN (FİLTRELİ) ---
        db.collection('matches').where('durum', '==', 'Tamamlandı').get().then(snapshot => {
            let historyMatches = [];
            
            const fStart = filterDateStart.value ? new Date(filterDateStart.value) : null;
            const fEnd = filterDateEnd.value ? new Date(filterDateEnd.value) : null;
            const fCourt = filterCourt.value;
            const fPlayer = filterPlayer.value;

            snapshot.forEach(doc => {
                const match = doc.data();
                
                // --- FİLTRELEME MANTIĞI (Sadece Geçmiş İçin) ---
                if (fStart || fEnd) {
                    const d = match.macZamani ? match.macZamani.toDate() : (match.tarih ? match.tarih.toDate() : null);
                    if (!d) return; 
                    if (fStart) { fStart.setHours(0,0,0,0); if (d < fStart) return; }
                    if (fEnd) { fEnd.setHours(23,59,59,999); if (d > fEnd) return; }
                }
                if (fCourt && match.macYeri !== fCourt) return;
                if (fPlayer && match.oyuncu1ID !== fPlayer && match.oyuncu2ID !== fPlayer) return;

                historyMatches.push({ ...match, id: doc.id });
            });

            // Sıralama
            historyMatches.sort((a, b) => { 
                const dateA = a.macZamani ? a.macZamani.seconds : (a.tarih ? a.tarih.seconds : 0); 
                const dateB = b.macZamani ? b.macZamani.seconds : (b.tarih ? b.tarih.seconds : 0); 
                return dateB - dateA; 
            });

            renderFixtureSection(historyMatches, fixtureHistoryContainer);
        });
    }

    // Fikstür Kartlarını Oluşturan Yardımcı Fonksiyon
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
            
            // Tarih Rozeti
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

            // Durum Rengi
            let statusColor = '#666';
            let statusText = match.durum;
            if(match.durum === 'Hazır') { statusText = 'Oynanıyor / Hazır'; statusColor = '#28a745'; }
            else if(match.durum === 'Bekliyor') { statusText = 'Yanıt Bekliyor'; statusColor = '#ffc107'; }
            else if(match.durum === 'Tamamlandı') { statusText = 'Tamamlandı'; statusColor = '#6c757d'; }
            else if(match.durum === 'Sonuç_Bekleniyor') { statusText = 'Sonuç Onayı'; statusColor = '#17a2b8'; }

            // Skor HTML
            let scoreHTML = '';
            if(match.durum === 'Tamamlandı' && match.skor) {
                const s = match.skor;
                let s3Txt = (s.s3_me || s.s3_opp) ? `, ${s.s3_me}-${s.s3_opp}` : '';
                scoreHTML = `<div style="margin-top:5px; font-size:0.85em; color:#333; font-weight:bold; background:#f8f9fa; padding:2px 5px; border-radius:4px; display:inline-block;">
                                🏁 ${s.s1_me}-${s.s1_opp}, ${s.s2_me}-${s.s2_opp}${s3Txt}
                             </div>`;
            }

            const courtInfo = match.macYeri ? `<div style="font-size:0.85em; color:#555; margin-top:2px;">📍 ${match.macYeri}</div>` : '';

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

    // --- YENİ GELİŞMİŞ İSTATİSTİK HESAPLAMA SİSTEMİ ---
    async function calculateAdvancedStats(userId) {
        const q1 = db.collection('matches').where('oyuncu1ID', '==', userId).where('durum', '==', 'Tamamlandı').get();
        const q2 = db.collection('matches').where('oyuncu2ID', '==', userId).where('durum', '==', 'Tamamlandı').get();
        const [s1, s2] = await Promise.all([q1, q2]);
        
        let allMatches = []; 
        s1.forEach(d => allMatches.push({ ...d.data(), id: d.id })); 
        s2.forEach(d => allMatches.push({ ...d.data(), id: d.id }));
        
        // Tarihe göre sırala (Form durumu için)
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

            // Form (W/L) - Son 5 maç
            if(stats.form.length < 5) stats.form.push(isWinner ? 'W' : 'L');

            // Kort Tipi Analizi
            let surface = 'other';
            const venue = (m.macYeri || '').toLowerCase();
            if(venue.includes('meşeli') || venue.includes('podyum') || venue.includes('toprak')) surface = 'clay';
            else if(venue.includes('sert') || venue.includes('esas') || venue.includes('hard') || venue.includes('akademi')) surface = 'hard';
            else if(venue.includes('çim') || venue.includes('grass')) surface = 'grass';
            
            if(surface !== 'other') {
                stats[surface].played++;
                if(isWinner) stats[surface].won++;
            }

            // Set ve Oyun İstatistikleri
            if (m.skor) {
                const s = m.skor; 
                // Skoru veritabanına kaydeden kişiye göre (sonucuGirenID) bizim skorları ayırt et
                const isMyInput = (m.sonucuGirenID === userId);
                
                const sets = [
                    {p1: s.s1_me, p2: s.s1_opp}, 
                    {p1: s.s2_me, p2: s.s2_opp}, 
                    {p1: s.s3_me, p2: s.s3_opp, tb: true}
                ];

                sets.forEach(set => {
                    // Eğer sonucu giren bizsek p1 bizim, p2 rakibin. Değilse tam tersi.
                    // Fakat buradaki mantık daha basit: maçın oyuncuları içinde hangisiyiz?
                    // Firebase skor yapısında sX_me her zaman sonucu girene aittir.
                    // Bu yüzden şu kontrolü yapıyoruz:
                    let myG, opG;
                    
                    if (m.sonucuGirenID === userId) {
                        myG = parseInt(set.p1 || 0);
                        opG = parseInt(set.p2 || 0);
                    } else {
                        // Sonucu rakip girdiyse, 'me' rakip, 'opp' biziz.
                        myG = parseInt(set.p2 || 0);
                        opG = parseInt(set.p1 || 0);
                    }
                    
                    if(myG + opG > 0) {
                        stats.setsPlayed++;
                        if(myG > opG) stats.setsWon++;
                        
                        if(!set.tb) { // Tie-break dışındaki oyunları say
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
        
        // UI Temizle / Yükleniyor
        statFormBadges.innerHTML = '...';
        
        const user = userMap[targetUserId];
        const stats = await calculateAdvancedStats(targetUserId);

        // Özet Kartlar
        statTotalMatch.textContent = stats.played;
        statTotalWin.textContent = stats.won;
        statTotalPointsDisplay.textContent = user ? user.toplamPuan : 0;

        // Dairesel Grafikler (CSS Variables Update)
        const winRate = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;
        const setRate = stats.setsPlayed > 0 ? Math.round((stats.setsWon / stats.setsPlayed) * 100) : 0;
        const gameRate = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;

        updateCircleChart(chartWinRate, winRate);
        updateCircleChart(chartSetRate, setRate);
        updateCircleChart(chartGameRate, gameRate);

        // Bar Grafikler (Kort Performansı)
        updateBarChart(barClay, valClay, stats.clay);
        updateBarChart(barHard, valHard, stats.hard);
        updateBarChart(barGrass, valGrass, stats.grass);

        // Form Rozetleri
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
            const val = e.target.value;
            updateStatsView(val === 'me' ? auth.currentUser.uid : val);
        });
    }

    // --- ESKİ MODAL İSTATİSTİK GÖSTERİMİ (Korundu) ---
    async function showPlayerStats(userId) {
        try {
            const u = userMap[userId]; if(!u) return;
            statsPlayerName.textContent = u.isim; statsTotalPoints.textContent = u.toplamPuan; statsCourtPref.textContent = u.kortTercihi || '-';
            if(statsPlayerPhoto) statsPlayerPhoto.src = u.fotoURL || 'https://via.placeholder.com/120';
            if(startChatBtn) {
                if (userId === auth.currentUser.uid) { startChatBtn.style.display = 'none'; } 
                else { startChatBtn.style.display = 'block'; startChatBtn.onclick = () => openChat(userId, u.isim); }
            }
            playerStatsModal.style.display = 'flex'; 
            
            // Modal için de yeni gelişmiş hesaplamayı kullan
            const stats = await calculateAdvancedStats(userId);
            const matchRate = stats.played > 0 ? ((stats.won / stats.played) * 100).toFixed(0) : 0;
            const setRate = stats.setsPlayed > 0 ? ((stats.setsWon / stats.setsPlayed) * 100).toFixed(0) : 0;
            const gameRate = stats.gamesPlayed > 0 ? ((stats.gamesWon / stats.gamesPlayed) * 100).toFixed(0) : 0;
            
            document.getElementById('pie-match-chart').style.setProperty('--p', matchRate); document.getElementById('text-match-rate').textContent = `%${matchRate}`;
            document.getElementById('pie-set-chart').style.setProperty('--p', setRate); document.getElementById('text-set-rate').textContent = `%${setRate}`;
            document.getElementById('pie-game-chart').style.setProperty('--p', gameRate); document.getElementById('text-game-rate').textContent = `%${gameRate}`;
            
            const h2hBox = document.getElementById('stats-h2h-box');
            if (userId !== auth.currentUser.uid) {
                // H2H hesaplaması modalda kalabilir
                h2hBox.style.display = 'block'; h2hBox.innerHTML = 'Aramızdaki Maçlar Yükleniyor...';
                // H2H fonksiyonu basitçe burada inline hesaplanabilir veya eski fonksiyon kullanılabilir.
                // Veri tutarlılığı için basit bir sorgu:
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
        } catch (error) { console.error("İstatistik hatası:", error); document.getElementById('stats-form-badges').innerHTML = '<span style="color:red; font-size:0.8em;">Veri alınamadı</span>'; }
    }

    function showMatchDetail(matchDocId) {
        tabSections.forEach(s => s.style.display = 'none');
        matchDetailView.style.display = 'block';
        currentMatchDocId = matchDocId;
        const currentUserID = auth.currentUser.uid;
        db.collection('matches').doc(matchDocId).get().then(doc => {
            const match = doc.data();
            const p1Name = userMap[match.oyuncu1ID]?.isim || '???';
            const p2Name = match.oyuncu2ID ? (userMap[match.oyuncu2ID]?.isim || '???') : 'Henüz Yok';
            winnerSelect.innerHTML = `<option value="">Kazananı Seçin</option><option value="${match.oyuncu1ID}">${p1Name}</option>`;
            if(match.oyuncu2ID) winnerSelect.innerHTML += `<option value="${match.oyuncu2ID}">${p2Name}</option>`;
            let infoHTML = `<h3>${match.macTipi}</h3><p><strong>${p1Name}</strong> vs <strong>${p2Name}</strong></p><p>Bahis: ${match.bahisPuani} Puan</p>`;
            if(match.durum === 'Acik_Ilan') infoHTML += `<p style="color:orange; font-weight:bold;">Bu bir açık ilandır.</p>`;
            if(match.macYeri && match.macZamani) {
                const d = match.macZamani.toDate().toLocaleString('tr-TR');
                infoHTML += `<div style="background-color:#e2e6ea; padding:8px; border-radius:5px; margin-top:5px;">📍 <strong>${match.macYeri}</strong><br>⏰ <strong>${d}</strong></div>`;
            }
            detailMatchInfo.innerHTML = infoHTML;
            scoreInputSection.style.display = 'none'; scoreDisplaySection.style.display = 'none'; winnerSelect.style.display = 'none'; scheduleInputSection.style.display = 'none'; actionButtonsContainer.innerHTML = ''; document.getElementById('result-message').textContent = '';
            if (chatFromMatchBtn) {
                if (match.oyuncu2ID && (currentUserID === match.oyuncu1ID || currentUserID === match.oyuncu2ID)) {
                    const opponentId = currentUserID === match.oyuncu1ID ? match.oyuncu2ID : match.oyuncu1ID;
                    const opponentName = userMap[opponentId]?.isim || 'Rakip';
                    chatFromMatchBtn.style.display = 'block'; chatFromMatchBtn.onclick = () => openChat(opponentId, opponentName);
                } else { chatFromMatchBtn.style.display = 'none'; }
            }
            const isParticipant = (currentUserID === match.oyuncu1ID || currentUserID === match.oyuncu2ID);
            if (isReadOnlyView || !isParticipant) {
                if (match.durum === 'Sonuç_Bekleniyor' || match.durum === 'Tamamlandı') {
                    const s = match.skor || {}; scoreDisplaySection.style.display = 'block';
                    let resText = match.durum === 'Tamamlandı' ? `<p style="color:green;">Kazanan: ${userMap[match.kayitliKazananID]?.isim}</p>` : `<p style="color:orange;">Sonuç Onayı Bekleniyor</p>`;
                    scoreDisplaySection.innerHTML = `<div style="background:#f1f1f1; padding:10px; border-radius:5px;"><p><strong>Skor:</strong> ${s.s1_me}-${s.s1_opp}, ${s.s2_me}-${s.s2_opp}, ${s.s3_me}-${s.s3_opp}</p>${resText}</div>`;
                } else { document.getElementById('result-message').textContent = "Bu maç henüz oynanmadı veya sonuç girilmedi."; }
                return;
            }
            if (match.durum === 'Acik_Ilan' && currentUserID === match.oyuncu1ID) {
                const dbn = document.createElement('button'); dbn.textContent='İlanı Kaldır 🗑️'; dbn.className='btn-reject'; dbn.onclick=()=>deleteMatch(matchDocId,"İlan kaldırıldı."); actionButtonsContainer.appendChild(dbn); return;
            }
            if (match.durum === 'Bekliyor' && currentUserID === match.oyuncu2ID) {
                const ab = document.createElement('button'); ab.textContent='Kabul Et'; ab.className='btn-accept'; ab.onclick=()=>updateMatchStatus(matchDocId,'Hazır',"Kabul edildi!");
                const rb = document.createElement('button'); rb.textContent='Reddet'; rb.className='btn-reject'; rb.onclick=()=>deleteMatch(matchDocId,"Reddedildi."); actionButtonsContainer.append(ab, rb);
            } else if (match.durum === 'Bekliyor' && currentUserID === match.oyuncu1ID) {
                const wb = document.createElement('button'); wb.textContent='Geri Çek'; wb.className='btn-withdraw'; wb.onclick=()=>deleteMatch(matchDocId,"Geri çekildi."); actionButtonsContainer.appendChild(wb);
            } else if (match.durum === 'Hazır') {
                scheduleInputSection.style.display = 'block'; matchVenueSelect.innerHTML = '<option value="">Kort Seç</option>';
                COURT_LIST.forEach(c => { const o = document.createElement('option'); o.value=c; o.textContent=c; if(match.macYeri===c) o.selected=true; matchVenueSelect.appendChild(o); });
                if(match.macZamani) { matchTimeInput.value = new Date(match.macZamani.toDate().getTime() - (match.macZamani.toDate().getTimezoneOffset() * 60000)).toISOString().slice(0,16); }
                saveScheduleBtn.onclick = () => saveMatchSchedule(matchDocId);
                scoreInputSection.style.display = 'block'; winnerSelect.style.display = 'block';
                const sb = document.createElement('button'); sb.textContent='Sonucu Gir'; sb.className='btn-save'; sb.onclick=()=>saveMatchResult(matchDocId); actionButtonsContainer.appendChild(sb);
            } else if (match.durum === 'Sonuç_Bekleniyor') {
                const s = match.skor || {}; scoreDisplaySection.style.display = 'block';
                scoreDisplaySection.innerHTML = `<div style="background:#f1f1f1; padding:10px;"><p>${s.s1_me}-${s.s1_opp}, ${s.s2_me}-${s.s2_opp}, ${s.s3_me}-${s.s3_opp}</p><p>Aday Kazanan: ${userMap[match.adayKazananID]?.isim}</p></div>`;
                if (match.sonucuGirenID !== currentUserID) {
                    const apb = document.createElement('button'); apb.textContent='Onayla'; apb.className='btn-approve'; apb.onclick=()=>finalizeMatch(matchDocId, match); actionButtonsContainer.appendChild(apb);
                } else { document.getElementById('result-message').textContent = "Onay bekleniyor..."; }
            } else if (match.durum === 'Tamamlandı') {
                const s = match.skor || {}; scoreDisplaySection.style.display = 'block';
                scoreDisplaySection.innerHTML = `<div style="background:#e8f5e9; padding:10px;"><p>${s.s1_me}-${s.s1_opp}, ${s.s2_me}-${s.s2_opp}, ${s.s3_me}-${s.s3_opp}</p><p>Kazanan: ${userMap[match.kayitliKazananID]?.isim}</p></div>`;
            }
        });
    }

    async function updateMatchStatus(id, st, msg) { await db.collection('matches').doc(id).update({durum:st}); alert(msg); goBackToList(); }
    async function deleteMatch(id, msg) { await db.collection('matches').doc(id).delete(); alert(msg); goBackToList(); }
    async function saveMatchSchedule(id) { 
        if(!matchVenueSelect.value || !matchTimeInput.value) { alert("Eksik bilgi."); return; }
        await db.collection('matches').doc(id).update({ macYeri: matchVenueSelect.value, macZamani: firebase.firestore.Timestamp.fromDate(new Date(matchTimeInput.value)) });
        alert("Planlandı!"); showMatchDetail(id);
    }
    async function saveMatchResult(id) {
        if(!winnerSelect.value) { alert("Kazanan seç!"); return; }
        const s1m=parseInt(document.getElementById('s1-me').value)||0, s1o=parseInt(document.getElementById('s1-opp').value)||0;
        const s2m=parseInt(document.getElementById('s2-me').value)||0, s2o=parseInt(document.getElementById('s2-opp').value)||0;
        const s3m=parseInt(document.getElementById('s3-me').value)||0, s3o=parseInt(document.getElementById('s3-opp').value)||0;
        if(s1m>7||s1o>7||s2m>7||s2o>7) { alert("Hata: Max 7 oyun."); return; }
        await db.collection('matches').doc(id).update({ durum:'Sonuç_Bekleniyor', adayKazananID:winnerSelect.value, sonucuGirenID:auth.currentUser.uid, skor:{s1_me:s1m, s1_opp:s1o, s2_me:s2m, s2_opp:s2o, s3_me:s3m, s3_opp:s3o} });
        alert("Girildi."); showMatchDetail(id);
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
        alert("Onaylandı!"); goBackToList(); loadLeaderboard();
    }

    function goBackToList() {
        matchDetailView.style.display='none';
        if (returnToTab) {
            tabSections.forEach(s => s.style.display = 'none');
            document.getElementById(returnToTab).style.display = 'block';
            navItems.forEach(n => n.classList.remove('active'));
            const navItem = document.querySelector(`.nav-item[data-target="${returnToTab}"]`);
            if(navItem) navItem.classList.add('active');
            if (returnToTab === 'tab-matches') loadMyMatchesOverview();
            if (returnToTab === 'tab-fixture') loadMatchesForFixture();
            returnToTab = null;
        } else {
            document.querySelector('.tab-section[style*="block"]').style.display = 'block'; 
            if ([...tabSections].every(s => s.style.display === 'none')) {
                document.getElementById('tab-matches').style.display = 'block';
                loadMyMatchesOverview();
            }
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

            fetchUserMap().then(() => { 
                loadLeaderboard(); loadOpponents(); loadMyMatchesOverview(); loadOpenRequests();
                loadScheduledMatches(); loadAnnouncements(); setupNotifications(user.uid); 
            });
        } else { 
            authScreen.style.display = 'flex'; mainApp.style.display = 'none'; listeners.forEach(u=>u());
            switchAuthTab('login');
        }
    });

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-target');
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
            else if (targetId === 'tab-profile') {
                const u = userMap[auth.currentUser.uid];
                if(u) {
                    editFullNameInput.value = u.isim || ''; 
                    editPhoneNumber.value = u.telefon || ''; 
                    editCourtPreference.value = u.kortTercihi || 'Her İkisi'; 
                    if(editNotificationPreference) editNotificationPreference.value = u.bildirimTercihi || 'ses';
                    if(editProfilePreview) editProfilePreview.src = u.fotoURL || 'https://via.placeholder.com/100';
                }
            }
        });
    });

    // --- GÜNCELLENEN EVENT LISTENERLAR ---
    if(btnApplyHistoryFilter) btnApplyHistoryFilter.addEventListener('click', filterMyHistoryMatches);
    if(bestsFilterSelect) bestsFilterSelect.addEventListener('change', (e) => loadTheBests(e.target.value));

    // Diğer Event Listenerlar
    if(saveProfileBtn) saveProfileBtn.addEventListener('click', async ()=>{ 
        const f=editProfilePhotoInput.files[0]; let url=userMap[auth.currentUser.uid].fotoURL; if(f) url=await convertToBase64(f);
        await db.collection('users').doc(auth.currentUser.uid).update({isim:editFullNameInput.value, telefon:editPhoneNumber.value, kortTercihi:editCourtPreference.value, bildirimTercihi:editNotificationPreference.value, fotoURL:url});
        alert("Güncellendi!"); location.reload(); 
    });
    
    document.querySelectorAll('.close-modal').forEach(b=>b.onclick=function(){this.closest('.modal').style.display='none'});
    window.onclick=e=>{if(e.target.classList.contains('modal'))e.target.style.display='none'};
    
    if(btnShowCreateAd) btnShowCreateAd.addEventListener('click', () => { createAdForm.style.display='block'; challengeForm.style.display='none'; });
    if(btnShowSpecificChallenge) btnShowSpecificChallenge.addEventListener('click', () => { challengeForm.style.display='block'; createAdForm.style.display='none'; });
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
                    if(profilePhotoInput.files[0]) url = await convertToBase64(profilePhotoInput.files[0]);
                    
                    await db.collection('users').doc(c.user.uid).set({
                        email: email,
                        isim: fullNameInput.value || email.split('@')[0],
                        kortTercihi: courtPreferenceSelect.value || 'Farketmez',
                        telefon: phoneNumberInput.value || '',
                        fotoURL: url,
                        toplamPuan: 1000,
                        bildirimTercihi: 'ses',
                        macSayisi: 0,
                        galibiyetSayisi: 0,
                        kayitTari: firebase.firestore.FieldValue.serverTimestamp()
                    });
                } catch(e) {
                    authError.style.display = 'block';
                    authError.textContent = "Kayıt Hatası: " + e.message;
                }
            }
        });
    }

    submitChallengeBtn.addEventListener('click', async ()=>{ 
        const oid=opponentSelect.value, mt=matchTypeSelect.value; let wp=parseInt(wagerPointsInput.value);
        if(!oid) return alert("Rakip seç!");
        if(mt==='Meydan Okuma' && (isNaN(wp)||wp<50||wp%50!==0)) return alert("Min 50 ve katları!");
        const me=userMap[auth.currentUser.uid], op=userMap[oid];
        if(mt==='Meydan Okuma' && (me.toplamPuan<0||op.toplamPuan<0||wp>me.toplamPuan*0.5||wp>op.toplamPuan*0.5)) return alert("Puan yetersiz.");
        await db.collection('matches').add({oyuncu1ID:auth.currentUser.uid, oyuncu2ID:oid, macTipi:mt, bahisPuani:wp||0, durum:'Bekliyor', tarih:firebase.firestore.FieldValue.serverTimestamp(), kayitliKazananID:null});
        alert("Teklif yollandı!"); challengeForm.style.display='none'; document.querySelector('[data-target="tab-matches"]').click();
    });
    submitAdBtn.addEventListener('click', async () => {
        const mt = adMatchTypeSelect.value; let wp = parseInt(adWagerPointsInput.value);
        if(mt === 'Meydan Okuma' && (isNaN(wp)||wp<50||wp%50!==0)) return alert("Min 50 ve katları!");
        const me = userMap[auth.currentUser.uid];
        if (mt === 'Meydan Okuma') {
            if (me.toplamPuan < 0) return alert("Puanın eksiye düştüğü için bahisli ilan açamazsın.");
            if (wp > me.toplamPuan * 0.5) return alert("Maksimum bahis toplam puanının yarısı olabilir.");
        }
        await db.collection('matches').add({ oyuncu1ID: auth.currentUser.uid, oyuncu2ID: null, macTipi: mt, bahisPuani: wp || 0, durum: 'Acik_Ilan', tarih: firebase.firestore.FieldValue.serverTimestamp(), kayitliKazananID: null });
        alert("İlan yayınlandı!"); createAdForm.style.display = 'none'; loadOpenRequests(); document.querySelector('[data-target="tab-lobby"]').click(); 
    });
    if(applyFiltersBtn) applyFiltersBtn.addEventListener('click', () => loadMatchesForFixture());
    if(clearFiltersBtn) clearFiltersBtn.addEventListener('click', () => { filterDateStart.value = ''; filterDateEnd.value = ''; filterCourt.value = ''; filterPlayer.value = ''; loadMatchesForFixture(); });
    if(logoutBtnProfile) logoutBtnProfile.addEventListener('click', ()=> { if(confirm("Çıkış yapmak istediğinize emin misiniz?")) { auth.signOut(); window.location.reload(); } });
    if (profilePhotoInput) { profilePhotoInput.addEventListener('change', async (e) => { const file = e.target.files[0]; if(file) { const base64 = await convertToBase64(file); if(profilePreview) profilePreview.src = base64; } }); }
    if (editProfilePhotoInput) { editProfilePhotoInput.addEventListener('change', async (e) => { const file = e.target.files[0]; if(file) { const base64 = await convertToBase64(file); if(editProfilePreview) editProfilePreview.src = base64; } }); }
});