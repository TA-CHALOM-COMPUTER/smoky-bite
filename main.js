const IMG = {
  s1: "https://i.ibb.co/1Y4fr8Pm/1.jpg",
  s2: "https://i.ibb.co/GQkb6htw/2.jpg",
  s3: "https://i.ibb.co/Mk5rBykB/3.jpg",
  s4: "https://i.ibb.co/0RXdjKYW/4.jpg",
  s5: "https://i.ibb.co/dJw4Wfj2/5.jpg",
  j6: "https://i.ibb.co/3Y41Nbmd/6.png",
  j7: "https://i.ibb.co/kshkw5ww/7.jpg",
  j8: "https://i.ibb.co/GvKL2nxh/8.jpg",
  j9: "https://i.ibb.co/cK418SKp/9.jpg",
  j10: "https://i.ibb.co/zWpcrp1j/10.jpg",
};

const smallMenus = [
  { id: "s1", num: 1, name: "หนังกรอบไก่", price: 7 },
  { id: "s2", num: 2, name: "หนังกรอบหมู", price: 7 },
  { id: "s3", num: 3, name: "กะเพรา", price: 7 },
  { id: "s4", num: 4, name: "รมควันไก่ สอดไส้ชีส", price: 7 },
  { id: "s5", num: 5, name: "นมวนิลา สอดไส้ชีส", price: 7 },
];

const jumboMenus = [
  { id: "j6", num: 6, name: "จัมโบ้ชีส", price: 10, tag: "ขายดีประจำร้าน" },
  { id: "j7", num: 7, name: "เวียนนารมควัน", price: 10, tag: "หอมมากก" },
  { id: "j8", num: 8, name: "นมเบทาโกร", price: 10 },
  { id: "j9", num: 9, name: "หมูผสมไก่ เบทาโกร", price: 10 },
  { id: "j10", num: 10, name: "หนังไก่กรอบ TFG", price: 10 },
];

let cart = [];
let globalSauce = "ซอสรวม";
let globalVeg = "🥬 ใส่ผัก";

/* ── Build product card ── */
function buildCard(m, isJumbo) {
  const promo = isJumbo ? "" : `<div class="card-promo">3 ชิ้น = 20 บาท 🔥</div>`;
  const best = m.tag ? `<div class="best-tag">${m.tag}</div>` : "";
  return `<div class="card">
    <div class="card-img-wrap">
      <div class="card-num">${m.num}</div>
      <img src="${IMG[m.id]}" alt="${m.name}" loading="lazy">
      ${best}
    </div>
    <div class="card-body">
      <h3>${m.name}</h3>
      <div class="card-price">${m.price} บาท</div>
      ${promo}
      <div class="qty-row">
        <label>จำนวน</label>
        <div class="qty-ctrl">
          <button class="qty-btn" onclick="chgQty('qty_${m.id}',-1)">−</button>
          <span class="qty-num" id="qty_${m.id}">1</span>
          <button class="qty-btn" onclick="chgQty('qty_${m.id}',1)">+</button>
        </div>
      </div>
      <button class="btn-add" id="btn_${m.id}" onclick="addToCart('${m.id}','${m.name}',${m.price})">+ เพิ่มลงตะกร้า</button>
    </div>
  </div>`;
}

document.getElementById("grid-small").innerHTML = smallMenus.map(m => buildCard(m, false)).join("");
document.getElementById("grid-jumbo").innerHTML = jumboMenus.map(m => buildCard(m, true)).join("");

/* ── Quantity controls ── */
function chgQty(id, d) {
  const el = document.getElementById(id);
  el.textContent = Math.max(1, Math.min(99, parseInt(el.textContent) + d));
}

/* ── Sauce handler ── */
function handleGlobalSauceChange(el) {
  if (el.value === "ไม่รับซอส" && el.checked) {
    document.querySelectorAll('input[name="gsauce"]').forEach(c => { if (c.value !== "ไม่รับซอส") c.checked = false; });
  } else if (el.checked) {
    const ns = document.querySelector('input[name="gsauce"][value="ไม่รับซอส"]');
    if (ns) ns.checked = false;
  }
  const checked = [...document.querySelectorAll('input[name="gsauce"]:checked')].map(e => e.value);
  globalSauce = checked.length > 0 ? checked.join("+") : "ซอสรวม";
}

