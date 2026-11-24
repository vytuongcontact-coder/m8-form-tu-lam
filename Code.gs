/**
 * Thí nghiệm M8 (P03 "Made in…?", Nhóm 02): bản người tham gia tự làm.
 * Gắn script này vào một Google Sheet của nhóm (Tiện ích mở rộng > Apps Script), dán file index.html (tên tệp HTML: Index),
 * rồi Triển khai > Tùy chọn triển khai mới > Ứng dụng web: "Thực thi với tư cách: Tôi", "Ai có quyền truy cập: Bất kỳ ai".
 * Sheet tự tạo 3 trang tính: sessions (mỗi người một dòng), responses (mỗi câu một dòng), contacts (liên hệ xác minh, không gắn mã).
 */
const APP = "m8-tu-lam-1.0";
const SESS_COLS = ["participant", "order", "status", "started_at", "finished_at", "seen_before", "done_before",
  "screen", "pointer", "user_agent", "preference", "preference_reason", "app_version"];
const RESP_COLS = ["participant", "order", "round", "version", "question", "answer", "correct", "seconds", "confidence",
  "hovered", "pointed", "preference", "preference_reason", "seen_before", "date", "time", "experimenter", "recorder",
  "device", "note", "answer_source", "hover_count", "view_changes", "left_page", "mode", "app_version", "saved_at"];
const ORDERS = ["2D-3D", "3D-2D"];
const STALE_MIN = 40;   // phiên "đang làm" quá 40 phút không tính vào cân bằng thứ tự

function doGet() {
  return HtmlService.createHtmlOutputFromFile("Index")
    .setTitle("Thí nghiệm đọc biểu đồ thương mại")
    .addMetaTag("viewport", "width=device-width, initial-scale=1");
}

/** Nhận dữ liệu từ trang chạy trên GitHub Pages: body JSON {fn, args}. Chỉ cho gọi 4 hàm bên dưới. */
const API_FNS = {startSession: startSession, saveSession: saveSession, withdraw: withdraw, saveContact: saveContact};
function doPost(e) {
  let out;
  try {
    const req = JSON.parse(e.postData.contents);
    const fn = API_FNS[req.fn];
    if (!fn) throw new Error("Không có hàm " + req.fn);
    out = {ok: true, result: fn.apply(null, Array.isArray(req.args) ? req.args : [])};
  } catch (err) {
    out = {ok: false, error: String(err && err.message || err)};
  }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

function sheet_(name, header) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, header.length).setValues([header]).setFontWeight("bold");
    sh.setFrozenRows(1);
  }
  return sh;
}

function rows_(sh, ncol) {
  const n = sh.getLastRow() - 1;
  return n > 0 ? sh.getRange(2, 1, n, ncol).getValues() : [];
}

/** Cấp mã S001, S002… và thứ tự bản: ngẫu nhiên, có cân bằng (thứ tự nào ít người hơn thì được chọn; bằng nhau thì bốc thăm). */
function startSession(meta) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = sheet_("sessions", SESS_COLS);
    const vals = rows_(sh, SESS_COLS.length);
    const now = new Date();
    const count = {"2D-3D": 0, "3D-2D": 0};
    vals.forEach(function (r) {
      const status = r[2], started = new Date(r[3]);
      if (status === "hoàn tất" || (status === "đang làm" && now - started < STALE_MIN * 60000)) count[r[1]] = (count[r[1]] || 0) + 1;
    });
    let order;
    if (count["2D-3D"] < count["3D-2D"]) order = "2D-3D";
    else if (count["3D-2D"] < count["2D-3D"]) order = "3D-2D";
    else order = ORDERS[Math.floor(Math.random() * 2)];
    const code = "S" + ("00" + (vals.length + 1)).slice(-3);
    const m = meta || {};
    sh.appendRow([code, order, "đang làm", now, "", s_(m.seen_before), s_(m.done_before), s_(m.screen), s_(m.pointer),
      s_(m.user_agent), "", "", s_(m.app_version) || APP]);
    return {participant: code, order: order};
  } finally {
    lock.releaseLock();
  }
}

/** Lưu 6 dòng câu trả lời một lần, khi người tham gia bấm Gửi. Từ chối nếu mã không tồn tại hoặc đã lưu. */
function saveSession(code, rows, fin) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = sheet_("sessions", SESS_COLS);
    const vals = rows_(sh, SESS_COLS.length);
    const i = vals.findIndex(function (r) { return r[0] === code; });
    if (i < 0) throw new Error("Không có mã " + code);
    if (vals[i][2] === "hoàn tất") throw new Error("Mã " + code + " đã được lưu");
    if (!Array.isArray(rows) || rows.length !== 6) throw new Error("Cần đúng 6 câu trả lời");
    const now = new Date();
    const out = rows.map(function (r) {
      return RESP_COLS.map(function (c) { return c === "saved_at" ? now : (r[c] === undefined || r[c] === null ? "" : r[c]); });
    });
    const rs = sheet_("responses", RESP_COLS);
    rs.getRange(rs.getLastRow() + 1, 1, out.length, RESP_COLS.length).setValues(out);
    const f = fin || {};
    sh.getRange(i + 2, 3, 1, 3).setValues([["hoàn tất", vals[i][3], now]]);
    sh.getRange(i + 2, 11, 1, 2).setValues([[s_(f.preference), s_(f.preference_reason)]]);
    return {ok: true};
  } finally {
    lock.releaseLock();
  }
}

/** Người tham gia bấm Dừng: đánh dấu, không lưu câu trả lời; mã không cấp lại. */
function withdraw(code) {
  const sh = sheet_("sessions", SESS_COLS);
  const vals = rows_(sh, SESS_COLS.length);
  const i = vals.findIndex(function (r) { return r[0] === code; });
  if (i >= 0 && vals[i][2] === "đang làm") sh.getRange(i + 2, 3).setValue("đã dừng");
  return {ok: true};
}

/** Liên hệ để giảng viên xác minh: lưu riêng, không có mã người tham gia, chỉ có ngày. */
function saveContact(contact) {
  const sh = sheet_("contacts", ["date", "contact"]);
  sh.appendRow([Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd/MM/yyyy"), s_(contact).slice(0, 120)]);
  return {ok: true};
}

function s_(v) { return v === undefined || v === null ? "" : String(v).slice(0, 500); }
