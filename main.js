document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. DATA DE COMPONENTES Y MATERIALES
    // ==========================================
    const materialsData = {
        micelio: {
            title: "Micelio de Hongo",
            type: "Aglutinante Natural Vivo",
            badge: "Estructura Orgánica",
            desc: "El micelio es la red vegetativa subterránea de los hongos (Pleurotus ostreatus). Durante la incubación, el micelio consume el sustrato orgánico y entrelaza las fibras en una red sólida y moldeada sin requerir pega química ni calor excesivo.",
            image: "xiupack2.jpeg",
            points: [
                "Aglutinado tridimensional microscópico",
                "Sustituye adhesivos sintéticos y resinas tóxicas",
                "Se descompone como materia orgánica en el compost"
            ]
        },
        aserrin: {
            title: "Aserrín Orgánico",
            type: "Base Principal de Densidad",
            badge: "Sustrato de Madera",
            desc: "Obtenido de madereras locales con manejo sustentable. El aserrín le otorga consistencia, rigidez estructural y la densidad necesaria para soportar objetos pesados como productos de cerámica o tecnología.",
            image: "aserrin.jpg",
            points: [
                "Base principal del volumen de empaque",
                "Aporta resistencia a la compresión (≥ 50 kPa)",
                "Residuo industrial valorizado en economía circular"
            ]
        },
        paja: {
            title: "Paja & Fibra Agrícola",
            type: "Ligereza y Flexibilidad",
            badge: "Fibra Vegetal",
            desc: "Las fibras de paja aportan elasticidad al cuerpo del molde, previniendo resquebrajamientos o grietas cuando el paquete sufre impactos de caída durante el transporte express.",
            image: "paja.jpg",
            points: [
                "Reduce el peso total del empaque para envíos",
                "Capacidad de amortiguación de caídas mecánicas",
                "Procedencia agrícola 100% renovable"
            ]
        },
        cascarilla: {
            title: "Cascarilla de Arroz",
            type: "Textura & Aislamiento Térmico",
            badge: "Protección Térmica",
            desc: "La cascarilla de arroz es rica en sílice natural. Aporta propiedades refractarias y de aislamiento térmico, además de mejorar la textura final del acabado al tacto del consumidor.",
            image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80",
            points: [
                "Aislamiento térmico frente a cambios de temperatura",
                "Acabado estético y suave al tacto de lujo",
                "Resistencia hidrófoba contra humedad ligera"
            ]
        }
    };

    // ==========================================
    // 2. INTERACCIÓN DE PESTAÑAS DE MATERIALES
    // ==========================================
    const materialCards = document.querySelectorAll('.comp-card');
    const matTitle = document.getElementById('matTitle');
    const matType = document.getElementById('matType');
    const matBadge = document.getElementById('matBadge');
    const matDesc = document.getElementById('matDesc');
    const matImage = document.getElementById('matImage');
    const matList = document.getElementById('matList');

    materialCards.forEach(card => {
        card.addEventListener('click', () => {
            const key = card.getAttribute('data-mat');
            const data = materialsData[key];

            materialCards.forEach(c => c.classList.remove('active', 'border-primary-orange'));
            card.classList.add('active', 'border-primary-orange');

            if (data) {
                if (matTitle) matTitle.textContent = data.title;
                if (matType) matType.textContent = data.type;
                if (matBadge) matBadge.textContent = data.badge;
                if (matDesc) matDesc.textContent = data.desc;
                if (matImage) matImage.src = data.image;

                if (matList) {
                    matList.innerHTML = data.points.map(p => `
                        <li class="flex items-center gap-2">
                            <i class="fa-solid fa-circle-check text-primary-orange"></i> ${p}
                        </li>
                    `).join('');
                }
            }
        });
    });

    // ==========================================
    // CATÁLOGO DE COSTALES Y FACTORES AMBIENTALES
    // ==========================================
    // Precios de ejemplo: cámbialos por los reales (deben coincidir con el HTML)
    const COSTALES = {
        25: { title: 'Costal de Relleno Micelial 25 kg', price: 349.00 },
        45: { title: 'Costal de Relleno Micelial 45 kg', price: 599.00 },
        50: { title: 'Costal de Relleno Micelial 50 kg', price: 649.00 }
    };

    // Factores por cada kg de relleno XIUPACK (ajústalos con tus datos reales)
    const FACTORES = {
        desechoPorKg: 0.05,  // kg de unicel/plástico evitado
        co2PorKg: 0.155      // kg CO₂e evitado
    };

    const fmtKg = (n) => n.toLocaleString('es-MX', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

    // ==========================================
    // 3. SISTEMA DEL CARRITO DE COMPRAS
    // ==========================================
    let cart = [];
    const cartBtn = document.getElementById('cartBtn');
    const cartModal = document.getElementById('cartModal');
    const cartContainer = document.getElementById('cartContainer');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const cartCount = document.getElementById('cartCount');
    const cartItemsList = document.getElementById('cartItemsList');
    const emptyCartMsg = document.getElementById('emptyCartMsg');
    const cartTotal = document.getElementById('cartTotal');
    const cartWaste = document.getElementById('cartWaste');

    function toggleCart(show) {
        if (!cartModal || !cartContainer) return;
        if (show) {
            cartModal.classList.remove('opacity-0', 'pointer-events-none');
            cartContainer.classList.remove('translate-x-full');
            prefillCheckout();
        } else {
            cartModal.classList.add('opacity-0', 'pointer-events-none');
            cartContainer.classList.add('translate-x-full');
        }
    }

    if (cartBtn) cartBtn.addEventListener('click', () => toggleCart(true));
    if (closeCartBtn) closeCartBtn.addEventListener('click', () => toggleCart(false));
    if (cartModal) {
        cartModal.addEventListener('click', (e) => {
            if (e.target === cartModal) toggleCart(false);
        });
    }

    // kg = peso del costal; sirve para calcular el desecho ahorrado del pedido
    window.addToCart = function(title, price, kg = 0, qty = 1) {
        const existing = cart.find(item => item.title === title);
        if (existing) {
            existing.qty += qty;
        } else {
            cart.push({ title, price, kg, qty });
        }
        updateCartUI();
        showToast(`¡"${title}" agregado al carrito!`);
    };

    function updateCartUI() {
        const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const totalKg = cart.reduce((sum, item) => sum + (item.kg * item.qty), 0);

        if (cartCount) cartCount.textContent = totalItems;
        if (cartTotal) cartTotal.textContent = `$${totalPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`;
        if (cartWaste) cartWaste.textContent = `${fmtKg(totalKg * FACTORES.desechoPorKg)} kg`;

        if (!cartItemsList) return;

        if (cart.length === 0) {
            if (emptyCartMsg) emptyCartMsg.style.display = 'block';
            cartItemsList.innerHTML = '';
            if (emptyCartMsg) cartItemsList.appendChild(emptyCartMsg);
        } else {
            if (emptyCartMsg) emptyCartMsg.style.display = 'none';
            cartItemsList.innerHTML = cart.map((item, idx) => `
                <div class="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div>
                        <h4 class="font-bold text-dark-green text-xs">${item.title}</h4>
                        <span class="text-[11px] text-gray-500">$${item.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN c/u</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-xs font-bold text-primary-orange">x${item.qty}</span>
                        <button onclick="removeFromCart(${idx})" class="text-gray-400 hover:text-red-500 text-xs ml-2">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }

    window.removeFromCart = function(index) {
        cart.splice(index, 1);
        updateCartUI();
    };

    // Envía el pedido por WhatsApp (requiere nombre y aceptar el aviso de privacidad)
    window.checkout = function() {
        if (cart.length === 0) {
            showToast("Tu carrito está vacío.");
            return;
        }

        const nameInput = document.getElementById('customerName');
        const privacyCheck = document.getElementById('privacyCheck');
        const name = nameInput ? nameInput.value.trim() : '';

        if (!name) {
            showToast("Escribe tu nombre para enviar el pedido.");
            if (nameInput) nameInput.focus();
            return;
        }
        const val = (id) => {
            const el = document.getElementById(id);
            return el ? el.value.trim() : '';
        };
        const street = val('addrStreet');
        const colonia = val('addrColonia');
        const zip = val('addrZip');
        const city = val('addrCity');
        const refs = val('addrRefs');

        const required = [
            [street, 'addrStreet', 'Escribe tu calle y número.'],
            [colonia, 'addrColonia', 'Escribe tu colonia.'],
            [/^\d{5}$/.test(zip) ? zip : '', 'addrZip', 'Escribe un código postal de 5 dígitos.'],
            [city, 'addrCity', 'Escribe tu ciudad y estado.']
        ];
        for (const [value, id, message] of required) {
            if (!value) {
                showToast(message);
                const el = document.getElementById(id);
                if (el) el.focus();
                return;
            }
        }

        if (!privacyCheck || !privacyCheck.checked) {
            showToast("Debes aceptar el Aviso de Privacidad para continuar.");
            return;
        }

        const fmtMoney = (n) => n.toLocaleString('es-MX', { minimumFractionDigits: 2 });
        const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
        const ahorro = cart.reduce((s, i) => s + i.kg * i.qty, 0) * FACTORES.desechoPorKg;
        const lines = cart.map(i => `• ${i.qty} x ${i.title} — $${fmtMoney(i.price * i.qty)} MXN`);

        const msg = [
            `Hola, soy ${name}. Quiero hacer este pedido de XIUPACK:`,
            '',
            ...lines,
            '',
            `Total: $${fmtMoney(total)} MXN`,
            `Desecho no reciclable que evitaría: ${fmtKg(ahorro)} kg`,
            '',
            'Dirección de entrega:',
            street,
            `Col. ${colonia}, C.P. ${zip}`,
            city,
            ...(refs ? [`Referencias: ${refs}`] : []),
            '',
            'Acepto el Aviso de Privacidad. ¿Me confirman disponibilidad, envío y forma de pago?'
        ].join('\n');

        window.open(`https://wa.me/${whatsappNum}?text=${encodeURIComponent(msg)}`, '_blank');

        onOrderSent({
            address: { street, colonia, zip, city, refs },
            items: cart.map(i => ({ title: i.title, qty: i.qty, price: i.price })),
            total
        });

        showToast("Abriendo WhatsApp con tu pedido...");
        cart = [];
        updateCartUI();
        resetCheckoutFields();
        privacyCheck.checked = false;
        toggleCart(false);
    };

    // Aviso de privacidad
    const privacyModal = document.getElementById('privacyModal');
    const closePrivacyBtn = document.getElementById('closePrivacyBtn');
    const btnPrivacyClose = document.getElementById('btnPrivacyClose');

    window.openPrivacy = function() {
        if (privacyModal) privacyModal.classList.remove('opacity-0', 'pointer-events-none');
    };
    function closePrivacy() {
        if (privacyModal) privacyModal.classList.add('opacity-0', 'pointer-events-none');
    }
    if (closePrivacyBtn) closePrivacyBtn.addEventListener('click', closePrivacy);
    if (btnPrivacyClose) btnPrivacyClose.addEventListener('click', closePrivacy);
    if (privacyModal) privacyModal.addEventListener('click', (e) => { if (e.target === privacyModal) closePrivacy(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePrivacy(); });

    // ==========================================
    // 4. FILTRADO Y BÚSQUEDA ÚNICA DE PRODUCTOS
    // ==========================================
    const productCards = document.querySelectorAll('.product-card');
    const searchInput = document.getElementById('searchInput');
    const searchCategory = document.getElementById('searchCategory');
    const searchBtn = document.getElementById('searchBtn');
    const visibleCount = document.getElementById('visibleCount');

    function filterProducts() {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const selectCat = searchCategory ? searchCategory.value : 'all';
        let count = 0;

        productCards.forEach(card => {
            const cardCategories = (card.getAttribute('data-category') || '').toLowerCase().split(' ');
            const text = card.textContent.toLowerCase();

            // Evalúa el selector del header único
            const matchesSelectCat = (selectCat === 'all') || cardCategories.includes(selectCat);

            // Evalúa el texto escrito
            const matchesSearch = text.includes(query);

            if (matchesSelectCat && matchesSearch) {
                card.style.display = 'flex';
                count++;
            } else {
                card.style.display = 'none';
            }
        });

        if (visibleCount) visibleCount.textContent = count;
    }

    // Eventos para la barra de búsqueda y selector principal
    if (searchBtn) searchBtn.addEventListener('click', filterProducts);
    if (searchInput) searchInput.addEventListener('input', filterProducts);
    if (searchCategory) searchCategory.addEventListener('change', filterProducts);

    // Ejecución inicial
    filterProducts();

    // ==========================================
    // 5. CALCULADORA DE DESECHO AHORRADO
    // ==========================================
    const calcSize = document.getElementById('calcSize');
    const calcQty = document.getElementById('calcQty');
    const calcMinus = document.getElementById('calcMinus');
    const calcPlus = document.getElementById('calcPlus');
    const calcAddBtn = document.getElementById('calcAddBtn');
    const calcWaste = document.getElementById('calcWaste');
    const calcCO2 = document.getElementById('calcCO2');
    const calcCompost = document.getElementById('calcCompost');

    function getCalcQty() {
        const q = parseInt(calcQty ? calcQty.value : '1', 10);
        return Number.isFinite(q) && q > 0 ? q : 0;
    }

    function updateCalculator() {
        if (!calcSize) return;
        const kgPorCostal = parseInt(calcSize.value, 10);
        const totalKg = kgPorCostal * getCalcQty();

        if (calcWaste) calcWaste.textContent = `${fmtKg(totalKg * FACTORES.desechoPorKg)} kg`;
        if (calcCO2) calcCO2.textContent = `${fmtKg(totalKg * FACTORES.co2PorKg)} kg`;
        if (calcCompost) calcCompost.textContent = `${fmtKg(totalKg)} kg`;
    }

    if (calcSize) calcSize.addEventListener('change', updateCalculator);
    if (calcQty) calcQty.addEventListener('input', updateCalculator);
    if (calcMinus) calcMinus.addEventListener('click', () => {
        calcQty.value = Math.max(1, getCalcQty() - 1);
        updateCalculator();
    });
    if (calcPlus) calcPlus.addEventListener('click', () => {
        calcQty.value = getCalcQty() + 1;
        updateCalculator();
    });
    if (calcAddBtn) calcAddBtn.addEventListener('click', () => {
        const qty = getCalcQty();
        if (qty < 1) {
            showToast("Ingresa una cantidad válida de costales.");
            return;
        }
        const kg = parseInt(calcSize.value, 10);
        window.addToCart(COSTALES[kg].title, COSTALES[kg].price, kg, qty);
    });

    updateCalculator();

    // ==========================================
    // 6. NOTIFICACIONES TOAST Y BOTONES CTA
    // ==========================================
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');

    function showToast(msg) {
        if (!toast || !toastMsg) return;
        toastMsg.textContent = msg;
        toast.classList.remove('toast-enter');
        toast.classList.add('toast-active');
        setTimeout(() => {
            toast.classList.remove('toast-active');
            toast.classList.add('toast-enter');
        }, 3000);
    }

    const btnRequestSamples = document.getElementById('btnRequestSamples');
    if (btnRequestSamples) {
        btnRequestSamples.addEventListener('click', () => {
            showToast("Muestras gratuitas solicitadas. Un asesor se comunicará pronto.");
        });
    }

    // ==========================================
    // 7. INTEGRACIÓN WHATSAPP
    // ==========================================
    const whatsappNum = '5219982460228';
    const whatsappDefaultMsg = encodeURIComponent('Hola, me interesa conocer más sobre los empaques biodegradables de XIUPACK. Me gustaría recibir información sobre sus productos y cotizaciones.');
    
    window.openWhatsApp = function() {
        const url = `https://wa.me/${whatsappNum}?text=${whatsappDefaultMsg}`;
        window.open(url, '_blank');
    };

    // ==========================================
    // 8. CUENTAS (Supabase)
    // ==========================================
    const SUPABASE_URL = 'https://pisxpkjzsnspmpcmixxc.supabase.co';
    // Clave "publishable": es pública por diseño; la seguridad la dan las reglas RLS de la base de datos.
    // NUNCA pongas aquí la "secret key" ni la "service_role".
    const SUPABASE_KEY = 'sb_publishable_3q8cLLW_ZNzRm8wM71Sceg_ytAT5muw';

    const sb = (window.supabase && window.supabase.createClient)
        ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
        : null;

    const SERVICE_DOWN = 'El servicio de cuentas no está disponible en este momento. Inténtalo más tarde.';
    let currentUser = null; // { id, email, name, address }

    const $ = (id) => document.getElementById(id);
    const escapeHtml = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function getCurrentUser() { return currentUser; }
    const displayName = (u) => (u.name && u.name.trim()) || u.email.split('@')[0];

    function setFieldError(id, msg) {
        const el = $(id);
        if (!el) return;
        el.textContent = msg || '';
        el.classList.toggle('hidden', !msg);
    }
    function setFieldInfo(id, msg) { setFieldError(id, msg); }

    function authErrorMessage(error) {
        const m = ((error && error.message) || '').toLowerCase();
        if (m.includes('invalid login credentials')) return 'Correo o contraseña incorrectos.';
        if (m.includes('email not confirmed')) return 'Confirma tu correo (revisa tu bandeja de entrada) antes de iniciar sesión.';
        if (m.includes('already registered')) return 'Ya existe una cuenta con ese correo. Inicia sesión.';
        if (m.includes('rate limit') || (error && error.status === 429)) return 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.';
        if (m.includes('password')) return 'La contraseña no cumple los requisitos (mínimo 8 caracteres).';
        if (m.includes('fetch') || m.includes('network')) return 'No hay conexión con el servicio de cuentas. Revisa tu internet.';
        return 'No se pudo completar la operación. Inténtalo de nuevo.';
    }

    // ---------- Interfaz ----------
    function updateAccountUI() {
        const user = getCurrentUser();
        const greeting = $('accountGreeting');
        if (greeting) greeting.textContent = user ? `Hola, ${displayName(user).split(' ')[0]}` : 'Hola, Inicia sesión';

        const saveWrap = $('saveAddrWrap');
        const hint = $('cartLoginHint');
        if (saveWrap) saveWrap.classList.toggle('hidden', !user);
        if (hint) hint.classList.toggle('hidden', !!user);
    }

    function toggleModal(id, show) {
        const m = $(id);
        if (!m) return;
        m.classList.toggle('opacity-0', !show);
        m.classList.toggle('pointer-events-none', !show);
    }

    function setAuthTab(tab) {
        const isRegister = tab !== 'login';
        const reg = $('registerForm'), log = $('loginForm');
        if (reg) reg.classList.toggle('hidden', !isRegister);
        if (log) log.classList.toggle('hidden', isRegister);
        if ($('authTitle')) $('authTitle').textContent = isRegister ? 'Crea tu cuenta' : 'Inicia sesión';
        const on = ['bg-white', 'shadow', 'text-dark-green'];
        const off = ['text-gray-500'];
        [['tabRegister', isRegister], ['tabLogin', !isRegister]].forEach(([id, active]) => {
            const b = $(id);
            if (!b) return;
            on.forEach(c => b.classList.toggle(c, active));
            off.forEach(c => b.classList.toggle(c, !active));
        });
        setFieldError('regError', '');
        setFieldInfo('regInfo', '');
        setFieldError('loginError', '');
    }

    window.openAuth = function(tab = 'register') {
        if (!sb) { showToast(SERVICE_DOWN); return; }
        setAuthTab(tab);
        toggleModal('authModal', true);
    };

    function renderOrders(orders) {
        const box = $('accountOrders');
        if (!box) return;
        if (!orders || orders.length === 0) {
            box.innerHTML = '<p class="text-gray-500">Aún no tienes pedidos enviados.</p>';
            return;
        }
        box.innerHTML = orders.map(o => {
            const date = new Date(o.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
            const items = (o.items || []).map(i => `${Number(i.qty)} x ${escapeHtml(i.title)}`).join('<br>');
            const total = Number(o.total).toLocaleString('es-MX', { minimumFractionDigits: 2 });
            return `<div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div class="flex justify-between font-bold text-dark-green"><span>${date}</span><span>$${total} MXN</span></div>
                <div class="text-gray-600 mt-1">${items}</div>
            </div>`;
        }).join('');
    }

    async function openAccount() {
        const user = getCurrentUser();
        if (!user) { window.openAuth('register'); return; }
        $('acName').textContent = displayName(user);
        $('acEmail').textContent = user.email;
        const a = user.address || {};
        $('acStreet').value = a.street || '';
        $('acColonia').value = a.colonia || '';
        $('acZip').value = a.zip || '';
        $('acCity').value = a.city || '';
        $('acRefs').value = a.refs || '';
        setFieldError('acError', '');
        $('accountOrders').innerHTML = '<p class="text-gray-500">Cargando pedidos...</p>';
        toggleModal('accountModal', true);

        try {
            const { data, error } = await sb.from('orders').select('items, total, created_at').order('created_at', { ascending: false }).limit(20);
            if (error) throw error;
            renderOrders(data);
        } catch (err) {
            $('accountOrders').innerHTML = '<p class="text-red-600">No se pudieron cargar tus pedidos. Inténtalo más tarde.</p>';
        }
    }

    // ---------- Datos del pedido (prellenado) ----------
    function prefillCheckout() {
        updateAccountUI();
        const user = getCurrentUser();
        if (!user) return;
        const fill = (id, value) => { const el = $(id); if (el && !el.value && value) el.value = value; };
        fill('customerName', user.name);
        const a = user.address || {};
        fill('addrStreet', a.street);
        fill('addrColonia', a.colonia);
        fill('addrZip', a.zip);
        fill('addrCity', a.city);
        fill('addrRefs', a.refs);
    }

    function resetCheckoutFields() {
        ['customerName', 'addrStreet', 'addrColonia', 'addrZip', 'addrCity', 'addrRefs'].forEach(id => {
            const el = $(id);
            if (el) el.value = '';
        });
        prefillCheckout();
    }

    // ---------- Sesión y perfil ----------
    async function refreshUser(session) {
        if (!session || !session.user) {
            currentUser = null;
        } else {
            const u = session.user;
            currentUser = { id: u.id, email: u.email || '', name: (u.user_metadata && u.user_metadata.name) || '', address: null };
            updateAccountUI();
            try {
                const { data } = await sb.from('profiles').select('name, street, colonia, zip, city, refs').eq('id', u.id).maybeSingle();
                if (data && currentUser && currentUser.id === u.id) {
                    if (data.name) currentUser.name = data.name;
                    if (data.street) currentUser.address = { street: data.street, colonia: data.colonia || '', zip: data.zip || '', city: data.city || '', refs: data.refs || '' };
                }
            } catch (err) { /* se queda con los datos de la sesión */ }

            // Si el perfil aún no tiene dirección, usa la que se capturó al crear la cuenta
            const meta = u.user_metadata || {};
            if (currentUser && currentUser.id === u.id && !currentUser.address && meta.street) {
                currentUser.address = { street: meta.street, colonia: meta.colonia || '', zip: meta.zip || '', city: meta.city || '', refs: meta.refs || '' };
            }
        }
        updateAccountUI();
        prefillCheckout();
    }

    // Se llama al enviar un pedido por WhatsApp: lo guarda en la cuenta
    async function onOrderSent(order) {
        const user = getCurrentUser();
        if (!sb || !user) return;
        try {
            const { error } = await sb.from('orders').insert({ user_id: user.id, items: order.items, total: order.total });
            if (error) throw error;

            const saveCheck = $('saveAddrCheck');
            if (saveCheck && saveCheck.checked) {
                const a = order.address;
                const { error: e2 } = await sb.from('profiles')
                    .update({ street: a.street, colonia: a.colonia, zip: a.zip, city: a.city, refs: a.refs || null })
                    .eq('id', user.id);
                if (e2) throw e2;
                user.address = a;
                prefillCheckout();
            }
        } catch (err) {
            setTimeout(() => showToast('Tu pedido se envió, pero no pudimos guardarlo en tu cuenta.'), 3300);
        }
    }

    // ---------- Crear cuenta ----------
    async function handleRegister(e) {
        e.preventDefault();
        if (!sb) return setFieldError('regError', SERVICE_DOWN);
        setFieldError('regError', '');
        setFieldInfo('regInfo', '');

        const name = $('regName').value.trim();
        const email = $('regEmail').value.trim().toLowerCase();
        const password = $('regPassword').value;
        const street = $('regStreet').value.trim();
        const colonia = $('regColonia').value.trim();
        const zip = $('regZip').value.trim();
        const city = $('regCity').value.trim();
        const refs = $('regRefs').value.trim();

        if (name.length < 2) return setFieldError('regError', 'Escribe tu nombre.');
        if (!EMAIL_RE.test(email)) return setFieldError('regError', 'Escribe un correo válido.');
        if (password.length < 8) return setFieldError('regError', 'La contraseña debe tener al menos 8 caracteres.');
        if (!street) return setFieldError('regError', 'Escribe tu calle y número.');
        if (!colonia) return setFieldError('regError', 'Escribe tu colonia.');
        if (!/^\d{5}$/.test(zip)) return setFieldError('regError', 'Escribe un código postal de 5 dígitos.');
        if (!city) return setFieldError('regError', 'Escribe tu ciudad y estado.');
        if (!$('regPrivacy').checked) return setFieldError('regError', 'Debes aceptar el Aviso de Privacidad.');

        const btn = $('registerForm').querySelector('button[type=submit]');
        btn.disabled = true;
        try {
            const options = { data: { name, street, colonia, zip, city, refs } };
            if (/^https?:$/.test(location.protocol)) options.emailRedirectTo = location.origin + location.pathname;

            const { data, error } = await sb.auth.signUp({ email, password, options });
            if (error) return setFieldError('regError', authErrorMessage(error));

            // Correo ya registrado (Supabase no lo avisa como error por seguridad)
            if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
                setAuthTab('login');
                $('loginEmail').value = email;
                return setFieldError('loginError', 'Ya existe una cuenta con ese correo. Inicia sesión.');
            }

            $('registerForm').reset();
            if (!data.session) {
                // Confirmación de correo activada
                return setFieldInfo('regInfo', `Te enviamos un correo a ${email}. Ábrelo y confirma tu cuenta para iniciar sesión.`);
            }
            toggleModal('authModal', false);
            showToast(`¡Cuenta creada! Bienvenido, ${name.split(' ')[0]}.`);
        } catch (err) {
            setFieldError('regError', authErrorMessage(err));
        } finally {
            btn.disabled = false;
        }
    }

    // ---------- Iniciar sesión ----------
    async function handleLogin(e) {
        e.preventDefault();
        if (!sb) return setFieldError('loginError', SERVICE_DOWN);
        setFieldError('loginError', '');

        const email = $('loginEmail').value.trim().toLowerCase();
        const password = $('loginPassword').value;
        if (!EMAIL_RE.test(email) || !password) return setFieldError('loginError', 'Escribe tu correo y tu contraseña.');

        const btn = $('loginForm').querySelector('button[type=submit]');
        btn.disabled = true;
        try {
            const { data, error } = await sb.auth.signInWithPassword({ email, password });
            if (error) return setFieldError('loginError', authErrorMessage(error));
            $('loginForm').reset();
            toggleModal('authModal', false);
            const nm = (data.user && data.user.user_metadata && data.user.user_metadata.name) || email.split('@')[0];
            showToast(`¡Hola de nuevo, ${nm.split(' ')[0]}!`);
        } catch (err) {
            setFieldError('loginError', authErrorMessage(err));
        } finally {
            btn.disabled = false;
        }
    }

    // ---------- Mi cuenta ----------
    async function handleSaveAddress() {
        const user = getCurrentUser();
        if (!sb || !user) return;
        const street = $('acStreet').value.trim();
        const colonia = $('acColonia').value.trim();
        const zip = $('acZip').value.trim();
        const city = $('acCity').value.trim();
        const refs = $('acRefs').value.trim();
        if (!street || !colonia || !city) return setFieldError('acError', 'Completa calle, colonia y ciudad.');
        if (!/^\d{5}$/.test(zip)) return setFieldError('acError', 'Escribe un código postal de 5 dígitos.');

        try {
            const { data, error } = await sb.from('profiles')
                .update({ street, colonia, zip, city, refs: refs || null })
                .eq('id', user.id)
                .select();
            if (error || !data || data.length === 0) throw error || new Error('sin filas');
            user.address = { street, colonia, zip, city, refs };
            setFieldError('acError', '');
            showToast('Dirección guardada en tu cuenta.');
        } catch (err) {
            setFieldError('acError', 'No se pudo guardar tu dirección. Inténtalo de nuevo.');
        }
    }

    async function logout() {
        try { if (sb) await sb.auth.signOut(); } catch (err) {}
        currentUser = null;
        toggleModal('accountModal', false);
        resetCheckoutFields();
        updateAccountUI();
        showToast('Sesión cerrada.');
    }

    // El navegador no puede borrar usuarios de Supabase: se genera la solicitud por WhatsApp
    function requestAccountDeletion() {
        const user = getCurrentUser();
        if (!user) return;
        if (!confirm('¿Solicitar la eliminación de tu cuenta y de tus datos? Se abrirá WhatsApp con tu solicitud para que la envíes.')) return;
        const msg = `Hola, quiero ejercer mi derecho de cancelación: solicito eliminar mi cuenta y mis datos personales de XIUPACK. Correo de mi cuenta: ${user.email}`;
        window.open(`https://wa.me/${whatsappNum}?text=${encodeURIComponent(msg)}`, '_blank');
    }

    // ---------- Eventos ----------
    if ($('accountBtn')) $('accountBtn').addEventListener('click', () => getCurrentUser() ? openAccount() : window.openAuth('register'));
    if ($('closeAuthBtn')) $('closeAuthBtn').addEventListener('click', () => toggleModal('authModal', false));
    if ($('closeAccountBtn')) $('closeAccountBtn').addEventListener('click', () => toggleModal('accountModal', false));
    if ($('tabRegister')) $('tabRegister').addEventListener('click', () => setAuthTab('register'));
    if ($('tabLogin')) $('tabLogin').addEventListener('click', () => setAuthTab('login'));
    if ($('registerForm')) $('registerForm').addEventListener('submit', handleRegister);
    if ($('loginForm')) $('loginForm').addEventListener('submit', handleLogin);
    if ($('saveAddressBtn')) $('saveAddressBtn').addEventListener('click', handleSaveAddress);
    if ($('logoutBtn')) $('logoutBtn').addEventListener('click', logout);
    if ($('deleteAccountBtn')) $('deleteAccountBtn').addEventListener('click', requestAccountDeletion);
    ['authModal', 'accountModal'].forEach(id => {
        const m = $(id);
        if (m) m.addEventListener('click', (ev) => { if (ev.target === m) toggleModal(id, false); });
    });
    document.addEventListener('keydown', (ev) => {
        if (ev.key === 'Escape') { toggleModal('authModal', false); toggleModal('accountModal', false); }
    });

    // Estado de sesión: se dispara al cargar la página y en cada inicio/cierre de sesión
    if (sb) {
        sb.auth.onAuthStateChange((event, session) => {
            // setTimeout evita bloqueos al llamar a Supabase dentro de este callback
            setTimeout(() => refreshUser(session), 0);
        });
    }
    updateAccountUI();

});