/* ── Add to cart ── */
function addToCart(id, name, price) {
  const qty = parseInt(document.getElementById("qty_" + id).textContent);
  const ex = cart.find(c => c.id === id);
  if (ex) { ex.qty += qty; }
  else { cart.push({ id, name, price, sauce: "ซอสรวม", veg: "🥬 ใส่ผัก", qty, img: IMG[id] }); }
  updateCartBar();
  flashBtn(id);
  showToast("✅ เพิ่ม " + name + " x" + qty + " แล้ว!");
}

function flashBtn(id) {
  const b = document.getElementById("btn_" + id);
  b.classList.add("added");
  b.textContent = "✅ เพิ่มแล้ว!";
  setTimeout(() => { b.classList.remove("added"); b.textContent = "+ เพิ่มลงตะกร้า"; }, 1500);
}

/* ── Price calculations ── */
function calcPooledSmall() {
  const totalSmallQty = cart.filter(c => c.price === 7).reduce((s, c) => s + c.qty, 0);
  return Math.floor(totalSmallQty / 3) * 20 + (totalSmallQty % 3) * 7;
}

function cartGrandTotal() {
  const smallTotal = calcPooledSmall();
  const jumboTotal = cart.filter(c => c.price !== 7).reduce((s, c) => s + c.price * c.qty, 0);
  return smallTotal + jumboTotal;
}

function itemDisplayPrice(c) {
  if (c.price !== 7) return c.price * c.qty;
  const totalSmallQty = cart.filter(x => x.price === 7).reduce((s, x) => s + x.qty, 0);
  const pooled = calcPooledSmall();
  return Math.round(pooled * (c.qty / totalSmallQty));
}

function itemTotal(c) { return itemDisplayPrice(c); }
function totalCount() { return cart.reduce((s, c) => s + c.qty, 0); }

/* ── Cart bar ── */
function updateCartBar() {
  const total = cartGrandTotal();
  const count = totalCount();
  document.getElementById("cartCount").textContent = count;
  document.getElementById("cartTotal").textContent = "฿" + total;
  document.getElementById("cartSummary").textContent = count > 0 ? cart.map(c => c.name + " x" + c.qty).join(", ") : "ยังไม่มีรายการ";
  const btn = document.getElementById("btnCheckout");
  btn.disabled = count === 0;
  btn.textContent = count > 0 ? "ดูตะกร้า (" + count + ")" : "ดูตะกร้า";
}

/* ── Modal controls ── */
function openCart() { renderModal(); document.getElementById("modalBg").classList.add("open"); document.body.style.overflow = "hidden"; }
function closeCart() { document.getElementById("modalBg").classList.remove("open"); document.body.style.overflow = ""; }
function closeCartOutside(e) { if (e.target === document.getElementById("modalBg")) closeCart(); }

