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
    let activeTabFilter = 'pending_to_me'; 
    let isLoginMode = true; 
    let listeners = [];
    let isReadOnlyView = false;
    let currentChatId = null;
    let currentChatUnsubscribe = null;
    
    // YENİ: Geri dönüş için hangi sekmenin açılacağını tutan değişken
    let returnToTab = null; 

    // --- DOM ELEMENTLERİ ---
    const authScreen = document.getElementById('auth-screen');
    const mainApp = document.getElementById('main-app');
    
    // Form Inputları
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const fullNameInput = document.getElementById('full-name');
    const courtPreferenceSelect = document.getElementById('court-preference'); 
    const phoneNumberInput = document.getElementById('phone-number');
    const profilePhotoInput = document.getElementById('profile-photo');
    const profilePreview = document.getElementById('profile-preview');
    
    // Auth Butonları
    const toggleAuthModeBtn = document.getElementById('toggle-auth-mode'); 
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const authError = document.getElementById('auth-error');

    // Meydan Okuma ve Açık İlan
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
    
    // Lobi Listeleri
    const openRequestsContainer = document.getElementById('lobby-requests-container');
    const scheduledMatchesContainer = document.getElementById('lobby-scheduled-container');
    const announcementsContainer = document.getElementById('lobby-announcements-container'); 
    
    // LİSTELER
    const leaderboardDiv = document.getElementById('leaderboard');
    const userMatchListContainer = document.getElementById('user-match-list-container');
    const programListContainer = document.getElementById('program-list-container');
    const chatListContainer = document.getElementById('chat-list-container');
    const matchTabs = document.getElementById('match-tabs');
    
    // FİLTRELER
    const filtersContainer = document.getElementById('filters-container');
    const filterDateStart = document.getElementById('filter-date-start');
    const filterDateEnd = document.getElementById('filter-date-end');
    const filterCourt = document.getElementById('filter-court');
    const filterPlayer = document.getElementById('filter-player');
    const filterStatus = document.getElementById('filter-status'); 
    const applyFiltersBtn = document.getElementById('apply-filters-btn');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');

    // Detay
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

    // Bildirim ve Modallar
    const notificationContainer = document.getElementById('notification-container');
    const playerStatsModal = document.getElementById('player-stats-modal');
    const startChatBtn = document.getElementById('start-chat-btn'); 
    
    // İstatistik
    const statsPlayerName = document.getElementById('stats-player-name');
    const statsTotalPoints = document.getElementById('stats-total-points');
    const statsCourtPref = document.getElementById('stats-court-pref');
    const statsPhone = document.getElementById('stats-phone'); 
    const statsMatchWinRate = document.getElementById('stats-match-win-rate');
    const statsMatchRecord = document.getElementById('stats-match-record');
    const statsSetWinRate = document.getElementById('stats-set-win-rate');
    const statsSetRecord = document.getElementById('stats-set-record');
    const statsGameWinRate = document.getElementById('stats-game-win-rate');
    const statsGameRecord = document.getElementById('stats-game-record');
    const statsPlayerPhoto = document.getElementById('stats-player-photo');

    // Sohbet Modalı
    const chatModal = document.getElementById('chat-window-modal');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendMessageBtn = document.getElementById('send-message-btn');
    const chatRecipientName = document.getElementById('chat-recipient-name');
    const closeChatModal = document.getElementById('close-chat-window');
    const clearChatBtn = document.getElementById('clear-chat-btn'); 

    // Profil Düzenleme Alanları
    const editProfilePhotoInput = document.getElementById('edit-profile-photo');
    const editProfilePreview = document.getElementById('edit-profile-preview');
    const editFullNameInput = document.getElementById('edit-full-name');
    const editCourtPreference = document.getElementById('edit-court-preference');
    const editPhoneNumber = document.getElementById('edit-phone-number');
    const editNotificationPreference = document.getElementById('edit-notification-preference');
    const saveProfileBtn = document.getElementById('save-profile-btn');
    const requestPermissionBtn = document.getElementById('request-permission-btn');
    const logoutBtnProfile = document.getElementById('logout-btn-profile');

    // --- NAVIGASYON VE SEKMELER ---
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

    const setTodayFilters = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`;
        if(filterDateStart) filterDateStart.value = todayStr;
        if(filterDateEnd) filterDateEnd.value = todayStr;
    };

    const requestNotificationPermission = () => {
        if (!("Notification" in window)) {
            alert("Bu tarayıcı sistem bildirimlerini desteklemiyor.");
        } else if (Notification.permission === "granted") {
            alert("Bildirim izni zaten verilmiş.");
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    new Notification("Tenis Ligi", { body: "Bildirimler aktif edildi! 🎾" });
                }
            });
        }
    };

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

    // --- MESAJLARI DİNLE ---
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

    // --- MESAJ GÖNDER ---
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

    // --- SOHBET SİLME ---
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

    // --- MESAJLARI TEMİZLEME ---
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

    // --- SOHBET LİSTESİNİ YÜKLE ---
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

    // --- VERİ ÇEKME ---
    function fetchUserMap() {
        return db.collection('users').get().then(snapshot => {
            if (filterPlayer) filterPlayer.innerHTML = '<option value="">Tüm Oyuncular</option>';
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
            });
        });
    }

    // LİG SIRALAMASI
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

    // --- GELİŞMİŞ YAPAY ZEKA YORUM MOTORU ---
    function generateAdvancedAIComment(matchData, p1Name, p2Name) {
        // 1. Veri Analizi
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

        // 2. Yorum Havuzları
        const comments = {
            'Acik_Ilan': [
                `📢 <strong>${p1Name}</strong> kortlara meydan okuyor! "Var mı bana yan bakan?" diyor.`,
                `👀 <strong>${p1Name}</strong> dişli bir rakip arıyor. Cesareti olan sahaya çıksın!`,
                `🎾 Raketler konuşsun! <strong>${p1Name}</strong> maç yapacak partner arıyor.`,
                `🚀 <strong>${p1Name}</strong> formunun zirvesinde, kendini test edecek birini bekliyor.`,
                `📣 <strong>${p1Name}</strong> ligde ses getirmek istiyor, rakip bekleniyor!`
            ],
            'Acik_Ilan_HighWager': [ 
                `💰 <strong>${p1Name}</strong> masaya büyük koydu! Tam <strong>${wager} Puan</strong> bahisli maç arıyor.`,
                `🔥 Ligde bahisler yükseliyor! <strong>${p1Name}</strong> kendine çok güveniyor, ${wager} puanı riske etti.`,
                `🤑 "Büyük oyna ya da eve dön" diyen <strong>${p1Name}</strong>, ${wager} puanlık iddialı bir rakip bekliyor.`,
                `💎 <strong>${p1Name}</strong>'den servet değerinde teklif! ${wager} puanlık maça var mısın?`
            ],
            'Bekliyor': [
                `⚔️ <strong>${p1Name}</strong> gözünü kararttı, <strong>${p2Name}</strong> kişisine resmen meydan okudu!`,
                `👀 Yeni bir rekabet doğuyor: <strong>${p1Name}</strong> vs <strong>${p2Name}</strong>. Bakalım cevap ne olacak?`,
                `⚡ Ortalık geriliyor! <strong>${p1Name}</strong>, <strong>${p2Name}</strong> ile kozlarını paylaşmak istiyor.`,
                `📩 <strong>${p2Name}</strong>'in telefonuna bildirim düştü: <strong>${p1Name}</strong> maç istiyor!`,
                `🛡️ <strong>${p1Name}</strong> defans hattını kurdu, <strong>${p2Name}</strong>'i düelloya davet etti.`
            ],
            'Hazır': [
                `🤝 Ve anlaşma sağlandı! <strong>${p1Name}</strong> ile <strong>${p2Name}</strong> maçı kesinleşti.`,
                `🍿 Mısırları hazırlayın, <strong>${p1Name}</strong> - <strong>${p2Name}</strong> maçı yaklaşıyor!`,
                `📅 Randevu deftere yazıldı. <strong>${p1Name}</strong> ve <strong>${p2Name}</strong> kortta buluşacak.`,
                `💣 Saatli bomba kuruldu: <strong>${p1Name}</strong> vs <strong>${p2Name}</strong>. İyi olan kazansın!`,
                `🔋 İki oyuncu da hazır. <strong>${p1Name}</strong> ve <strong>${p2Name}</strong> enerjilerini maça saklıyor.`
            ],
            'Sonuç_Bekleniyor': [
                `📝 Maç bitti, terler soğudu. Şimdi skor onayı bekleniyor...`,
                `🤔 Korttan sonuçlar geldi. Bakalım kazanan kim? Onay bekleniyor.`,
                `⏳ Nefesler tutuldu, maç sonucu sisteme girildi. Tarafların onayı bekleniyor.`
            ],
            'Tamamlandı_Generic': [
                `🏆 Kazanan: <strong>${winnerName}</strong>! ${loserName} elinden geleni yaptı ama yetmedi.`,
                `✨ <strong>${winnerName}</strong> günü galibiyetle kapattı. Tebrikler!`,
                `🔥 Kortun tozunu attıran isim <strong>${winnerName}</strong> oldu.`,
                `✅ İstatistiklere bir galibiyet daha: <strong>${winnerName}</strong> kazandı.`,
                `📢 Maçın son düdüğü, kazanan <strong>${winnerName}</strong>! ${loserName} bir sonraki maça odaklanmalı.`
            ],
            'Tamamlandı_Crushing': [
                `😱 Aman Allah'ım! <strong>${winnerName}</strong> rakibine kortu dar etti! Ezici bir skor.`,
                `🍩 <strong>${winnerName}</strong> bugün rakibine "simit" ikram etmiş olabilir. Çok net bir galibiyet!`,
                `🚀 <strong>${winnerName}</strong> maçı antrenman havasında geçti. ${loserName} için zor bir gün oldu.`,
                `🔨 Çekiç gibi indi! <strong>${winnerName}</strong> rakibine hiç şans tanımadı, silindir gibi geçti.`,
                `🌪️ Kortta fırtına vardı ve adı <strong>${winnerName}</strong> idi! Farklı kazandı.`
            ],
            'Tamamlandı_Tight': [
                `🥵 Ne maçtı ama! <strong>${winnerName}</strong> zor da olsa ${loserName} karşısında kazanmayı bildi.`,
                `🤯 Kalpler dayanamaz! Müthiş bir çekişme, tie-breakler, uzatmalar... Sonunda <strong>${winnerName}</strong> güldü.`,
                `⚖️ Gitti geldi, gitti geldi... Sonunda <strong>${winnerName}</strong> kazandı. ${loserName} harika direndi.`,
                `🕰️ Kortun ışıkları sönene kadar oynadılar sandık! <strong>${winnerName}</strong> bu maratonu kazandı.`,
                `😰 Tırnaklar yendi! <strong>${winnerName}</strong> son topta maçı aldı.`
            ]
        };

        // 3. Mantıksal Seçim
        let selectedCategory = [];

        if (type === 'Acik_Ilan') {
            selectedCategory = (wager >= 500) ? comments['Acik_Ilan_HighWager'] : comments['Acik_Ilan'];
        } 
        else if (type === 'Bekliyor') {
            selectedCategory = comments['Bekliyor'];
        }
        else if (type === 'Hazır') {
            selectedCategory = comments['Hazır'];
        }
        else if (type === 'Sonuç_Bekleniyor') {
            selectedCategory = comments['Sonuç_Bekleniyor'];
        }
        else if (type === 'Tamamlandı') {
            const s1 = parseInt(score.s1_me) + parseInt(score.s1_opp); 
            const s3 = (score.s3_me && score.s3_opp) ? parseInt(score.s3_me) + parseInt(score.s3_opp) : 0;
            
            const setsPlayed = (s3 > 0) ? 3 : 2;
            const isCrushing = [score.s1_me, score.s1_opp, score.s2_me, score.s2_opp].some(val => val == 0 || val == 1);
            const isTight = setsPlayed === 3 || [score.s1_me, score.s1_opp, score.s2_me, score.s2_opp].some(val => val == 7);

            if (isTight) {
                selectedCategory = comments['Tamamlandı_Tight'];
            } else if (isCrushing) {
                selectedCategory = comments['Tamamlandı_Crushing'];
            } else {
                selectedCategory = comments['Tamamlandı_Generic'];
            }
        }

        if (!selectedCategory || selectedCategory.length === 0) return `🎾 <strong>${p1Name}</strong> vs <strong>${p2Name}</strong>`;
        
        const randomIndex = Math.floor(Math.random() * selectedCategory.length);
        return selectedCategory[randomIndex];
    }

    // --- LOBİ: HABER AKIŞINI YÜKLE ---
    function loadAnnouncements() {
        if(!announcementsContainer) return;
        
        const loadingTexts = ["Veriler analiz ediliyor...", "Maç sonuçları taranıyor...", "Yapay zeka yorum hazırlıyor...", "Kortlardan haberler toplanıyor..."];
        const randLoad = loadingTexts[Math.floor(Math.random()*loadingTexts.length)];
        announcementsContainer.innerHTML = `<p style="text-align:center; color:#999; font-style:italic;">🤖 ${randLoad}</p>`;

        db.collection('matches')
          .orderBy('tarih', 'desc')
          .limit(15)
          .get()
          .then(snapshot => {
              announcementsContainer.innerHTML = '';
              let hasNews = false;

              snapshot.forEach(doc => {
                  hasNews = true;
                  const m = doc.data();
                  const p1 = userMap[m.oyuncu1ID]?.isim || 'Gizli Oyuncu';
                  const p2 = m.oyuncu2ID ? (userMap[m.oyuncu2ID]?.isim || 'Rakip') : '???';
                  
                  const comment = generateAdvancedAIComment(m, p1, p2);
                  
                  let icon = '🎾';
                  if (m.durum === 'Acik_Ilan') icon = '📢';
                  if (m.durum === 'Bekliyor') icon = '⚔️';
                  if (m.durum === 'Hazır') icon = '📅';
                  if (m.durum === 'Tamamlandı') icon = '🏆';

                  let dateStr = '';
                  if (m.tarih) {
                      const d = m.tarih.toDate();
                      const today = new Date();
                      if (d.getDate() === today.getDate() && d.getMonth() === today.getMonth()) {
                          dateStr = `Bugün ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
                      } else {
                          dateStr = d.toLocaleDateString('tr-TR');
                      }
                  }

                  const item = document.createElement('div');
                  item.style.cssText = 'padding:12px; border-bottom:1px solid #eee; font-size:0.95em; line-height:1.5; animation: fadeIn 0.5s;';
                  
                  const headerDiv = document.createElement('div');
                  headerDiv.style.cssText = 'margin-bottom:4px; display:flex; justify-content:space-between; align-items:center;';
                  headerDiv.innerHTML = `<span style="font-size:1.2em;">${icon}</span><span style="font-size:0.75em; color:#bbb;">${dateStr}</span>`;
                  
                  const commentDiv = document.createElement('div');
                  commentDiv.style.color = '#444';
                  commentDiv.innerHTML = comment;
                  
                  const btnDiv = document.createElement('div');
                  btnDiv.style.marginTop = '8px';
                  
                  const detailBtn = document.createElement('button');
                  detailBtn.textContent = 'İncele 🔍';
                  detailBtn.className = 'btn-chat-small'; 
                  detailBtn.style.cssText = 'padding: 5px 12px; font-size: 0.8em; width: auto; margin:0; background-color: #6c757d; border:none; border-radius:15px;';
                  
                  detailBtn.onclick = function() {
                      // YENİ: Dönüş sekmesini Lobi olarak ayarla
                      returnToTab = 'tab-lobby';
                      showMatchDetail(doc.id);
                  };

                  btnDiv.appendChild(detailBtn);
                  
                  item.appendChild(headerDiv);
                  item.appendChild(commentDiv);
                  item.appendChild(btnDiv);

                  announcementsContainer.appendChild(item);
              });

              if(!hasNews) announcementsContainer.innerHTML = '<p style="text-align:center; color:#777;">Henüz dedikodu yok.</p>';
          });
    }

    // --- AÇIK İLANLAR LİSTESİ ---
    function loadOpenRequests() {
        if(!openRequestsContainer) return;
        openRequestsContainer.innerHTML = '<p style="text-align:center;">Yükleniyor...</p>';
        const currentUserID = auth.currentUser.uid;

        db.collection('matches')
          .where('durum', '==', 'Acik_Ilan')
          .orderBy('tarih', 'desc')
          .get()
          .then(snapshot => {
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

                  card.innerHTML = `
                      <div>
                          <div style="font-weight:bold; font-size:1.1em;">${p1Name}</div>
                          <div style="font-size:0.9em; color:#555;">${wagerInfo} | ${kort}</div>
                          <div style="font-size:0.8em; color:#999;">${tarih}</div>
                      </div>
                      <button class="btn-accept-request" data-id="${doc.id}" data-wager="${data.bahisPuani}" data-type="${data.macTipi}" style="width:auto; padding:8px 15px; font-size:0.9em; background-color:#28a745; color:white; border:none; border-radius:5px;">Kabul Et</button>
                  `;
                  
                  card.querySelector('.btn-accept-request').onclick = () => acceptOpenRequest(doc.id, data.bahisPuani, data.macTipi);
                  openRequestsContainer.appendChild(card);
              });

              if(!hasRequest) openRequestsContainer.innerHTML = '<p style="text-align:center; color:#777; padding:15px;">Şu an açık ilan yok. İlk ilanı sen oluştur! 🎾</p>';
          })
          .catch(err => {
              console.error("Açık ilan hatası:", err);
              openRequestsContainer.innerHTML = '<p style="text-align:center; color:red;">İlanlar yüklenemedi.</p>';
          });
    }

    // --- LOBİ: PLANLI MAÇLARI YÜKLE ---
    function loadScheduledMatches() {
        if(!scheduledMatchesContainer) return;
        scheduledMatchesContainer.innerHTML = '<p style="text-align:center;">Yükleniyor...</p>';

        db.collection('matches')
          .where('durum', '==', 'Hazır')
          .get()
          .then(snapshot => {
              scheduledMatchesContainer.innerHTML = '';
              let matches = [];

              snapshot.forEach(doc => {
                  matches.push({ ...doc.data(), id: doc.id });
              });

              matches.sort((a, b) => {
                  const timeA = a.macZamani ? a.macZamani.toMillis() : 9999999999999;
                  const timeB = b.macZamani ? b.macZamani.toMillis() : 9999999999999;
                  return timeA - timeB;
              });

              if(matches.length === 0) {
                  scheduledMatchesContainer.innerHTML = '<p style="text-align:center; color:#777; padding:15px;">Planlanmış maç yok.</p>';
                  return;
              }

              matches.forEach(match => {
                  const p1Name = userMap[match.oyuncu1ID]?.isim || 'Bilinmiyor';
                  const p2Name = userMap[match.oyuncu2ID]?.isim || 'Bilinmiyor';
                  const kort = match.macYeri || 'Kort Belirlenmedi';
                  
                  let timeStr = '<span style="color:#999; font-style:italic;">Zaman bekleniyor</span>';
                  let dateBadge = '';

                  if (match.macZamani) {
                      const date = match.macZamani.toDate();
                      const day = date.getDate();
                      const month = date.toLocaleString('tr-TR', { month: 'short' });
                      const time = date.toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                      
                      timeStr = `<strong style="color:#333;">${time}</strong>`;
                      dateBadge = `
                        <div style="background:#e3f2fd; color:#0d47a1; padding:5px 10px; border-radius:8px; text-align:center; margin-right:10px; min-width:45px;">
                            <div style="font-size:0.8em; font-weight:bold;">${day}</div>
                            <div style="font-size:0.7em;">${month}</div>
                        </div>`;
                  } else {
                       dateBadge = `
                        <div style="background:#f5f5f5; color:#999; padding:5px 10px; border-radius:8px; text-align:center; margin-right:10px; min-width:45px;">
                            <div style="font-size:1.2em;">?</div>
                        </div>`;
                  }

                  const card = document.createElement('div');
                  card.className = 'lobby-match-card';
                  card.style.cssText = 'background:#fff; border:1px solid #dee2e6; border-left: 4px solid #007bff; border-radius:8px; padding:10px; margin-bottom:10px; display:flex; align-items:center; box-shadow:0 1px 3px rgba(0,0,0,0.05); cursor:pointer;';
                  
                  card.innerHTML = `
                      ${dateBadge}
                      <div style="flex-grow:1;">
                          <div style="font-weight:600; font-size:0.95em; color:#333;">${p1Name} <span style="color:#999; font-weight:normal;">vs</span> ${p2Name}</div>
                          <div style="font-size:0.85em; color:#666; margin-top:2px;">📍 ${kort} | ${timeStr}</div>
                      </div>
                  `;
                  
                  card.onclick = () => {
                      // YENİ: Lobiye geri dönüş
                      returnToTab = 'tab-lobby';
                      
                      const myUid = auth.currentUser.uid;
                      // Kendi maçıysa düzenleyebilir, değilse salt okunur
                      if(match.oyuncu1ID === myUid || match.oyuncu2ID === myUid) {
                          isReadOnlyView = false;
                      } else {
                          isReadOnlyView = true;
                      }
                      showMatchDetail(match.id);
                  };

                  scheduledMatchesContainer.appendChild(card);
              });
          })
          .catch(err => {
              console.error("Planlı maçlar hatası:", err);
              scheduledMatchesContainer.innerHTML = '<p style="text-align:center; color:red;">Liste yüklenemedi.</p>';
          });
    }

    async function acceptOpenRequest(matchId, wager, type) {
        if(!confirm("Bu maçı kabul etmek istiyor musun?")) return;
        
        const myUid = auth.currentUser.uid;
        const me = userMap[myUid];

        if (type === 'Meydan Okuma') {
            if (me.toplamPuan < 0) return alert("Puanın eksiye düştüğü için bahisli maç kabul edemezsin.");
            if (wager > me.toplamPuan * 0.5) return alert(`Bu maç için puanın yetersiz. (Mevcut: ${me.toplamPuan}, Gereken Min: ${wager*2})`);
        }

        try {
            await db.collection('matches').doc(matchId).update({
                oyuncu2ID: myUid,
                durum: 'Hazır'
            });
            alert("Maç kabul edildi! İletişime geçip maçı planlayabilirsin.");
            document.querySelector('[data-target="tab-matches"]').click();
        } catch (error) {
            console.error(error);
            alert("Hata: Maç kabul edilemedi (belki başkası kaptı).");
            loadOpenRequests();
        }
    }

    // --- MAÇ LİSTELEME ---
    function loadMatches(filterType) {
        let targetContainer;
        
        if (filterType === 'all_matches') {
            targetContainer = programListContainer; 
            isReadOnlyView = true;
            if (filterCourt && filterCourt.options.length === 1) {
                COURT_LIST.forEach(c => { const opt = document.createElement('option'); opt.value = c; opt.textContent = c; filterCourt.appendChild(opt); });
            }
        } else {
            targetContainer = userMatchListContainer; 
            activeTabFilter = filterType; 
            isReadOnlyView = false;
            
            if (matchTabs) {
                matchTabs.querySelectorAll('.tab-btn').forEach(btn => {
                    if (btn.getAttribute('data-status') === filterType) { btn.style.backgroundColor = '#333'; btn.style.color = '#fff'; } 
                    else { btn.style.backgroundColor = ''; btn.style.color = ''; }
                });
            }
        }

        const currentUserID = auth.currentUser.uid;
        let query;
        
        switch (filterType) {
            case 'pending_to_me': 
                query = db.collection('matches').where('oyuncu2ID', '==', currentUserID).where('durum', '==', 'Bekliyor'); 
                break;
            case 'pending_from_me': 
                query = db.collection('matches').where('oyuncu1ID', '==', currentUserID).where('durum', 'in', ['Bekliyor', 'Acik_Ilan']);
                break;
            case 'active': query = db.collection('matches').where('durum', 'in', ['Hazır', 'Sonuç_Bekleniyor']); break;
            case 'completed': query = db.collection('matches').where('durum', '==', 'Tamamlandı'); break;
            case 'all_matches': query = db.collection('matches').where('durum', 'in', ['Bekliyor', 'Hazır', 'Sonuç_Bekleniyor', 'Tamamlandı']); break; 
            default: return;
        }

        query.get().then(snapshot => {
            if(!targetContainer) return;
            targetContainer.innerHTML = '';
            let matchesData = [];

            snapshot.forEach(doc => {
                const match = doc.data();
                if (filterType !== 'all_matches' && (filterType === 'active' || filterType === 'completed')) {
                    if (match.oyuncu1ID !== currentUserID && match.oyuncu2ID !== currentUserID) return;
                }

                if (filterType === 'all_matches') {
                    const fStart = filterDateStart.value ? new Date(filterDateStart.value) : null;
                    const fEnd = filterDateEnd.value ? new Date(filterDateEnd.value) : null;
                    const fCourt = filterCourt.value;
                    const fPlayer = filterPlayer.value;
                    const fStatus = filterStatus ? filterStatus.value : '';

                    if (fStart || fEnd) {
                        if (!match.macZamani) return;
                        const d = match.macZamani.toDate();
                        if (fStart) { fStart.setHours(0,0,0,0); if (d < fStart) return; }
                        if (fEnd) { fEnd.setHours(23,59,59,999); if (d > fEnd) return; }
                    }
                    if (fCourt && match.macYeri !== fCourt) return;
                    if (fPlayer && match.oyuncu1ID !== fPlayer && match.oyuncu2ID !== fPlayer) return;
                    if (fStatus && match.durum !== fStatus) return;
                }
                matchesData.push({ ...match, id: doc.id });
            });

            matchesData.sort((a, b) => { const dateA = a.tarih ? a.tarih.seconds : 0; const dateB = b.tarih ? b.tarih.seconds : 0; return dateB - dateA; });
            
            if (matchesData.length === 0) { targetContainer.innerHTML = '<p style="text-align:center; color:#777;">Maç bulunamadı.</p>'; return; }

            matchesData.forEach(match => {
                let titleHTML = '';
                if (filterType === 'all_matches') {
                    const p1 = userMap[match.oyuncu1ID]?.isim || '???'; const p2 = userMap[match.oyuncu2ID]?.isim || '???';
                    titleHTML = `<strong>${p1}</strong> vs <strong>${p2}</strong>`;
                } else {
                    if (match.durum === 'Acik_Ilan') {
                        titleHTML = `<strong>AÇIK İLAN</strong> (Henüz rakip yok)`;
                    } else {
                        const oid = match.oyuncu1ID === currentUserID ? match.oyuncu2ID : match.oyuncu1ID;
                        const oname = userMap[oid]?.isim || 'Bilinmiyor';
                        titleHTML = `Rakip: <strong>${oname}</strong>`;
                    }
                }
                
                let dm = match.durum;
                if(dm === 'Bekliyor') dm = 'Yanıt Bekleniyor';
                if(dm === 'Hazır') dm = 'Oynanıyor 🎾';
                if(dm === 'Sonuç_Bekleniyor') dm = 'Onay Bekliyor ⏳';
                if(dm === 'Tamamlandı') dm = 'Bitti ✅';
                if(dm === 'Acik_Ilan') dm = 'İlan Yayında 📢';

                let planInfo = "";
                if (match.macZamani && match.macYeri) {
                    const d = match.macZamani.toDate().toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' });
                    planInfo = `<div class="match-plan-info">📅 ${d} - ${match.macYeri}</div>`;
                }

                const card = document.createElement('div'); card.className = 'match-card';
                card.innerHTML = `<p><strong>${match.macTipi}</strong> | ${dm}</p><p>${titleHTML}</p><p>Bahis: ${match.bahisPuani}</p>${planInfo}<button class="match-action-btn" data-id="${match.id}">Detay</button>`;
                // YENİ: Maçlarım veya Fikstürden geliyorsa ilgili sekme adını ata
                card.querySelector('.match-action-btn').addEventListener('click', () => {
                   if (filterType === 'all_matches') returnToTab = 'tab-fixture';
                   else returnToTab = 'tab-matches';
                });
                targetContainer.appendChild(card);
            });
        });
    }

    // --- İSTATİSTİKLER ---
    async function calculatePlayerStats(userId) {
        const q1 = db.collection('matches').where('oyuncu1ID', '==', userId).where('durum', '==', 'Tamamlandı').get();
        const q2 = db.collection('matches').where('oyuncu2ID', '==', userId).where('durum', '==', 'Tamamlandı').get();
        const [s1, s2] = await Promise.all([q1, q2]);
        let matches = []; s1.forEach(d=>matches.push(d.data())); s2.forEach(d=>matches.push(d.data()));
        let stats = { matchesPlayed: 0, matchesWon: 0, setsPlayed: 0, setsWon: 0, gamesPlayed: 0, gamesWon: 0 };
        matches.forEach(m => {
            stats.matchesPlayed++; if (m.kayitliKazananID === userId) stats.matchesWon++;
            if (m.skor) {
                const s = m.skor; const isRep = m.sonucuGirenID === userId;
                const sets = [{p1:s.s1_me, p2:s.s1_opp}, {p1:s.s2_me, p2:s.s2_opp}, {p1:s.s3_me, p2:s.s3_opp, tb:true}];
                sets.forEach(set => {
                    let mg = isRep ? parseInt(set.p1||0) : parseInt(set.p2||0);
                    let og = isRep ? parseInt(set.p2||0) : parseInt(set.p1||0);
                    if(mg+og > 0) {
                        stats.setsPlayed++; if(mg > og) stats.setsWon++;
                        if(!set.tb) { stats.gamesPlayed += mg+og; stats.gamesWon += mg; }
                    }
                });
            }
        });
        return stats;
    }

    async function showPlayerStats(userId) {
        const u = userMap[userId];
        if(!u) return;
        statsPlayerName.textContent = u.isim; statsTotalPoints.textContent = u.toplamPuan;
        statsCourtPref.textContent = u.kortTercihi; statsPhone.textContent = u.telefon;
        if(statsPlayerPhoto) statsPlayerPhoto.src = u.fotoURL || 'https://via.placeholder.com/120';
        
        if(startChatBtn) {
            if (userId === auth.currentUser.uid) { startChatBtn.style.display = 'none'; } 
            else { startChatBtn.style.display = 'block'; startChatBtn.onclick = () => openChat(userId, u.isim); }
        }
        
        playerStatsModal.style.display = 'flex'; 
        const stats = await calculatePlayerStats(userId);
        const matchRate = stats.matchesPlayed > 0 ? ((stats.matchesWon / stats.matchesPlayed) * 100).toFixed(0) : 0;
        const setRate = stats.setsPlayed > 0 ? ((stats.setsWon / stats.setsPlayed) * 100).toFixed(0) : 0;
        const gameRate = stats.gamesPlayed > 0 ? ((stats.gamesWon / stats.gamesPlayed) * 100).toFixed(0) : 0;

        statsMatchWinRate.textContent = matchRate;
        statsMatchRecord.textContent = `${stats.matchesWon}/${stats.matchesPlayed}`;
        statsSetWinRate.textContent = setRate;
        statsSetRecord.textContent = `${stats.setsWon}/${stats.setsPlayed}`;
        statsGameWinRate.textContent = gameRate;
        statsGameRecord.textContent = `${stats.gamesWon}/${stats.gamesPlayed}`;
    }

    // --- DETAY GÖSTERİMİ ---
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

            scoreInputSection.style.display = 'none'; scoreDisplaySection.style.display = 'none';
            winnerSelect.style.display = 'none'; scheduleInputSection.style.display = 'none';
            actionButtonsContainer.innerHTML = ''; document.getElementById('result-message').textContent = '';
            
            if (chatFromMatchBtn) {
                if (match.oyuncu2ID && (currentUserID === match.oyuncu1ID || currentUserID === match.oyuncu2ID)) {
                    const opponentId = currentUserID === match.oyuncu1ID ? match.oyuncu2ID : match.oyuncu1ID;
                    const opponentName = userMap[opponentId]?.isim || 'Rakip';
                    chatFromMatchBtn.style.display = 'block';
                    chatFromMatchBtn.onclick = () => openChat(opponentId, opponentName);
                } else { chatFromMatchBtn.style.display = 'none'; }
            }

            const isParticipant = (currentUserID === match.oyuncu1ID || currentUserID === match.oyuncu2ID);

            if (isReadOnlyView || !isParticipant) {
                if (match.durum === 'Sonuç_Bekleniyor' || match.durum === 'Tamamlandı') {
                    const s = match.skor || {};
                    scoreDisplaySection.style.display = 'block';
                    let resText = match.durum === 'Tamamlandı' ? `<p style="color:green;">Kazanan: ${userMap[match.kayitliKazananID]?.isim}</p>` : `<p style="color:orange;">Sonuç Onayı Bekleniyor</p>`;
                    scoreDisplaySection.innerHTML = `<div style="background:#f1f1f1; padding:10px; border-radius:5px;"><p><strong>Skor:</strong> ${s.s1_me}-${s.s1_opp}, ${s.s2_me}-${s.s2_opp}, ${s.s3_me}-${s.s3_opp}</p>${resText}</div>`;
                } else { document.getElementById('result-message').textContent = "Bu maç henüz oynanmadı veya sonuç girilmedi."; }
                return;
            }
            
            if (match.durum === 'Acik_Ilan' && currentUserID === match.oyuncu1ID) {
                const dbn = document.createElement('button'); dbn.textContent='İlanı Kaldır 🗑️'; dbn.className='btn-reject'; dbn.onclick=()=>deleteMatch(matchDocId,"İlan kaldırıldı.");
                actionButtonsContainer.appendChild(dbn);
                return;
            }

            if (match.durum === 'Bekliyor' && currentUserID === match.oyuncu2ID) {
                const ab = document.createElement('button'); ab.textContent='Kabul Et'; ab.className='btn-accept'; ab.onclick=()=>updateMatchStatus(matchDocId,'Hazır',"Kabul edildi!");
                const rb = document.createElement('button'); rb.textContent='Reddet'; rb.className='btn-reject'; rb.onclick=()=>deleteMatch(matchDocId,"Reddedildi.");
                actionButtonsContainer.append(ab, rb);
            } else if (match.durum === 'Bekliyor' && currentUserID === match.oyuncu1ID) {
                const wb = document.createElement('button'); wb.textContent='Geri Çek'; wb.className='btn-withdraw'; wb.onclick=()=>deleteMatch(matchDocId,"Geri çekildi.");
                actionButtonsContainer.appendChild(wb);
            } else if (match.durum === 'Hazır') {
                scheduleInputSection.style.display = 'block';
                matchVenueSelect.innerHTML = '<option value="">Kort Seç</option>';
                COURT_LIST.forEach(c => { const o = document.createElement('option'); o.value=c; o.textContent=c; if(match.macYeri===c) o.selected=true; matchVenueSelect.appendChild(o); });
                if(match.macZamani) { matchTimeInput.value = new Date(match.macZamani.toDate().getTime() - (match.macZamani.toDate().getTimezoneOffset() * 60000)).toISOString().slice(0,16); }
                saveScheduleBtn.onclick = () => saveMatchSchedule(matchDocId);
                scoreInputSection.style.display = 'block'; winnerSelect.style.display = 'block';
                const sb = document.createElement('button'); sb.textContent='Sonucu Gir'; sb.className='btn-save'; sb.onclick=()=>saveMatchResult(matchDocId);
                actionButtonsContainer.appendChild(sb);
            } else if (match.durum === 'Sonuç_Bekleniyor') {
                const s = match.skor || {}; scoreDisplaySection.style.display = 'block';
                scoreDisplaySection.innerHTML = `<div style="background:#f1f1f1; padding:10px;"><p>${s.s1_me}-${s.s1_opp}, ${s.s2_me}-${s.s2_opp}, ${s.s3_me}-${s.s3_opp}</p><p>Aday Kazanan: ${userMap[match.adayKazananID]?.isim}</p></div>`;
                if (match.sonucuGirenID !== currentUserID) {
                    const apb = document.createElement('button'); apb.textContent='Onayla'; apb.className='btn-approve'; apb.onclick=()=>finalizeMatch(matchDocId, match);
                    actionButtonsContainer.appendChild(apb);
                } else { document.getElementById('result-message').textContent = "Onay bekleniyor..."; }
            } else if (match.durum === 'Tamamlandı') {
                const s = match.skor || {}; scoreDisplaySection.style.display = 'block';
                scoreDisplaySection.innerHTML = `<div style="background:#e8f5e9; padding:10px;"><p>${s.s1_me}-${s.s1_opp}, ${s.s2_me}-${s.s2_opp}, ${s.s3_me}-${s.s3_opp}</p><p>Kazanan: ${userMap[match.kayitliKazananID]?.isim}</p></div>`;
            }
        });
    }

    // --- DB İŞLEMLERİ ---
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

    // YENİ: Geri dönüş fonksiyonu güncellendi
    function goBackToList() {
        matchDetailView.style.display='none';

        if (returnToTab) {
            // Tüm sekmeleri gizle
            tabSections.forEach(s => s.style.display = 'none');
            // Hedef sekmeyi göster
            document.getElementById(returnToTab).style.display = 'block';
            
            // Navigasyon stilini güncelle
            navItems.forEach(n => n.classList.remove('active'));
            const navItem = document.querySelector(`.nav-item[data-target="${returnToTab}"]`);
            if(navItem) navItem.classList.add('active');

            if (returnToTab === 'tab-matches') loadMatches(activeTabFilter);
            if (returnToTab === 'tab-fixture') loadMatches('all_matches');
            
            // Değişkeni sıfırla
            returnToTab = null;
        } else {
            // Varsayılan davranış (eğer returnToTab set edilmemişse)
            document.querySelector('.tab-section[style*="block"]').style.display = 'block'; 
            if ([...tabSections].every(s => s.style.display === 'none')) {
                document.getElementById('tab-matches').style.display = 'block';
                loadMatches(activeTabFilter);
            }
        }
    }

    // --- BİLDİRİM ---
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
        if (Notification.permission === "granted" && document.visibilityState === "hidden") { new Notification("Tenis Ligi", { body: msg }); }
        if(u?.bildirimTercihi==='ses') { try { const a=new (window.AudioContext||window.webkitAudioContext)(); const o=a.createOscillator(); const g=a.createGain(); o.connect(g); g.connect(a.destination); o.type='sine'; o.frequency.value=880; g.gain.value=0.1; o.start(); o.stop(a.currentTime+0.2); } catch(e){} }
        else if(u?.bildirimTercihi==='titresim' && navigator.vibrate) navigator.vibrate([200,100,200]);
    }

    if(sendMessageBtn) { sendMessageBtn.onclick = sendMessage; }
    if(chatInput) { chatInput.addEventListener('keypress', function(e) { if (e.key === 'Enter') sendMessage(); }); }
    if(closeChatModal) { closeChatModal.onclick = () => { chatModal.style.display = 'none'; if (currentChatUnsubscribe) currentChatUnsubscribe(); }; }
    
    if (clearChatBtn) clearChatBtn.addEventListener('click', clearChatMessages);

    // --- AUTH CHANGE ---
    auth.onAuthStateChanged(user => {
        if (user) {
            authScreen.style.display = 'none'; 
            mainApp.style.display = 'flex'; 
            
            tabSections.forEach(s => s.style.display = 'none');
            document.getElementById('tab-lobby').style.display = 'block';
            navItems.forEach(n => n.classList.remove('active'));
            document.querySelector('[data-target="tab-lobby"]').classList.add('active');

            fetchUserMap().then(() => { 
                loadLeaderboard(); 
                loadOpponents(); 
                loadMatches('pending_to_me');
                loadOpenRequests();
                loadScheduledMatches(); 
                loadAnnouncements(); 
                setupNotifications(user.uid); 
                if(Notification.permission === "default") Notification.requestPermission();
            });
        } else { authScreen.style.display = 'flex'; mainApp.style.display = 'none'; listeners.forEach(u=>u()); }
    });

    // --- NAVİGASYON VE SEKMELER ---
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-target');
            
            tabSections.forEach(section => section.style.display = 'none');
            document.getElementById(targetId).style.display = 'block';
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            if (targetId === 'tab-fixture') { 
                setTodayFilters(); 
                loadMatches('all_matches'); 
            }
            else if (targetId === 'tab-matches') { 
                loadMatches(activeTabFilter); 
            }
            else if (targetId === 'tab-chat') { 
                loadChatList(); 
            }
            else if (targetId === 'tab-rankings') { 
                loadLeaderboard(); 
            }
            else if (targetId === 'tab-lobby') { 
                loadOpenRequests();
                loadScheduledMatches(); 
                loadAnnouncements(); 
            }
            else if (targetId === 'tab-profile') {
                const u = userMap[auth.currentUser.uid];
                if(u) {
                    document.getElementById('edit-full-name').value = u.isim || ''; 
                    document.getElementById('edit-phone-number').value = u.telefon || ''; 
                    document.getElementById('edit-court-preference').value = u.kortTercihi || 'Her İkisi'; 
                    if(editNotificationPreference) editNotificationPreference.value = u.bildirimTercihi || 'ses';
                    if(document.getElementById('edit-profile-preview')) document.getElementById('edit-profile-preview').src = u.fotoURL || 'https://via.placeholder.com/100';
                    
                    (async () => {
                       const stats = await calculatePlayerStats(auth.currentUser.uid);
                       const matchRate = stats.matchesPlayed > 0 ? ((stats.matchesWon / stats.matchesPlayed) * 100).toFixed(0) : 0;
                       const setRate = stats.setsPlayed > 0 ? ((stats.setsWon / stats.setsPlayed) * 100).toFixed(0) : 0;
                       const gameRate = stats.gamesPlayed > 0 ? ((stats.gamesWon / stats.gamesPlayed) * 100).toFixed(0) : 0;
    
                       document.getElementById('my-stats-points').textContent = u.toplamPuan;
                       document.getElementById('my-stats-matches').textContent = stats.matchesPlayed;
                       document.getElementById('my-stats-winrate').textContent = `%${matchRate}`;
                       document.getElementById('my-stats-setrate').textContent = `%${setRate}`;
                       document.getElementById('my-stats-gamerate').textContent = `%${gameRate}`;
                    })();
                }
            }
        });
    });

    if(toggleAuthModeBtn) toggleAuthModeBtn.addEventListener('click', ()=>{ isLoginMode=!isLoginMode; document.getElementById('register-fields').style.display=isLoginMode?'none':'block'; loginBtn.style.display=isLoginMode?'block':'none'; registerBtn.style.display=isLoginMode?'none':'block'; });
    if(userMatchListContainer) userMatchListContainer.addEventListener('click', e => { if (e.target.classList.contains('match-action-btn')) showMatchDetail(e.target.getAttribute('data-id')); });
    if(programListContainer) programListContainer.addEventListener('click', e => { if (e.target.classList.contains('match-action-btn')) showMatchDetail(e.target.getAttribute('data-id')); });
    if(matchTabs) matchTabs.addEventListener('click', e=>{ if(e.target.classList.contains('tab-btn')) loadMatches(e.target.getAttribute('data-status')); });
    if(requestPermissionBtn) requestPermissionBtn.addEventListener('click', requestNotificationPermission);
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
    if(loginBtn) loginBtn.addEventListener('click', ()=>{auth.signInWithEmailAndPassword(emailInput.value, passwordInput.value).catch(e=>authError.textContent=e.message)});
    if(registerBtn) registerBtn.addEventListener('click', async ()=>{ 
        try { const c = await auth.createUserWithEmailAndPassword(emailInput.value, passwordInput.value); 
        let url=null; if(profilePhotoInput.files[0]) url=await convertToBase64(profilePhotoInput.files[0]);
        await db.collection('users').doc(c.user.uid).set({email:emailInput.value, isim:fullNameInput.value, kortTercihi:courtPreferenceSelect.value, telefon:phoneNumberInput.value, fotoURL:url, toplamPuan:1000, bildirimTercihi:'ses', macSayisi:0, galibiyetSayisi:0, kayitTari:firebase.firestore.FieldValue.serverTimestamp()}); } catch(e){authError.textContent=e.message;} 
    });
    submitChallengeBtn.addEventListener('click', async ()=>{ 
        const oid=opponentSelect.value, mt=matchTypeSelect.value; let wp=parseInt(wagerPointsInput.value);
        if(!oid) return alert("Rakip seç!");
        if(mt==='Meydan Okuma' && (isNaN(wp)||wp<50||wp%50!==0)) return alert("Min 50 ve katları!");
        const me=userMap[auth.currentUser.uid], op=userMap[oid];
        if(mt==='Meydan Okuma' && (me.toplamPuan<0||op.toplamPuan<0||wp>me.toplamPuan*0.5||wp>op.toplamPuan*0.5)) return alert("Puan yetersiz.");
        await db.collection('matches').add({oyuncu1ID:auth.currentUser.uid, oyuncu2ID:oid, macTipi:mt, bahisPuani:wp||0, durum:'Bekliyor', tarih:firebase.firestore.FieldValue.serverTimestamp(), kayitliKazananID:null});
        alert("Teklif yollandı!"); challengeForm.style.display='none'; 
        document.querySelector('[data-target="tab-matches"]').click();
    });
    submitAdBtn.addEventListener('click', async () => {
        const mt = adMatchTypeSelect.value; 
        let wp = parseInt(adWagerPointsInput.value);
        if(mt === 'Meydan Okuma' && (isNaN(wp)||wp<50||wp%50!==0)) return alert("Min 50 ve katları!");
        const me = userMap[auth.currentUser.uid];
        if (mt === 'Meydan Okuma') {
            if (me.toplamPuan < 0) return alert("Puanın eksiye düştüğü için bahisli ilan açamazsın.");
            if (wp > me.toplamPuan * 0.5) return alert("Maksimum bahis toplam puanının yarısı olabilir.");
        }
        await db.collection('matches').add({
            oyuncu1ID: auth.currentUser.uid, 
            oyuncu2ID: null, 
            macTipi: mt, 
            bahisPuani: wp || 0, 
            durum: 'Acik_Ilan', 
            tarih: firebase.firestore.FieldValue.serverTimestamp(), 
            kayitliKazananID: null
        });
        alert("İlan yayınlandı!"); 
        createAdForm.style.display = 'none';
        loadOpenRequests(); 
        document.querySelector('[data-target="tab-lobby"]').click(); 
    });
    if(applyFiltersBtn) applyFiltersBtn.addEventListener('click', () => loadMatches('all_matches'));
    if(clearFiltersBtn) clearFiltersBtn.addEventListener('click', () => {
        filterDateStart.value = ''; filterDateEnd.value = ''; filterCourt.value = ''; filterPlayer.value = ''; if(filterStatus) filterStatus.value = '';
        loadMatches('all_matches');
    });
    if(logoutBtnProfile) logoutBtnProfile.addEventListener('click', ()=> {
        if(confirm("Çıkış yapmak istediğinize emin misiniz?")) {
            auth.signOut();
            window.location.reload(); 
        }
    });
    if (profilePhotoInput) {
        profilePhotoInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if(file) { const base64 = await convertToBase64(file); if(profilePreview) profilePreview.src = base64; }
        });
    }
    if (editProfilePhotoInput) {
        editProfilePhotoInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if(file) { const base64 = await convertToBase64(file); if(editProfilePreview) editProfilePreview.src = base64; }
        });
    }
});