const API_BASE = 'http://localhost:3000';



        /* ─── SPECIALISTS ─── */

        const SPECIALTIES = [

            { id: 'general', label: 'General Physician', dbKey: 'General Physician', icon: 'stethoscope', iconColor: '#1B6FEB', bg: '#EBF2FF', count: 2 },

            { id: 'cardiologist', label: 'Cardiologist', dbKey: 'Cardiologist', icon: 'heart-pulse', iconColor: '#EF4444', bg: '#FEE2E2', count: 2 },

            { id: 'pediatrics', label: 'Pediatrics', dbKey: 'Pediatrician', icon: 'baby', iconColor: '#10B981', bg: '#D1FAE5', count: 2 },

            { id: 'orthopedic', label: 'Orthopedic', dbKey: 'Orthopedic', icon: 'bone', iconColor: '#F59E0B', bg: '#FEF3C7', count: 2 },

            { id: 'gynecologist', label: 'Gynecologist', dbKey: 'Gynecologist', icon: 'activity', iconColor: '#EC4899', bg: '#FCE7F3', count: 2 },

            { id: 'dentist', label: 'Dentist', dbKey: 'Dentist', icon: 'smile', iconColor: '#0ABFBC', bg: '#E6F9F9', count: 10 },

            { id: 'pulmonology', label: 'Pulmonology', dbKey: 'Pulmonologist', icon: 'wind', iconColor: '#6366F1', bg: '#EEF2FF', count: 1 },

            { id: 'neurology', label: 'Neurology', dbKey: 'Neurologist', icon: 'brain', iconColor: '#7C3AED', bg: '#EDE9FE', count: 1 },

        ];



        const AVATAR_COLORS = {

            'Dentist': ['#FEF3C7', '#D97706'],

            'Pediatric Dentist': ['#FEF3C7', '#D97706'],

            'General Physician': ['#EBF2FF', '#1B6FEB'],

            'Cardiologist': ['#FEE2E2', '#EF4444'],

            'Orthopedic': ['#DBEAFE', '#3B82F6'],

            'Pediatrician': ['#D1FAE5', '#10B981'],

            'Gynecologist': ['#FCE7F3', '#EC4899'],

            'Pulmonologist': ['#E0F2FE', '#0ABFBC'],

            'Neurologist': ['#EDE9FE', '#7C3AED'],

        };



        /* ─── STATE ─── */

        let activeSpec = null;

        let currentDoctors = [];

        let currentDoctor = null;

        let bkDate = null, bkTime = null, bkType = 'In-Clinic';



        /* ─── CHAT STATE ─── */

        let chatHistory = [];



        /* ─────────────────────────────────────────────

           CHAT HELPER FUNCTIONS  (were missing before)

        ───────────────────────────────────────────── */



        /** Append an AI bubble (with a typing delay for realism) */

        function addAiMsg(text) {

            const msgs = document.getElementById('chatMessages');



            // Show typing indicator

            const typingId = 'typing-' + Date.now();

            const typingEl = document.createElement('div');

            typingEl.className = 'msg ai';

            typingEl.id = typingId;

            typingEl.innerHTML = `

                <div class="msg-avatar">🤖</div>

                <div class="typing-bubble">

                    <div class="typing-dot"></div>

                    <div class="typing-dot"></div>

                    <div class="typing-dot"></div>

                </div>`;

            msgs.appendChild(typingEl);

            msgs.scrollTop = msgs.scrollHeight;



            // Replace with real message after short delay

            setTimeout(() => {

                const el = document.getElementById(typingId);

                if (el) el.remove();



                const msgEl = document.createElement('div');

                msgEl.className = 'msg ai';

                msgEl.innerHTML = `

                    <div class="msg-avatar">🤖</div>

                    <div class="bubble">${text}</div>`;

                msgs.appendChild(msgEl);

                msgs.scrollTop = msgs.scrollHeight;

            }, 700);

        }



        /** Append a user bubble immediately */

        function addUserMsg(text) {

            const msgs = document.getElementById('chatMessages');

            const msgEl = document.createElement('div');

            msgEl.className = 'msg user';

            msgEl.innerHTML = `<div class="bubble">${text}</div>`;

            msgs.appendChild(msgEl);

            msgs.scrollTop = msgs.scrollHeight;

        }



        /**

         * Render quick-reply chips.

         * @param {string[]} options  - labels for each chip

         * @param {Function} [callback] - called with the chosen label; chips are removed after click

         */

        function setQuickReplies(options, callback) {

            const qr = document.getElementById('quickReplies');

            qr.innerHTML = '';

            options.forEach(label => {

                const btn = document.createElement('button');

                btn.className = 'qr';

                btn.textContent = label;

                btn.onclick = () => {

                    // Remove all chips so the user can't double-click

                    qr.innerHTML = '';

                    if (callback) callback(label);

                };

                qr.appendChild(btn);

            });

        }



        /** Close the chat overlay */

        function closeChat() {

            document.getElementById('chatOverlay').classList.remove('open');

            document.body.style.overflow = '';

            chatHistory = [];

        }



        /** Send a free-text message typed in the input box */

        function sendMsg() {

            const input = document.getElementById('chatInput');

            const text = input.value.trim();

            if (!text) return;

            input.value = '';

            addUserMsg(text);

            chatHistory.push({ role: 'user', text });



            // Simple fallback AI reply for free-text input

            setTimeout(() => {

                const reply = "Thanks for your message! For a more accurate assessment, please use the quick-reply options or book an appointment with the doctor.";

                addAiMsg(reply);

                chatHistory.push({ role: 'ai', text: reply });

            }, 800);

        }



        /** Handle the "Satisfied / Not Satisfied" buttons */

        function endConvo(type) {

            document.getElementById('quickReplies').innerHTML = '';

            if (type === 'satisfied') {

                addAiMsg("Great! I'm glad I could help. 😊 Would you like to book an appointment with " + (currentDoctor?.name || 'the doctor') + "?");

                setTimeout(() => {

                    setQuickReplies(['Book Appointment', 'No, thanks'], (choice) => {

                        if (choice === 'Book Appointment') {

                            closeChat();

                            openBooking(currentDoctor);

                        } else {

                            closeChat();

                        }

                    });

                }, 800);

            } else {

                addAiMsg("I'm sorry I couldn't fully help. Would you like to book an appointment so a real doctor can assist you?");

                setTimeout(() => {

                    setQuickReplies(['Book Appointment', 'Close'], (choice) => {

                        if (choice === 'Book Appointment') {

                            closeChat();

                            openBooking(currentDoctor);

                        } else {

                            closeChat();

                        }

                    });

                }, 800);

            }

        }



        /* ─── BUILD SPECIALTY GRID ─── */

        (function buildGrid() {

            const grid = document.getElementById('specGrid');

            SPECIALTIES.forEach(s => {

                const card = document.createElement('div');

                card.className = 'spec-card';

                card.dataset.id = s.id;

                card.innerHTML = `

                    <div class="spec-active-badge"></div>

                    <div class="spec-card-top"></div>

                    <div class="spec-card-icon" style="background:${s.bg}">

                        <i data-lucide="${s.icon}" style="color:${s.iconColor}"></i>

                    </div>

                    <div class="spec-card-body">

                        <div class="spec-name">${s.label}</div>

                        <div class="spec-count" id="cnt-${s.id}">${s.count} doctors</div>

                    </div>`;

                card.onclick = () => selectSpec(s);

                grid.appendChild(card);

            });

            lucide.createIcons();

        })();



        /* ─── SELECT SPECIALTY ─── */

        function selectSpec(spec) {

            document.querySelectorAll('.spec-card').forEach(c => {

                c.classList.remove('active');

                c.style.borderColor = '';

                const ic = c.querySelector('.spec-card-icon');

                if (ic) ic.style.borderColor = 'transparent';

            });

            const activeCard = document.querySelector(`.spec-card[data-id="${spec.id}"]`);

            if (activeCard) {

                activeCard.classList.add('active');

                activeCard.style.borderColor = spec.iconColor;

                activeCard.querySelector('.spec-card-icon').style.borderColor = spec.iconColor;

            }

            activeSpec = spec;



            document.getElementById('pillIcon').setAttribute('data-lucide', spec.icon);

            document.getElementById('pillLabel').textContent = spec.label + ' Specialists';

            document.getElementById('docSearchInput').value = '';

            document.getElementById('noDocResults').style.display = 'none';

            lucide.createIcons();



            const sec = document.getElementById('doctorsSection');

            sec.classList.remove('visible');

            void sec.offsetWidth;

            sec.classList.add('visible');



            if (window.innerWidth <= 900) {

                setTimeout(() => sec.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);

            }



            loadDoctors(spec);

        }



        /* ─── LOAD DOCTORS ─── */

        async function loadDoctors(spec) {

            document.getElementById('doctorGrid').innerHTML = skeletonCards(3);

            document.getElementById('pillCount').textContent = '';

            currentDoctors = [];



            try {

                const resp = await fetch(

                    `${API_BASE}/api/doctors?specialization=${encodeURIComponent(spec.dbKey)}`

                );

                if (!resp.ok) {

                    const errText = await resp.text();

                    throw new Error(`Server ${resp.status}: ${errText}`);

                }

                const doctors = await resp.json();

                if (!Array.isArray(doctors)) {

                    throw new Error('Backend returned unexpected format — expected array of doctors.');

                }

                currentDoctors = doctors;

                document.getElementById('pillCount').textContent = doctors.length;

                renderDoctors(doctors);

            } catch (err) {

                console.error('loadDoctors error:', err);

                document.getElementById('doctorGrid').innerHTML = `

                    <div style="text-align:center;padding:36px 20px;color:var(--muted)">

                        <div style="font-size:36px;margin-bottom:10px">⚠️</div>

                        <div style="font-size:14px;font-weight:700;color:var(--sub);margin-bottom:6px">Could not load doctors</div>

                        <div style="font-size:12.5px;line-height:1.6;margin-bottom:14px">${err.message}</div>

                        <button onclick="loadDoctors(activeSpec)"

                            style="padding:9px 20px;background:var(--blue);color:#fff;border:none;border-radius:30px;font-size:13px;font-weight:700;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif">

                            Try Again

                        </button>

                    </div>`;

                document.getElementById('pillCount').textContent = '0';

                showToast('⚠️ ' + err.message);

            }

        }



        /* ─── RENDER DOCTORS ─── */

        function renderDoctors(doctors) {

            const grid = document.getElementById('doctorGrid');

            grid.innerHTML = '';



            if (doctors.length === 0) {

                document.getElementById('noDocResults').style.display = 'block';

                return;

            }

            document.getElementById('noDocResults').style.display = 'none';



            doctors.forEach((doc, idx) => {

                const colors = AVATAR_COLORS[doc.specialization] || ['#EBF2FF', '#1B6FEB'];

                const initials = doc.name.replace('Dr. ', '').split(' ').map(w => w[0]).slice(0, 2).join('');

                const specInfo = SPECIALTIES.find(s =>

                    doc.specialization.toLowerCase().includes(s.dbKey.toLowerCase().split(' ')[0])

                    || s.dbKey.toLowerCase() === doc.specialization.toLowerCase()

                );

                const accentColor = specInfo ? specInfo.iconColor : '#1B6FEB';



                const card = document.createElement('div');

                card.className = 'doc-card';

                card.style.animationDelay = (idx * 60) + 'ms';

                card.innerHTML = `

                    <div class="doc-avatar" style="background:${colors[0]};border-color:${colors[0]}">

                        <span style="font-family:'Sora',sans-serif;font-size:18px;font-weight:800;color:${colors[1]}">${initials}</span>

                    </div>

                    <div class="doc-info">

                        <div class="doc-name">${doc.name}</div>

                        <div class="doc-spec" style="color:${accentColor}">${doc.specialization}</div>

                        <div class="doc-hospital">

                            <i data-lucide="building-2" style="width:12px;height:12px;color:var(--muted);flex-shrink:0"></i>

                            ${doc.hospital}

                        </div>

                        ${doc.phone && doc.phone !== 'Clinic Contact' ? `

                        <div class="doc-phone">

                            <i data-lucide="phone" style="width:12px;height:12px;color:var(--muted);flex-shrink:0"></i>

                            ${doc.phone}

                        </div>` : `

                        <div class="doc-phone">

                            <i data-lucide="phone-off" style="width:12px;height:12px;color:var(--muted);flex-shrink:0"></i>

                            <span style="color:var(--muted)">Contact clinic directly</span>

                        </div>`}

                    </div>

                    <div class="doc-actions">

                        <button class="btn-talk" style="background:linear-gradient(135deg,${accentColor},${accentColor}dd)"

                            onclick="openChat(${JSON.stringify(doc).replace(/"/g, '&quot;')})">

                            <i data-lucide="message-circle" style="width:13px;height:13px"></i>Talk to Doctor

                        </button>

                        <div style="display:flex;align-items:center;gap:5px">

                            <div class="avail-dot"></div>

                            <div class="avail-txt">Available Now</div>

                        </div>

                    </div>`;

                grid.appendChild(card);

            });

            lucide.createIcons();

        }



        /* ─── FILTER ─── */

        function filterDoctors() {

            const q = document.getElementById('docSearchInput').value.toLowerCase();

            if (!q) { renderDoctors(currentDoctors); return; }

            const filtered = currentDoctors.filter(d =>

                d.name.toLowerCase().includes(q) ||

                d.hospital.toLowerCase().includes(q) ||

                d.specialization.toLowerCase().includes(q)

            );

            renderDoctors(filtered);

        }



        /* ─── SKELETON ─── */

        function skeletonCards(n) {

            let html = '';

            for (let i = 0; i < n; i++) html += `

                <div class="doc-card" style="pointer-events:none;animation:none">

                    <div style="width:60px;height:60px;border-radius:18px;background:linear-gradient(90deg,#f0f4fa 25%,#e2e8f4 50%,#f0f4fa 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;flex-shrink:0"></div>

                    <div style="flex:1;display:flex;flex-direction:column;gap:8px">

                        <div style="height:16px;width:65%;background:linear-gradient(90deg,#f0f4fa 25%,#e2e8f4 50%,#f0f4fa 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;border-radius:6px"></div>

                        <div style="height:12px;width:45%;background:linear-gradient(90deg,#f0f4fa 25%,#e2e8f4 50%,#f0f4fa 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;border-radius:6px"></div>

                        <div style="height:12px;width:80%;background:linear-gradient(90deg,#f0f4fa 25%,#e2e8f4 50%,#f0f4fa 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;border-radius:6px"></div>

                    </div>

                </div>`;

            return `<style>@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}</style>` + html;

        }



        /* ─── OPEN CHAT ─── */

        function openChat(doc) {

            currentDoctor = doc;

            chatHistory = [];



            const colors = AVATAR_COLORS[doc.specialization] || ['#EBF2FF', '#1B6FEB'];

            const initials = doc.name.replace('Dr. ', '').split(' ').map(w => w[0]).slice(0, 2).join('');

            const avatarEl = document.getElementById('chatDocAvatar');

            avatarEl.style.background = colors[0];

            avatarEl.style.borderColor = colors[0];

            avatarEl.innerHTML = `<span style="font-family:'Sora',sans-serif;font-size:20px;font-weight:800;color:${colors[1]}">${initials}</span>`;



            document.getElementById('chatDocName').textContent = doc.name;

            document.getElementById('chatDocSpec').textContent = doc.specialization;



            const msgs = document.getElementById('chatMessages');

            msgs.innerHTML = '';

            document.getElementById('quickReplies').innerHTML = '';



            // Opening AI greeting

            const greeting = `Hi! I'm the AI assistant for ${doc.name} (${doc.specialization}). How can I help you today?`;

            addAiMsg(greeting);

            chatHistory.push({ role: 'ai', text: greeting });



            let step = 1;



            function nextStep(choice) {

                addUserMsg(choice);

                chatHistory.push({ role: 'user', text: choice });

                step++;



                if (step === 2) {

                    setTimeout(() => {

                        addAiMsg("Can you describe the type of symptom?");

                        setTimeout(() => setQuickReplies(['Sharp pain', 'Dull pain', 'Sensitivity', 'Swelling', 'Bleeding'], nextStep), 750);

                    }, 800);

                } else if (step === 3) {

                    setTimeout(() => {

                        addAiMsg("When did this start?");

                        setTimeout(() => setQuickReplies(['Started today', 'Few days', 'More than a week', 'Recurring', 'Not sure'], nextStep), 750);

                    }, 800);

                } else if (step === 4) {

                    setTimeout(() => {

                        addAiMsg("How would you rate the severity?");

                        setTimeout(() => setQuickReplies(['Mild', 'Moderate', 'Severe', 'Comes and goes', 'Getting worse'], nextStep), 750);

                    }, 800);

                } else if (step === 5) {

                    setTimeout(() => {

                        addAiMsg("Are there any specific triggers?");

                        setTimeout(() => setQuickReplies(['Pain while eating', 'Hot/cold trigger', 'Night pain', 'No trigger', 'Swelling present'], nextStep), 750);

                    }, 800);

                } else if (step === 6) {

                    setTimeout(() => {

                        addAiMsg("What would you like to know?");

                        setTimeout(() => setQuickReplies(['What should I do?', 'Need doctor?', 'Home remedies', 'Is this serious?'], nextStep), 750);

                    }, 800);

                } else if (step === 7) {

                    setTimeout(() => {

                        addAiMsg("Based on what you've shared, I have some suggestions. What would you like to do next?");

                        setTimeout(() => setQuickReplies(['Generate report', 'Book Appointment', 'Restart'], (c) => {

                            if (c === 'Book Appointment') { closeChat(); openBooking(currentDoctor); }

                            else if (c === 'Restart') { openChat(currentDoctor); }

                            else { nextStep(c); }

                        }), 750);

                    }, 800);

                } else {

                    setTimeout(() => {

                        const msg = "Thanks for sharing all details. Based on your symptoms, it seems like a manageable condition, but I recommend consulting a doctor if it persists.";

                        addAiMsg(msg);

                        chatHistory.push({ role: 'ai', text: msg });

                        setTimeout(() => setQuickReplies(['Book Appointment', 'Start new consultation'], (c) => {

                            if (c === 'Book Appointment') { closeChat(); openBooking(currentDoctor); }

                            else { openChat(currentDoctor); }

                        }), 750);

                    }, 800);

                }

            }



            // STEP 1 — shown after the greeting animation finishes

            setTimeout(() => {

                setQuickReplies(['I have pain', 'Routine check-up', 'Treatment inquiry', 'Other concern'], nextStep);

            }, 900);



            document.getElementById('chatOverlay').classList.add('open');

            document.body.style.overflow = 'hidden';

        }



        /* ─── BOOKING MODAL ─── */

        function openBooking(doc) {

            currentDoctor = doc || currentDoctor;

            bkDate = null; bkTime = null; bkType = 'In-Clinic';



            document.getElementById('bkDocLabel').textContent = (currentDoctor?.name || '—') + ' · ' + (currentDoctor?.specialization || '');

            document.getElementById('bookingForm').style.display = 'block';

            document.getElementById('successScreen').classList.remove('show');

            document.getElementById('btnConfirm').disabled = true;

            document.getElementById('summaryWrap').style.display = 'none';

            document.getElementById('bkNote').value = '';



            buildDatePicker();

            buildTimePicker();



            document.getElementById('bookingOverlay').classList.add('open');

            document.body.style.overflow = 'hidden';

        }



        function closeBooking() {

            document.getElementById('bookingOverlay').classList.remove('open');

            document.body.style.overflow = '';

        }



        function buildDatePicker() {

            const grid = document.getElementById('dateGrid');

            grid.innerHTML = '';

            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            const today = new Date();



            for (let i = 0; i < 8; i++) {

                const d = new Date(today);

                d.setDate(today.getDate() + i);

                const tile = document.createElement('div');

                tile.className = 'date-tile';

                tile.innerHTML = `<div class="date-day">${days[d.getDay()]}</div><div class="date-num">${d.getDate()}</div><div style="font-size:9px;color:var(--muted);margin-top:1px">${months[d.getMonth()]}</div>`;

                tile.onclick = () => {

                    document.querySelectorAll('.date-tile').forEach(t => t.classList.remove('selected'));

                    tile.classList.add('selected');

                    bkDate = `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;

                    updateSummary();

                };

                grid.appendChild(tile);

            }

        }



        function buildTimePicker() {

            const slots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '05:00 PM'];

            const busy = ['09:30 AM', '11:00 AM', '03:00 PM'];

            const grid = document.getElementById('timeGrid');

            grid.innerHTML = '';

            slots.forEach(s => {

                const tile = document.createElement('div');

                tile.className = 'time-slot' + (busy.includes(s) ? ' busy' : '');

                tile.textContent = s;

                if (!busy.includes(s)) {

                    tile.onclick = () => {

                        document.querySelectorAll('.time-slot:not(.busy)').forEach(t => t.classList.remove('selected'));

                        tile.classList.add('selected');

                        bkTime = s;

                        updateSummary();

                    };

                }

                grid.appendChild(tile);

            });

        }



        function selType(type, el) {

            document.querySelectorAll('.type-pill').forEach(p => p.classList.remove('selected'));

            el.classList.add('selected');

            bkType = type;

            updateSummary();

        }



        function updateSummary() {

            if (bkDate && bkTime) {

                document.getElementById('summaryWrap').style.display = 'block';

                document.getElementById('sumDoc').textContent = currentDoctor?.name || '—';

                document.getElementById('sumDate').textContent = bkDate;

                document.getElementById('sumTime').textContent = bkTime;

                document.getElementById('sumType').textContent = bkType;

                document.getElementById('btnConfirm').disabled = false;

            }

        }



        async function confirmBooking() {

            const btn = document.getElementById('btnConfirm');

            btn.disabled = true;

            btn.innerHTML = '<i data-lucide="loader" style="width:18px;height:18px;animation:spin 1s linear infinite"></i> Confirming…';

            lucide.createIcons();

            await sleep(1200);

            showConfirmed(genRef());

        }



        function showConfirmed(ref) {

            document.getElementById('bookingForm').style.display = 'none';

            const suc = document.getElementById('successScreen');

            suc.classList.add('show');

            document.getElementById('bookingRef').textContent = ref;

            document.getElementById('successDetails').innerHTML = `

                <div class="sdet-row">

                    <div class="sdet-ic" style="background:var(--blue-light)"><i data-lucide="user" style="width:14px;height:14px;color:var(--blue)"></i></div>

                    <div><div class="sdet-label">Doctor</div><div class="sdet-val">${currentDoctor?.name}</div></div>

                </div>

                <div class="sdet-row">

                    <div class="sdet-ic" style="background:var(--green-light)"><i data-lucide="calendar" style="width:14px;height:14px;color:var(--green)"></i></div>

                    <div><div class="sdet-label">Date &amp; Time</div><div class="sdet-val">${bkDate} · ${bkTime}</div></div>

                </div>

                <div class="sdet-row">

                    <div class="sdet-ic" style="background:var(--purple-light)"><i data-lucide="building-2" style="width:14px;height:14px;color:var(--purple)"></i></div>

                    <div><div class="sdet-label">Hospital</div><div class="sdet-val">${currentDoctor?.hospital}</div></div>

                </div>

                <div class="sdet-row">

                    <div class="sdet-ic" style="background:var(--amber-light)"><i data-lucide="video" style="width:14px;height:14px;color:var(--amber)"></i></div>

                    <div><div class="sdet-label">Visit Type</div><div class="sdet-val">${bkType}</div></div>

                </div>`;

            lucide.createIcons();

        }



        function genRef() {

            return 'HP-' + Math.random().toString(36).slice(2, 8).toUpperCase();

        }



        /* ─── UTILS ─── */

        function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }



        function showToast(msg) {

            const t = document.getElementById('toast');

            t.textContent = msg;

            t.classList.add('show');

            setTimeout(() => t.classList.remove('show'), 3200);

        }



        /* ─── SIDEBAR ─── */

        lucide.createIcons();

        const sidebarEl = document.getElementById('sidebar');

        const overlayEl = document.getElementById('overlay');



        document.getElementById('hamBtn').addEventListener('click', () => {

            sidebarEl.classList.add('open');

            overlayEl.classList.add('show');

            document.body.style.overflow = 'hidden';

        });



        overlayEl.addEventListener('click', () => {

            sidebarEl.classList.remove('open');

            overlayEl.classList.remove('show');

            document.body.style.overflow = '';

        });



        document.querySelectorAll('.nav-item').forEach(el => el.addEventListener('click', () => {

            if (window.innerWidth <= 900) {

                sidebarEl.classList.remove('open');

                overlayEl.classList.remove('show');

                document.body.style.overflow = '';

            }

        }));



        document.querySelectorAll('.bn-item').forEach(el => el.addEventListener('click', function () {

            document.querySelectorAll('.bn-item').forEach(i => i.classList.remove('active'));

            this.classList.add('active');

        }));



        // Close modals on backdrop click

        document.getElementById('chatOverlay').addEventListener('click', e => {

            if (e.target === document.getElementById('chatOverlay')) closeChat();

        });

        document.getElementById('bookingOverlay').addEventListener('click', e => {

            if (e.target === document.getElementById('bookingOverlay')) closeBooking();

        });

    