/* ── Render modal ── */
function renderModal() {
  const count = totalCount();
  const total = cartGrandTotal();
  const sub = document.getElementById("modalHeadSub");
  sub.textContent = count > 0 ? count + " รายการ • ยอดรวม ฿" + total : "ยังไม่มีสินค้าในตะกร้า";
  const body = document.getElementById("modalBody");
  const hasItems = cart.length > 0;
  const btnLine = document.getElementById("btnLine");
  btnLine.style.display = hasItems ? "flex" : "none";

  if (!hasItems) {
    body.innerHTML = `<div class="cart-empty">
      <div class="cart-empty-icon">🛒</div>
      <div class="cart-empty-text">ตะกร้าว่างอยู่ครับ</div>
      <div class="cart-empty-sub">กดเพิ่มสินค้าก่อนนะครับ</div>
    </div>`;
    return;
  }

  const itemsHTML = `<div class="cart-items-section">${cart.map((c, i) => `
    <div class="cart-item">
      <img class="ci-img" src="${c.img}" alt="${c.name}">
      <div class="ci-info">
        <div class="ci-name">${c.name}</div>
        <div class="ci-sauce">${c.sauce} · ${c.veg}</div>
        <div class="ci-controls">
          <button class="ci-qbtn" onclick="cartChg(${i},-1)">−</button>
          <span class="ci-qnum">${c.qty}</span>
          <button class="ci-qbtn" onclick="cartChg(${i},1)">+</button>
        </div>
      </div>
      <div class="ci-right">
        <div class="ci-price">฿${itemTotal(c)}</div>
        <button class="ci-del" onclick="cartDel(${i})" title="ลบ">🗑</button>
      </div>
    </div>`).join("")}</div>`;

  const totalSmallQty = cart.filter(c => c.price === 7).reduce((s, c) => s + c.qty, 0);
  const summaryItems = cart.map(c => {
    const promoTag = (c.price === 7 && totalSmallQty >= 3) ? `<span class="os-promo-tag">รวมโปร ${Math.floor(totalSmallQty / 3)}×20</span>` : "";
    return `<div class="os-item">
      <div class="os-item-left">
        <div class="os-item-name">${c.name}${promoTag}</div>
        <div class="os-item-detail">${c.sauce} · ${c.veg} · จำนวน ${c.qty} ชิ้น</div>
      </div>
      <div class="os-item-price">฿${itemTotal(c)}</div>
    </div>`;
  }).join("");

  const summaryHTML = `
  <div class="section-divider"><span>สรุปรายการ</span></div>
  <div class="order-summary">
    <div class="os-header">🧾 รายการสั่งซื้อ <span class="count-chip">${count} ชิ้น</span></div>
    ${summaryItems}
    <div class="os-total-row">
      <div>
        <div class="os-total-label">ยอดรวมทั้งหมด</div>
        <div class="os-total-note">รวมโปร 3 ชิ้น 20 บาทแล้ว</div>
      </div>
      <div class="os-total-amount">฿${total}</div>
    </div>
  </div>`;

  const sauceVals = ["ซอสรวม", "มายองเนส", "มะเขือเทศ", "ซอสพริก", "ไม่รับซอส"];
  const sauceIcons = { "ซอสรวม": "🎉", "มายองเนส": "🟡", "มะเขือเทศ": "🍅", "ซอสพริก": "🔴", "ไม่รับซอส": "🚫" };
  const currentSauces = (globalSauce || "ซอสรวม").split("+");
  const sauceBoxes = sauceVals.map(sv => {
    const chk = currentSauces.includes(sv) ? "checked" : "";
    return `<label class="sauce-chk"><input type="checkbox" name="gsauce" value="${sv}" ${chk} onchange="handleGlobalSauceChange(this)"><span>${sauceIcons[sv]} ${sv}</span></label>`;
  }).join("");

  const sauceVegSectionHTML = `
  <div class="section-divider"><span>เลือกซอส & ผัก</span></div>
  <div class="modal-sauce-section">
    <div class="modal-sauce-item">
      <div class="msi-row">
        <div class="msi-label">ซอส</div>
        <div class="sauce-grid modal-sauce-grid">${sauceBoxes}</div>
      </div>
      <div class="msi-row" style="margin-top:10px">
        <div class="msi-label">ผัก</div>
        <div class="veg-options">
          <label class="veg-opt"><input type="radio" name="gveg" value="🥬 ใส่ผัก" ${globalVeg === "🥬 ใส่ผัก" ? "checked" : ""} onchange="globalVeg=this.value"><span>🥬 ใส่ผัก</span></label>
          <label class="veg-opt"><input type="radio" name="gveg" value="🚫 ไม่ผัก" ${globalVeg === "🚫 ไม่ผัก" ? "checked" : ""} onchange="globalVeg=this.value"><span>🚫 ไม่ผัก</span></label>
        </div>
      </div>
      <div class="msi-note">✅ ใช้กับทุกเมนูในออเดอร์นี้</div>
    </div>
  </div>`;

  const formHTML = `
  <div class="section-divider"><span>ที่อยู่จัดส่ง</span></div>
  <div class="delivery-section">
    <div class="ds-header">📍 ระบุที่อยู่จัดส่ง</div>
    <div class="ds-body">
      <div class="field-row">
        <div class="field-wrap">
          <label class="field-label">บ้านเลขที่<span class="field-required">*</span></label>
          <input class="field-input" id="fldHouseNo" type="text" placeholder="เช่น 159/306" maxlength="30">
          <span class="field-err">กรุณากรอกบ้านเลขที่</span>
        </div>
        <div class="field-wrap">
          <label class="field-label">ซอย</label>
          <input class="field-input" id="fldSoi" type="text" placeholder="เช่น ซ.3" maxlength="60">
        </div>
      </div>
    </div>
  </div>`;

  body.innerHTML = itemsHTML + summaryHTML + sauceVegSectionHTML + formHTML;
  document.getElementById("fldHouseNo").addEventListener("input", function () {
    if (this.value.trim()) this.classList.remove("err");
  });
}

/* ── Cart item controls ── */
function cartChg(i, d) { cart[i].qty = Math.max(1, cart[i].qty + d); updateCartBar(); renderModal(); }
function cartDel(i) { cart.splice(i, 1); updateCartBar(); renderModal(); }

