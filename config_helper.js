/**
 * JD Cookie Sync - 配置助手
 * 帮助用户快速配置青龙面板连接信息
 */

const $ = new Env('JD Config Helper');

// ============= 配置助手 =============

/**
 * 显示当前配置
 */
function showCurrentConfig() {
    const qlUrl = $.getval('ql_url') || '未配置';
    const clientId = $.getval('ql_client_id') || '未配置';
    const clientSecret = $.getval('ql_client_secret') || '未配置';
    const updateInterval = $.getval('ql_update_interval') || '1800 (默认)';

    const message = `当前配置信息：
    
📍 青龙地址: ${qlUrl}
🔑 Client ID: ${maskString(clientId)}
🔐 Client Secret: ${maskString(clientSecret)}
⏰ 更新间隔: ${updateInterval} 秒

${(qlUrl === '未配置' || clientId === '未配置' || clientSecret === '未配置') ? '⚠️ 配置不完整，请完成配置' : '✅ 配置完整'}`;

    $.msg('JD Cookie Sync', '当前配置', message);
}

/**
 * 智能配置检查（合并显示配置、配置向导、测试配置）
 */
async function smartConfigCheck() {
    const qlUrl = $.getval('ql_url');
    const clientId = $.getval('ql_client_id');
    const clientSecret = $.getval('ql_client_secret');
    const updateInterval = $.getval('ql_update_interval') || '1800';

    // 情况1：配置不完整，显示配置向导
    if (!qlUrl || !clientId || !clientSecret) {
        const instructions = `⚠️ 配置不完整，请先配置

📋 配置方法（URL Scheme）：

1️⃣ 设置青龙地址：
surge:///write-persistent-store?key=ql_url&value=https://your-domain.com

2️⃣ 设置 Client ID：
surge:///write-persistent-store?key=ql_client_id&value=YOUR_CLIENT_ID

3️⃣ 设置 Client Secret：
surge:///write-persistent-store?key=ql_client_secret&value=YOUR_SECRET

复制以上链接到 Safari 打开（替换为你的信息）`;

        $.msg('JD Cookie Sync', '配置向导', instructions);
        return;
    }

    // 情况2：配置完整，执行测试
    $.msg('JD Cookie Sync', '正在测试配置', '请稍候...');

    const url = `${qlUrl}/open/auth/token?client_id=${clientId}&client_secret=${clientSecret}`;

    try {
        const response = await httpRequest({
            url: url,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const body = JSON.parse(response.body);

        if (body.code === 200 && body.data && body.data.token) {
            // 测试成功，显示配置信息
            const message = `✅ 连接测试成功

📍 青龙地址: ${qlUrl}
🔑 Client ID: ${maskString(clientId)}
🔐 Client Secret: ${maskString(clientSecret)}
⏰ 更新间隔: ${updateInterval} 秒

一切正常，可以正常使用！`;

            $.msg('JD Cookie Sync', '配置状态', message);
        } else {
            // Token获取失败
            const message = `❌ 连接失败

📍 青龙地址: ${qlUrl}
🔑 Client ID: ${maskString(clientId)}
🔐 Client Secret: ${maskString(clientSecret)}

错误: ${body.message || '未知错误'}

请检查 Client ID 和 Secret 是否正确`;

            $.msg('JD Cookie Sync', '配置错误', message);
        }
    } catch (error) {
        // 网络错误
        const message = `❌ 连接失败

📍 青龙地址: ${qlUrl}

网络错误: ${error.message || error}

请检查青龙面板地址是否正确且可访问`;

        $.msg('JD Cookie Sync', '配置错误', message);
    }
}

/**
 * 掩码显示敏感信息
 */
function maskString(str) {
    if (!str || str === '未配置') return str;
    if (str.length <= 8) return '****';
    return str.substring(0, 4) + '****' + str.substring(str.length - 4);
}

/**
 * 配置向导
 */
function configWizard() {
    const instructions = `配置步骤：

1️⃣ 准备青龙面板信息
   - 面板地址（如 https://ql.example.com）
   - Client ID
   - Client Secret

2️⃣ 使用以下方式之一配置：

方式一：URL Scheme（推荐）
复制以下链接到 Safari 打开（替换为你的信息）：

surge:///write-persistent-store?key=ql_url&value=https://your-domain.com

surge:///write-persistent-store?key=ql_client_id&value=YOUR_CLIENT_ID

surge:///write-persistent-store?key=ql_client_secret&value=YOUR_SECRET

方式二：脚本编辑器
在 Surge 脚本编辑器中运行：

$persistentStore.write('你的地址', 'ql_url');
$persistentStore.write('你的ID', 'ql_client_id');
$persistentStore.write('你的密钥', 'ql_client_secret');

在 QX 脚本编辑器中运行：

$prefs.setValueForKey('你的地址', 'ql_url');
$prefs.setValueForKey('你的ID', 'ql_client_id');
$prefs.setValueForKey('你的密钥', 'ql_client_secret');

3️⃣ 配置完成后再次运行本脚本查看配置`;

    $.msg('JD Cookie Sync', '配置向导', instructions);
}

/**
 * 测试配置
 */
async function testConfig() {
    const qlUrl = $.getval('ql_url');
    const clientId = $.getval('ql_client_id');
    const clientSecret = $.getval('ql_client_secret');

    if (!qlUrl || !clientId || !clientSecret) {
        $.msg('JD Cookie Sync', '配置测试失败', '⚠️ 请先完成配置');
        return;
    }

    $.msg('JD Cookie Sync', '正在测试配置', '请稍候...');

    // 测试获取 Token
    const url = `${qlUrl}/open/auth/token?client_id=${clientId}&client_secret=${clientSecret}`;

    try {
        const response = await httpRequest({
            url: url,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const body = JSON.parse(response.body);

        if (body.code === 200 && body.data && body.data.token) {
            $.msg('JD Cookie Sync', '✅ 配置测试成功', '青龙面板连接正常，可以正常使用了！');
        } else {
            $.msg('JD Cookie Sync', '❌ 配置测试失败', `错误信息: ${body.message || '未知错误'}\n\n请检查 Client ID 和 Secret 是否正确`);
        }
    } catch (error) {
        $.msg('JD Cookie Sync', '❌ 配置测试失败', `网络错误: ${error.message || error}\n\n请检查青龙面板地址是否正确且可访问`);
    }
}

/**
 * 清除配置
 */
function clearConfig() {
    $.setval('', 'ql_url');
    $.setval('', 'ql_client_id');
    $.setval('', 'ql_client_secret');
    $.setval('', 'ql_update_interval');

    $.msg('JD Cookie Sync', '✅ 配置已清除', '所有配置数据已删除，请重新配置');
}

/**
 * 清除 Cookie 缓存
 * 由于 Surge 无法枚举所有存储键，这里使用全局标志来绕过时间检查
 */
function clearCookieCache() {
    // 设置全局标志，让下次同步时绕过时间间隔检查
    $.setval('true', 'jd_bypass_interval_check');

    const message = `✅ 缓存已重置\n\n现在请：\n1. 访问京东 App 或网页\n2. Cookie 将立即重新抓取并同步\n3. 无需等待时间间隔`;

    $.msg('JD Cookie Sync', '✅ 缓存已清除', message);
}


// ============= 主菜单 =============

(async () => {
    // 根据 URL 参数决定执行的操作
    const action = $argument || 'smart-check';

    switch (action) {
        case 'smart-check':
            await smartConfigCheck();
            break;
        case 'clear':
            clearConfig();
            break;
        case 'clear-cache':
            clearCookieCache();
            break;
        // 保留旧的操作以兼容
        case 'show':
        case 'wizard':
        case 'test':
            await smartConfigCheck();
            break;
        default:
            $.msg('JD Cookie Sync', '未知操作', `不支持的操作: ${action}\n\n支持的操作: smart-check, clear, clear-cache`);
    }

    $.done({});
})();

// ============= Surge 环境适配 =============

// function Env(name) {
//     this.name = name;
//     this.logs = [];

//     this.log = function (message) {
//         console.log(`[${this.name}] ${message}`);
//         this.logs.push(message);
//     };

//     this.notify = function (title, subtitle, message) {
//         console.log(`[Notification] ${title}\n${subtitle}\n${message}`);
//         $notify(title, subtitle, message);
//     };

//     this.http = {
//         get: function (options) {
//             return new Promise((resolve, reject) => {
//                 $httpClient.get(options, (error, response, body) => {
//                     if (error) {
//                         reject(error);
//                     } else {
//                         response.body = body;
//                         resolve(response);
//                     }
//                 });
//             });
//         }
//     };

//     return this;
// }

//  二次封装
async function httpRequest(options) {
    try {
        options = options.url ? options : { url: options };
        const _method = options?._method || ('body' in options ? 'post' : 'get');
        const _respType = options?._respType || 'body';
        const _timeout = options?._timeout || 15e3;
        const _http = [
            new Promise((_, reject) => setTimeout(() => reject(`⛔️ 请求超时: ${options['url']}`), _timeout)),
            new Promise((resolve, reject) => {
                //debug(options, '[Request]');
                $[_method.toLowerCase()](options, (error, response, data) => {
                    //debug(response, '[response]');
                    //debug(data, '[data]');
                    error && $.log($.toStr(error));
                    if (_respType !== 'all') {
                        resolve($.toObj(response?.[_respType], response?.[_respType]));
                    } else {
                        resolve(response);
                    }
                })
            })
        ];
        return await Promise.race(_http);
    } catch (err) {
        $.logErr(err);
    }
}

function Env(t, e) { class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; "POST" === e && (s = this.post); const i = new Promise(((e, i) => { s.call(this, t, ((t, s, o) => { t ? i(t) : e(s) })) })); return t.timeout ? ((t, e = 1e3) => Promise.race([t, new Promise(((t, s) => { setTimeout((() => { s(new Error("请求超时")) }), e) }))]))(i, t.timeout) : i } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.logLevels = { debug: 0, info: 1, warn: 2, error: 3 }, this.logLevelPrefixs = { debug: "[DEBUG] ", info: "[INFO] ", warn: "[WARN] ", error: "[ERROR] " }, this.logLevel = "info", this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.encoding = "utf-8", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } getEnv() { return "undefined" != typeof $environment && $environment["surge-version"] ? "Surge" : "undefined" != typeof $environment && $environment["stash-version"] ? "Stash" : "undefined" != typeof module && module.exports ? "Node.js" : "undefined" != typeof $task ? "Quantumult X" : "undefined" != typeof $loon ? "Loon" : "undefined" != typeof $rocket ? "Shadowrocket" : void 0 } isNode() { return "Node.js" === this.getEnv() } isQuanX() { return "Quantumult X" === this.getEnv() } isSurge() { return "Surge" === this.getEnv() } isLoon() { return "Loon" === this.getEnv() } isShadowrocket() { return "Shadowrocket" === this.getEnv() } isStash() { return "Stash" === this.getEnv() } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null, ...s) { try { return JSON.stringify(t, ...s) } catch { return e } } getjson(t, e) { let s = e; if (this.getdata(t)) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise((e => { this.get({ url: t }, ((t, s, i) => e(i))) })) } runScript(t, e) { return new Promise((s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let o = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); o = o ? 1 * o : 20, o = e && e.timeout ? e.timeout : o; const [r, a] = i.split("@"), n = { url: `http://${a}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: o }, headers: { "X-Key": r, Accept: "*/*" }, policy: "DIRECT", timeout: o }; this.post(n, ((t, e, i) => s(i))) })).catch((t => this.logErr(t))) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), o = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, o) : i ? this.fs.writeFileSync(e, o) : this.fs.writeFileSync(t, o) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let o = t; for (const t of i) if (o = Object(o)[t], void 0 === o) return s; return o } lodash_set(t, e, s) { return Object(t) !== t || (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce(((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}), t)[e[e.length - 1]] = s), t } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), o = s ? this.getval(s) : ""; if (o) try { const t = JSON.parse(o); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, o] = /^@(.*?)\.(.*?)$/.exec(e), r = this.getval(i), a = i ? "null" === r ? null : r || "{}" : "{}"; try { const e = JSON.parse(a); this.lodash_set(e, o, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const r = {}; this.lodash_set(r, o, t), s = this.setval(JSON.stringify(r), i) } } else s = this.setval(t, e); return s } getval(t) { switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": return $persistentStore.read(t); case "Quantumult X": return $prefs.valueForKey(t); case "Node.js": return this.data = this.loaddata(), this.data[t]; default: return this.data && this.data[t] || null } } setval(t, e) { switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": return $persistentStore.write(t, e); case "Quantumult X": return $prefs.setValueForKey(t, e); case "Node.js": return this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0; default: return this.data && this.data[e] || null } } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.cookie && void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar))) } get(t, e = (() => { })) { switch (t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"], delete t.headers["content-type"], delete t.headers["content-length"]), t.params && (t.url += "?" + this.queryStr(t.params)), void 0 === t.followRedirect || t.followRedirect || ((this.isSurge() || this.isLoon()) && (t["auto-redirect"] = !1), this.isQuanX() && (t.opts ? t.opts.redirection = !1 : t.opts = { redirection: !1 })), this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": default: this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, ((t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status ? s.status : s.statusCode, s.status = s.statusCode), e(t, s, i) })); break; case "Quantumult X": this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then((t => { const { statusCode: s, statusCode: i, headers: o, body: r, bodyBytes: a } = t; e(null, { status: s, statusCode: i, headers: o, body: r, bodyBytes: a }, r, a) }), (t => e(t && t.error || "UndefinedError"))); break; case "Node.js": let s = require("iconv-lite"); this.initGotEnv(t), this.got(t).on("redirect", ((t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } })).then((t => { const { statusCode: i, statusCode: o, headers: r, rawBody: a } = t, n = s.decode(a, this.encoding); e(null, { status: i, statusCode: o, headers: r, rawBody: a, body: n }, n) }), (t => { const { message: i, response: o } = t; e(i, o, o && s.decode(o.rawBody, this.encoding)) })); break } } post(t, e = (() => { })) { const s = t.method ? t.method.toLocaleLowerCase() : "post"; switch (t.body && t.headers && !t.headers["Content-Type"] && !t.headers["content-type"] && (t.headers["content-type"] = "application/x-www-form-urlencoded"), t.headers && (delete t.headers["Content-Length"], delete t.headers["content-length"]), void 0 === t.followRedirect || t.followRedirect || ((this.isSurge() || this.isLoon()) && (t["auto-redirect"] = !1), this.isQuanX() && (t.opts ? t.opts.redirection = !1 : t.opts = { redirection: !1 })), this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": default: this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient[s](t, ((t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status ? s.status : s.statusCode, s.status = s.statusCode), e(t, s, i) })); break; case "Quantumult X": t.method = s, this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then((t => { const { statusCode: s, statusCode: i, headers: o, body: r, bodyBytes: a } = t; e(null, { status: s, statusCode: i, headers: o, body: r, bodyBytes: a }, r, a) }), (t => e(t && t.error || "UndefinedError"))); break; case "Node.js": let i = require("iconv-lite"); this.initGotEnv(t); const { url: o, ...r } = t; this.got[s](o, r).then((t => { const { statusCode: s, statusCode: o, headers: r, rawBody: a } = t, n = i.decode(a, this.encoding); e(null, { status: s, statusCode: o, headers: r, rawBody: a, body: n }, n) }), (t => { const { message: s, response: o } = t; e(s, o, o && i.decode(o.rawBody, this.encoding)) })); break } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } queryStr(t) { let e = ""; for (const s in t) { let i = t[s]; null != i && "" !== i && ("object" == typeof i && (i = JSON.stringify(i)), e += `${s}=${i}&`) } return e = e.substring(0, e.length - 1), e } msg(e = t, s = "", i = "", o = {}) { const r = t => { const { $open: e, $copy: s, $media: i, $mediaMime: o } = t; switch (typeof t) { case void 0: return t; case "string": switch (this.getEnv()) { case "Surge": case "Stash": default: return { url: t }; case "Loon": case "Shadowrocket": return t; case "Quantumult X": return { "open-url": t }; case "Node.js": return }case "object": switch (this.getEnv()) { case "Surge": case "Stash": case "Shadowrocket": default: { const r = {}; let a = t.openUrl || t.url || t["open-url"] || e; a && Object.assign(r, { action: "open-url", url: a }); let n = t["update-pasteboard"] || t.updatePasteboard || s; if (n && Object.assign(r, { action: "clipboard", text: n }), i) { let t, e, s; if (i.startsWith("http")) t = i; else if (i.startsWith("data:")) { const [t] = i.split(";"), [, o] = i.split(","); e = o, s = t.replace("data:", "") } else { e = i, s = (t => { const e = { JVBERi0: "application/pdf", R0lGODdh: "image/gif", R0lGODlh: "image/gif", iVBORw0KGgo: "image/png", "/9j/": "image/jpg" }; for (var s in e) if (0 === t.indexOf(s)) return e[s]; return null })(i) } Object.assign(r, { "media-url": t, "media-base64": e, "media-base64-mime": o ?? s }) } return Object.assign(r, { "auto-dismiss": t["auto-dismiss"], sound: t.sound }), r } case "Loon": { const s = {}; let o = t.openUrl || t.url || t["open-url"] || e; o && Object.assign(s, { openUrl: o }); let r = t.mediaUrl || t["media-url"]; return i?.startsWith("http") && (r = i), r && Object.assign(s, { mediaUrl: r }), console.log(JSON.stringify(s)), s } case "Quantumult X": { const o = {}; let r = t["open-url"] || t.url || t.openUrl || e; r && Object.assign(o, { "open-url": r }); let a = t["media-url"] || t.mediaUrl; i?.startsWith("http") && (a = i), a && Object.assign(o, { "media-url": a }); let n = t["update-pasteboard"] || t.updatePasteboard || s; return n && Object.assign(o, { "update-pasteboard": n }), console.log(JSON.stringify(o)), o } case "Node.js": return }default: return } }; if (!this.isMute) switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": default: $notification.post(e, s, i, r(o)); break; case "Quantumult X": $notify(e, s, i, r(o)); break; case "Node.js": break }if (!this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } debug(...t) { this.logLevels[this.logLevel] <= this.logLevels.debug && (t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(`${this.logLevelPrefixs.debug}${t.map((t => t ?? String(t))).join(this.logSeparator)}`)) } info(...t) { this.logLevels[this.logLevel] <= this.logLevels.info && (t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(`${this.logLevelPrefixs.info}${t.map((t => t ?? String(t))).join(this.logSeparator)}`)) } warn(...t) { this.logLevels[this.logLevel] <= this.logLevels.warn && (t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(`${this.logLevelPrefixs.warn}${t.map((t => t ?? String(t))).join(this.logSeparator)}`)) } error(...t) { this.logLevels[this.logLevel] <= this.logLevels.error && (t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(`${this.logLevelPrefixs.error}${t.map((t => t ?? String(t))).join(this.logSeparator)}`)) } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(`[${this.name}] ${t.map((t => t ?? String(t))).join(this.logSeparator)}`) } logErr(t, e) { switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": case "Quantumult X": default: this.log("", `❗️${this.name}, 错误!`, e, t); break; case "Node.js": this.log("", `❗️${this.name}, 错误!`, e, void 0 !== t.message ? t.message : t, t.stack); break } } wait(t) { return new Promise((e => setTimeout(e, t))) } done(t = {}) { const e = ((new Date).getTime() - this.startTime) / 1e3; switch (this.log("", `🔔${this.name}, 结束! 🕛 ${e} 秒`), this.log(), this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": case "Quantumult X": default: $done(t); break; case "Node.js": process.exit(1) } } }(t, e) }

