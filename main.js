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

        showToast("Abriendo WhatsApp con tu pedido...");
        cart = [];
        updateCartUI();
        if (nameInput) nameInput.value = '';
        ['addrStreet', 'addrColonia', 'addrZip', 'addrCity', 'addrRefs'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
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

});