/* ── Form validation ── */
function validateForm() {
  const el = document.getElementById("fldHouseNo");
  if (!el || !el.value.trim()) { if (el) el.classList.add("err"); return false; }
  el.classList.remove("err");
  return true;
}

/* ── Thai date/time ── */
function getThaiDateTime() {
  const now = new Date();
  const thDate = now.toLocaleDateString("th-TH", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const thTime = now.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  return { date: thDate, time: thTime };
}

/* ── Generate Order ID ── */
function genOrderId() {
  const ts = Date.now().toString(36).toUpperCase().slice(-5);
  const rnd = Math.random().toString(36).substring(2, 5).toUpperCase();
  return "SB-" + ts + rnd;
}

/* ── ตั้งค่า Apps Script Web App URL (ได้จากขั้นตอน Deploy) ── */
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/ใส่-DEPLOYMENT-ID-ตรงนี้/exec";

/* ── ส่งออเดอร์ (ไม่ต้องแอดเพื่อน LINE) ── */
async function sendToLine() {
  if (cart.length === 0) return;
  if (!validateForm()) { showToast("⚠️ กรุณากรอกบ้านเลขที่"); return; }

  const houseNo = document.getElementById("fldHouseNo").value.trim();
  const soi = document.getElementById("fldSoi").value.trim();
  const total = cartGrandTotal();
  const count = totalCount();
  const addrLine = soi ? `บ้านเลขที่ ${houseNo}  ซ.${soi}` : `บ้านเลขที่ ${houseNo}`;
  const { date, time } = getThaiDateTime();
  const orderId = genOrderId();

  const orderPayload = {
    orderId,
    date,
    time,
    address: addrLine,
    items: cart.map(c => ({ name: c.name, qty: c.qty, price: itemTotal(c) })),
    sauce: globalSauce,
    veg: globalVeg,
    total,
    count
  };

  const btnLine = document.getElementById("btnLine");
  btnLine.disabled = true;
  const originalHTML = btnLine.innerHTML;
  btnLine.innerHTML = "<span>⏳</span><span>กำลังส่งออเดอร์...</span>";

  try {
    // ใช้ mode: no-cors เพราะ Apps Script Web App ไม่ส่ง CORS header กลับมา
    // (ทำให้อ่าน response ไม่ได้ แต่ request ยังถูกส่งและประมวลผลตามปกติ)
    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(orderPayload)
    });
    showSuccess();
  } catch (err) {
    console.error("ส่งออเดอร์ไม่สำเร็จ:", err);
    showToast("⚠️ ส่งออเดอร์ไม่สำเร็จ กรุณาลองใหม่ หรือโทร 063-509-6265");
    btnLine.disabled = false;
    btnLine.innerHTML = originalHTML;
  }
}

/* ── Success screen ── */
function showSuccess() {
  const body = document.getElementById("modalBody");
  const btnLine = document.getElementById("btnLine");
  btnLine.style.display = "none";
  const sub = document.getElementById("modalHeadSub");
  sub.textContent = "ส่งออเดอร์เสร็จแล้ว 🎉";
  body.innerHTML = `<div class="success-screen">
    <div class="success-glow">✅</div>
    <div class="success-title">ส่งออเดอร์เรียบร้อยแล้ว!</div>
    <div class="success-sub">ร้านได้รับรายการสั่งซื้อแล้วครับ<br>รอร้านยืนยันออเดอร์สักครู่นะครับ 🙏</div>
    <div class="success-countdown" id="successCountdown">กลับสู่หน้าหลักใน 3 วินาที...</div>
    <div class="success-bar-wrap"><div class="success-bar" id="successBar"></div></div>
  </div>`;
  let sec = 3;
  const bar = document.getElementById("successBar");
  bar.style.transition = "width " + sec + "s linear";
  setTimeout(() => { bar.style.width = "0%"; }, 50);
  const timer = setInterval(() => {
    sec--;
    const el = document.getElementById("successCountdown");
    if (el) el.textContent = "กลับสู่หน้าหลักใน " + sec + " วินาที...";
    if (sec <= 0) {
      clearInterval(timer);
      cart = []; globalSauce = "ซอสรวม"; globalVeg = "🥬 ใส่ผัก";
      btnLine.disabled = false;
      btnLine.innerHTML = `<span>💬</span><span>สั่งผ่าน LINE ทันที!<span class="btn-line-sub">กดเพื่อส่งออเดอร์ไปหาร้าน</span></span>`;
      btnLine.style.display = "";
      updateCartBar(); closeCart();
    }
  }, 1000);
}

/* ── Toast notification ── */
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2500);
}
