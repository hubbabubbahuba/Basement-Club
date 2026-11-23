import { CONFIG } from "./config.js";

/* =====================================================================
   Basement Club
   Sign in with a music service, turn albums you've been listening to
   into trading cards rated in stars, and trade them with friends you add.
===================================================================== */
const DEMO = CONFIG.DEMO_MODE !== false;   // preview mode: sample data kept in this browser
const configured = ![CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY].some(v => !v || v.includes("YOUR-"));
let sb = null, demo = null;

/* =====================================================================
   Small helpers
===================================================================== */
const $ = (s, el = document) => el.querySelector(s);
function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  if (attrs) for (const k in attrs) {
    const v = attrs[k]; if (v == null || v === false) continue;
    if (k === "class") el.className = v;
    else if (k === "text") el.textContent = v;
    else if (k === "html") el.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? "" : String(v));
  }
  for (const k of kids.flat(Infinity)) { if (k == null || k === false) continue; el.append(k instanceof Node ? k : document.createTextNode(String(k))); }
  return el;
}
const btn = (label, onclick, cls = "", extra = {}) => h("button", { type: "button", class: "btn " + cls, onclick, ...extra }, label);
function toast(msg, kind = "info") { const t = h("div", { class: "toast " + kind, role: kind === "error" ? "alert" : "status", text: msg }); $("#toasts").append(t); setTimeout(() => t.remove(), 5000); }
const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
const err = m => Object.assign(new Error(m), { user: true });
const msgOf = e => (e && (e.user || e.code === "P0001")) ? e.message : "Something went wrong. Try again.";
function relTime(ts) { if (!ts) return ""; const t = new Date(ts).getTime(), d = (Date.now() - t) / 1000; if (d < 60) return "just now"; if (d < 3600) return Math.floor(d / 60) + " min ago"; if (d < 86400) return Math.floor(d / 3600) + " h ago"; if (d < 604800) return Math.floor(d / 86400) + " d ago"; return new Date(t).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }); }
function clock(ts) { const d = new Date(ts); return new Date().toDateString() === d.toDateString() ? d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) : d.toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }); }
const fmtDate = ts => new Date(ts).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
const safeColor = c => /^#[0-9a-f]{6}$/i.test(c || "") ? c : "#F7A9C6";
const safeArt = u => typeof u === "string" && /^https:\/\/(i\.scdn\.co|[a-z0-9-]+\.mzstatic\.com|i1\.sndcdn\.com)\//.test(u) ? u : "";
const safeImg = u => typeof u === "string" && (/^https:\/\//.test(u) || /^data:image\/(jpeg|png|webp|svg\+xml)[;,]/.test(u) || /^blob:/.test(u)) ? u : "";
const safeHttp = u => typeof u === "string" && /^https:\/\//.test(u) ? u : "";
function hashStr(s) { let x = 2166136261; for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; }
function rngFrom(s) { let a = hashStr(s); return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/* =====================================================================
   Ratings and card look
===================================================================== */
// Every rating is a star rating, like Letterboxd: ½ to 5 stars in half steps, picked by clicking the stars.
// Stored as 10-100 (stars x 20), so 2½ stars (50) is the line between liked it and didn't.
// Your taste rating puts the card in a tier, and the tier sets the card's edge.
// [stars, edge, name]
const TIERS = [[.5, "poo", "Straight poo"], [1, "rot", "Unlistenable"], [1.5, "rot", "Awful"], [2, "dud", "Bad"], [2.5, "plain", "Like"],
  [3, "mint", "Enjoy"], [3.5, "gold", "Love"], [4, "gold", "Can't live without"], [4.5, "holo", "Literally a narcotic"], [5, "peak", "Peak of human expression"]];
const LIKED_FROM = 50;
const starsOf = p => p == null ? null : clamp(Math.round(p / 10) / 2, .5, 5);
const toPoints = st => Math.round(st * 20);
const starNum = st => (Math.floor(st) ? String(Math.floor(st)) : "") + (st % 1 ? "½" : "");
const starWord = st => st == null ? "not rated" : `${starNum(st)} star${st === 1 ? "" : "s"}`;
const starShort = p => p == null ? "–" : "★" + starNum(starsOf(p));
const tierOf = p => { const st = starsOf(p ?? LIKED_FROM), t = TIERS.find(x => x[0] === st) || TIERS[4]; return [t[1], t[2]]; };
// Five stars filled to the rating (half stars too).
function starRow(p, cls = "") {
  const st = starsOf(p);
  return h("span", { class: "stars " + cls, role: "img", "aria-label": st == null ? "Not rated" : starWord(st) },
    h("span", { class: "st-base", "aria-hidden": "true", text: "★★★★★" }),
    h("span", { class: "st-fill", "aria-hidden": "true", style: `width:${st == null ? 0 : st / 5 * 100}%`, text: "★★★★★" }));
}
const decadeOf = y => y ? `${Math.floor(y / 10) * 10}s` : null;
// Every card is rated in stars on four scales. "Your taste" (points) is the one on the front of the card and sets its tier;
// the other three are optional.
const SCALES = [
  { key: "genre_score", label: "In its genre", short: "Genre", hint: al => al.genre ? `Against other ${al.genre} albums` : "Against other albums in its genre" },
  { key: "artist_score", label: "In the artist's discography", short: "Artist", hint: al => al.artist ? `Against other albums by ${al.artist}` : "Against the artist's other albums" },
  { key: "decade_score", label: "In its decade", short: "Decade", hint: al => decadeOf(al.year) ? `Against other albums from the ${decadeOf(al.year)}` : "Against other albums from its decade" },
  { key: "points", label: "Your taste", short: "Taste", hint: () => "The stars on the front of the card. 2½ and up means you liked it." }
];
const SCORE_KEYS = SCALES.map(x => x.key);
const WALLS = {
  plain: { n: "Plain", img: "none", size: "auto" },
  dots: { n: "Dots", img: "radial-gradient(rgba(255,255,255,.5) 2px, transparent 2.6px)", size: "22px 22px" },
  stripes: { n: "Stripes", img: "repeating-linear-gradient(45deg, rgba(255,255,255,.22) 0 12px, transparent 12px 24px)", size: "auto" },
  checker: { n: "Checker", img: "conic-gradient(rgba(255,255,255,.25) 25%, transparent 0 50%, rgba(255,255,255,.25) 0 75%, transparent 0)", size: "40px 40px" },
  grid: { n: "Grid", img: "linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)", size: "28px 28px" },
  stars: { n: "Sparkles", img: "radial-gradient(circle at 20% 30%, rgba(255,255,255,.95) 0 1.4px, transparent 2px), radial-gradient(circle at 72% 62%, rgba(255,255,255,.75) 0 1px, transparent 1.6px), radial-gradient(circle at 46% 86%, rgba(255,255,255,.85) 0 1.2px, transparent 1.8px)", size: "64px 64px" }
};
const SERVICES = { spotify: ["Spotify", "sp"], apple: ["Apple Music", "am"], soundcloud: ["SoundCloud", "sc"] };

// Original abstract art for albums without artwork (and for preview mode).
const coverCache = new Map();
function coverSVG(al) {
  al = { id: String(al.id || "x"), genre: al.genre || "" };
  if (coverCache.has(al.id)) return coverCache.get(al.id);
  const r = rngFrom(al.id), n = v => v.toFixed(1);
  const base = hashStr(al.genre + "~") % 360;
  const h1 = (base + r() * 40 - 20 + 360) % 360, h2 = (h1 + 150 + r() * 60) % 360, h3 = (h1 + 35 + r() * 30) % 360;
  const bg = `hsl(${h1 | 0} ${55 + r() * 30 | 0}% ${20 + r() * 22 | 0}%)`;
  const c2 = `hsl(${h2 | 0} ${70 + r() * 25 | 0}% ${55 + r() * 15 | 0}%)`;
  const c3 = `hsl(${h3 | 0} ${60 + r() * 30 | 0}% ${72 + r() * 14 | 0}%)`;
  let s = "";
  const style = hashStr(al.id + "#") % 6;
  if (style === 0) {
    const cx = 30 + r() * 40, cy = 30 + r() * 40;
    for (let i = 8; i > 0; i--) s += `<circle cx="${n(cx)}" cy="${n(cy)}" r="${i * 10.5}" fill="${i % 2 ? c2 : bg}"/>`;
    s += `<circle cx="${n(cx)}" cy="${n(cy)}" r="7" fill="${c3}"/><circle cx="${n(cx)}" cy="${n(cy)}" r="1.6" fill="${bg}"/>`;
  } else if (style === 1) {
    const ang = (r() * 80 - 40) | 0; let x = -70, i = 0;
    s += `<g transform="rotate(${ang} 50 50)">`;
    while (x < 170) { const w = 4 + r() * 16; s += `<rect x="${n(x)}" y="-70" width="${n(w)}" height="240" fill="${[c2, c3, bg][i % 3]}"/>`; x += w; i++; }
    s += "</g>";
  } else if (style === 2) {
    const k = 5 + (r() * 3 | 0), st = 100 / k;
    for (let i = 0; i < k; i++) for (let j = 0; j < k; j++) s += `<circle cx="${n(st * (i + .5))}" cy="${n(st * (j + .5))}" r="${n(st * (.12 + r() * .36))}" fill="${r() < .25 ? c3 : c2}"/>`;
  } else if (style === 3) {
    s += `<circle cx="${n(25 + r() * 50)}" cy="${n(20 + r() * 40)}" r="${n(22 + r() * 18)}" fill="${c2}"/>`;
    const y = 55 + r() * 25; s += `<polygon points="0,100 ${n(20 + r() * 60)},${n(y - 30)} 100,100" fill="${c3}" opacity=".92"/>`;
    s += `<rect x="${n(10 + r() * 55)}" y="${n(10 + r() * 55)}" width="${n(14 + r() * 16)}" height="${n(14 + r() * 16)}" fill="none" stroke="${c3}" stroke-width="2.5" transform="rotate(${(r() * 40 - 20) | 0} 50 50)"/>`;
  } else if (style === 4) {
    const amp = 4 + r() * 8, fq = 1 + r() * 2;
    for (let i = 0; i < 9; i++) { const y0 = 8 + i * 11; let d = `M0 ${n(y0)}`; for (let x = 5; x <= 100; x += 5) d += ` L${x} ${n(y0 + Math.sin(x / 100 * Math.PI * 2 * fq + i * .7) * amp)}`; s += `<path d="${d}" fill="none" stroke="${i % 2 ? c2 : c3}" stroke-width="${n(2 + r() * 3)}" stroke-linecap="round"/>`; }
  } else {
    const hy = 55 + r() * 15;
    s += `<circle cx="50" cy="${n(hy)}" r="${n(26 + r() * 10)}" fill="${c2}"/>`;
    for (let i = 0; i < 5; i++) s += `<rect x="0" y="${n(hy - 22 + i * 5.5)}" width="100" height="${n(1 + i * .7)}" fill="${bg}"/>`;
    s += `<rect y="${n(hy)}" width="100" height="${n(100 - hy)}" fill="${bg}"/>`;
    for (let i = 1; i < 6; i++) s += `<line x1="0" y1="${n(hy + i * i * 1.6)}" x2="100" y2="${n(hy + i * i * 1.6)}" stroke="${c3}" stroke-width=".6" opacity=".7"/>`;
  }
  const svg = `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><rect width="100" height="100" fill="${bg}"/>${s}</svg>`;
  coverCache.set(al.id, svg); return svg;
}
function coverEl(al, cls) {
  const s = h("span", { class: cls });
  const src = safeArt(al.image_url);
  if (src) s.append(h("img", { src, alt: "", loading: "lazy" })); else s.innerHTML = coverSVG(al);
  return s;
}

/* =====================================================================
   App state
===================================================================== */
const S = { me: null, profiles: new Map(), cards: [], cardById: new Map(), albums: new Map(), trades: [], items: new Map(), messages: [], friendships: [], logs: [], likes: [], drawHist: [], loaded: false };
const alb = id => S.albums.get(id) || { id, title: "Unknown album", artist: "", genre: "", description: "" };
const cardsOf = uid => S.cards.filter(c => c.owner === uid);
const sumPoints = cards => cards.reduce((n, c) => n + (c.points || 0), 0);
const me = () => S.profiles.get(S.me);
const nameOf = id => S.profiles.get(id)?.username || "A former member";
const unreadCount = () => S.messages.filter(m => m.recipient === S.me && !m.read_at).length;
const pendingIn = () => S.trades.filter(t => t.to_user === S.me && t.status === "pending");
const otherSide = f => f.requester === S.me ? f.addressee : f.requester;
const myLinks = () => S.friendships.filter(f => f.requester === S.me || f.addressee === S.me);  // the list also holds your friends' friendships
const friendIds = () => myLinks().filter(f => f.status === "accepted").map(otherSide);
const isFriend = id => myLinks().some(f => f.status === "accepted" && otherSide(f) === id);
const requestsIn = () => S.friendships.filter(f => f.status === "pending" && f.addressee === S.me);
const requestsOut = () => S.friendships.filter(f => f.status === "pending" && f.requester === S.me);
const friendshipWith = id => myLinks().find(f => otherSide(f) === id);
const likesOn = cardId => S.likes.filter(l => l.card_id === cardId);
const iLike = cardId => S.likes.some(l => l.card_id === cardId && l.user_id === S.me);
const DAY = 864e5;
const ageDays = ts => ts ? (Date.now() - new Date(ts).getTime()) / DAY : Infinity;
// Cards that came from a trade: "New find!" for 4 days, and a listened / not-listened status for 2 weeks.
const NEW_DAYS = 4, RECENT_DAYS = 14;
const isNewCard = c => ageDays(c.acquired_at) < NEW_DAYS;
const isRecentTrade = c => ageDays(c.acquired_at) < RECENT_DAYS;

async function loadAll() {
  const q = await Promise.all([
    sb.from("profiles").select("*"),
    sb.from("cards").select("*"),
    sb.from("albums").select("*"),
    sb.from("trades").select("*").order("updated_at", { ascending: false }).limit(500),
    sb.from("trade_items").select("*"),
    sb.from("messages").select("*").order("created_at", { ascending: true }).limit(5000),
    sb.from("friendships").select("*"),
    sb.from("song_logs").select("*").order("created_at", { ascending: false }),
    sb.from("card_likes").select("*"),
    sb.from("drawing_history").select("*").eq("user_id", S.me)
  ]);
  const bad = q.find(r => r.error); if (bad) throw bad.error;
  const [p, c, a, t, ti, m, f, sl, lk, dh] = q.map(r => r.data);
  const prevIn = new Set(pendingIn().map(x => x.id)), prevMsg = new Set(S.messages.map(x => x.id)), prevReq = new Set(requestsIn().map(x => x.id));
  S.profiles = new Map(p.map(x => [x.id, x]));
  S.cards = c; S.cardById = new Map(c.map(x => [x.id, x]));
  S.albums = new Map(a.map(x => [x.id, x]));
  S.trades = t;
  S.items = new Map(); for (const it of ti) { if (!S.items.has(it.trade_id)) S.items.set(it.trade_id, []); S.items.get(it.trade_id).push(it); }
  S.messages = m; S.friendships = f; S.logs = sl; S.likes = lk; S.drawHist = dh;
  if (S.loaded) {
    for (const x of pendingIn()) if (!prevIn.has(x.id)) toast(`New trade offer from ${nameOf(x.from_user)}.`);
    for (const x of requestsIn()) if (!prevReq.has(x.id)) toast(`${nameOf(x.requester)} wants to be friends.`);
    const fresh = m.filter(x => x.recipient === S.me && !prevMsg.has(x.id));
    if (fresh.length && current.name !== "messages") toast(`New message from ${nameOf(fresh[fresh.length - 1].sender)}.`);
  }
  S.loaded = true;
}
let reloadTimer = null, liveChannel = null;
function scheduleReload() { clearTimeout(reloadTimer); reloadTimer = setTimeout(async () => { if (!S.me) return; try { await loadAll(); refresh(); } catch (e) { console.warn(e); } }, 250); }
function subscribeLive() {
  if (liveChannel) return;
  liveChannel = sb.channel("basement-club-live");
  for (const table of ["profiles", "cards", "albums", "trades", "trade_items", "messages", "friendships", "song_logs", "card_likes", "drawing_history"]) liveChannel.on("postgres_changes", { event: "*", schema: "public", table }, scheduleReload);
  liveChannel.subscribe();
}
const tradeSides = t => { const its = S.items.get(t.id) || []; return { give: its.filter(i => i.side === "give").map(i => i.card_id), get: its.filter(i => i.side === "get").map(i => i.card_id) }; };

/* =====================================================================
   Spotify
   Preview mode uses sample listening data. On the live site everything goes
   through the "spotify" edge function (supabase/functions/spotify), which
   keeps the Spotify secret key and everyone's Spotify sign-in on the server.
===================================================================== */
// What the site asks Spotify for when you sign in: your recently played songs.
const SPOTIFY_SCOPES = "user-read-recently-played";
const SIGNIN_KEY = "basement-club-spotify-signin";
const b64url = bytes => btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
// Where Spotify sends you back after signing in. Must be listed under Redirect URIs in the Spotify dashboard.
const spotifyRedirect = () => location.origin + location.pathname.replace(/index\.html$/, "");
async function spotifyFn(action, args = {}) {
  const { data, error } = await sb.functions.invoke("spotify", { body: { action, ...args } });
  if (error) {
    let message = "Spotify didn't respond. Try again in a moment.";
    try { const j = await error.context?.json?.(); if (j?.error) message = j.error; } catch { }
    throw err(message);
  }
  return data;
}
// Your recent plays, fetched at most once a minute (Home, making cards and the listened check all use them).
let recentCache = null;
async function recentPlays() {
  if (recentCache && Date.now() - recentCache.at < 60_000) return recentCache.data;
  const data = await spotifyFn("recent");
  recentCache = { at: Date.now(), data };
  return data;
}
const MUSIC = {
  // Sends you to Spotify's sign-in page. Spotify sends you back here with a one-time code,
  // which boot() hands to the spotify edge function to finish signing in.
  async signIn() {
    if (DEMO) return sb.auth.signInWithProvider("spotify");
    if (!CONFIG.SPOTIFY_CLIENT_ID || CONFIG.SPOTIFY_CLIENT_ID.includes("YOUR-")) throw err("Add your Spotify Client ID to config.js first (SPOTIFY_CLIENT_ID).");
    const verifier = b64url(crypto.getRandomValues(new Uint8Array(48)));
    const challenge = b64url(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier))));
    const state = b64url(crypto.getRandomValues(new Uint8Array(16)));
    try { sessionStorage.setItem(SIGNIN_KEY, JSON.stringify({ verifier, state })); }
    catch { throw err("This browser is blocking site storage, so sign-in can't finish. Allow site data for this page and try again."); }
    location.assign("https://accounts.spotify.com/authorize?" + new URLSearchParams({ client_id: CONFIG.SPOTIFY_CLIENT_ID, response_type: "code",
      redirect_uri: spotifyRedirect(), scope: SPOTIFY_SCOPES, state, code_challenge_method: "S256", code_challenge: challenge }));
    return { error: null };
  },
  // Albums from your recent listening, most played first: [{ album, plays }]
  async recentAlbums() {
    if (DEMO) return demo.recentAlbums();
    const { albums, plays } = await recentPlays();
    const count = new Map(); for (const p of plays) count.set(p.album_id, (count.get(p.album_id) || 0) + 1);
    return albums.map(album => ({ album, plays: count.get(album.id) || 1 })).sort((a, b) => b.plays - a.plays);
  },
  // Albums Basement Club already knows: every album anyone has made a card for (plus the sample list in preview mode).
  async searchCatalog() {
    const known = [...S.albums.values()];
    if (DEMO) { const ids = new Set(known.map(a => a.id)); for (const a of await demo.searchAlbums()) if (!ids.has(a.id)) known.push(a); }
    return known;
  },
  // Albums from Spotify's catalog (10 per search).
  async searchOnline(q) {
    if (DEMO) throw Object.assign(new Error("not connected"), { offline: true });
    const { albums } = await spotifyFn("search", { q });
    return albums.map((a, i) => ({ ...a, _rel: 100 - i * 5 }));
  },
  // Songs you've had on lately, newest first, one entry per song.
  async recentTracks() {
    if (DEMO) return demo.recentTracks();
    const { plays } = await recentPlays(), seen = new Set(), out = [];
    for (const p of plays) if (p.track_id && !seen.has(p.track_id)) { seen.add(p.track_id); out.push({ id: p.track_id, name: p.name, artist: p.artist, albumId: p.album_id, genre: alb(p.album_id).genre || "" }); }
    return out;
  },
  // Songs you've actually played lately, with the album each came from: how cards get marked as listened to.
  async recentPlays() {
    if (DEMO) return demo.recentTracks();
    const { plays } = await recentPlays();
    return plays.map(p => ({ id: p.track_id, albumId: p.album_id }));
  },
  // Fills in genre and the underground check for Spotify albums (the edge function asks Spotify for the details).
  async enrich(ids) {
    if (DEMO) return;
    const spotifyIds = [...new Set(ids)].filter(id => /^[A-Za-z0-9]{22}$/.test(id));
    for (let i = 0; i < spotifyIds.length; i += 20) await spotifyFn("details", { ids: spotifyIds.slice(i, i + 20) });
  }
};

/* =====================================================================
   Site theme and card size (Settings). Saved on your profile, and in this
   browser so the page opens in your colors before you're signed in.
===================================================================== */
// [id, name, colors described, swatch colors]
const THEMES = [
  ["strawberry", "Strawberry Mint", "Light pink and mint green", ["#FFE6EF", "#F7A9C6", "#13805C"]],
  ["ember", "Ember", "Black and orange", ["#14110F", "#FF7A1A", "#FFB36B"]],
  ["redroom", "Red Room", "Red and black", ["#0F0B0B", "#E3242E", "#FF8A90"]],
  ["cornflower", "Cornflower Cream", "Cream white and light blue", ["#FAF5E8", "#A8CBF0", "#2D66A8"]],
  ["sunday", "Sunday Morning", "Baby yellow and light blue", ["#FFF7D1", "#FFE27A", "#BCDDF7"]],
  ["lagoon", "Lagoon", "Turquoise and dark green", ["#DDF6F3", "#35CFC7", "#0C4A33"]],
  ["daylight", "Daylight", "Plain light mode", ["#F5F5F3", "#FFFFFF", "#18181A"]],
  ["midnight", "Midnight", "Plain dark mode", ["#111215", "#1B1D21", "#ECEDF0"]]
];
const CARD_SIZES = [["small", "Small"], ["medium", "Medium"], ["large", "Large"]];
const PREF_KEY = "basement-club-prefs";
const validTheme = t => THEMES.some(x => x[0] === t) ? t : "strawberry";
const validSize = z => CARD_SIZES.some(x => x[0] === z) ? z : "small";
function applyPrefs(p) {
  const r = document.documentElement;
  r.dataset.siteTheme = validTheme(p?.theme);
  r.dataset.cardSize = validSize(p?.size);
}
const currentPrefs = () => ({ theme: validTheme(document.documentElement.dataset.siteTheme), size: validSize(document.documentElement.dataset.cardSize) });
function rememberPrefs(p) { try { localStorage.setItem(PREF_KEY, JSON.stringify(p)); } catch { } }
function storedPrefs() { try { return JSON.parse(localStorage.getItem(PREF_KEY) || "null") || {}; } catch { return {}; } }
applyPrefs(storedPrefs());

function openSettings() {
  const before = currentPrefs(), st = { ...before };
  let saved = false;
  const themeGrid = h("div", { class: "theme-grid", role: "radiogroup", "aria-label": "Theme" }, THEMES.map(([v, name, desc, sw]) =>
    h("label", { class: "theme-opt", for: "th-" + v },
      h("input", { type: "radio", name: "site-theme", id: "th-" + v, value: v, checked: v === st.theme || null, onchange: () => { st.theme = v; applyPrefs(st); } }),
      h("span", { class: "th-sw", "aria-hidden": "true" }, sw.map(c => { const i = h("i"); i.style.background = c; return i; })),
      h("span", { class: "th-txt" }, h("strong", { text: name }), h("small", { text: desc })))));
  const sizeGrid = h("div", { class: "size-grid", role: "radiogroup", "aria-label": "Card size" }, CARD_SIZES.map(([v, name], i) =>
    h("label", { class: "size-opt", for: "sz-" + v },
      h("input", { type: "radio", name: "card-size", id: "sz-" + v, value: v, checked: v === st.size || null, onchange: () => { st.size = v; applyPrefs(st); } }),
      h("span", { class: "sz-glyph s" + i, "aria-hidden": "true" }, h("i"), h("i")),
      h("strong", { text: name }))));
  const save = btn("Save settings", async () => {
    save.disabled = true;
    const { error } = await sb.from("profiles").update({ site_theme: st.theme, card_size: st.size }).eq("id", S.me);
    if (error) { toast("Your settings didn't save. Try again.", "error"); save.disabled = false; return; }
    rememberPrefs(st); saved = true;
    await loadAll(); dlg.close(); toast("Settings saved."); refresh();
  }, "primary");
  const dlg = modal({ title: "Settings", body: h("div", { class: "form-grid" },
    h("fieldset", { class: "fieldset" }, h("legend", { text: "Theme" }),
      h("p", { class: "hint small muted", text: "Colors for the whole site, just for you. Profiles keep the colors their owners chose." }), themeGrid),
    h("fieldset", { class: "fieldset" }, h("legend", { text: "Card size" }),
      h("p", { class: "hint small muted", text: "How big album cards are everywhere on the site. The space between them stays the same." }), sizeGrid)),
    foot: [btn("Cancel", () => dlg.close()), save] });
  dlg.addEventListener("close", () => { if (!saved) applyPrefs(before); });
}

/* =====================================================================
   Album search ranking
   Matches whole words, words you're still typing, and words with typos
   ("radiohed", "abbey rode"), then suggests the corrected search.
===================================================================== */
const normText = s => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim();
function editDistance(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 3;
  let prev2 = null, prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) cur[j] = Math.min(cur[j], prev2[j - 2] + 1);
    }
    prev2 = prev; prev = cur;
  }
  return prev[b.length];
}
// Score for one typed word against one word of a title or artist. [score, was it a typo fix]
function wordMatch(w, t, typing) {
  if (t === w) return [3, false];
  if (t.startsWith(w) && (typing || w.length >= 4)) return [2.4, false];
  if (w.length < 3) return [0, false];
  const allow = w.length <= 3 ? 1 : 2;
  let d = editDistance(w, t);
  if (typing && t.length > w.length) d = Math.min(d, editDistance(w, t.slice(0, w.length)) + 0.5);
  return d <= allow ? [2 - d * .5, true] : [0, false];
}
// Plain edit distance for whole titles and names (no cutoff), and a 0-1 similarity from it.
function fullDistance(a, b) {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) { const cur = [i]; for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = cur; }
  return prev[b.length];
}
const similar = (a, b) => { a = normText(a); b = normText(b); if (!a || !b) return 0; if (a === b) return 1;
  const ca = a.replace(/ /g, ""), cb = b.replace(/ /g, ""); if (ca === cb) return .97;
  return 1 - fullDistance(ca, cb) / Math.max(ca.length, cb.length); };
// Before someone adds an album by hand: is it one we can already find, maybe spelled differently?
async function findAlbumMatch(title, artist, local = []) {
  let pool = [...(await MUSIC.searchCatalog().catch(() => [...S.albums.values()])), ...local], checkedOnline = null;
  try { pool = pool.concat(await MUSIC.searchOnline(`${title} ${artist}`)); checkedOnline = true; } catch (e) { checkedOnline = e.offline ? null : false; }
  const seen = new Set(), scored = [];
  for (const a of pool) {
    const k = normText(a.title) + "|" + normText(a.artist); if (seen.has(k)) continue; seen.add(k);
    const t = similar(title, a.title), ar = similar(artist, a.artist);
    if (t === 1 && ar === 1) return { exact: a, close: [], checkedOnline };
    // Also catch the right title with an extra word, like "Kid A Mnesia" or "OK Computer OKNOTOK".
    const tt = Math.max(t, normText(a.title).startsWith(normText(title)) || normText(title).startsWith(normText(a.title)) ? .85 : 0);
    if (tt >= .7 && ar >= .6) scored.push([tt * .6 + ar * .4, a]);
    else if (tt >= .9 && ar >= .35) scored.push([tt * .5 + ar * .3, a]);
  }
  scored.sort((x, y) => y[0] - x[0]);
  return { exact: null, close: scored.slice(0, 3).map(x => x[1]), checkedOnline };
}
function rankAlbums(q, albums) {
  const words = normText(q).split(" ").filter(Boolean);
  if (!words.length) return { items: [], corrected: null };
  const nq = words.join(" "), scored = [];
  for (const al of albums) {
    const nt = normText(al.title), na = normText(al.artist), pool = [...new Set((nt + " " + na).split(" ").filter(Boolean))];
    let total = 0, missed = 0, fuzzy = false; const fixed = [];
    words.forEach((w, i) => {
      let best = [0, false], bestT = w;
      for (const t of pool) { const m = wordMatch(w, t, i === words.length - 1); if (m[0] > best[0]) { best = m; bestT = t; } }
      if (!best[0]) { missed++; fixed.push(w); return; }
      total += best[0]; if (best[1]) fuzzy = true; fixed.push(best[1] ? bestT : w);
    });
    if (missed > (words.length >= 3 ? 1 : 0)) continue;
    if (nt === nq || na === nq) total += 3; else if (nt.startsWith(nq) || na.startsWith(nq)) total += 1.5;
    if (al._type === "EP") total -= 0.6;
    scored.push({ al, total: total - missed * 2, fuzzy, fixed: fixed.join(" ") });
  }
  scored.sort((a, b) => b.total - a.total || (b.al._rel ?? 60) - (a.al._rel ?? 60) || (b.al.year || 0) - (a.al.year || 0));
  const top = scored[0];
  return { items: scored.map(x => x.al), corrected: top && top.fuzzy && top.fixed !== nq ? top.fixed : null };
}

/* =====================================================================
   Card components
===================================================================== */
function cardEl(c, o = {}) {
  const al = c._album || alb(c.album_id), p = c.points ?? LIKED_FROM;
  const [tk, tname] = tierOf(p);
  const from = c.made_by && c.made_by !== c.owner ? c.made_by : null;
  const tag = o.static ? "div" : "button";
  const status = o.dupe ? ["dupe", o.dupe] : o.locked ? ["lock", "In a trade"] : (c.for_trade && !o.hideTrade ? ["trade", "Up for trade"] : null);
  const fresh = !o.compact && isNewCard(c), heard = !o.compact && isRecentTrade(c) ? !!c.listened_at : null;
  const subs = SCALES.slice(0, 3), hasScores = subs.some(x => c[x.key] != null);
  const scoreText = hasScores ? " " + subs.filter(x => c[x.key] != null).map(x => `${x.label}: ${starWord(starsOf(c[x.key]))}`).join(", ") + "." : "";
  return h(tag, {
    class: `card tier-${tk}${o.big ? " big" : ""}${o.compact ? " compact" : ""}${o.locked ? " locked" : ""}${o.dupe ? " dupe" : ""}`,
    type: o.static ? null : "button", role: o.static ? "group" : null,
    "aria-label": `${fresh ? "New find. " : ""}${al.title} by ${al.artist}. Taste ${starWord(starsOf(p))}, ${tname}.${scoreText}${from ? ` Traded from ${nameOf(from)}.` : ""}${heard === null ? "" : heard ? " Listened to." : " Not listened to yet."}${status ? ` ${status[1]}.` : ""}`,
    "aria-pressed": o.selectable ? String(!!o.selected) : null, disabled: o.disabled || null, onclick: o.onClick
  },
    fresh ? h("span", { class: "new-tag", "aria-hidden": "true", text: "New find!" }) : null,
    coverEl(al, "cover"),
    h("span", { class: "head" }, h("span", { class: "title", text: al.title })),
    h("span", { class: "artist", text: al.artist }),
    h("span", { class: "card-stars", "aria-hidden": "true" }, starRow(p)),
    from ? h("span", { class: "from", text: `From ${nameOf(from)}` }) : null,
    heard === null ? null : h("span", { class: "heard " + (heard ? "yes" : "no"), "aria-hidden": "true", text: heard ? "Listened to" : "Not listened to yet" }),
    hasScores && !o.compact ? h("span", { class: "scores", "aria-hidden": "true" }, subs.map(x => h("span", {}, h("b", { text: starShort(c[x.key]) }), h("small", { text: x.short })))) : null,
    status ? h("span", { class: `strip ${status[0]}`, text: status[1] }) : null);
}
function miniCard(cardId, o = {}) {
  const c = S.cardById.get(cardId) || { album_id: "?", points: LIKED_FROM }; const al = alb(c.album_id); const [tk] = tierOf(c.points);
  const sub = o.year && al.year ? `${al.artist}, ${al.year}` : al.artist;
  return h("button", { type: "button", class: "mini", onclick: () => openCardDetail(c, o.ask ? { ownerId: c.owner } : {}), "aria-label": `${al.title} by ${al.artist}${al.year ? `, ${al.year}` : ""}, taste ${starWord(starsOf(c.points))}. Open card.` },
    coverEl(al, "mcover"), h("span", { style: "min-width:0" }, h("span", { class: "mt", text: al.title }), h("span", { class: "ma", text: sub })), h("span", { class: "pts " + tk, "aria-hidden": "true", text: starShort(c.points) }));
}
function avatarEl(p, size) {
  const src = safeImg(p?.avatar_url);
  if (src) return h("img", { class: "avatar " + size, src, alt: "" });
  const el = h("span", { class: "avatar " + size, "aria-hidden": "true", text: (p?.username || "?").slice(0, 1).toUpperCase() });
  const hl = hexOrNull(p?.highlight_color); if (hl) { el.style.background = hl; el.style.color = inkOn(hl); }
  return el;
}
// Like button for the review on a card. Shows the count; your own reviews just show the count.
function likeButton(c) {
  const n = likesOn(c.id).length, liked = iLike(c.id);
  if (c.owner === S.me) return h("span", { class: "likes", "aria-label": `${plural(n, "like")} on your review` }, h("span", { class: "heart", "aria-hidden": "true", text: "♥" }), String(n));
  const b = h("button", { type: "button", class: "like-btn", "data-fid": "like-" + c.id, "aria-pressed": String(liked), "aria-label": `Like this review. ${plural(n, "like")} so far.`, onclick: async () => {
    b.disabled = true;
    const { error } = await sb.rpc("like_card", { card: c.id, liked: !liked });
    if (error) { toast(msgOf(error), "error"); b.disabled = false; return; }
    await loadAll();
    const nb = likeButton(S.cardById.get(c.id) || c); b.replaceWith(nb); nb.focus(); refresh();
  } }, h("span", { class: "heart", "aria-hidden": "true", text: liked ? "♥" : "♡" }), String(n));
  return b;
}
function spotifyEmbed(trackId, title) {
  return h("iframe", { class: "sp-embed", src: `https://open.spotify.com/embed/track/${trackId}?utm_source=generator`, title, loading: "lazy", allow: "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" });
}

/* =====================================================================
   Navigation
===================================================================== */
const TABS = [["home", "Home"], ["profile", "My profile"], ["market", "Marketplace"], ["friends", "Friends"], ["trades", "Trades"], ["messages", "Messages"]];
let current = { name: null };
function go(name, arg = null) {
  try { current.cleanup?.(); } catch { }
  current = { name, arg };
  const main = $("#main"); main.replaceChildren();
  const v = VIEWS[name](main, arg) || {};
  current = { name, arg, ...v };
  updateNav(); window.scrollTo(0, 0);
}
function refresh() { updateNav(); try { current.update?.(); } catch (e) { console.error(e); } }
function updateNav() {
  const tabs = $("#tabs"); tabs.replaceChildren();
  if (!S.me) return;
  const onboarding = current.name === "onboard" || (current.name === "make" && current.arg?.onboarding);
  if (me() && !onboarding) {
    for (const [k, label] of TABS) {
      const active = current.name === k && (k !== "profile" || !current.arg || current.arg === S.me);
      const badge = k === "trades" ? pendingIn().length : k === "messages" ? unreadCount() : k === "friends" ? requestsIn().length : 0;
      tabs.append(h("button", { type: "button", class: "tab", "aria-current": active ? "page" : null, onclick: () => go(k) }, label,
        badge ? h("span", { class: "count", "aria-label": `${badge} new`, text: badge }) : null));
    }
  }
  // Log out is on your profile; while you're still signing up it stays up here.
  if (!me() || onboarding) tabs.append(h("button", { type: "button", class: "tab", onclick: logout }, "Log out"));
}
async function logout() {
  await sb.auth.signOut();
  if (!DEMO) { location.reload(); return; }
  resetState(); go("auth");
}
function resetState() { Object.assign(S, { me: null, profiles: new Map(), cards: [], cardById: new Map(), albums: new Map(), trades: [], items: new Map(), messages: [], friendships: [], logs: [], likes: [], drawHist: [], loaded: false }); updateNav(); }
$("#brand").addEventListener("click", () => { if (S.me && me() && cardsOf(S.me).length + myLinks().length) go("home"); });

let dlgN = 0;
function modal({ title, body, foot, wide }) {
  const hid = "dlg" + (++dlgN);
  const dlg = h("dialog", { class: "modal" + (wide ? " wide" : ""), "aria-labelledby": hid },
    h("div", { class: "m-head" }, h("h2", { id: hid, text: title }), h("button", { type: "button", class: "x", "aria-label": "Close", onclick: () => dlg.close(), text: "×" })),
    h("div", { class: "m-body" }, body), foot ? h("div", { class: "m-foot" }, foot) : null);
  dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener("close", () => dlg.remove());
  document.body.append(dlg); dlg.showModal(); return dlg;
}
// A button that asks for a second click before doing something hard to undo.
function confirmBtn(label, confirmLabel, action, cls = "small danger") {
  const b = btn(label, async () => {
    if (!b.dataset.armed) { b.dataset.armed = "1"; b.textContent = confirmLabel; setTimeout(() => { if (b.isConnected) { delete b.dataset.armed; b.textContent = label; } }, 4000); return; }
    b.disabled = true; try { await action(); } catch (e) { toast(msgOf(e), "error"); b.disabled = false; }
  }, cls);
  return b;
}

/* =====================================================================
   Card detail
===================================================================== */
// Click (or tap, or drag across) the stars to rate. Click the left half of a star for a half star.
// Keyboard: arrow keys move by half a star. Optional ratings can be cleared.
function starPicker(value, onChange, idBase, { label = "Rating", hint = "", tier = false, optional = false } = {}) {
  let v = starsOf(value);
  const fill = h("span", { class: "st-fill", "aria-hidden": "true", text: "★★★★★" });
  const pad = h("span", { class: "star-pick", role: "slider", tabindex: "0", id: idBase, "aria-labelledby": idBase + "-l", "aria-valuemin": "0.5", "aria-valuemax": "5" },
    h("span", { class: "st-base", "aria-hidden": "true", text: "★★★★★" }), fill);
  const valEl = h("span", { class: "star-val" });
  const tierEl = tier ? h("span", { class: "tier-label" }) : null;
  const clearB = optional ? h("button", { type: "button", class: "linkish small", onclick: () => set(null), text: "Clear" }) : null;
  function paint(show = v) {
    fill.style.width = show ? show / 5 * 100 + "%" : "0";
    pad.classList.toggle("unrated", !v);
    pad.setAttribute("aria-valuenow", String(v ?? 0));
    pad.setAttribute("aria-valuetext", v ? starWord(v) + (tier ? ", " + tierOf(toPoints(v))[1] : "") : "Not rated");
    valEl.textContent = show ? starNum(show) : optional ? "Not rated" : "Tap a star";
    if (tierEl) { const [tk, tn] = show ? tierOf(toPoints(show)) : ["", ""]; tierEl.className = "tier-label " + tk; tierEl.textContent = tn; tierEl.hidden = !show; }
    if (clearB) clearB.hidden = !v;
  }
  function set(st) { v = st; paint(); onChange(v == null ? null : toPoints(v)); }
  const at = e => { const r = pad.getBoundingClientRect(); return clamp(Math.ceil((e.clientX - r.left) / r.width * 10) / 2, .5, 5); };
  pad.addEventListener("pointerdown", e => { e.preventDefault(); pad.focus(); pad.setPointerCapture(e.pointerId); set(at(e)); });
  pad.addEventListener("pointermove", e => { if (pad.hasPointerCapture(e.pointerId)) set(at(e)); else if (e.pointerType === "mouse") paint(at(e)); });
  pad.addEventListener("pointerleave", () => paint());
  pad.addEventListener("keydown", e => {
    const k = e.key, cur = v ?? 0;
    if (k === "ArrowRight" || k === "ArrowUp") set(Math.min(5, cur + .5));
    else if (k === "ArrowLeft" || k === "ArrowDown") set(Math.max(.5, cur - .5));
    else if (k === "Home") set(.5); else if (k === "End") set(5);
    else if ((k === "Delete" || k === "Backspace") && optional) set(null);
    else return;
    e.preventDefault();
  });
  paint();
  return h("div", { class: "scale" + (tier ? " main" : "") },
    h("div", { class: "scale-head" }, h("span", { class: "scale-label", id: idBase + "-l", text: label }), hint ? h("span", { class: "scale-hint", text: hint }) : null),
    h("div", { class: "star-ctl" }, pad, valEl, tierEl, clearB));
}
// The four star ratings for one card, taste first. Writes into item[key].
function scaleInputs(item, al, idBase) {
  return h("div", { class: "scales" }, [SCALES[3], ...SCALES.slice(0, 3)].map(x => starPicker(item[x.key], v => { item[x.key] = v; }, `${idBase}-${x.key}`,
    { label: x.label + (x.key === "points" ? "" : " (optional)"), hint: x.hint(al), tier: x.key === "points", optional: x.key !== "points" })));
}
// Read-only stars for someone else's card.
function scoreMeters(c, al, whose) {
  return h("div", { class: "meters" }, [SCALES[3], ...SCALES.slice(0, 3)].map(x =>
    h("div", { class: "meter-row" + (x.key === "points" ? " main" : "") },
      h("span", { class: "ml" }, h("strong", { text: x.key === "points" ? `${whose}'s taste` : x.label }), h("small", { text: x.key === "points" ? `How much it means to ${whose}` : x.hint(al) })),
      starRow(c[x.key], "lg"))));
}
/* ---------- Drawings: a small square doodle, the same shape as the album cover ---------- */
const PAD_PX = 360;
const PEN_COLORS = [["Ink", "#1A1A1A"], ["Pink", "#E0457B"], ["Jade", "#13805C"], ["Blue", "#2D66A8"], ["Yellow", "#F2B705"], ["Orange", "#FF7A1A"], ["Purple", "#8A4FD1"]];
const PEN_SIZES = [["Fine", 4], ["Medium", 10], ["Thick", 22]];
let padN = 0;
// onChange gets a PNG data URL, or null once it's cleared.
function drawPad(initial, onChange, label = "Drawing") {
  const n = ++padN;
  const cv = h("canvas", { class: "pad-canvas", width: PAD_PX, height: PAD_PX, role: "img", "aria-label": `${label}. Draw with a mouse, finger or pen.` });
  const g = cv.getContext("2d");
  let color = PEN_COLORS[0][1], width = PEN_SIZES[1][1], erasing = false, drawn = !!initial, last = null;
  const undo = [];
  const paper = () => { g.fillStyle = "#FFFFFF"; g.fillRect(0, 0, PAD_PX, PAD_PX); };
  paper();
  if (initial) { const im = new Image(); im.onload = () => g.drawImage(im, 0, 0, PAD_PX, PAD_PX); im.src = initial; }
  const emit = () => onChange(drawn ? cv.toDataURL("image/png") : null);
  const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * PAD_PX, (e.clientY - r.top) / r.height * PAD_PX]; };
  const ink = () => { g.strokeStyle = g.fillStyle = erasing ? "#FFFFFF" : color; g.lineWidth = erasing ? width * 1.8 : width; g.lineCap = g.lineJoin = "round"; };
  cv.addEventListener("pointerdown", e => {
    e.preventDefault(); cv.setPointerCapture(e.pointerId);
    undo.push(g.getImageData(0, 0, PAD_PX, PAD_PX)); if (undo.length > 12) undo.shift();
    last = pos(e); ink(); g.beginPath(); g.arc(last[0], last[1], g.lineWidth / 2, 0, Math.PI * 2); g.fill();
    drawn = true; undoB.disabled = false;
  });
  cv.addEventListener("pointermove", e => {
    if (!last || !cv.hasPointerCapture(e.pointerId)) return;
    const p = pos(e); ink(); g.beginPath(); g.moveTo(last[0], last[1]); g.lineTo(p[0], p[1]); g.stroke(); last = p;
  });
  const end = () => { if (last) { last = null; emit(); } };
  cv.addEventListener("pointerup", end); cv.addEventListener("pointercancel", end);
  const swatches = h("div", { class: "pad-row", role: "radiogroup", "aria-label": "Pen color" }, PEN_COLORS.map(([name, hex], i) =>
    h("label", { class: "pen", title: name }, h("input", { type: "radio", name: "pen-" + n, checked: i === 0 || null, "aria-label": name, onchange: () => { color = hex; erasing = false; eraser.checked = false; } }),
      h("span", { style: `background:${hex}` }))),
    );
  const eraserL = h("label", { class: "pen eraser", title: "Eraser" }, h("input", { type: "radio", name: "pen-" + n, "aria-label": "Eraser", onchange: e => { erasing = e.target.checked; } }), h("span", { text: "⌫" }));
  const eraser = eraserL.querySelector("input");
  const sizes = h("div", { class: "pad-row", role: "radiogroup", "aria-label": "Pen size" }, PEN_SIZES.map(([name, w], i) =>
    h("label", { class: "pen-size", title: name }, h("input", { type: "radio", name: "size-" + n, checked: i === 1 || null, "aria-label": name, onchange: () => { width = w; } }),
      h("span", {}, h("i", { style: `width:${Math.max(4, w / 2)}px;height:${Math.max(4, w / 2)}px` })))));
  const undoB = btn("Undo", () => { const im = undo.pop(); if (im) { g.putImageData(im, 0, 0); emit(); } undoB.disabled = !undo.length; }, "small", { disabled: true });
  const clearB = btn("Clear", () => { undo.push(g.getImageData(0, 0, PAD_PX, PAD_PX)); paper(); drawn = false; undoB.disabled = false; emit(); }, "small ghost");
  return h("div", { class: "pad" }, cv, swatches, h("div", { class: "pad-row" }, sizes, eraserL), h("div", { class: "pad-row" }, undoB, clearB));
}
function dataUrlToBlob(url) {
  const [head, data] = url.split(","), bin = atob(data), arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: (head.match(/data:([^;]+)/) || [])[1] || "image/png" });
}
// Saves a drawing to storage and returns its address (a data URL in preview mode).
async function saveDrawing(dataUrl) { return dataUrl ? uploadImage(dataUrlToBlob(dataUrl), "drawing-" + Date.now() + "-" + Math.floor(Math.random() * 1e6), true) : null; }

// Listened status for a card you got in a trade.
function listenedBox(c) {
  const heard = !!c.listened_at;
  const set = async v => {
    const { error } = await sb.rpc("mark_listened", { card: c.id, listened: v });
    if (error) { toast(msgOf(error), "error"); return; }
    await loadAll(); refresh();
    const fresh = S.cardById.get(c.id); if (fresh) box.replaceWith(listenedBox(fresh));
  };
  const box = h("div", { class: "heard-box " + (heard ? "yes" : "no") },
    h("p", {}, h("strong", { text: heard ? "Listened to" : "Not listened to yet" }), " ",
      h("span", { class: "muted small", text: heard ? `Since ${fmtDate(c.listened_at)}.` : `It's new from a trade. This updates on its own once you play it on ${SERVICES[me()?.service]?.[0] || "your music service"}.` })),
    btn(heard ? "Mark as not listened" : "Mark as listened", () => set(!heard), "small ghost"));
  return box;
}
function openCardDetail(c, ctx = {}) {
  const al = alb(c.album_id);
  const [tk, tname] = tierOf(c.points);
  const mine = c.owner === S.me, ownerName = nameOf(c.owner);
  const others = new Set(S.cards.filter(x => x.album_id === al.id && x.owner !== c.owner).map(x => x.owner)).size;
  const facts = h("dl", { class: "facts" }, [
    ["Released", al.year || "Unknown"], ["Genre", al.genre || "Uncategorized"],
    c.made_by && c.made_by !== c.owner ? ["Card made by", nameOf(c.made_by)] : null,
    c.created_at ? ["Card made", fmtDate(c.created_at)] : null,
    c.acquired_at ? [mine ? "You got it" : `${ownerName} got it`, `${fmtDate(c.acquired_at)}, in a trade`] : null,
    ["Other people with this album", others ? plural(others, "person") : "Nobody else yet"]
  ].filter(Boolean).map(([k, v]) => h("div", {}, h("dt", { text: k }), h("dd", { text: String(v) }))));
  const sp = safeHttp(al.spotify_url);
  const info = [al.description ? h("p", { style: "margin:18px 0;max-width:52ch", class: "muted", text: al.description }) : null, facts,
    sp ? h("p", { style: "margin-top:14px" }, h("a", { class: "sp-link", href: sp, target: "_blank", rel: "noopener", text: "Listen on Spotify" })) : null];
  const foot = [];
  let side;
  if (mine) {
    const item = { points: c.points ?? LIKED_FROM, genre_score: c.genre_score ?? null, artist_score: c.artist_score ?? null, decade_score: c.decade_score ?? null, for_trade: !!c.for_trade };
    const note = h("textarea", { id: "cd-note", maxlength: "280", rows: "3", placeholder: "What you think of it (optional)" }); note.value = c.note || "";
    const trade = h("input", { type: "checkbox", id: "cd-trade", checked: item.for_trade || null, onchange: e => { item.for_trade = e.target.checked; } });
    const nLikes = likesOn(c.id).length;
    side = h("div", { style: "min-width:0" },
      isRecentTrade(c) ? listenedBox(c) : null,
      h("h3", { text: "Your ratings", style: "margin-bottom:4px" }), scaleInputs(item, al, "cd"),
      h("label", { class: "field", for: "cd-note", style: "margin-top:16px" }, "Your review ",
        h("span", { class: "hint", text: c.note ? `${plural(nLikes, "like")} so far. Rewriting it starts the likes over. Reviews and their likes are cleared when the card is traded.` : "Anyone can read and like it. It's cleared when the card is traded." }), note),
      h("label", { class: "check", for: "cd-trade", style: "margin-top:12px" }, trade, "Looking to trade this card"),
      info);
    const save = btn("Save", async () => {
      save.disabled = true;
      const { error } = await sb.rpc("update_card", { card: c.id, ...item, note: note.value.trim() });
      if (error) { toast(msgOf(error), "error"); save.disabled = false; return; }
      await loadAll(); dlg.close(); toast("Card updated."); refresh();
    }, "primary");
    const remove = confirmBtn("Remove from binder", "Click again to remove", async () => {
      const { error } = await sb.rpc("remove_card", { card: c.id }); if (error) throw error;
      await loadAll(); dlg.close(); toast(`${al.title} is out of your binder.`); refresh();
    });
    if (c.locked_by) { remove.disabled = true; remove.title = "This card is promised in a pending trade."; }
    foot.push(remove, btn("Close", () => dlg.close()), save);
  } else {
    const friend = isFriend(c.owner);
    const haveIt = cardsOf(S.me).some(x => x.album_id === c.album_id);
    side = h("div", { style: "min-width:0" },
      c.note ? h("p", { style: "font-size:17px;margin-bottom:6px;max-width:52ch", text: `“${c.note}”` }) : null,
      c.note ? h("div", { class: "review-by" }, h("span", { class: "muted small", text: `${ownerName}'s review${c.note_at ? `, ${relTime(c.note_at)}` : ""}` }), likeButton(c)) : null,
      isRecentTrade(c) ? h("p", { class: "heard-line " + (c.listened_at ? "yes" : "no"), text: c.listened_at ? `${ownerName} has listened to it since the trade.` : `${ownerName} got it in a trade and hasn't listened yet.` }) : null,
      scoreMeters(c, al, ownerName), h("p", { class: "tier-label " + tk, text: tname }),
      c.for_trade ? h("p", { class: "pill", style: "margin-top:12px;display:inline-block", text: `${ownerName} is looking to trade this card` }) : null,
      !friend && ctx.ownerId ? h("p", { class: "muted small", style: "margin-top:12px", text: `Add ${ownerName} as a friend to trade for this card.` }) : null,
      info);
    if (ctx.ownerId && friend && haveIt) foot.push(h("span", { class: "muted small", style: "margin-right:auto", text: "You have this album too, so it can't be traded to you." }));
    else if (ctx.ownerId && friend) foot.push(btn("Ask for this card", () => { dlg.close(); openTradeBuilder(ctx.ownerId, c.id); }, "primary"));
    else if (ctx.ownerId && !friendshipWith(c.owner)) foot.push(friendButton(c.owner));
    foot.push(btn("Close", () => dlg.close()));
  }
  // The drawing lives right behind the card: press the arrow (or swipe) to slide the card left and see it.
  const art = safeImg(c.drawing_url), artistId = c.drawn_by || null;
  const byWho = artistId === S.me ? "you" : nameOf(artistId);
  const canDraw = mine && (!art || artistId === S.me);
  const drawSlide = h("div", { class: "cc-draw" });
  function paintDraw(editing = false) {
    if (editing) {
      let url = art || null;
      const saveB = btn("Save drawing", async () => {
        saveB.disabled = true;
        try { const u = await saveDrawing(url); const { error } = await sb.rpc("set_card_drawing", { card: c.id, drawing_url: u }); if (error) throw error; }
        catch (e) { toast(msgOf(e), "error"); saveB.disabled = false; return; }
        await loadAll(); dlg.close(); toast("Drawing saved."); refresh();
      }, "primary small");
      drawSlide.replaceChildren(drawPad(art, u => { url = u; }, `Drawing for ${al.title}`), h("div", { class: "row", style: "margin-top:10px" }, btn("Cancel", () => paintDraw(false), "small"), saveB));
      return;
    }
    drawSlide.replaceChildren(...[
      art ? h("img", { class: "drawing", src: art, alt: `Drawing by ${byWho} for ${al.title}` })
        : h("div", { class: "drawing none" }, h("p", { text: canDraw ? (c.acquired_at ? "No drawing yet. Since it's yours now, you can draw one." : "No drawing on this card yet.") : "No drawing on this card." })),
      art ? h("p", { class: "muted small", style: "margin-top:10px", text: `Drawn by ${byWho}.` }) : null,
      canDraw ? btn(art ? "Redraw" : "Draw one", () => paintDraw(true), "small", { style: "margin-top:10px" }) : null].filter(Boolean));
  }
  paintDraw();
  const slideCard = h("div", { class: "cc-slide" }, cardEl(c, { static: true, big: true }));
  const slideDraw = h("div", { class: "cc-slide" }, drawSlide);
  const track = h("div", { class: "cc-track" }, slideCard, slideDraw);
  const label = h("span", { class: "cc-label", "aria-live": "polite" });
  const chev = d => h("span", { "aria-hidden": "true", html: `<svg viewBox="0 0 24 24" width="22" height="22"><path d="${d}" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>` });
  const prev = h("button", { type: "button", class: "cc-arrow", "aria-label": "Back to the card", onclick: () => slide(0) }, chev("M15 5l-7 7 7 7"));
  const next = h("button", { type: "button", class: "cc-arrow", "aria-label": art ? "Show the drawing" : "Show the drawing side", onclick: () => slide(1) }, chev("M9 5l7 7-7 7"));
  let at = 0;
  function slide(i) {
    at = i; track.style.transform = `translateX(calc(${-i * 100}% - ${i * 48}px))`;
    slideCard.inert = i !== 0; slideDraw.inert = i !== 1;
    prev.disabled = i === 0; next.disabled = i === 1;
    label.textContent = i === 0 ? (art ? "Card · drawing →" : "Card") : "Drawing";
  }
  // Swipe on touch screens (not while drawing).
  let sx = null;
  track.addEventListener("pointerdown", e => { sx = e.target.closest(".pad") ? null : e.clientX; });
  track.addEventListener("pointerup", e => { if (sx == null) return; const dx = e.clientX - sx; sx = null; if (dx < -40) slide(1); else if (dx > 40) slide(0); });
  slide(0);
  const carousel = h("div", { class: "cc" }, h("div", { class: "cc-view" }, track), h("div", { class: "cc-nav" }, prev, label, next));
  const dlg = modal({ title: al.title, body: h("div", { class: "detail" }, carousel, side), foot: foot.filter(Boolean) });
}

/* =====================================================================
   Sign in and onboarding
===================================================================== */
function viewSetup(main) {
  main.append(h("div", { class: "wrap" }, h("div", { class: "signup", style: "max-width:640px" },
    h("h1", { style: "margin-bottom:12px", text: "Finish setting up Basement Club" }),
    h("p", { text: "DEMO_MODE is off, but config.js is still missing your Supabase address and key. Fill them in (README.md walks through it), or set DEMO_MODE back to true." }))));
}
function viewLoading(main) { main.append(h("div", { class: "loading" }, h("p", { text: "Shuffling the deck…" }))); }

function viewAuth(main) {
  const msg = h("p", { class: "error", role: "alert" });
  if (signInProblem) { msg.textContent = signInProblem; signInProblem = ""; }
  const svcBtn = key => {
    const [name, short] = SERVICES[key];
    const b = h("button", { type: "button", class: "svc", onclick: async () => {
      msg.textContent = ""; b.disabled = true;
      try { const { error } = await MUSIC.signIn(key); if (error) throw err(error.message); if (DEMO) await boot(); }
      catch (e) { msg.textContent = msgOf(e); b.disabled = false; }
    } }, h("span", { class: `dot ${short}`, "aria-hidden": "true", text: name[0] }), `Continue with ${name}`);
    return b;
  };
  const samples = [[30, "Awful"], [70, "Love"], [100, "Peak of human expression"]].map(([p, t], i) =>
    cardEl({ id: "s" + i, owner: "x", points: p, genre_score: clamp(p - 6, 0, 100), artist_score: clamp(p + 3, 0, 100), decade_score: clamp(p - 12, 0, 100), _album: { id: "hero-" + i + t, title: t, artist: `${starWord(starsOf(p))} from you`, genre: "Your taste", description: "" } }, { static: true, compact: true }));
  main.append(h("div", { class: "wrap" }, h("section", { class: "hero" },
    h("div", {},
      h("h1", { class: "sr", text: "Basement Club" }),
      h("img", { class: "hero-logo", src: "logo.png", alt: "" }),
      h("p", { class: "lede", text: "Turn the albums you've been playing into trading cards. Rate each one in stars, show them off on a profile you style yourself, and trade with other members to find new music." }),
      h("div", { class: "services" }, svcBtn("spotify")),
      h("p", { class: "svc-note", style: "margin-top:12px", text: "Signing in connects your listening history so you can pick albums from it. Nothing gets posted for you." }),
      msg,
      !DEMO ? h("p", { class: "svc-note", style: "margin-top:8px", text: "Basement Club is invite-only while it's small: the Spotify account you sign in with has to be on the list." }) : null,
      DEMO ? h("div", { class: "box", style: "margin-top:20px;max-width:440px" },
        h("p", { class: "small", style: "margin-bottom:10px", text: "Preview mode: the button above starts a new sample account. To jump to a filled-in profile with friends, a trade offer and messages, use the sample account." }),
        btn("Use the sample account", async () => { await sb.auth.signInWithProvider("sample"); await boot(); }, "small")) : null),
    h("div", { class: "fan", "aria-hidden": "true" }, samples))));
}

const onboardSteps = active => h("ol", { class: "steps", "aria-label": "Getting started" }, ["Connect your music", "Make your profile", "Make your first cards"].map((s, i) => h("li", { "aria-current": i === active ? "step" : null, text: `${i + 1}. ${s}` })));

function viewOnboard(main) {
  const service = DEMO ? demo.sessionService() : "spotify";
  const nameIn = h("input", { type: "text", id: "un", maxlength: "20", autocomplete: "nickname", required: true });
  if (!DEMO && authUser) {
    const m = authUser.user_metadata || {}, suggestion = String(m.preferred_username || m.name || m.full_name || "").replace(/[^A-Za-z0-9_.-]/g, "").slice(0, 20);
    if (suggestion.length >= 3) nameIn.value = suggestion;
  }
  const bioIn = h("textarea", { id: "bio", maxlength: "300", rows: "3" });
  const msg = h("p", { class: "error", role: "alert" });
  const submit = h("button", { type: "submit", class: "btn primary" }, "Continue");
  main.append(h("div", { class: "wrap" }, h("form", { class: "signup form-grid", style: "max-width:560px", onsubmit: async e => {
    e.preventDefault(); msg.textContent = "";
    const name = nameIn.value.trim();
    if (!/^[A-Za-z0-9_.-]{3,20}$/.test(name)) { msg.textContent = "Usernames are 3 to 20 characters: letters, numbers, dots, dashes or underscores."; nameIn.focus(); return; }
    submit.disabled = true;
    const { error } = await sb.from("profiles").insert({ id: S.me, username: name, bio: bioIn.value.trim().slice(0, 300), service });
    submit.disabled = false;
    if (error) { msg.textContent = error.code === "23505" ? `${name} is taken. Try another username.` : "Your profile didn't save. Try again."; return; }
    await loadAll(); go("make", { onboarding: true });
  } },
    onboardSteps(1), h("h1", { text: "Make your profile" }),
    h("p", { class: "muted", text: `Connected to ${SERVICES[service]?.[0] || "your music service"}.` }),
    h("label", { class: "field", for: "un" }, "Username", nameIn, h("span", { class: "hint", text: "3–20 characters. Friends add you by this name." })),
    h("label", { class: "field", for: "bio" }, "Bio ", h("span", { class: "hint", text: "Optional. What have you been listening to lately?" }), bioIn),
    msg, h("div", { class: "row" }, submit))));
  setTimeout(() => nameIn.focus(), 50);
}

/* =====================================================================
   Make cards: pick albums from recent listening, then rate them
===================================================================== */
function viewMake(main, arg) {
  arg = arg || {};
  const wrap = h("div", { class: "wrap" }); main.append(wrap);
  const chosen = new Map();  // album id -> { album, four scores, note, for_trade }
  const owned = new Set(cardsOf(S.me).map(c => c.album_id));
  const service = SERVICES[me()?.service]?.[0] || "your music service";
  let mode = "search", recent = null, recentErr = "", recentLoading = false;
  const newItem = album => ({ album, points: null, genre_score: null, artist_score: null, decade_score: null, note: "", for_trade: false, drawing: null });
  for (const a of arg.preselect || []) if (!owned.has(a.id)) chosen.set(a.id, newItem(a));

  const count = h("strong", { "aria-live": "polite" });
  const next = btn("Rate them", () => step2(), "primary");
  const paintCount = () => { count.textContent = chosen.size ? `${plural(chosen.size, "album")} picked` : "Pick at least one album"; next.disabled = !chosen.size; };
  const toggle = album => { if (chosen.has(album.id)) chosen.delete(album.id); else chosen.set(album.id, newItem(album)); paintCount(); };
  function pickTile(album, sub) {
    const have = owned.has(album.id);
    const b = h("button", { type: "button", class: "pick", "aria-pressed": String(chosen.has(album.id)), disabled: have || null,
      "aria-label": `${album.title} by ${album.artist}${album.year ? `, ${album.year}` : ""}${have ? ", already in your binder" : ""}`,
      onclick: () => { toggle(album); b.setAttribute("aria-pressed", String(chosen.has(album.id))); } },
      coverEl(album, "pc"), h("span", { class: "tick", "aria-hidden": "true", text: "✓" }),
      h("span", { class: "pt", text: album.title }), h("span", { class: "pa", text: album.artist }),
      have ? h("span", { class: "owned", text: "In your binder" }) : h("span", { class: "pp", text: sub }));
    return b;
  }
  function head(title, text, stepIdx) {
    return h("div", { class: "view-head" }, h("div", {},
      arg.onboarding ? onboardSteps(2) : h("p", { class: "steps" }, h("span", { text: stepIdx === 0 ? "Step 1 of 2: pick albums" : "Step 2 of 2: rate them" })),
      h("h1", { text: title }), h("p", { class: "muted", text })));
  }

  /* --- search with suggestions --- */
  const SQ = { results: [], sugg: [], active: -1, corrected: null, err: "", q: "", local: [], remote: [], online: "idle" };
  const qIn = h("input", { type: "search", id: "alb-q", role: "combobox", autocomplete: "off", spellcheck: "false", "aria-autocomplete": "list", "aria-expanded": "false", "aria-controls": "alb-sugg",
    placeholder: "Album or artist, like Kid A or Radiohead" });
  const list = h("ul", { id: "alb-sugg", role: "listbox", class: "sugg", hidden: true, "aria-label": "Suggestions" });
  const status = h("div", { class: "search-status", "aria-live": "polite" });
  const results = h("div", { class: "pick-grid" });
  let timer = null, onlineTimer = null, seq = 0;
  const openList = () => { if (!SQ.sugg.length) return closeList(); list.hidden = false; qIn.setAttribute("aria-expanded", "true"); };
  const closeList = () => { list.hidden = true; qIn.setAttribute("aria-expanded", "false"); qIn.removeAttribute("aria-activedescendant"); SQ.active = -1; paintActive(); };
  function paintActive() {
    [...list.children].forEach((li, i) => li.setAttribute("aria-selected", String(i === SQ.active)));
    if (SQ.active >= 0) { qIn.setAttribute("aria-activedescendant", "sg-" + SQ.active); list.children[SQ.active]?.scrollIntoView({ block: "nearest" }); } else qIn.removeAttribute("aria-activedescendant");
  }
  function paintList() {
    list.replaceChildren(...SQ.sugg.map((al, i) => {
      const tag = owned.has(al.id) ? "In your binder" : chosen.has(al.id) ? "Picked" : "";
      return h("li", { role: "option", id: "sg-" + i, class: "sg", "aria-selected": "false", onmousedown: e => e.preventDefault(), onclick: () => choose(i) },
        coverEl(al, "sg-cov"),
        h("span", { class: "sg-txt" }, h("span", { class: "sg-t", text: al.title }), h("span", { class: "sg-a", text: al.year ? `${al.artist}, ${al.year}` : al.artist })),
        tag ? h("span", { class: "sg-tag", text: tag }) : null);
    }));
  }
  function choose(i) {
    const al = SQ.sugg[i]; if (!al) return;
    closeList();
    if (owned.has(al.id)) say(`${al.title} is already in your binder.`);
    else { if (!chosen.has(al.id)) toggle(al); say(`Picked ${al.title}. Search for another album, or rate the ones you've picked.`); }
    paintResults(); paintList();
  }
  const say = text => { SQ.note = text; paintStatus(); };
  function paintStatus() {
    const q = SQ.q, n = SQ.results.length, parts = [];
    if (SQ.note) parts.push(h("p", { class: "ok-note", text: SQ.note }));
    if (SQ.err) parts.push(h("p", { class: "error", text: SQ.err }));
    else if (q.length >= 2) {
      if (SQ.corrected) parts.push(h("p", {}, "Did you mean ", h("button", { type: "button", class: "linkish", onclick: () => { qIn.value = SQ.corrected; runSearch(); qIn.focus(); }, text: SQ.corrected }), "? Showing the closest matches."));
      else if (!n && SQ.online === "loading") parts.push(h("p", { class: "muted", text: "Searching Spotify…" }));
      else if (!n) parts.push(h("p", { text: `No albums match “${q}”. Check the spelling, try the artist's name, or add it yourself below.` }));
      else parts.push(h("p", { class: "muted", text: `${plural(n, "album")} found${n > 24 ? ". Showing the best 24" : ""}.` }));
      if (n && SQ.online === "loading") parts.push(h("p", { class: "muted small", text: "Still searching Spotify for more…" }));
      if (SQ.online === "offline") parts.push(h("p", { class: "muted small", text: DEMO
        ? "The preview searches its sample list of about 230 albums. On the live site, search covers Spotify's whole catalog."
        : "Spotify search isn't connected yet, so only albums already on Basement Club were searched." }));
      if (SQ.online === "error") parts.push(h("p", { class: "muted small" }, "Spotify didn't respond, so only albums already on Basement Club were searched. ",
        h("button", { type: "button", class: "linkish", onclick: () => { runSearch(); }, text: "Try again" })));
    }
    status.replaceChildren(...parts);
  }
  function paintResults() {
    if (SQ.q.length < 2) {
      results.replaceChildren(h("div", { class: "search-intro" },
        h("p", { text: "Search by album or artist. Results come from Spotify's catalog and from albums already on Basement Club." }),
        DEMO ? h("p", { class: "muted small", text: "The preview searches a sample list of about 230 albums. Spotify search is connected in the backend step." }) : null,
        h("p", { class: "muted small", text: "Typos are fine. Try one of these:" }),
        h("div", { class: "row" }, ["kid a", "abbey rode", "beyonse", "kendrik lamar", "tame impla"].map(t => btn(t, () => { qIn.value = t; runSearch(); qIn.focus(); }, "small ghost chip")))));
    } else results.replaceChildren(...SQ.results.slice(0, 24).map(al => pickTile(al, al.year ? `Released ${al.year}` : al.genre || "")));
    paintStatus();
  }
  // Instant results from albums Basement Club already knows, then online results once typing pauses.
  async function runSearch() {
    const q = qIn.value.trim(), my = ++seq;
    SQ.q = q; SQ.note = ""; SQ.remote = []; clearTimeout(onlineTimer);
    if (q.length < 2) { Object.assign(SQ, { results: [], sugg: [], corrected: null, err: "", online: "idle" }); closeList(); paintResults(); return; }
    try { SQ.local = await MUSIC.searchCatalog(); } catch (e) { console.warn(e); SQ.local = []; }
    if (my !== seq) return;
    SQ.online = "loading"; applyRank();
    onlineTimer = setTimeout(async () => {
      try { const remote = await MUSIC.searchOnline(q); if (my !== seq) return; SQ.remote = remote; SQ.online = "done"; }
      catch (e) { if (my !== seq || e.stale) return; SQ.online = e.offline ? "offline" : "error"; }
      applyRank();
    }, 450);
  }
  function applyRank() {
    const key = a => normText(a.title) + "|" + normText(a.artist);
    const local = SQ.local.map(a => ({ ...a })), byKey = new Map(local.map(a => [key(a), a]));
    const extra = [];
    for (const a of SQ.remote) { const same = byKey.get(key(a)); if (same) same._rel = Math.max(same._rel ?? 0, a._rel); else { byKey.set(key(a), a); extra.push(a); } }
    const r = rankAlbums(SQ.q, local.concat(extra));
    Object.assign(SQ, { results: r.items, sugg: r.items.slice(0, 6), corrected: r.corrected, err: "" });
    SQ.active = -1; paintList();
    if (document.activeElement === qIn) openList(); else closeList();
    paintResults();
  }
  qIn.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(runSearch, 120); });
  qIn.addEventListener("focus", () => { if (SQ.q.length >= 2) openList(); });
  qIn.addEventListener("blur", () => setTimeout(closeList, 150));
  qIn.addEventListener("keydown", e => {
    const n = SQ.sugg.length;
    if (e.key === "ArrowDown" && n) { e.preventDefault(); if (list.hidden) openList(); SQ.active = (SQ.active + 1) % n; paintActive(); }
    else if (e.key === "ArrowUp" && n) { e.preventDefault(); if (list.hidden) openList(); SQ.active = (SQ.active - 1 + n) % n; paintActive(); }
    else if (e.key === "Enter") { e.preventDefault(); if (!list.hidden && SQ.active >= 0) choose(SQ.active); else { clearTimeout(timer); if (qIn.value.trim() !== SQ.q) runSearch().then(closeList); else closeList(); } }
    else if (e.key === "Escape" && !list.hidden) { e.preventDefault(); closeList(); }
  });
  const own = { title: h("input", { type: "text", id: "own-t", maxlength: "200", autocomplete: "off" }), artist: h("input", { type: "text", id: "own-a", maxlength: "200", autocomplete: "off" }),
    year: h("input", { type: "number", id: "own-y", min: "1900", max: String(new Date().getFullYear() + 1), inputmode: "numeric", placeholder: "Optional" }),
    genre: h("input", { type: "text", id: "own-g", maxlength: "40", placeholder: "Optional", autocomplete: "off" }) };
  const ownMsg = h("p", { class: "error", role: "alert" });
  const ownCheck = h("div", { class: "own-check", "aria-live": "polite" });
  const ownSubmit = h("button", { type: "submit", class: "btn primary small" }, "Check and add it");
  const pickOwn = album => {
    if (owned.has(album.id)) { ownMsg.textContent = `${album.title} is already in your binder.`; return; }
    if (!chosen.has(album.id)) toggle(album);
    Object.values(own).forEach(i => { i.value = ""; }); ownCheck.replaceChildren(); ownBox.open = false;
    say(`Picked ${album.title}. You'll rate it on the next step.`); paintResults();
  };
  const ownBox = h("details", { class: "add-own" }, h("summary", { text: "Can't find it? Add it yourself" }),
    h("form", { class: "form-grid", onsubmit: async e => {
      e.preventDefault(); ownMsg.textContent = ""; ownCheck.replaceChildren();
      const title = own.title.value.trim(), artist = own.artist.value.trim(), yearTxt = own.year.value.trim(), genre = own.genre.value.trim();
      if (!title || !artist) { ownMsg.textContent = "Add the album's title and artist."; (title ? own.artist : own.title).focus(); return; }
      const year = yearTxt ? parseInt(yearTxt) : null;
      if (yearTxt && (!/^\d{4}$/.test(yearTxt) || year < 1900 || year > new Date().getFullYear() + 1)) { ownMsg.textContent = "Years have four digits, like 1997."; own.year.focus(); return; }
      ownSubmit.disabled = true; ownSubmit.textContent = "Checking…";
      const found = await findAlbumMatch(title, artist, SQ.local);
      ownSubmit.disabled = false; ownSubmit.textContent = "Check and add it";
      // Typed exactly like an album we know: use that one.
      if (found.exact) { pickOwn(found.exact); return; }
      const typed = () => { const k = normText(title) + "|" + normText(artist);
        return { id: "own-" + hashStr(k).toString(36) + hashStr(k + "#").toString(36), title, artist, year, genre: genre || "Uncategorized", description: "", image_url: null, spotify_url: null, added_by: S.me }; };
      if (found.close.length) {
        // Probably a typo or a different spelling of an album that exists. Ask before adding a second version.
        ownCheck.replaceChildren(h("div", { class: "did-you-mean", role: "group", "aria-label": "Possible matches" },
          h("p", { style: "font-weight:700", text: found.close.length === 1 ? "Is this the album you mean?" : "Is it one of these?" }),
          ...found.close.map(a => h("div", { class: "dym-row" }, coverEl(a, "sg-cov"),
            h("span", { class: "sg-txt" }, h("span", { class: "sg-t", text: a.title }), h("span", { class: "sg-a", text: a.year ? `${a.artist}, ${a.year}` : a.artist })),
            btn("Use this one", () => pickOwn(a), "small primary"))),
          h("p", { class: "muted small" }, "Not it? ", h("button", { type: "button", class: "linkish", onclick: () => pickOwn(typed()), text: `Add “${title}” by ${artist} as typed` }), ".")));
        ownCheck.querySelector(".btn")?.focus();
        return;
      }
      if (found.checkedOnline === false && !DEMO) {
        ownCheck.replaceChildren(h("p", { class: "muted small" }, "Spotify couldn't be checked just now, so this album couldn't be confirmed. ",
          h("button", { type: "button", class: "linkish", onclick: () => pickOwn(typed()), text: "Add it anyway" }), "."));
        return;
      }
      pickOwn(typed());
    } },
      h("p", { class: "muted small", text: "For albums Spotify doesn't have, like a friend's band or something only on SoundCloud or Bandcamp." }),
      h("div", { class: "own-grid" },
        h("label", { class: "field", for: "own-t" }, "Album title", own.title), h("label", { class: "field", for: "own-a" }, "Artist", own.artist),
        h("label", { class: "field", for: "own-y" }, "Year released", own.year), h("label", { class: "field", for: "own-g" }, "Genre", own.genre)),
      h("p", { class: "muted small", text: "Before adding, Basement Club checks for the album under its real name, so typos don't end up as a second version." }),
      ownMsg, ownCheck, h("div", {}, ownSubmit)));
  ownBox.addEventListener("toggle", () => { if (ownBox.open && !own.title.value && SQ.q) own.title.value = SQ.q; });
  const searchPanel = h("div", { class: "search-panel" },
    h("label", { class: "field", for: "alb-q" }, "Search for an album"),
    h("div", { class: "combo" }, qIn, list),
    status, results, ownBox);

  /* --- recent listening --- */
  const recentPanel = h("div", {});
  function paintRecent() {
    if (recentErr) return recentPanel.replaceChildren(h("div", { class: "empty" }, h("p", { text: recentErr })));
    if (!recent) return recentPanel.replaceChildren(h("div", { class: "loading", style: "min-height:30vh" }, h("p", { text: `Reading your recent listening on ${service}…` })));
    if (!recent.length) return recentPanel.replaceChildren(h("div", { class: "empty" }, h("p", { text: `${service} didn't return any recent albums. Search for one instead.` })));
    recentPanel.replaceChildren(h("div", { class: "pick-grid" }, recent.map(({ album, plays }) => pickTile(album, plays ? `${plural(plays, "play")} lately` : "Played recently"))));
  }
  function loadRecent() {
    if (recent || recentLoading) return; recentLoading = true;
    MUSIC.recentAlbums().then(r => { recent = r; }, e => { recentErr = msgOf(e); }).then(() => { recentLoading = false; if (mode === "recent") paintRecent(); });
  }

  /* --- page --- */
  const tabSearch = h("button", { type: "button", class: "seg", onclick: () => setMode("search") }, "Search for an album");
  const tabRecent = h("button", { type: "button", class: "seg", onclick: () => setMode("recent") }, "From your recent listening");
  const panel = h("div", { class: "make-panel" });
  function setMode(m) {
    mode = m;
    tabSearch.setAttribute("aria-pressed", String(m === "search")); tabRecent.setAttribute("aria-pressed", String(m === "recent"));
    if (m === "search") { panel.replaceChildren(searchPanel); paintResults(); paintList(); }
    else { panel.replaceChildren(recentPanel); paintRecent(); loadRecent(); }
  }
  function step1() {
    wrap.replaceChildren(
      head(arg.onboarding ? "Pick albums for your first cards" : "Make new cards", `Search for any album, or pick from what you've been playing on ${service}. Your picks from both are kept together.`, 0),
      h("div", { class: "segs", role: "group", "aria-label": "Where to find albums" }, tabSearch, tabRecent),
      panel,
      h("div", { class: "sticky-foot" }, count, h("div", { class: "row" }, arg.onboarding ? null : btn("Cancel", () => go("profile"), "ghost"), next)));
    setMode(mode); paintCount();
    if (mode === "search") setTimeout(() => qIn.focus(), 30);
  }
  function step2() {
    const rlist = h("div", { class: "rate-list" });
    for (const [id, item] of chosen) {
      const al = item.album;
      const note = h("textarea", { id: "n-" + id, maxlength: "280", rows: "2", placeholder: "Your review: what you think of it (optional)", "aria-label": `Review of ${al.title}`, oninput: e => item.note = e.target.value });
      note.value = item.note;
      rlist.append(h("div", { class: "rate", "data-id": id }, coverEl(al, "rc"),
        h("div", { style: "min-width:0" }, h("h3", { text: al.title }), h("p", { class: "muted small", text: al.year ? `${al.artist}, ${al.year}` : al.artist }),
          scaleInputs(item, al, "r-" + id), note),
        h("div", { class: "rate-draw" }, h("p", { class: "scale-label", text: "Draw on it (optional)" }),
          h("p", { class: "scale-hint", style: "margin-bottom:8px", text: "Same size as the cover. It goes on the card's second page." }),
          drawPad(item.drawing, u => { item.drawing = u; }, `Drawing for ${al.title}`))));
    }
    const make = btn(`Make ${plural(chosen.size, "card")}`, async () => {
      const unrated = [...chosen.entries()].find(([, x]) => x.points == null);
      if (unrated) {
        toast(`Give ${unrated[1].album.title} a taste rating first: tap the stars.`, "error");
        document.getElementById(`r-${unrated[0]}-points`)?.focus();
        return;
      }
      make.disabled = true;
      try {
        for (const x of chosen.values()) x.drawing_url = x.drawing ? await saveDrawing(x.drawing) : null;
        // Albums typed in by hand are saved from here; Spotify albums were already saved by the search.
        // (In preview mode the sample catalog albums are saved here too.)
        const rows = [...chosen.values()].map(x => x.album).filter(a => !S.albums.has(a.id) && (DEMO || String(a.id).startsWith("own-")))
          .map(a => ({ id: a.id, title: a.title, artist: a.artist, year: a.year || null, genre: a.genre || null, description: a.description || null,
            image_url: a.image_url || null, spotify_url: a.spotify_url || null, ...(DEMO ? { underground: !!a.underground } : {}), added_by: S.me }));
        if (rows.length) { const { error } = await sb.from("albums").upsert(rows, { onConflict: "id", ignoreDuplicates: true }); if (error) throw error; }
        try { await MUSIC.enrich([...chosen.keys()]); } catch (e) { console.warn("Couldn't fill in album details", e); }
        const items = [...chosen.values()].map(x => ({ album_id: x.album.id, points: x.points, genre_score: x.genre_score, artist_score: x.artist_score, decade_score: x.decade_score, note: x.note.trim(), drawing_url: x.drawing_url, for_trade: false }));
        const { data, error } = await sb.rpc("create_cards", { items });
        if (error) throw error;
        await loadAll();
        showReveal(main, data || [], arg.onboarding);
      } catch (e) { toast(msgOf(e), "error"); make.disabled = false; }
    }, "primary");
    wrap.replaceChildren(
      head("Rate your cards", "Tap the stars to rate each album, half stars included. Your taste goes on the front of the card; the other three are optional. You can change any rating later.", 1),
      rlist,
      h("div", { class: "sticky-foot" }, h("span", { class: "muted small", text: "Ratings travel with the card when you trade it. Reviews don't." }), h("div", { class: "row" }, btn("Back", () => step1(), "ghost"), make)));
    window.scrollTo(0, 0);
  }
  if (chosen.size) step2(); else step1();
}
function showReveal(main, ids, onboarding) {
  const cards = ids.map(id => S.cardById.get(id)).filter(Boolean);
  const grid = h("div", { class: "deal" });
  const flips = cards.map(c => {
    const f = h("div", { class: "flip" }, h("div", { class: "flip-inner" },
      h("div", { class: "flip-face" }, cardEl(c, { onClick: () => openCardDetail(c) })),
      h("div", { class: "flip-face flip-back", "aria-hidden": "true" }, h("div", { class: "card-back" }, h("img", { src: "logo.png", alt: "" })))));
    grid.append(f); return f;
  });
  current = { name: "reveal" };
  main.replaceChildren(h("div", { class: "wrap" },
    h("div", { class: "view-head" }, h("div", {}, h("h1", { text: cards.length === 1 ? "Your new card" : "Your new cards" }), h("p", { class: "muted", text: `${plural(cards.length, "card")} added to your binder.` }))),
    grid,
    h("div", { class: "row" }, btn("Open my profile", () => go("profile"), "primary"), btn("Back home", () => go("home")), btn("Find people to trade with", () => go("market")))));
  updateNav();
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  flips.forEach((f, i) => setTimeout(() => f.classList.add("revealed"), reduce ? 0 : 350 + i * 220));
}

/* =====================================================================
   Profile colors and background
===================================================================== */
const hexOrNull = c => /^#[0-9a-f]{6}$/i.test(c || "") ? c : null;
function relLum(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [n >> 16 & 255, n >> 8 & 255, n & 255].map(v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; })
    .reduce((a, v, i) => a + v * [.2126, .7152, .0722][i], 0);
}
function contrast(a, b) { const x = relLum(a), y = relLum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); }
const inkOn = bg => contrast(bg, "#2A1621") >= contrast(bg, "#FFFFFF") ? "#2A1621" : "#FFFFFF";
function themeColors() {
  const cs = getComputedStyle(document.documentElement), v = k => hexOrNull(cs.getPropertyValue(k).trim()) || null;
  return { panel: v("--surface") || "#FFFFFF", text: v("--ink") || "#2A1621", hl: v("--jade") || "#0A7D5A" };
}
function applyProfileColors(el, c) {
  for (const [k, v] of [["--p-panel", c.panel_color], ["--p-text", c.text_color], ["--p-hl", c.highlight_color]]) {
    if (hexOrNull(v)) el.style.setProperty(k, v); else el.style.removeProperty(k);
  }
  if (hexOrNull(c.highlight_color)) el.style.setProperty("--p-banner", c.highlight_color); else el.style.removeProperty("--p-banner");
}
const IOS = /iP(hone|ad|od)/.test(navigator.userAgent);
const REPEATS = [["repeat", "Grid"], ["space", "Spaced out"], ["round", "Squeezed to fit"], ["repeat-x", "One row across"], ["repeat-y", "One column down"]];
// Paints a member's background. `scale` shrinks tile sizes for small previews.
function applyWall(el, c, { scale = 1, preview = false } = {}) {
  const st = el.style;
  st.backgroundColor = safeColor(c.wall_color);
  const pic = safeImg(c.wall_image_url);
  if (pic) {
    st.backgroundImage = `url("${pic.replace(/"/g, "%22")}")`;
    const mode = ["cover", "contain", "tile"].includes(c.wall_image_mode) ? c.wall_image_mode : "cover";
    const pos = ["top", "center", "bottom"].includes(c.wall_image_position) ? c.wall_image_position : "center";
    if (mode === "tile") {
      st.backgroundSize = `${Math.max(4, Math.round(clamp(c.wall_image_size || 240, 20, 1200) * scale))}px auto`;
      st.backgroundRepeat = REPEATS.some(r => r[0] === c.wall_image_repeat) ? c.wall_image_repeat : "repeat";
      st.backgroundPosition = "center top";
    } else {
      st.backgroundSize = mode; st.backgroundRepeat = "no-repeat"; st.backgroundPosition = `center ${pos}`;
    }
    st.backgroundAttachment = !preview && !IOS && c.wall_image_fixed !== false ? "fixed" : "scroll";
  } else {
    const wd = WALLS[c.wall] || WALLS.dots;
    st.backgroundImage = wd.img; st.backgroundRepeat = ""; st.backgroundPosition = ""; st.backgroundAttachment = "";
    st.backgroundSize = scale !== 1 && wd.size !== "auto" ? wd.size.split(" ").map(v => `${Math.max(6, parseFloat(v) * Math.max(scale, .5)).toFixed(1)}px`).join(" ") : wd.size;
  }
}

/* Enlarged profile picture, centered over the page. */
function openLightbox(src, name) {
  const close = () => dlg.close();
  const dlg = h("dialog", { class: "lightbox", "aria-label": `${name}'s profile picture` },
    h("button", { type: "button", class: "lb-close", "aria-label": "Close", onclick: close, text: "×" }),
    h("div", { class: "lb-inner" },
      h("img", { class: "lb-img square", src, alt: `${name}'s profile picture`, onclick: close }),
      h("p", { class: "lb-cap", text: name })));
  dlg.addEventListener("click", e => { if (e.target === dlg || e.target.classList.contains("lb-inner")) close(); });
  dlg.addEventListener("close", () => dlg.remove());
  document.body.append(dlg); dlg.showModal();
}

/* Profile song: Spotify's own player on the live site, a stand-in in preview mode. */
const playSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z" fill="currentColor"/></svg>';
const pauseSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="4.5" width="4" height="15" rx="1" fill="currentColor"/><rect x="14" y="4.5" width="4" height="15" rx="1" fill="currentColor"/></svg>';
function songPlayer(trackId, title) {
  if (!DEMO) return spotifyEmbed(trackId, title);
  const t = demo.track(trackId) || { name: "Unknown song", artist: "", albumId: trackId };
  const pp = h("button", { type: "button", class: "pp", "aria-label": `Play ${t.name}`, html: playSvg });
  const box = h("div", { class: "sp-mock" }, h("span", { class: "art", html: coverSVG({ id: t.albumId, genre: t.genre || "" }) }),
    h("span", { style: "min-width:0" }, h("b", { text: t.name }), h("small", { text: t.artist })), pp, h("span", { class: "sp-prog", "aria-hidden": "true" }, h("i")));
  pp.onclick = () => { const on = box.classList.toggle("playing"); pp.innerHTML = on ? pauseSvg : playSvg; pp.setAttribute("aria-label", `${on ? "Pause" : "Play"} ${t.name}`); };
  return h("div", {}, box, h("p", { class: "sp-mock-note muted", text: "Preview mode. The real player appears here on the live site." }));
}

/* =====================================================================
   Profile
===================================================================== */
/* =====================================================================
   Song log: songs someone has been listening to, newest first, on a
   scroll wheel. The song in the middle is full size; the further a song
   is from the middle, the smaller and fainter it gets. Click one to read
   what its owner thought of it.
===================================================================== */
const logsOf = uid => S.logs.filter(l => l.owner === uid).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
const WHEEL_ROW = 56;
let wheelN = 0;
function songWheel(logs, { isMe, ownerName }) {
  const n = ++wheelN, panelId = "lt-" + n;
  const height = logs.length === 1 ? 72 : logs.length === 2 ? 152 : 248;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wheel = h("div", { class: "wheel", role: "list", "aria-label": `${ownerName}'s logged songs, newest first` });
  wheel.style.setProperty("--wh", height + "px");
  const panel = h("div", { class: "log-thought", id: panelId, hidden: true });
  let selected = -1, frame = 0;
  const rows = logs.map((l, i) => {
    const b = h("button", { type: "button", class: "wheel-item", "aria-expanded": "false", "aria-controls": panelId,
      "aria-label": `${l.title} by ${l.artist}, logged ${relTime(l.created_at)}${l.note ? ", has a note" : ""}`,
      onclick: () => select(i), onfocus: () => center(i), onkeydown: e => {
        if (e.key === "ArrowDown" && i < rows.length - 1) { e.preventDefault(); rows[i + 1].firstChild.focus(); }
        else if (e.key === "ArrowUp" && i > 0) { e.preventDefault(); rows[i - 1].firstChild.focus(); }
      } },
      h("span", { class: "wi-art", "aria-hidden": "true", html: coverSVG({ id: "song:" + normText(l.title + " " + l.artist), genre: l.artist }) }),
      h("span", { class: "wi-txt" }, h("span", { class: "wi-t", text: l.title }), h("span", { class: "wi-a", text: l.artist })),
      l.note ? h("span", { class: "wi-note", "aria-hidden": "true", title: "Has a note" }) : null);
    return h("div", { role: "listitem", class: "wheel-row" }, b);
  });
  wheel.append(...rows);
  function center(i, smooth = true) {
    const row = rows[i]; if (!row) return;
    wheel.scrollTo({ top: row.offsetTop, behavior: smooth && !reduce ? "smooth" : "auto" });
  }
  function paint() {
    frame = 0;
    const box = wheel.getBoundingClientRect(); if (!box.height) return;
    // The song at the top of the wheel is full size; the further down, the smaller and fainter.
    for (const row of rows) {
      const r = row.getBoundingClientRect(), d = (r.top - box.top) / WHEEL_ROW, a = Math.min(Math.abs(d), 4);
      row.style.transform = `perspective(420px) rotateX(${(-d * 13).toFixed(1)}deg) scale(${(1 - a * .1).toFixed(3)})`;
      row.style.opacity = Math.max(.18, 1 - a * .26).toFixed(2);
      row.classList.toggle("centered", a < .5);
    }
  }
  wheel.addEventListener("scroll", () => { if (!frame) frame = requestAnimationFrame(paint); }, { passive: true });
  function showPanel() {
    rows.forEach((row, j) => { row.firstChild.setAttribute("aria-expanded", String(j === selected)); row.classList.toggle("open", j === selected); });
    const l = logs[selected];
    if (!l) { panel.hidden = true; panel.replaceChildren(); return; }
    panel.hidden = false;
    panel.replaceChildren(...[
      h("p", { class: "lt-head" }, h("strong", { text: l.title }), " ", h("span", { class: "muted", text: `by ${l.artist}` })),
      h("p", { class: "muted small", text: `Logged ${relTime(l.created_at)}` }),
      l.note ? h("p", { class: "lt-note", text: l.note }) : h("p", { class: "muted small", text: isMe ? "No thoughts written yet. Add some with Edit." : "No thoughts written for this one." }),
      isMe ? h("div", { class: "row" }, btn("Edit", () => openSongLog(l), "small"),
        confirmBtn("Delete", "Click again to delete", async () => { const { error } = await sb.rpc("delete_song_log", { log: l.id }); if (error) throw error; await loadAll(); toast("Song removed from your log."); refresh(); }, "small ghost")) : null].filter(Boolean));
  }
  function select(i) { selected = selected === i ? -1 : i; center(i); showPanel(); }
  requestAnimationFrame(() => { wheel.scrollTop = 0; paint(); });
  return h("div", { class: "song-wheel" }, h("div", { class: "wheel-wrap" }, h("div", { class: "wheel-band", "aria-hidden": "true" }), wheel), panel);
}
function songLogBox(id, isMe, ownerName) {
  const logs = logsOf(id);
  if (!logs.length && !isMe) return null;
  return h("div", { class: "box song-log" },
    h("div", { class: "log-head" }, h("h2", { text: "Song log" }), isMe ? btn("Log a song", () => openSongLog(), "small") : h("span", { class: "muted small", text: plural(logs.length, "song") })),
    logs.length ? h("p", { class: "muted small", style: "margin-bottom:8px", text: "Scroll through, and click a song to read the thoughts on it." }) : null,
    logs.length ? songWheel(logs, { isMe, ownerName }) : h("p", { class: "muted small", text: "Keep a running list of songs you've had on, with a few thoughts on each." }));
}
function openSongLog(entry, prefill) {
  const title = h("input", { type: "text", id: "sl-t", maxlength: "200", autocomplete: "off" });
  const artist = h("input", { type: "text", id: "sl-a", maxlength: "200", autocomplete: "off" });
  const note = h("textarea", { id: "sl-n", maxlength: "500", rows: "4", placeholder: "What it made you think of, where you heard it, why it's stuck in your head…" });
  if (entry) { title.value = entry.title; artist.value = entry.artist; note.value = entry.note || ""; }
  else if (prefill) { title.value = prefill.title || ""; artist.value = prefill.artist || ""; }
  const msg = h("p", { class: "error", role: "alert" });
  const picker = h("div", { class: "track-pick", role: "group", "aria-label": "Your recent songs" });
  const pickBtn = btn("Pick from my recent songs", async () => {
    pickBtn.disabled = true;
    try {
      const items = await MUSIC.recentTracks();
      picker.replaceChildren(...items.map(t => h("button", { type: "button", "aria-pressed": "false", onclick: e => {
        title.value = t.name; artist.value = t.artist;
        picker.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", String(x === e.currentTarget))); note.focus();
      } }, h("span", { class: "tcov", html: coverSVG({ id: t.albumId, genre: t.genre || "" }) }), h("span", {}, h("strong", { text: t.name }), h("br"), h("span", { class: "muted small", text: t.artist })))));
    } catch (e) { msg.textContent = msgOf(e); }
    pickBtn.disabled = false;
  }, "small");
  const save = btn(entry ? "Save" : "Log it", async () => {
    msg.textContent = "";
    if (!title.value.trim() || !artist.value.trim()) { msg.textContent = "Add the song's title and artist."; (title.value.trim() ? artist : title).focus(); return; }
    save.disabled = true;
    const args = { title: title.value.trim(), artist: artist.value.trim(), note: note.value.trim() };
    const { error } = entry ? await sb.rpc("update_song_log", { log: entry.id, ...args }) : await sb.rpc("log_song", args);
    if (error) { msg.textContent = msgOf(error); save.disabled = false; return; }
    await loadAll(); dlg.close(); toast(entry ? "Song updated." : "Song logged."); syncListened(); refresh();
  }, "primary");
  const dlg = modal({ title: entry ? "Edit logged song" : "Log a song", body: h("div", { class: "form-grid" },
    entry ? null : h("div", { class: "form-grid", style: "gap:10px" }, h("div", {}, pickBtn), picker),
    h("div", { class: "own-grid" }, h("label", { class: "field", for: "sl-t" }, "Song", title), h("label", { class: "field", for: "sl-a" }, "Artist", artist)),
    h("label", { class: "field", for: "sl-n" }, "Your thoughts ", h("span", { class: "hint", text: "Optional. A few words or a short review, up to 500 characters." }), note),
    msg), foot: [btn("Cancel", () => dlg.close()), save] });
  setTimeout(() => (entry || prefill ? note : title).focus(), 30);
}

const SORTS = [["points", "Your taste"], ["genre_score", "Rank in genre"], ["artist_score", "Rank in discography"], ["decade_score", "Rank in decade"], ["newest", "Newest first"], ["artist", "Artist A–Z"], ["title", "Album A–Z"]];
let binderSort = "points";
function sortCards(cards) {
  const a = c => alb(c.album_id);
  const byTitle = (x, y) => a(x).title.localeCompare(a(y).title);
  const f = binderSort === "newest" ? (x, y) => new Date(y.created_at) - new Date(x.created_at)
    : binderSort === "artist" ? (x, y) => a(x).artist.localeCompare(a(y).artist) || byTitle(x, y)
      : binderSort === "title" ? byTitle
        : (x, y) => (y[binderSort] ?? 0) - (x[binderSort] ?? 0) || byTitle(x, y);
  return cards.slice().sort(f);
}
// Most common genre among someone's five highest-rated cards.
function preferredGenre(uid) {
  const w = new Map();
  for (const c of cardsOf(uid).slice().sort((a, b) => b.points - a.points).slice(0, 5)) { const g = alb(c.album_id).genre; if (g) w.set(g, (w.get(g) || 0) + 1 + c.points / 100); }
  let best = null, bv = 0; for (const [g, v] of w) if (v > bv) { best = g; bv = v; }
  return best;
}
function friendButton(id, cls = "") {
  const f = friendshipWith(id), p = S.profiles.get(id); if (!p) return null;
  const act = (label, fn, okMsg) => {
    const b = btn(label, async () => {
      b.disabled = true;
      const { error } = await fn();
      if (error) { toast(msgOf(error), "error"); b.disabled = false; return; }
      await loadAll(); refresh(); if (okMsg) toast(okMsg);
    }, ("primary " + cls).trim());
    return b;
  };
  if (!f) return act("Add friend", () => sb.rpc("send_friend_request", { username: p.username }), `Friend request sent to ${p.username}.`);
  if (f.status === "pending" && f.requester === S.me) return btn("Request sent", null, cls, { disabled: true });
  if (f.status === "pending") return act("Accept friend request", () => sb.rpc("respond_friend_request", { request: f.id, accept: true }), `You and ${p.username} are now friends.`);
  return null;
}
function openDrawingHistory() {
  const tile = (url, title, sub) => h("figure", { class: "dh-tile" }, h("img", { src: safeImg(url), alt: `Your drawing for ${title}` }), h("figcaption", {}, h("strong", { text: title }), h("span", { class: "muted small", text: sub })));
  const now = cardsOf(S.me).filter(c => c.drawing_url && c.drawn_by === S.me).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const past = S.drawHist.filter(x => x.user_id === S.me).sort((a, b) => new Date(b.archived_at) - new Date(a.archived_at));
  const dlg = modal({ title: "Drawing history", wide: true, body: h("div", {},
    h("p", { class: "muted", style: "margin-bottom:16px;max-width:62ch", text: "Every drawing you've made. When you trade a card away, its drawing comes off the card and is kept here, so the new owner can draw their own." }),
    h("h3", { class: "mini-h", text: "On your cards now" }),
    now.length ? h("div", { class: "dh-grid" }, now.map(c => tile(c.drawing_url, alb(c.album_id).title, "On your card"))) : h("p", { class: "muted small", style: "margin-bottom:8px", text: "None right now." }),
    h("h3", { class: "mini-h", style: "margin-top:20px", text: "From cards you traded away" }),
    past.length ? h("div", { class: "dh-grid" }, past.map(x => tile(x.drawing_url, alb(x.album_id).title,
      x.reason === "replaced" ? `Redrawn ${fmtDate(x.archived_at)}` : `Traded to ${nameOf(x.traded_to)}, ${fmtDate(x.archived_at)}`))) : h("p", { class: "muted small", text: "Nothing yet. Drawings from cards you trade away will show up here." })),
    foot: [btn("Close", () => dlg.close())] });
}
// The More menu on your own profile.
function moreMenu() {
  const menu = h("div", { class: "more-menu", role: "menu", hidden: true });
  const toggle = btn("More", () => (menu.hidden ? open() : close()), "", { "aria-haspopup": "menu", "aria-expanded": "false" });
  const item = (text, fn) => h("button", { type: "button", role: "menuitem", class: "more-item", onclick: () => { close(); fn(); } }, text);
  menu.append(item("Drawing history", openDrawingHistory), item("Log out", logout));
  const away = e => { if (!wrap.contains(e.target)) close(); };
  const keys = e => { if (e.key === "Escape") { close(); toggle.focus(); } };
  function open() { menu.hidden = false; toggle.setAttribute("aria-expanded", "true"); menu.firstChild.focus(); document.addEventListener("pointerdown", away); document.addEventListener("keydown", keys); }
  function close() { menu.hidden = true; toggle.setAttribute("aria-expanded", "false"); document.removeEventListener("pointerdown", away); document.removeEventListener("keydown", keys); }
  const wrap = h("span", { class: "more-wrap" }, toggle, menu);
  return wrap;
}
function openLookingToTrade() {
  const mine = sortCards(cardsOf(S.me));
  const sel = new Set(mine.filter(c => c.for_trade).map(c => c.id));
  const grid = h("div", { class: "grid-cards tight" }), count = h("strong", { class: "summary", "aria-live": "polite" });
  const paint = () => {
    grid.replaceChildren(...mine.map(c => cardEl(c, { compact: true, hideTrade: true, selectable: true, selected: sel.has(c.id), onClick: () => { sel.has(c.id) ? sel.delete(c.id) : sel.add(c.id); paint(); } })));
    count.textContent = `${plural(sel.size, "card")} up for trade`;
  };
  const save = btn("Save", async () => {
    save.disabled = true;
    const { error } = await sb.rpc("set_looking_to_trade", { cards: [...sel] });
    if (error) { toast(msgOf(error), "error"); save.disabled = false; return; }
    await loadAll(); dlg.close(); toast("Looking to trade updated."); refresh();
  }, "primary");
  const dlg = modal({ title: "Looking to trade", wide: true,
    body: h("div", {}, h("p", { class: "muted", style: "margin-bottom:16px;max-width:62ch", text: "Pick the cards you'd trade away. They show at the top of your profile, and people can find them in the Marketplace. There's no limit." }),
      mine.length ? grid : h("p", { text: "Your binder is empty. Make some cards first." })),
    foot: [count, btn("Cancel", () => dlg.close()), save] });
  paint();
}
function viewProfile(main, id) {
  id = id || S.me;
  const isMe = id === S.me;
  let lastKey = "";
  const key = () => JSON.stringify([S.profiles.get(id), cardsOf(id), logsOf(id), S.likes.length, friendshipWith(id) || null, S.friendships.filter(f => f.status === "accepted" && (f.requester === id || f.addressee === id)).length, binderSort]);
  function build() {
    lastKey = key();
    const p = S.profiles.get(id);
    main.replaceChildren();
    if (!p) { main.append(h("div", { class: "wrap" }, h("div", { class: "empty" }, h("p", { text: "This person has left or never finished signing up." }), btn("Open the Marketplace", () => go("market"))))); return; }
    const friend = !isMe && isFriend(id);
    const wall = h("div", { class: "wall" }); applyWall(wall, p);
    const bannerSrc = safeImg(p.banner_url), avatarSrc = safeImg(p.avatar_url);
    // Cards that just arrived in a trade (the "New find!" ones) go first, newest first; then your chosen order.
    const all = cardsOf(id), sorted = sortCards(all), looking = sortCards(all.filter(c => c.for_trade));
    const finds = sorted.filter(isNewCard).sort((a, b) => new Date(b.acquired_at) - new Date(a.acquired_at));
    const cards = finds.concat(sorted.filter(c => !isNewCard(c)));
    const lockedN = all.filter(c => c.locked_by).length;
    const fromTrades = all.filter(c => c.acquired_at || (c.made_by && c.made_by !== c.owner)).length;
    const nFriends = S.friendships.filter(f => f.status === "accepted" && (f.requester === id || f.addressee === id)).length;
    const genre = preferredGenre(id);
    const actions = isMe
      ? [btn("Make new cards", () => go("make"), "primary"), btn("Edit profile", openEditor), btn("Settings", openSettings), moreMenu()]
      : friend
        ? [btn("Propose a trade", () => openTradeBuilder(id), "primary"), btn("Send a message", () => go("messages", id)),
          confirmBtn("Remove friend", "Click again to remove", async () => { const { error } = await sb.rpc("remove_friend", { other: id }); if (error) throw error; await loadAll(); toast(`You and ${p.username} are no longer friends.`); refresh(); }, "small ghost")]
        : [friendButton(id), h("span", { class: "muted small", style: "align-self:center", text: "Become friends to message and trade." })];
    const songBox = p.song_track_id
      ? h("div", { class: "box" }, h("h2", { text: "Profile song" }), songPlayer(p.song_track_id, `${p.username}'s profile song`))
      : isMe ? h("div", { class: "box" }, h("h2", { text: "Profile song" }), h("p", { class: "muted small", text: "Pick a song that plays when people visit. Open Edit profile." })) : null;
    const sortSel = h("select", { "aria-label": "Sort cards", onchange: e => { binderSort = e.target.value; build(); } }, SORTS.map(([v, l]) => h("option", { value: v, selected: v === binderSort || null, text: l })));
    const openCard = c => () => openCardDetail(c, { ownerId: id });
    const binder = cards.length ? h("div", { class: "grid-cards" }, cards.map(c => cardEl(c, { locked: isMe && !!c.locked_by, onClick: openCard(c) })))
      : h("div", { class: "slot-empty", style: "min-height:180px" }, isMe ? h("div", { style: "display:grid;gap:12px;justify-items:center" }, h("span", { text: "Your binder is empty." }), btn("Make your first cards", () => go("make"), "primary small")) : "No cards yet.");
    const lookingSec = isMe || looking.length ? h("section", { class: "ltt", "aria-labelledby": "ltt-h" },
      h("div", { class: "binder-head" }, h("h2", { id: "ltt-h", text: "Looking to trade" }),
        isMe ? btn(looking.length ? "Change cards" : "Choose cards", openLookingToTrade, "small") : h("span", { class: "muted small", text: plural(looking.length, "card") })),
      looking.length ? h("div", { class: "grid-cards" }, looking.map(c => cardEl(c, { hideTrade: true, locked: isMe && !!c.locked_by, onClick: openCard(c) })))
        : h("p", { class: "muted small", text: "Pick cards you'd trade away. People in the Marketplace can find them." })) : null;
    const avatar = avatarSrc
      ? h("button", { type: "button", class: "avatar-btn", "aria-label": `View ${p.username}'s profile picture larger`, onclick: () => openLightbox(avatarSrc, p.username) }, avatarEl(p, "lg"))
      : avatarEl(p, "lg");
    const article = h("article", { class: "profile", "aria-label": `${p.username}'s profile` },
      bannerSrc ? h("img", { class: "banner", src: bannerSrc, alt: "" }) : h("div", { class: "banner", "aria-hidden": "true" }),
      h("div", { class: "ident" }, avatar,
        h("div", { class: "who" }, h("h1", { text: p.username }),
          h("p", { class: "muted small", text: `Collecting since ${new Date(p.created_at).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}` }),
          friend ? h("p", { class: "pill", style: "display:inline-block;margin-top:6px", text: "Friends" }) : null),
        h("div", { class: "actions" }, actions)),
      h("div", { class: "pbody" },
        h("aside", { class: "aside" },
          h("div", { class: "box" }, h("h2", { text: "About" }), h("p", { class: "bio", text: p.bio || (isMe ? "Say what you've been listening to. Open Edit profile." : "No bio yet.") })),
          songBox,
          songLogBox(id, isMe, p.username),
          h("div", { class: "stats" },
            h("div", { class: "stat" }, h("b", { text: all.length }), h("span", { text: all.length === 1 ? "card" : "cards" })),
            h("div", { class: "stat" }, h("b", { text: looking.length }), h("span", { text: "up for trade" })),
            h("div", { class: "stat" }, h("b", { text: fromTrades }), h("span", { text: "from trades" })),
            h("div", { class: "stat" }, h("b", { text: nFriends }), h("span", { text: nFriends === 1 ? "friend" : "friends" })),
            h("div", { class: "stat wide" }, h("b", { class: "genre-stat", text: genre || "–" }), h("span", { text: "top genre" })))),
        h("section", { "aria-label": isMe ? "Your cards" : `${p.username}'s cards`, style: "min-width:0" },
          lookingSec,
          h("div", { class: "binder-head" }, h("h2", { id: "binder-h", text: isMe ? "Your binder" : `${p.username}'s binder` }),
            h("div", { class: "binder-tools" }, isMe && lockedN ? h("span", { class: "muted small", text: `${plural(lockedN, "card")} on hold` }) : null, sortSel)),
          binder)));
    applyProfileColors(article, p);
    wall.append(article);
    main.append(wall);
  }
  build();
  return { update() { if (key() !== lastKey) build(); } };
}

/* ---------- profile editor ---------- */
function readAsDataURL(file) { return new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = () => rej(fr.error); fr.readAsDataURL(file); }); }
function loadImage(src) { return new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => rej(err("That file couldn't be read as a picture. Try a JPEG or PNG.")); im.src = src; }); }
const canvasBlob = (c, type = "image/jpeg", q = .85) => new Promise(res => c.toBlob(res, type, q));
async function cropToBlob(file, w, hh) {
  const im = await loadImage(await readAsDataURL(file));
  const c = document.createElement("canvas"); c.width = w; c.height = hh;
  const ctx = c.getContext("2d"), sc = Math.max(w / im.width, hh / im.height), sw = w / sc, sh = hh / sc;
  ctx.drawImage(im, (im.width - sw) / 2, (im.height - sh) / 2, sw, sh, 0, 0, w, hh);
  return canvasBlob(c);
}
// Shrinks a picture so its longest side is at most maxSide, without cropping. PNGs stay PNG so see-through parts survive tiling.
async function shrinkToBlob(file, maxSide) {
  const im = await loadImage(await readAsDataURL(file));
  const sc = Math.min(1, maxSide / Math.max(im.width, im.height));
  const c = document.createElement("canvas"); c.width = Math.round(im.width * sc); c.height = Math.round(im.height * sc);
  c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
  const png = file.type === "image/png";
  return { blob: await canvasBlob(c, png ? "image/png" : "image/jpeg", .85), width: c.width, png };
}
async function uploadImage(blob, name, png) {
  const path = `${S.me}/${name}.${png ? "png" : "jpg"}`;
  const { error } = await sb.storage.from("media").upload(path, blob, { upsert: true, contentType: png ? "image/png" : "image/jpeg" });
  if (error) throw err("The picture didn't upload. Try a smaller file.");
  const url = sb.storage.from("media").getPublicUrl(path).data.publicUrl;
  return url.startsWith("data:") ? url : url + "?v=" + Date.now();
}
const trackIdFrom = s => (String(s).match(/(?:track[/:])([A-Za-z0-9]{22})/) || String(s).match(/^([A-Za-z0-9]{22})$/) || [])[1] || null;

const COLOR_PRESETS = [
  ["Site default", null, null, null],
  ["Bubblegum", "#FFE3F1", "#3A0F2A", "#C2185B"],
  ["Jade room", "#0F2A22", "#E6F6EF", "#F7A9C6"],
  ["Midnight", "#12152E", "#E9ECFF", "#FFD23F"],
  ["Newsprint", "#F4F4F0", "#1A1A1A", "#C62828"],
  ["Arcade", "#0B0B0B", "#F2F2F2", "#39FF14"]
];
function radioGroup(name, label, entries, cur, pick) {
  return h("div", { class: "swatches", role: "radiogroup", "aria-label": label }, entries.map(([val, text]) =>
    h("label", { class: "swatch" }, h("input", { type: "radio", name, value: val, checked: val === cur || null, onchange: () => pick(val) }), h("span", { text }))));
}

function openEditor() {
  const p = me(); if (!p) return;
  const theme = themeColors();
  const st = {
    wall: p.wall || "dots", wall_color: safeColor(p.wall_color),
    wall_image_url: safeImg(p.wall_image_url) || "", picBlob: null, picPng: false, blobUrl: null,
    wall_image_mode: p.wall_image_mode || "cover", wall_image_size: p.wall_image_size || 240, wall_image_repeat: p.wall_image_repeat || "repeat",
    wall_image_position: p.wall_image_position || "center", wall_image_fixed: p.wall_image_fixed !== false,
    panel: hexOrNull(p.panel_color), text: hexOrNull(p.text_color), hl: hexOrNull(p.highlight_color),
    avatarBlob: null, bannerBlob: null, removeBanner: false, track: p.song_track_id || null
  };
  const msg = h("p", { class: "error", role: "alert" });
  const bio = h("textarea", { id: "e-bio", maxlength: "300", rows: "4" }); bio.value = p.bio || "";

  /* Pictures */
  const avPrev = h("img", { class: "preview-av", alt: "Profile picture preview" }); if (safeImg(p.avatar_url)) avPrev.src = p.avatar_url; else avPrev.style.visibility = "hidden";
  const bnPrev = h("img", { class: "preview-bn", alt: "Banner preview" }); if (safeImg(p.banner_url)) bnPrev.src = p.banner_url; else bnPrev.style.display = "none";
  const preview = (blob, img) => { img.src = URL.createObjectURL(blob); img.style.visibility = "visible"; img.style.display = "block"; };
  const avIn = h("input", { type: "file", accept: "image/*", id: "e-av", onchange: async e => { const f = e.target.files[0]; if (!f) return; msg.textContent = ""; try { st.avatarBlob = await cropToBlob(f, 600, 600); preview(st.avatarBlob, avPrev); } catch (x) { msg.textContent = msgOf(x); } } });
  const bnIn = h("input", { type: "file", accept: "image/*", id: "e-bn", onchange: async e => { const f = e.target.files[0]; if (!f) return; msg.textContent = ""; try { st.bannerBlob = await cropToBlob(f, 1500, 500); st.removeBanner = false; preview(st.bannerBlob, bnPrev); } catch (x) { msg.textContent = msgOf(x); } } });

  /* Background */
  const wallPrev = h("div", { class: "wall-preview", role: "img", "aria-label": "Preview of your background behind your profile" });
  const picOpts = h("div", { class: "form-grid" }), tileOpts = h("div", { class: "form-grid" }), placeOpts = h("div", { class: "form-grid" });
  const patternField = h("div", { class: "field" }, "Pattern", radioGroup("wall", "Pattern", Object.entries(WALLS).map(([k, v]) => [k, v.n]), st.wall, v => { st.wall = v; paintWall(); }));
  const sizeOut = h("output", { for: "e-ts" });
  const sizeIn = h("input", { type: "range", id: "e-ts", min: "20", max: "800", step: "10", value: st.wall_image_size, oninput: e => { st.wall_image_size = +e.target.value; paintWall(); } });
  const fixedIn = h("input", { type: "checkbox", id: "e-fx", checked: st.wall_image_fixed || null, onchange: e => { st.wall_image_fixed = e.target.checked; } });
  function paintWall() {
    const hasPic = !!(st.picBlob || st.wall_image_url);
    const scale = clamp((wallPrev.clientWidth || 380) / Math.max(window.innerWidth, 320), .12, 1);
    if (st.picBlob && !st.blobUrl) st.blobUrl = URL.createObjectURL(st.picBlob);
    applyWall(wallPrev, { ...st, wall_image_url: hasPic ? (st.blobUrl || st.wall_image_url) : null }, { scale, preview: true });
    picOpts.hidden = !hasPic; patternField.hidden = hasPic;
    tileOpts.hidden = !hasPic || st.wall_image_mode !== "tile";
    placeOpts.hidden = !hasPic || st.wall_image_mode === "tile";
    sizeOut.textContent = `${st.wall_image_size}px`;
  }
  const wallColor = h("input", { type: "color", id: "e-wc", value: st.wall_color, oninput: e => { st.wall_color = e.target.value; paintWall(); } });
  const wallIn = h("input", { type: "file", accept: "image/*", id: "e-wp", onchange: async e => {
    const f = e.target.files[0]; if (!f) return; msg.textContent = "";
    try {
      const r = await shrinkToBlob(f, 1920);
      st.picBlob = r.blob; st.picPng = r.png; st.blobUrl = null;
      st.wall_image_size = clamp(Math.round(Math.min(r.width, 300) / 10) * 10, 20, 800); sizeIn.value = st.wall_image_size;
      paintWall();
    } catch (x) { msg.textContent = msgOf(x); }
  } });
  picOpts.append(
    h("div", { class: "field" }, "How the picture fills the page", radioGroup("wmode", "How the picture fills the page", [["cover", "Fill the screen"], ["contain", "Show the whole picture"], ["tile", "Tile it"]], st.wall_image_mode, v => { st.wall_image_mode = v; paintWall(); })),
    tileOpts, placeOpts,
    h("label", { class: "check", for: "e-fx" }, fixedIn, "Keep the picture still while the page scrolls"),
    h("div", {}, btn("Remove background picture", () => { st.wall_image_url = ""; st.picBlob = null; st.blobUrl = null; wallIn.value = ""; paintWall(); }, "small danger")));
  tileOpts.append(
    h("div", { class: "field" }, h("label", { for: "e-ts", text: "Tile size" }), h("div", { class: "range-row" }, sizeIn, sizeOut), h("span", { class: "hint", text: "How wide each copy of the picture is on the page." })),
    h("div", { class: "field" }, "Repeat pattern", radioGroup("wrep", "Repeat pattern", REPEATS, st.wall_image_repeat, v => { st.wall_image_repeat = v; paintWall(); })));
  placeOpts.append(h("div", { class: "field" }, "Line the picture up with the", radioGroup("wpos", "Picture position", [["top", "Top"], ["center", "Middle"], ["bottom", "Bottom"]], st.wall_image_position, v => { st.wall_image_position = v; paintWall(); })));

  /* Colors */
  const val = k => st[k] || theme[k];
  const mp = { name: h("span", { class: "mp-name", text: p.username }), num: h("span", { class: "mp-num", text: cardsOf(S.me).length }), body: h("span", { class: "small", text: "Main text looks like this." }), btn: h("span", { class: "mp-btn", text: "Propose a trade" }) };
  const miniPrev = h("div", { class: "mini-preview", "aria-hidden": "true" }, mp.name, mp.body, h("span", { class: "mp-row" }, mp.num, mp.btn));
  const warn = h("p", { class: "contrast-warn", role: "status" });
  const inputs = {};
  function paintColors() {
    for (const k of ["panel", "text", "hl"]) inputs[k].value = val(k);
    miniPrev.style.background = val("panel"); miniPrev.style.color = val("text");
    mp.num.style.color = mp.btn.style.color = val("hl");
    mp.btn.style.background = `color-mix(in srgb, ${val("hl")} 14%, ${val("panel")})`;
    const notes = [];
    if (contrast(val("text"), val("panel")) < 4.5) notes.push("Your main text may be hard to read on this card color.");
    if (contrast(val("hl"), val("panel")) < 3) notes.push("Your highlight color may be hard to see on this card color.");
    warn.textContent = notes.join(" ");
  }
  const colorRow = (k, label, desc) => {
    inputs[k] = h("input", { type: "color", id: "e-c-" + k, "aria-label": label, oninput: e => { st[k] = e.target.value; paintColors(); } });
    return h("div", { class: "color-row" }, inputs[k],
      h("label", { class: "cl", for: "e-c-" + k }, h("strong", { text: label }), h("span", { text: desc })),
      btn("Reset", () => { st[k] = null; paintColors(); }, "small ghost", { "aria-label": `Reset ${label.toLowerCase()} to the site default` }));
  };
  const presets = h("div", { class: "presets", role: "group", "aria-label": "Color presets" }, COLOR_PRESETS.map(([name, panel, text, hl]) => {
    const dot = h("i", { text: "Aa" });
    dot.style.background = panel || theme.panel; dot.style.color = text || theme.text; dot.style.boxShadow = `inset 0 -5px 0 ${hl || theme.hl}`;
    return h("button", { type: "button", class: "preset", onclick: () => { Object.assign(st, { panel, text, hl }); paintColors(); } }, dot, name);
  }));

  /* Profile song */
  const songPreview = h("div", {});
  const paintSong = () => songPreview.replaceChildren(st.track ? songPlayer(st.track, "Profile song preview") : h("p", { class: "muted small", text: "No profile song yet." }));
  const link = h("input", { type: "url", id: "e-song", placeholder: "https://open.spotify.com/track/…" });
  const useLink = btn("Use this link", () => { const tid = trackIdFrom(link.value); if (!tid) { msg.textContent = "That isn't a Spotify song link. In Spotify, open a song's menu, choose Share, then Copy song link."; return; } msg.textContent = ""; st.track = tid; paintSong(); }, "small");
  const picker = h("div", { class: "track-pick", role: "group", "aria-label": "Your recent songs" });
  const pickBtn = btn("Choose from my recent songs", async () => {
    pickBtn.disabled = true;
    try {
      const items = await MUSIC.recentTracks();
      picker.replaceChildren(...items.map(t => {
        const b = h("button", { type: "button", "aria-pressed": String(st.track === t.id), onclick: () => { st.track = t.id; picker.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", String(x === b))); paintSong(); } },
          h("span", { class: "tcov", html: coverSVG({ id: t.albumId, genre: t.genre || "" }) }),
          h("span", {}, h("strong", { text: t.name }), h("br"), h("span", { class: "muted small", text: t.artist })));
        return b;
      }));
    } catch (e) { msg.textContent = msgOf(e); }
    pickBtn.disabled = false;
  }, "small");

  const body = h("div", { class: "form-grid" },
    h("label", { class: "field", for: "e-bio" }, "Bio", bio),
    h("fieldset", { class: "fieldset" }, h("legend", { text: "Pictures" }),
      h("div", { class: "row" }, avPrev, h("label", { class: "field", for: "e-av" }, "Profile picture", avIn, h("span", { class: "hint", text: "Cropped to a square. Friends can click it to see it bigger." }))),
      h("label", { class: "field", for: "e-bn" }, "Banner", bnPrev, bnIn, h("span", { class: "hint", text: "Wide pictures work best. Cropped to 3:1." })),
      h("div", {}, btn("Remove banner", () => { st.removeBanner = true; st.bannerBlob = null; bnPrev.style.display = "none"; }, "small ghost"))),
    h("fieldset", { class: "fieldset" }, h("legend", { text: "Background" }),
      wallPrev,
      h("label", { class: "field", for: "e-wc" }, "Background color", wallColor),
      patternField,
      h("label", { class: "field", for: "e-wp" }, "Background picture", wallIn, h("span", { class: "hint", text: "Optional. Shows instead of the pattern. Small pictures and patterns tile best." })),
      picOpts),
    h("fieldset", { class: "fieldset" }, h("legend", { text: "Colors" }),
      h("p", { class: "hint small muted", text: "These colors apply to your profile card. Album cards keep their own look." }),
      presets,
      colorRow("panel", "Card color", "The background of your profile card"),
      colorRow("text", "Main text", "Your bio, headings and labels"),
      colorRow("hl", "Highlight", "Numbers, button text, links and accents"),
      miniPrev, warn),
    h("fieldset", { class: "fieldset" }, h("legend", { text: "Profile song" }),
      songPreview,
      h("div", { class: "row" }, pickBtn, st.track ? btn("Remove song", () => { st.track = null; paintSong(); }, "small danger") : null),
      picker,
      h("label", { class: "field", for: "e-song" }, "Or paste a Spotify song link", link), h("div", {}, useLink)),
    msg);
  const save = h("button", { type: "button", class: "btn primary", onclick: async () => {
    save.disabled = true; save.textContent = "Saving…"; msg.textContent = "";
    try {
      const patch = {
        bio: bio.value.trim().slice(0, 300), wall: st.wall, wall_color: safeColor(st.wall_color),
        wall_image_mode: st.wall_image_mode, wall_image_size: st.wall_image_size, wall_image_repeat: st.wall_image_repeat,
        wall_image_position: st.wall_image_position, wall_image_fixed: st.wall_image_fixed,
        panel_color: st.panel, text_color: st.text, highlight_color: st.hl, song_track_id: st.track, updated_at: new Date().toISOString()
      };
      if (st.avatarBlob) patch.avatar_url = await uploadImage(st.avatarBlob, "avatar");
      if (st.bannerBlob) patch.banner_url = await uploadImage(st.bannerBlob, "banner");
      else if (st.removeBanner) patch.banner_url = null;
      if (st.picBlob) patch.wall_image_url = await uploadImage(st.picBlob, "wallpaper", st.picPng);
      else if (!st.wall_image_url) patch.wall_image_url = null;
      const { error } = await sb.from("profiles").update(patch).eq("id", S.me);
      if (error) throw err("Your profile didn't save. Try again.");
      await loadAll(); dlg.close(); toast("Profile saved."); refresh();
    } catch (e) { msg.textContent = msgOf(e); save.disabled = false; save.textContent = "Save changes"; }
  } }, "Save changes");
  const dlg = modal({ title: "Edit profile", body, foot: [btn("Cancel", () => dlg.close()), save] });
  paintColors(); paintSong(); paintWall();
  requestAnimationFrame(paintWall);
}

/* =====================================================================
   Trading (friends only)
===================================================================== */
function openTradeBuilder(otherId, preWant) {
  const them = S.profiles.get(otherId); if (!them) { toast("That person isn't loaded yet.", "error"); return; }
  if (!isFriend(otherId)) { toast("You can only trade with friends.", "error"); return; }
  const mine = cardsOf(S.me), theirs = cardsOf(otherId);
  // Albums you both have can't change hands: you'd be swapping a card for the same album.
  const myAlbums = new Set(mine.map(c => c.album_id)), theirAlbums = new Set(theirs.map(c => c.album_id));
  const both = c => myAlbums.has(c.album_id) && theirAlbums.has(c.album_id);
  const give = new Set(), want = new Set(preWant && !both(S.cardById.get(preWant) || {}) ? [preWant] : []);
  const myGrid = h("div", { class: "grid-cards tight" }), theirGrid = h("div", { class: "grid-cards tight" });
  const summary = h("p", { class: "summary", "aria-live": "polite" });
  const note = h("input", { type: "text", maxlength: "200", id: "t-note", placeholder: "Optional note, like why you want it" });
  const msg = h("p", { class: "error reserve", role: "alert" });
  const send = h("button", { type: "button", class: "btn primary" }, "Send trade offer");
  const byPoints = arr => arr.slice().sort((a, b) => (both(a) ? 1 : 0) - (both(b) ? 1 : 0) || (b.for_trade ? 1 : 0) - (a.for_trade ? 1 : 0) || b.points - a.points);
  function paint() {
    myGrid.replaceChildren(...byPoints(mine).map(c => both(c)
      ? cardEl(c, { compact: true, dupe: "They have it too", disabled: true })
      : cardEl(c, { compact: true, selectable: true, selected: give.has(c.id), locked: !!c.locked_by, disabled: !!c.locked_by, onClick: () => { give.has(c.id) ? give.delete(c.id) : give.add(c.id); paint(); } })));
    theirGrid.replaceChildren(...byPoints(theirs).map(c => both(c)
      ? cardEl(c, { compact: true, dupe: "You have it too", disabled: true })
      : cardEl(c, { compact: true, selectable: true, selected: want.has(c.id), onClick: () => { want.has(c.id) ? want.delete(c.id) : want.add(c.id); paint(); } })));
    if (!mine.length) myGrid.append(h("p", { class: "muted", text: "Your binder is empty." }));
    if (!theirs.length) theirGrid.append(h("p", { class: "muted", text: "Their binder is empty." }));
    const g = give.size, r = want.size;
    const gp = mine.filter(c => give.has(c.id)).reduce((n, c) => n + c.points, 0);
    const rp = theirs.filter(c => want.has(c.id)).reduce((n, c) => n + c.points, 0);
    summary.replaceChildren(h("strong", { text: `You give ${plural(g, "card")}, you get ${plural(r, "card")}.` }), h("br"), g && r ? `Average taste: ${starShort(gp / g)} given, ${starShort(rp / r)} received.` : "Pick cards on both sides.");
    send.disabled = !g || !r; msg.textContent = (g || r) && (!g || !r) ? "Pick at least one card on each side." : "";
  }
  send.onclick = async () => {
    send.disabled = true; send.textContent = "Sending…"; msg.textContent = "";
    const { error } = await sb.rpc("propose_trade", { recipient: otherId, give: [...give], want: [...want], note: note.value.trim() });
    if (error) { msg.textContent = msgOf(error); send.disabled = false; send.textContent = "Send trade offer"; return; }
    dlg.close(); toast(`Trade offer sent to ${them.username}.`); await loadAll(); go("trades");
  };
  const body = h("div", {},
    h("div", { class: "builder" },
      h("section", { "aria-label": "Cards you give" }, h("h3", { text: "You give" }), myGrid, mine.some(c => c.locked_by) ? h("p", { class: "muted small", style: "margin-top:8px", text: "Faded cards are already promised in another pending trade." }) : null),
      h("section", { "aria-label": "Cards you get" }, h("h3", { text: `You get from ${them.username}` }), theirGrid)),
    mine.some(both) ? h("p", { class: "muted small", style: "margin-top:14px", text: "Dark cards are albums you both have, so they can't be traded between you." }) : null,
    h("label", { class: "field", for: "t-note", style: "margin-top:20px" }, "Note", note), msg);
  const dlg = modal({ title: `Trade with ${them.username}`, wide: true, body, foot: [summary, btn("Cancel", () => dlg.close()), send] });
  paint();
}

function viewTrades(main) {
  const root = h("div", { class: "wrap" }); main.append(root);
  const LABEL = { pending: "Pending", completed: "Completed", declined: "Declined", cancelled: "Cancelled", expired: "Expired" };
  function tradeEl(t) {
    const incoming = t.to_user === S.me, other = incoming ? t.from_user : t.to_user, op = S.profiles.get(other);
    const { give, get } = tradeSides(t);
    const youGive = incoming ? get : give, youGet = incoming ? give : get;
    const actions = h("div", { class: "row" });
    const run = (b, fn) => async () => { b.disabled = true; try { await fn(); await loadAll(); refresh(); } catch (e) { toast(msgOf(e), "error"); b.disabled = false; } };
    let warn = null;
    if (t.status === "pending") {
      const valid = give.every(id => S.cardById.get(id)?.owner === t.from_user) && get.every(id => S.cardById.get(id)?.owner === t.to_user);
      if (!valid) warn = h("p", { class: "warn", text: "Some of these cards have changed hands since the offer was made." });
      if (incoming) {
        const a = btn("Accept trade", null, "primary small"); a.onclick = run(a, async () => {
          const { data, error } = await sb.rpc("accept_trade", { trade: t.id }); if (error) throw error;
          toast(data === "completed" ? "Trade complete. The new cards are at the top of your binder, marked New find!" : "That offer is out of date because some cards already moved, so it was closed.", data === "completed" ? "info" : "error");
        });
        const d = btn("Decline", null, "small"); d.onclick = run(d, async () => { const { error } = await sb.rpc("close_trade", { trade: t.id, action: "decline" }); if (error) throw error; toast("Trade declined."); });
        actions.append(a, d);
      } else {
        const c = btn("Cancel offer", null, "small danger"); c.onclick = run(c, async () => { const { error } = await sb.rpc("close_trade", { trade: t.id, action: "cancel" }); if (error) throw error; toast("Offer cancelled."); });
        actions.append(c);
      }
    }
    if (op && isFriend(other)) actions.append(btn("Message", () => go("messages", other), "small ghost"));
    return h("article", { class: "trade" },
      h("div", { class: "trade-top" }, op ? avatarEl(op, "sm") : null,
        h("div", { class: "who" }, op ? h("button", { type: "button", class: "who-link", onclick: () => go("profile", other), text: op.username }) : h("span", { text: "A former member" }),
          h("div", { class: "muted small", text: (incoming ? "Offered to you " : "You offered ") + relTime(t.created_at) })),
        h("span", { class: "status " + t.status, text: LABEL[t.status] || t.status })),
      h("div", { class: "sides" },
        h("div", {}, h("h3", { text: "You give" }), h("ul", { class: "minis" }, youGive.map(id => h("li", {}, miniCard(id))))),
        h("div", {}, h("h3", { text: "You get" }), h("ul", { class: "minis" }, youGet.map(id => h("li", {}, miniCard(id)))))),
      t.note ? h("p", { class: "note", text: `“${t.note}”` }) : null, warn, actions);
  }
  function render() {
    const inc = S.trades.filter(t => t.to_user === S.me && t.status === "pending");
    const out = S.trades.filter(t => t.from_user === S.me && t.status === "pending");
    const hist = S.trades.filter(t => t.status !== "pending").slice(0, 30);
    const sec = (title, items, empty) => h("section", { class: "sec" }, h("h2", { text: title }), items.length ? items : h("div", { class: "empty" }, empty));
    root.replaceChildren(
      h("div", { class: "view-head" }, h("div", {}, h("h1", { text: "Trades" }), h("p", { class: "muted", text: "Cards you offer are held until your friend accepts or declines, or you cancel. When a card changes hands, its review and the review's likes are cleared." }))),
      sec("Waiting on you", inc.map(tradeEl), h("p", { text: "No offers right now." })),
      sec("Waiting on them", out.map(tradeEl), [h("p", { text: "You haven't offered any trades." }), btn("Find a friend to trade with", () => go("friends"), "primary")]),
      sec("History", hist.map(tradeEl), h("p", { text: "Finished, declined, cancelled and expired trades show up here." })));
  }
  render();
  return { update: render };
}

/* =====================================================================
   Friends
===================================================================== */
function personCovers(p) {
  return h("span", { class: "covers", "aria-hidden": "true" }, cardsOf(p.id).sort((a, b) => b.points - a.points).slice(0, 5).map(c => coverEl(alb(c.album_id), "")));
}
function viewFriends(main) {
  const st = { q: "", sort: "new" };
  const root = h("div", { class: "wrap" }); main.append(root);
  const grid = h("div", { class: "player-grid" });
  const search = h("input", { type: "search", id: "f-q", placeholder: "Search friends", "aria-label": "Search friends", oninput: e => { st.q = e.target.value.trim().toLowerCase(); renderGrid(); } });
  const sort = h("select", { id: "f-s", "aria-label": "Sort friends", onchange: e => { st.sort = e.target.value; renderGrid(); } }, h("option", { value: "new" }, "Newest friends"), h("option", { value: "cards" }, "Most cards"), h("option", { value: "az" }, "Name A–Z"));
  const reqBox = h("div", {});
  const countEl = h("p", { class: "muted", style: "margin-bottom:14px", "aria-live": "polite" });
  function tile(p) {
    const n = cardsOf(p.id).length, g = preferredGenre(p.id);
    const el = h("button", { type: "button", class: "player", onclick: () => go("profile", p.id) },
      avatarEl(p, "md"), h("span", {}, h("span", { class: "pn", text: p.username }), h("span", { class: "ps", text: `${plural(n, "card")}${g ? `, mostly ${g}` : ""}` })),
      personCovers(p));
    const hl = hexOrNull(p.highlight_color); if (hl) el.style.setProperty("--pa", hl); return el;
  }
  function reqRow(f, incoming) {
    const other = otherSide(f), p = S.profiles.get(other);
    const act = (label, cls, fn) => { const b = btn(label, null, cls); b.onclick = async () => { b.disabled = true; const { error } = await fn(); if (error) { toast(msgOf(error), "error"); b.disabled = false; return; } await loadAll(); refresh(); }; return b; };
    const actions = incoming
      ? [act("Accept", "primary small", () => sb.rpc("respond_friend_request", { request: f.id, accept: true })), act("Decline", "small", () => sb.rpc("respond_friend_request", { request: f.id, accept: false }))]
      : [act("Cancel", "small ghost", () => sb.rpc("remove_friend", { other }))];
    return h("li", { class: "req" }, avatarEl(p, "sm"),
      h("span", { style: "min-width:0" }, h("button", { type: "button", class: "who-link rn", onclick: () => go("profile", other), text: p?.username || "Someone" }), h("br"), h("span", { class: "rs", text: (incoming ? "Wants to be friends, " : "Request sent ") + relTime(f.created_at) })),
      h("span", { class: "row" }, actions));
  }
  function renderReqs() {
    const inc = requestsIn(), out = requestsOut();
    reqBox.replaceChildren(h("h2", { text: "Friend requests" }),
      !inc.length && !out.length ? h("p", { class: "muted", text: "No requests right now." }) :
        h("ul", { class: "req-list" }, inc.map(f => reqRow(f, true)), out.map(f => reqRow(f, false))));
  }
  function renderGrid() {
    let list = friendIds().map(id => S.profiles.get(id)).filter(Boolean);
    const total = list.length;
    if (st.q) list = list.filter(p => p.username.toLowerCase().includes(st.q));
    const since = id => new Date(friendshipWith(id)?.responded_at || friendshipWith(id)?.created_at || 0);
    list.sort(st.sort === "cards" ? (a, b) => cardsOf(b.id).length - cardsOf(a.id).length : st.sort === "az" ? (a, b) => a.username.localeCompare(b.username) : (a, b) => since(b.id) - since(a.id));
    countEl.textContent = plural(total, "friend");
    grid.replaceChildren(...list.map(tile));
    if (!total) grid.append(h("div", { class: "empty", style: "grid-column:1/-1" }, h("p", { text: "No friends yet. Find people you know, or someone new, in the Marketplace." }), btn("Open the Marketplace", () => go("market"), "primary")));
    else if (!list.length) grid.append(h("div", { class: "empty", style: "grid-column:1/-1" }, h("p", { text: "No friends match that search." })));
  }
  root.append(
    h("div", { class: "view-head" }, h("div", {}, h("h1", { text: "Friends" }), h("p", { class: "muted", text: "Friends can message each other and trade cards." }))),
    h("div", { class: "friends-top" },
      h("section", { class: "panel" }, h("h2", { text: "Find people" }),
        h("p", { class: "muted", style: "margin-bottom:14px", text: "Everyone on Basement Club is in the Marketplace. Look someone up by name, or browse by genre, join date and the cards they want to trade." }),
        btn("Open the Marketplace", () => go("market"), "primary")),
      h("section", { class: "panel" }, reqBox)),
    h("div", { class: "view-head", style: "margin-bottom:10px" }, h("h2", { text: "Your friends" }), h("div", { class: "filters" }, search, sort)),
    countEl, grid);
  renderReqs(); renderGrid();
  return { update() { renderReqs(); renderGrid(); } };
}

/* =====================================================================
   Marketplace: every member, with filters and pages instead of endless scrolling
===================================================================== */
const PAGE_SIZE = 12;
// Broad families of genres, used to compare two people's taste. First match wins.
const FAMILIES = [["electronic", "electronic and ambient", /electro|ambient|techno|house|synth|new age|trip hop|downtempo|idm/],
  ["hiphop", "hip-hop", /hip hop|rap|trap|grime|drill/], ["jazz", "jazz", /jazz|bop|swing/], ["world", "music from around the world", /afro|highlife|flamenco|latin|bossa|samba|reggae|cumbia|k pop|j pop|city pop|dembow|ethio/],
  ["folk", "folk", /folk|country|americana|bluegrass|singer/], ["soul", "soul and R&B", /soul|r and b|rnb|funk|disco|gospel/],
  ["rock", "rock and guitar music", /rock|punk|grunge|shoegaze|slowcore|post|metal|alternative|indie|new wave|dream pop|psych|emo/],
  ["pop", "pop", /pop/], ["classical", "classical and experimental", /classical|piano|orchestr|minimal|experimental|avant|opera|contemporary/]];
const familyOf = g => { const n = normText(g); return (FAMILIES.find(f => f[2].test(n)) || ["other", "other music"])[0]; };
const familyName = k => FAMILIES.find(f => f[0] === k)?.[1] || "other music";
function tasteVector(uid) {
  const v = new Map();
  for (const c of cardsOf(uid)) { if ((c.points || 0) < LIKED_FROM) continue; const k = familyOf(alb(c.album_id).genre); v.set(k, (v.get(k) || 0) + .25 + (c.points - LIKED_FROM) / 50); }
  return v;
}
function tasteMatch(a, b) {
  const x = tasteVector(a), y = tasteVector(b); let dot = 0, nx = 0, ny = 0;
  for (const [k, v] of x) { nx += v * v; dot += v * (y.get(k) || 0); }
  for (const v of y.values()) ny += v * v;
  return nx && ny ? dot / Math.sqrt(nx * ny) : null;
}
const topFamily = uid => [...tasteVector(uid)].sort((p, q) => q[1] - p[1])[0]?.[0] || null;
// Opposite taste: little overlap between what the two of you collect. Needs a few cards on both sides.
const OPPOSITE_BELOW = .3;
const likedCount = id => cardsOf(id).filter(c => c.points >= LIKED_FROM).length;
const isOpposite = id => likedCount(id) >= 3 && likedCount(S.me) >= 3 && (tasteMatch(S.me, id) ?? 1) < OPPOSITE_BELOW;
const MONTHS = Array.from({ length: 12 }, (_, i) => new Date(2000, i, 1).toLocaleString(undefined, { month: "short" }));
function viewMarket(main) {
  const blank = { q: "", genre: "", trading: false, fresh: false, y: "", m: "", d: "", from: null, to: null, sort: "new", shown: PAGE_SIZE };
  const st = { ...blank };
  const people = () => [...S.profiles.values()].filter(p => p.id !== S.me && p.username);
  const lttOf = id => cardsOf(id).filter(c => c.for_trade);
  const yearVal = v => /^\d{4}$/.test(v.trim()) ? +v.trim() : null;
  const go1 = () => { st.shown = PAGE_SIZE; render(); };

  /* filter controls */
  const field = (label, id, control, hint) => h("div", { class: "field" }, h("label", { for: id, text: label }), control, hint ? h("span", { class: "hint", text: hint }) : null);
  const search = h("input", { type: "search", id: "m-q", placeholder: "Search by name", autocomplete: "off", oninput: e => { st.q = e.target.value.trim().toLowerCase(); go1(); } });
  const genreSel = h("select", { id: "m-g", onchange: e => { st.genre = e.target.value; go1(); } });
  const tradingIn = h("input", { type: "checkbox", id: "m-t", onchange: e => { st.trading = e.target.checked; go1(); } });
  const freshIn = h("input", { type: "checkbox", id: "m-n", onchange: e => { st.fresh = e.target.checked; go1(); } });
  const ySel = h("select", { id: "m-y", "aria-label": "Year joined", onchange: e => { st.y = e.target.value; go1(); } });
  const mSel = h("select", { id: "m-m", "aria-label": "Month joined", onchange: e => { st.m = e.target.value; go1(); } }, h("option", { value: "" }, "Month"), MONTHS.map((n, i) => h("option", { value: String(i), text: n })));
  const dSel = h("select", { id: "m-d", "aria-label": "Day joined", onchange: e => { st.d = e.target.value; go1(); } }, h("option", { value: "" }, "Day"), Array.from({ length: 31 }, (_, i) => h("option", { value: String(i + 1), text: String(i + 1) })));
  const thisYear = new Date().getFullYear();
  const fromIn = h("input", { type: "number", id: "m-from", min: "1900", max: String(thisYear), placeholder: "Any", inputmode: "numeric", "aria-label": "Released from year", oninput: e => { st.from = yearVal(e.target.value); go1(); } });
  const toIn = h("input", { type: "number", id: "m-to", min: "1900", max: String(thisYear), placeholder: "Any", inputmode: "numeric", "aria-label": "Released up to year", oninput: e => { st.to = yearVal(e.target.value); go1(); } });
  const sortSel = h("select", { id: "m-s", "aria-label": "Sort people", onchange: e => { st.sort = e.target.value; go1(); } },
    [["new", "Newest members"], ["old", "Longest here"], ["trade", "Most cards up for trade"], ["az", "Name A–Z"]].map(([v, t]) => h("option", { value: v, text: t })));
  const clear = btn("Clear filters", () => {
    Object.assign(st, blank, { sort: st.sort });
    search.value = ""; genreSel.value = ""; tradingIn.checked = false; freshIn.checked = false; ySel.value = ""; mSel.value = ""; dSel.value = ""; fromIn.value = ""; toIn.value = "";
    render();
  }, "small ghost");
  const summary = h("summary", {});
  const filters = h("details", { class: "filters-box", open: window.innerWidth > 860 || null }, summary,
    h("div", { class: "form-grid" },
      field("Name", "m-q", search),
      field("Preferred genre", "m-g", genreSel, "The top genre among each person's highest-rated cards."),
      h("div", { class: "field" }, "Show only",
        h("label", { class: "check", for: "m-t" }, tradingIn, "People looking to trade"),
        h("label", { class: "check", for: "m-n" }, freshIn, "People you haven't friended yet")),
      h("fieldset", { class: "fs-plain" }, h("legend", { text: "Date joined" }), h("div", { class: "date-row" }, ySel, mSel, dSel), h("span", { class: "hint", text: "Pick any mix, like just a year, or a month and day." })),
      h("fieldset", { class: "fs-plain" }, h("legend", { text: "Release date of cards up for trade" }),
        h("div", { class: "year-row" }, fromIn, h("span", { class: "muted small", text: "to" }), toIn),
        h("span", { class: "hint", text: "Years, like 1970 to 1989." })),
      h("div", {}, clear)));

  /* results */
  const countEl = h("p", { class: "count-line", "aria-live": "polite" });
  const oppGrid = h("div", { class: "people" }), grid = h("div", { class: "people" });
  const more = h("div", { class: "pager" });
  const headRow = h("div", { class: "results-head" }, countEl, sortSel);
  const oppCount = h("span", { class: "mk-n" }), restCount = h("span", { class: "mk-n" }), restTitle = h("span");
  const oppSec = h("section", { class: "mk-sec opp-sec", "aria-labelledby": "mk-opp" },
    h("div", { class: "mk-head" }, h("h2", { id: "mk-opp" }, "Opposite taste ", oppCount)), oppGrid);
  const restSec = h("section", { class: "mk-sec", "aria-labelledby": "mk-rest" },
    h("div", { class: "mk-head" }, h("h2", { id: "mk-rest" }, restTitle, " ", restCount)), grid, more);
  const results = h("div", { class: "results-body" }, oppSec, restSec);

  const setOptions = (sel, opts, val) => { sel.replaceChildren(...opts.map(([v, t]) => h("option", { value: v, text: t }))); sel.value = opts.some(o => o[0] === val) ? val : ""; return sel.value; };
  function fillOptions() {
    const ps = people();
    const genres = [...new Set(ps.map(p => preferredGenre(p.id)).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    st.genre = setOptions(genreSel, [["", "Any genre"], ...genres.map(g => [g, g])], st.genre);
    const years = [...new Set(ps.map(p => new Date(p.created_at).getFullYear()))].sort((a, b) => b - a);
    st.y = setOptions(ySel, [["", "Year"], ...years.map(y => [String(y), String(y)])], st.y);
  }

  function tile(p, inRel, rel) {
    const all = lttOf(p.id), shown = (rel ? all.filter(inRel) : all).sort((a, b) => (alb(a.album_id).year || 0) - (alb(b.album_id).year || 0));
    const genre = preferredGenre(p.id), f = friendshipWith(p.id), friend = f?.status === "accepted";
    const action = friend ? btn("Open profile", () => go("profile", p.id), "small") : friendButton(p.id, "small");
    const rangeText = st.from != null && st.to != null ? `${st.from} to ${st.to}` : st.from != null ? `${st.from} or later` : `${st.to} or earlier`;
    const opp = isOpposite(p.id), mineTop = topFamily(S.me), theirTop = topFamily(p.id);
    return h("article", { class: "person" + (opp ? " opposite" : "") },
      opp ? h("p", { class: "opp-tag", text: mineTop && theirTop && mineTop !== theirTop ? `You mostly collect ${familyName(mineTop)}. They mostly collect ${familyName(theirTop)}.` : "Your binders barely overlap." }) : null,
      h("div", { class: "person-top" }, avatarEl(p, "md"),
        h("div", { style: "min-width:0" }, h("button", { type: "button", class: "who-link", onclick: () => go("profile", p.id), text: p.username }),
          h("p", { class: "muted small", text: `Joined ${fmtDate(p.created_at)}` })),
        friend ? h("span", { class: "pill", text: "Friends" }) : null),
      h("div", { class: "person-tags" }, genre ? h("span", { class: "genre", text: genre }) : null, h("span", { class: "muted small", text: plural(cardsOf(p.id).length, "card") })),
      shown.length ? h("div", { class: "person-ltt" },
        h("p", { class: "small", style: "font-weight:700;margin-bottom:6px", text: rel ? `Up for trade, released ${rangeText}` : `Up for trade (${all.length})` }),
        h("ul", { class: "minis" }, shown.slice(0, 3).map(c => h("li", {}, miniCard(c.id, { year: true, ask: true })))),
        shown.length > 3 ? h("p", { class: "muted small", style: "margin-top:6px", text: `and ${shown.length - 3} more on their profile` }) : null)
        : h("p", { class: "muted small", text: "Not looking to trade anything right now." }),
      h("div", { class: "row" }, action));
  }
  function render() {
    const rel = st.from != null || st.to != null;
    const inRel = c => { const y = alb(c.album_id).year; return !!y && (st.from == null || y >= st.from) && (st.to == null || y <= st.to); };
    let list = people().filter(p => {
      if (st.q && !p.username.toLowerCase().includes(st.q)) return false;
      if (st.genre && preferredGenre(p.id) !== st.genre) return false;
      const ltt = lttOf(p.id);
      if (st.trading && !ltt.length) return false;
      if (rel && !ltt.some(inRel)) return false;
      if (st.fresh && friendshipWith(p.id)?.status === "accepted") return false;
      const j = new Date(p.created_at);
      if (st.y && j.getFullYear() !== +st.y) return false;
      if (st.m !== "" && j.getMonth() !== +st.m) return false;
      if (st.d && j.getDate() !== +st.d) return false;
      return true;
    });
    const joined = p => new Date(p.created_at).getTime();
    list.sort(st.sort === "old" ? (a, b) => joined(a) - joined(b) : st.sort === "trade" ? (a, b) => lttOf(b.id).length - lttOf(a.id).length || a.username.localeCompare(b.username)
      : st.sort === "az" ? (a, b) => a.username.localeCompare(b.username) : (a, b) => joined(b) - joined(a));
    const active = [st.q, st.genre, st.trading, st.fresh, st.y, st.m !== "", st.d, rel].filter(Boolean).length;
    summary.textContent = active ? `Filters (${active} on)` : "Filters";
    const total = people().length;
    // Opposite taste gets its own section, in the same order; everyone else is below it, a page at a time.
    const opp = list.filter(p => isOpposite(p.id)), rest = list.filter(p => !isOpposite(p.id));
    const n = rest.length, shown = Math.min(st.shown, n);
    countEl.textContent = !list.length ? (active ? `Nobody out of ${total}` : "Nobody yet") : `${list.length} ${list.length === 1 ? "person" : "people"}${active ? `, filtered from ${total}` : ""}`;
    oppSec.hidden = !opp.length; results.classList.toggle("split", !!opp.length);
    oppCount.textContent = `(${opp.length})`;
    oppGrid.replaceChildren(...opp.map(p => tile(p, inRel, rel)));
    restTitle.textContent = opp.length ? "Everyone else" : "Everyone";
    restCount.textContent = n ? (n > shown ? `(showing ${shown} of ${n})` : `(${n})`) : "";
    grid.replaceChildren(...rest.slice(0, shown).map(p => tile(p, inRel, rel)));
    if (!total) grid.append(h("div", { class: "empty", style: "grid-column:1/-1" }, h("p", { text: "Nobody else has joined yet. Send your friends the link." })));
    else if (!list.length) grid.append(h("div", { class: "empty", style: "grid-column:1/-1" }, h("p", { text: "Nobody matches these filters." }), btn("Clear filters", () => clear.click(), "small")));
    else if (!n) grid.append(h("p", { class: "muted small", text: "Everyone who matches has the opposite taste to you." }));
    more.replaceChildren();
    if (n > shown) more.append(btn(`Load ${Math.min(PAGE_SIZE, n - shown)} more`, () => {
      const first = st.shown; st.shown += PAGE_SIZE; render();
      grid.querySelectorAll(".person")[first]?.querySelector(".who-link")?.focus({ preventScroll: true });
    }));
    else if (n > PAGE_SIZE) more.append(h("p", { class: "muted small", text: "That's everyone." }));
  }
  main.append(h("div", { class: "wrap" },
    h("div", { class: "view-head" }, h("div", {}, h("h1", { text: "Marketplace" }),
      h("p", { class: "muted", text: "Find your friends, or make new ones!" }))),
    h("div", { class: "market" }, headRow, filters, results)));
  fillOptions(); render();
  return { update() { fillOptions(); render(); } };
}

/* =====================================================================
   Messages (friends only)
===================================================================== */
function viewMessages(main, otherId) {
  if (otherId === S.me) otherId = null;
  const wrapEl = h("div", { class: "chat-wrap" + (otherId ? " has-chat" : "") });
  const list = h("nav", { class: "convos", "aria-label": "Conversations" }), pane = h("section", { class: "chat-pane", "aria-label": "Conversation" });
  let msgBox = null, lastKey = "", first = true;
  const thread = () => S.messages.filter(m => (m.sender === S.me && m.recipient === otherId) || (m.sender === otherId && m.recipient === S.me));
  function convos() {
    const m = new Map();
    for (const x of S.messages) {
      const o = x.sender === S.me ? x.recipient : x.sender;
      const e = m.get(o) || { id: o, at: 0, preview: "", unread: false };
      if (new Date(x.created_at) >= e.at) { e.at = new Date(x.created_at); e.preview = (x.sender === S.me ? "You: " : "") + x.body; }
      if (x.recipient === S.me && !x.read_at) e.unread = true;
      m.set(o, e);
    }
    if (otherId && !m.has(otherId)) m.set(otherId, { id: otherId, at: new Date(), preview: "New conversation", unread: false });
    return [...m.values()].sort((a, b) => b.at - a.at);
  }
  function renderList() {
    const others = friendIds().map(id => S.profiles.get(id)).filter(Boolean).sort((a, b) => a.username.localeCompare(b.username));
    const picker = h("select", { "aria-label": "Message a friend", onchange: e => { if (e.target.value) go("messages", e.target.value); } }, h("option", { value: "" }, "Message a friend…"), others.map(p => h("option", { value: p.id, text: p.username })));
    const cs = convos();
    list.replaceChildren(picker, ...cs.map(c => { const p = S.profiles.get(c.id);
      return h("button", { type: "button", class: "convo", "aria-current": c.id === otherId ? "true" : null, onclick: () => go("messages", c.id) },
        avatarEl(p, "sm"), h("span", { style: "min-width:0" }, h("span", { class: "cn", text: p?.username || "A former member" }), h("span", { class: "cp", text: c.preview })),
        c.unread ? h("span", { class: "dot", "aria-label": "Unread" }) : h("span")); }));
    if (!cs.length) list.append(h("p", { class: "muted small", style: "padding:10px", text: "No conversations yet. Pick a friend above." }));
  }
  async function markRead() {
    const unread = thread().filter(m => m.recipient === S.me && !m.read_at); if (!unread.length) return;
    const now = new Date().toISOString(); unread.forEach(m => m.read_at = now); updateNav(); renderList();
    await sb.from("messages").update({ read_at: now }).eq("recipient", S.me).eq("sender", otherId).is("read_at", null);
  }
  function renderMsgs() {
    if (!msgBox) return;
    const all = thread(); const k = all.length + ":" + (all.length ? all[all.length - 1].id : "");
    if (k === lastKey) return; lastKey = k;
    const near = msgBox.scrollHeight - msgBox.scrollTop - msgBox.clientHeight < 120;
    msgBox.replaceChildren(...(all.length ? all.map(m => h("div", { class: "msg" + (m.sender === S.me ? " mine" : "") }, h("span", { class: "msg-text", text: m.body }), h("time", { class: "msg-time", datetime: m.created_at, text: clock(m.created_at) })))
      : [h("p", { class: "muted center", style: "margin:auto", text: `Say hi to ${nameOf(otherId)}. Ask what they've had on repeat.` })]));
    if (near || first) { msgBox.scrollTop = msgBox.scrollHeight; first = false; }
    markRead().catch(e => console.warn(e));
  }
  function renderPane() {
    if (!otherId) { pane.append(h("div", { class: "loading" }, h("p", { text: "Pick a conversation, or start one with a friend." }))); return; }
    const p = S.profiles.get(otherId), friend = isFriend(otherId);
    msgBox = h("div", { class: "msgs", role: "log", "aria-live": "polite", "aria-label": `Messages with ${nameOf(otherId)}` });
    const ta = h("textarea", { maxlength: "1000", placeholder: friend ? "Write a message" : "You can only message friends", disabled: !friend || null, "aria-label": "Message", onkeydown: e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } } });
    const sendB = btn("Send", () => send(), "primary", { disabled: !friend || null });
    async function send() {
      const body = ta.value.trim(); if (!body) return;
      ta.value = ""; sendB.disabled = true;
      const { data, error } = await sb.from("messages").insert({ recipient: otherId, body }).select().single();
      sendB.disabled = false; ta.focus();
      if (error) { ta.value = body; toast(msgOf(error), "error"); return; }
      if (!S.messages.some(m => m.id === data.id)) S.messages.push(data);
      renderMsgs(); renderList();
    }
    pane.append(
      h("div", { class: "chat-head" }, btn("Back", () => go("messages"), "small ghost back-btn"), avatarEl(p, "sm"),
        h("div", { class: "who" }, p ? h("button", { type: "button", class: "who-link", onclick: () => go("profile", otherId), text: p.username }) : h("span", { text: "A former member" })),
        friend ? btn("Propose a trade", () => openTradeBuilder(otherId), "small") : null),
      msgBox, h("div", { class: "composer" }, ta, sendB));
    renderMsgs();
  }
  main.append(h("div", { class: "wrap", style: "padding-bottom:20px" }, h("h1", { class: "sr", text: "Messages" }), wrapEl));
  wrapEl.append(list, pane); renderList(); renderPane();
  return { update() { renderList(); renderMsgs(); } };
}

/* =====================================================================
   Home: this week on Basement Club, your friends, and what to rate next
===================================================================== */
// Keep keyboard focus on the same control when a section redraws.
function keepFocus(root, draw) {
  const fid = document.activeElement?.closest?.("[data-fid]")?.dataset.fid;
  draw();
  if (fid) root.querySelector(`[data-fid="${CSS.escape(fid)}"]`)?.focus({ preventScroll: true });
}
// Cards you got in a trade get marked as listened once you've played that album (or logged a song by that artist since).
let syncing = false;
async function syncListened() {
  if (syncing || !S.me) return;
  const waiting = cardsOf(S.me).filter(c => isRecentTrade(c) && !c.listened_at);
  if (!waiting.length) return;
  syncing = true;
  try {
    const played = new Set();
    try { for (const t of await MUSIC.recentPlays()) if (t.albumId) played.add(t.albumId); } catch (e) { /* not connected yet */ }
    const mine = logsOf(S.me);
    const hits = waiting.filter(c => played.has(c.album_id) || mine.some(l => new Date(l.created_at) >= new Date(c.acquired_at) && normText(l.artist) === normText(alb(c.album_id).artist)));
    for (const c of hits) await sb.rpc("mark_listened", { card: c.id, listened: true });
    if (hits.length) {
      await loadAll(); refresh();
      toast(hits.length === 1 ? `You've played ${alb(hits[0].album_id).title}, so it's marked as listened to.` : `${hits.length} of your new cards are now marked as listened to.`);
    }
  } finally { syncing = false; }
}

/* ---------- asking you to rate what you've been playing ---------- */
const ASK_KEY = "basement-club-asked";
const askedToday = () => { try { return localStorage.getItem(ASK_KEY + ":" + S.me) === new Date().toDateString(); } catch { return true; } };
const markAsked = () => { try { localStorage.setItem(ASK_KEY + ":" + S.me, new Date().toDateString()); } catch { } };
let suggestCache = null;
async function listeningSuggestions() {
  if (!suggestCache || suggestCache.user !== S.me) {
    const out = { user: S.me, albums: [], songs: [] };
    try { out.albums = await MUSIC.recentAlbums(); } catch (e) { /* not connected yet */ }
    try { out.songs = await MUSIC.recentTracks(); } catch (e) { /* not connected yet */ }
    suggestCache = out;
  }
  const owned = new Set(cardsOf(S.me).map(c => c.album_id));
  const logged = new Set(logsOf(S.me).map(l => normText(l.title) + "|" + normText(l.artist)));
  return {
    albums: suggestCache.albums.filter(x => !owned.has(x.album.id)).slice(0, 4),
    songs: suggestCache.songs.filter(t => !logged.has(normText(t.name) + "|" + normText(t.artist))).slice(0, 4)
  };
}
function rateBlock(sug, before = () => { }) {
  const svc = SERVICES[me()?.service]?.[0] || "your music service";
  const albumRow = ({ album, plays }) => h("li", { class: "ask-row" }, coverEl(album, "ask-cov"),
    h("span", { class: "ask-txt" }, h("span", { class: "ask-t", text: album.title }), h("span", { class: "ask-a", text: `${album.artist}${plays ? `, ${plural(plays, "play")} lately` : ""}` })),
    btn("Rate it", () => { before(); go("make", { preselect: [album] }); }, "small", { "data-fid": "rate-" + album.id }));
  const songRow = t => h("li", { class: "ask-row" }, h("span", { class: "ask-cov", "aria-hidden": "true", html: coverSVG({ id: t.albumId, genre: t.genre || "" }) }),
    h("span", { class: "ask-txt" }, h("span", { class: "ask-t", text: t.name }), h("span", { class: "ask-a", text: t.artist })),
    btn("Log it", () => { before(); openSongLog(null, { title: t.name, artist: t.artist }); }, "small", { "data-fid": "log-" + t.id }));
  return h("div", { class: "ask-cols" },
    sug.albums.length ? h("div", {}, h("h3", { text: `Albums you've played on ${svc}` }), h("ul", { class: "ask-list" }, sug.albums.map(albumRow)),
      sug.albums.length > 1 ? btn(`Rate all ${sug.albums.length}`, () => { before(); go("make", { preselect: sug.albums.map(x => x.album) }); }, "small primary", { style: "margin-top:10px" }) : null) : null,
    sug.songs.length ? h("div", {}, h("h3", { text: "Songs you've had on" }), h("ul", { class: "ask-list" }, sug.songs.map(songRow))) : null);
}
async function maybeAskToRate() {
  if (askedToday()) return;
  const sug = await listeningSuggestions();
  if (current.name !== "home" || document.querySelector("dialog[open]") || (!sug.albums.length && !sug.songs.length)) return;
  markAsked();
  const svc = SERVICES[me()?.service]?.[0] || "your music service";
  const dlg = modal({ title: "Rate what you've been playing?", wide: true,
    body: h("div", {}, h("p", { class: "muted", style: "margin-bottom:16px;max-width:60ch", text: `These turned up in your recent listening on ${svc} and aren't in your binder or song log yet. Make a card for an album, or log a song with a few thoughts.` }),
      rateBlock(sug, () => dlg.close())),
    foot: [h("span", { class: "muted small", style: "margin-right:auto", text: "This asks once a day. They also stay on your home page." }), btn("Not now", () => dlg.close())] });
}

/* ---------- an album, with everyone who has a card for it ---------- */
function openAlbum(albumId) {
  const al = alb(albumId), holders = S.cards.filter(c => c.album_id === albumId).sort((a, b) => b.points - a.points);
  const mine = holders.find(c => c.owner === S.me);
  const avg = holders.length ? holders.reduce((n, c) => n + c.points, 0) / holders.length : null;
  const sp = safeHttp(al.spotify_url);
  const dlg = modal({ title: al.title, wide: true, body: h("div", { class: "album-detail" },
    coverEl(al, "album-cover"),
    h("div", { style: "min-width:0" },
      h("p", { style: "font-size:18px;font-weight:700", text: al.artist }),
      h("p", { class: "muted", text: [al.year, al.genre].filter(Boolean).join(", ") }),
      al.underground ? h("p", { class: "ug-tag", style: "margin-top:8px", text: "Underground" }) : null,
      al.description ? h("p", { class: "muted", style: "margin-top:12px;max-width:56ch", text: al.description }) : null,
      sp ? h("p", { style: "margin-top:12px" }, h("a", { class: "sp-link", href: sp, target: "_blank", rel: "noopener", text: "Listen on Spotify" })) : null,
      h("h3", { style: "margin:20px 0 8px", text: holders.length ? `${plural(holders.length, "person")} ${holders.length === 1 ? "has" : "have"} a card${avg != null ? `, average taste ${starShort(avg)}` : ""}` : "Nobody has a card for it yet" }),
      h("ul", { class: "holders" }, holders.map(c => {
        const p = S.profiles.get(c.owner), [tk, tn] = tierOf(c.points);
        return h("li", {}, h("button", { type: "button", class: "holder", onclick: () => { dlg.close(); openCardDetail(c, { ownerId: c.owner }); } },
          avatarEl(p, "sm"),
          h("span", { class: "ask-txt" }, h("span", { class: "ask-t", text: c.owner === S.me ? "You" : p?.username || "A former member" }),
            h("span", { class: "ask-a", text: c.note ? `“${c.note}”` : tn })),
          h("span", { class: "pts " + tk, "aria-label": `taste ${starWord(starsOf(c.points))}`, text: starShort(c.points) })));
      })))),
    foot: [mine ? btn("Open your card", () => { dlg.close(); openCardDetail(mine); }) : btn("Make a card for it", () => { dlg.close(); go("make", { preselect: [al] }); }, "primary"), btn("Close", () => dlg.close())] });
}

/* ---------- the page ---------- */
function viewHome(main) {
  const root = h("div", { class: "wrap home" }); main.append(root);
  const st = { reviews: "all", shownReviews: 6, sug: null };
  let lastKey = "";
  const key = () => JSON.stringify([S.cards.map(c => c.id + c.owner + (c.note || "") + (c.listened_at || "")).join(), S.likes.length, S.logs.length, S.friendships.length, S.trades.length, S.profiles.size, st]);

  const since = Date.now() - 7 * DAY;
  const recentT = c => Math.max(new Date(c.created_at).getTime(), c.acquired_at ? new Date(c.acquired_at).getTime() : 0);
  function weekTop() {
    const m = new Map();
    for (const c of S.cards) {
      if (recentT(c) < since) continue;
      const e = m.get(c.album_id) || { id: c.album_id, n: 0, sum: 0, traded: 0 };
      e.n++; e.sum += c.points; if (c.acquired_at && new Date(c.acquired_at).getTime() >= since) e.traded++; m.set(c.album_id, e);
    }
    return [...m.values()].sort((a, b) => b.n - a.n || b.sum / b.n - a.sum / a.n).slice(0, 8);
  }
  const sec = (id, title, ...kids) => h("section", { class: "home-sec", "aria-labelledby": id }, h("h2", { id, text: title }), ...kids);

  function topSec() {
    const top = weekTop();
    return sec("h-top", "Top albums this week",
      h("p", { class: "muted small sec-sub", text: "The albums members made the most cards for, or traded for, in the last 7 days." }),
      top.length ? h("ol", { class: "top-list" }, top.map((e, i) => {
        const al = alb(e.id), avg = e.sum / e.n;
        return h("li", {}, h("button", { type: "button", class: "top-row", "data-fid": "top-" + e.id, onclick: () => openAlbum(e.id) },
          h("span", { class: "top-n", "aria-hidden": "true", text: i + 1 }), coverEl(al, "top-cov"),
          h("span", { class: "ask-txt" }, h("span", { class: "ask-t", text: al.title }), h("span", { class: "ask-a", text: al.artist })),
          h("span", { class: "top-meta" }, h("b", { text: plural(e.n, "card") }), h("small", { text: `${e.traded ? `${e.traded} by trade, ` : ""}avg ${starShort(avg)}` }))));
      })) : h("p", { class: "empty", text: "Quiet week. Nobody has made or traded a card in the last 7 days." }));
  }

  function reviewsSec() {
    const albums = S.cards.filter(c => c.note).map(c => ({ kind: "album", at: c.note_at || c.created_at, c }));
    const songs = S.logs.filter(l => l.note).map(l => ({ kind: "song", at: l.created_at, l }));
    const newest = list => list.sort((a, b) => new Date(b.at) - new Date(a.at));
    newest(albums); newest(songs);
    // "All" alternates album and song reviews, newest first in each, so one kind doesn't bury the other.
    const mixed = []; for (let i = 0; i < Math.max(albums.length, songs.length); i++) { if (albums[i]) mixed.push(albums[i]); if (songs[i]) mixed.push(songs[i]); }
    const all = st.reviews === "albums" ? albums : st.reviews === "songs" ? songs : mixed;
    const seg = (v, label) => h("button", { type: "button", class: "seg", "aria-pressed": String(st.reviews === v), "data-fid": "rv-" + v, onclick: () => { st.reviews = v; st.shownReviews = 6; render(); } }, label);
    const who = id => id === S.me ? h("strong", { text: "You" }) : h("button", { type: "button", class: "who-link", onclick: () => go("profile", id), text: nameOf(id) });
    const item = r => {
      if (r.kind === "album") {
        const c = r.c, al = alb(c.album_id), [tk] = tierOf(c.points);
        return h("article", { class: "review" },
          h("button", { type: "button", class: "rv-cov", "aria-label": `Open ${nameOf(c.owner)}'s card for ${al.title}`, onclick: () => openCardDetail(c, { ownerId: c.owner }) }, coverEl(al, "")),
          h("div", { class: "rv-body" },
            h("p", { class: "rv-head" }, who(c.owner), " on ", h("strong", { text: al.title }), ` by ${al.artist} `, h("span", { class: "pts " + tk, "aria-label": `rated ${starWord(starsOf(c.points))}`, text: starShort(c.points) })),
            h("p", { class: "rv-text", text: `“${c.note}”` }),
            h("div", { class: "rv-foot" }, h("span", { class: "rv-kind", text: "Album" }), h("span", { class: "muted small", text: relTime(r.at) }),
              likeButton(c))));
      }
      const l = r.l;
      return h("article", { class: "review" },
        h("span", { class: "rv-cov", "aria-hidden": "true", html: coverSVG({ id: "song:" + normText(l.title + " " + l.artist), genre: l.artist }) }),
        h("div", { class: "rv-body" },
          h("p", { class: "rv-head" }, who(l.owner), " on ", h("strong", { text: l.title }), ` by ${l.artist}`),
          h("p", { class: "rv-text", text: `“${l.note}”` }),
          h("div", { class: "rv-foot" }, h("span", { class: "rv-kind song", text: "Song" }), h("span", { class: "muted small", text: relTime(r.at) }))));
    };
    return sec("h-rev", "Recent reviews",
      h("div", { class: "segs small-segs", role: "group", "aria-label": "Show reviews of" }, seg("all", "All"), seg("albums", "Albums"), seg("songs", "Songs")),
      all.length ? h("div", { class: "reviews" }, all.slice(0, st.shownReviews).map(item)) : h("p", { class: "empty", text: "No reviews yet." }),
      all.length > st.shownReviews ? btn("Show more", () => { st.shownReviews += 6; render(); }, "small", { "data-fid": "rv-more" }) : null);
  }

  function undergroundSec() {
    const ug = [...S.albums.values()].filter(a => a.underground);
    const held = ug.map(a => { const cs = S.cards.filter(c => c.album_id === a.id); return { a, n: new Set(cs.map(c => c.owner)).size, avg: cs.length ? cs.reduce((x, c) => x + c.points, 0) / cs.length : 0 }; })
      .filter(x => x.n).sort((x, y) => y.n - x.n || y.avg - x.avg).slice(0, 8);
    const ugArtists = new Set(ug.map(a => normText(a.artist)));
    const seen = new Set(), songs = [];
    for (const l of S.logs) { const k = normText(l.title) + "|" + normText(l.artist); if (ugArtists.has(normText(l.artist)) && !seen.has(k)) { seen.add(k); songs.push(l); } }
    return sec("h-ug", "Underground",
      h("p", { class: "muted small sec-sub", text: DEMO
        ? "Independent and self-released records that never charted on Billboard. In the preview these are hand-picked from the sample albums."
        : "Independent and self-released records that never charted on Billboard." }),
      held.length ? h("div", { class: "ug-grid" }, held.map(({ a, n, avg }) => h("button", { type: "button", class: "ug-tile", "data-fid": "ug-" + a.id, onclick: () => openAlbum(a.id) },
        coverEl(a, "ug-cov"), h("span", { class: "ask-t", text: a.title }), h("span", { class: "ask-a", text: a.artist }),
        h("span", { class: "ug-meta", text: `${plural(n, "collector")}, avg ${starShort(avg)}` })))) : h("p", { class: "empty", text: "No underground albums in anyone's binder yet." }),
      songs.length ? h("div", { style: "margin-top:16px" }, h("h3", { class: "mini-h", text: "Underground songs members logged" }),
        h("ul", { class: "ask-list" }, songs.slice(0, 6).map(l => h("li", { class: "ask-row" },
          h("span", { class: "ask-cov", "aria-hidden": "true", html: coverSVG({ id: "song:" + normText(l.title + " " + l.artist), genre: l.artist }) }),
          h("span", { class: "ask-txt" }, h("span", { class: "ask-t", text: l.title }), h("span", { class: "ask-a", text: l.artist })),
          h("span", { class: "muted small", text: l.owner === S.me ? "you" : nameOf(l.owner) }))))) : null);
  }

  function friendsSec() {
    const ids = friendIds(), inc = requestsIn();
    const list = ids.map(id => S.profiles.get(id)).filter(Boolean)
      .map(p => ({ p, fresh: cardsOf(p.id).filter(c => recentT(c) >= since).length })).sort((a, b) => b.fresh - a.fresh || a.p.username.localeCompare(b.p.username));
    return sec("h-fr", "Friends",
      inc.length ? h("p", { class: "warn", style: "margin-bottom:12px" }, `${inc.map(f => nameOf(f.requester)).join(", ")} ${inc.length === 1 ? "wants" : "want"} to be friends. `,
        h("button", { type: "button", class: "linkish", onclick: () => go("friends"), text: "Answer" })) : null,
      list.length ? h("ul", { class: "friend-list" }, list.slice(0, 6).map(({ p, fresh }) => h("li", {},
        h("button", { type: "button", class: "friend-row", "data-fid": "fr-" + p.id, onclick: () => go("profile", p.id) }, avatarEl(p, "sm"),
          h("span", { class: "ask-txt" }, h("span", { class: "ask-t", text: p.username }), h("span", { class: "ask-a", text: fresh ? `${plural(fresh, "new card")} this week` : `${plural(cardsOf(p.id).length, "card")}${preferredGenre(p.id) ? `, mostly ${preferredGenre(p.id)}` : ""}` })))))) :
        h("p", { class: "muted small", text: "No friends yet. Find people in the Marketplace." }),
      h("div", { class: "row", style: "margin-top:12px" }, list.length > 6 ? btn(`All ${list.length} friends`, () => go("friends"), "small") : list.length ? btn("Friends", () => go("friends"), "small") : null,
        btn("Marketplace", () => go("market"), "small ghost")));
  }

  function listeningSec() {
    const fr = new Set(friendIds());
    const items = S.logs.filter(l => fr.has(l.owner)).map(l => ({ at: l.created_at, kind: "song", l }))
      .concat(S.cards.filter(c => fr.has(c.owner) && ageDays(c.created_at) < RECENT_DAYS && c.made_by === c.owner).map(c => ({ at: c.created_at, kind: "card", c })))
      .sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 8);
    return sec("h-ls", "What your friends are listening to",
      items.length ? h("ul", { class: "feed" }, items.map(it => {
        const owner = it.kind === "song" ? it.l.owner : it.c.owner, p = S.profiles.get(owner);
        const who = h("button", { type: "button", class: "who-link", onclick: () => go("profile", owner), text: p?.username || "A friend" });
        const line = it.kind === "song"
          ? h("p", {}, who, " logged ", h("strong", { text: it.l.title }), ` by ${it.l.artist}`)
          : h("p", {}, who, " made a card for ", h("button", { type: "button", class: "linkish strong", onclick: () => openCardDetail(it.c, { ownerId: owner }), text: alb(it.c.album_id).title }), ` (${starShort(it.c.points)})`);
        return h("li", { class: "feed-row" }, avatarEl(p, "sm"), h("div", { style: "min-width:0" }, line,
          it.kind === "song" && it.l.note ? h("p", { class: "feed-note", text: it.l.note }) : null,
          h("p", { class: "muted small", text: relTime(it.at) })));
      })) : h("p", { class: "muted small", text: fr.size ? "Your friends haven't logged any songs yet." : "Add friends to see what they're playing." }));
  }

  function statsSec() {
    const mine = cardsOf(S.me), avg = mine.length ? mine.reduce((n, c) => n + c.points, 0) / mine.length : 0;
    const myTrades = S.trades.filter(t => t.status === "completed" && (t.from_user === S.me || t.to_user === S.me)).length;
    const likes = mine.reduce((n, c) => n + likesOn(c.id).length, 0);
    const ugShare = mine.length ? Math.round(mine.filter(c => alb(c.album_id).underground).length / mine.length * 100) : 0;
    const panned = mine.filter(c => c.points < LIKED_FROM).length;
    const top = mine.length ? tierOf(Math.max(...mine.map(c => c.points)))[1] : "–";
    const weekCards = S.cards.filter(c => new Date(c.created_at).getTime() >= since).length;
    const weekTrades = S.trades.filter(t => t.status === "completed" && new Date(t.updated_at).getTime() >= since).length;
    const weekReviews = S.cards.filter(c => c.note && new Date(c.note_at || c.created_at).getTime() >= since).length + S.logs.filter(l => l.note && new Date(l.created_at).getTime() >= since).length;
    const tile = (n, label, wide) => h("div", { class: "stat" + (wide ? " wide" : "") }, h("b", { text: n }), h("span", { text: label }));
    return sec("h-st", "Statistics",
      h("h3", { class: "mini-h", text: "You" }),
      h("div", { class: "stats" }, tile(mine.length, mine.length === 1 ? "card" : "cards"), tile(mine.length ? starShort(avg) : "–", "average taste"), tile(myTrades, myTrades === 1 ? "trade done" : "trades done"),
        tile(likes, likes === 1 ? "like on your reviews" : "likes on your reviews"), tile(logsOf(S.me).length, "songs logged"), tile(ugShare + "%", "underground"),
        tile(panned, panned === 1 ? "card you didn't like" : "cards you didn't like"), tile(top, "highest tier in your binder")),
      h("h3", { class: "mini-h", style: "margin-top:16px", text: "The club, last 7 days" }),
      h("div", { class: "stats" }, tile(weekCards, "new cards"), tile(weekTrades, weekTrades === 1 ? "trade" : "trades"), tile(weekReviews, "reviews"), tile(S.profiles.size, "members")));
  }

  function askSec() {
    if (!st.sug || (!st.sug.albums.length && !st.sug.songs.length)) return null;
    return h("section", { class: "home-sec ask-sec", "aria-labelledby": "h-ask" },
      h("h2", { id: "h-ask", text: "Rate what you've been playing" }),
      h("p", { class: "muted small sec-sub", text: "From your recent listening, not in your binder or song log yet." }),
      rateBlock(st.sug));
  }

  let render = function () {
    lastKey = key();
    const p = me();
    keepFocus(root, () => root.replaceChildren(...[
      h("header", { class: "home-hero" }, h("h1", { class: "sr", text: "Basement Club home" }), h("img", { class: "home-logo", src: "logo.png", alt: "Basement Club" }),
        h("p", { class: "muted", text: `Welcome back, ${p?.username || "friend"}.` }),
        h("div", { class: "row", style: "justify-content:center" }, btn("Make new cards", () => go("make"), "primary"), btn("My profile", () => go("profile")))),
      askSec(),
      h("div", { class: "home-grid" },
        h("div", { class: "home-col" }, topSec(), reviewsSec(), undergroundSec()),
        h("div", { class: "home-col" }, friendsSec(), listeningSec(), statsSec()))].filter(Boolean)));
  };
  // Each section's shine slides across as it moves up the screen, like tilting a holographic card.
  let sheenFrame = 0;
  function paintSheen() {
    sheenFrame = 0;
    const H = innerHeight;
    for (const el of root.querySelectorAll(".home-sec")) {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--sheen", clamp(1 - r.bottom / (H + r.height), 0, 1).toFixed(3));
    }
  }
  const onScroll = () => { if (!sheenFrame) sheenFrame = requestAnimationFrame(paintSheen); };
  addEventListener("scroll", onScroll, { passive: true }); addEventListener("resize", onScroll, { passive: true });
  const draw = render;
  render = () => { draw(); paintSheen(); };
  render();
  listeningSuggestions().then(sug => { st.sug = sug; if (current.name === "home") render(); });
  setTimeout(() => { if (current.name === "home") maybeAskToRate(); }, 900);
  return { cleanup() { removeEventListener("scroll", onScroll); removeEventListener("resize", onScroll); cancelAnimationFrame(sheenFrame); }, update() {
    if (st.sug) listeningSuggestions().then(sug => { st.sug = sug; if (key() !== lastKey && current.name === "home") render(); });
    if (key() !== lastKey) render();
  } };
}

const VIEWS = { home: viewHome, setup: viewSetup, loading: viewLoading, auth: viewAuth, onboard: viewOnboard, make: viewMake, profile: viewProfile, market: viewMarket, friends: viewFriends, trades: viewTrades, messages: viewMessages };

/* =====================================================================
   Start up
===================================================================== */
function demoBar() {
  const n = $("#notice");
  if (!DEMO) { n.replaceChildren(); return; }
  n.replaceChildren(h("div", { class: "demo-bar" },
    h("span", { text: "Preview mode: sample friends and listening, saved only in this browser." }),
    h("button", { type: "button", onclick: async () => { demo.reset(); resetState(); await boot(); toast("Preview reset to the starting sample data."); } }, "Start over")));
}
let signInProblem = "", authUser = null;
function signInMessage(raw) {
  const t = String(raw).replace(/\+/g, " ");
  if (/access.?denied|cancel/i.test(t)) return "Spotify sign-in was cancelled.";
  return "Spotify sign-in didn't work: " + t;
}
async function boot() {
  if (!sb) {
    if (DEMO) { demo = await import("./demo.js"); sb = demo.createDemoClient(); }
    else if (!configured) { go("setup"); return; }
    else {
      const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/+esm");
      sb = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } });
    }
    sb.auth.onAuthStateChange(evt => { if (evt === "SIGNED_OUT") S.me = null; });
  }
  demoBar();
  go("loading");
  // Coming back from Spotify's sign-in page: finish signing in, then tidy the address bar.
  const back = new URLSearchParams(location.search);
  if (!DEMO && back.has("state") && (back.has("code") || back.has("error"))) {
    history.replaceState(null, "", location.pathname);
    let saved = null;
    try { saved = JSON.parse(sessionStorage.getItem(SIGNIN_KEY) || "null"); sessionStorage.removeItem(SIGNIN_KEY); } catch { }
    if (back.get("error")) signInProblem = signInMessage(back.get("error"));
    else if (!saved || saved.state !== back.get("state")) signInProblem = "That sign-in didn't start on this page, so it was stopped. Try again.";
    else {
      try {
        const t = await spotifyFn("login", { code: back.get("code"), redirect_uri: spotifyRedirect(), code_verifier: saved.verifier });
        const { error } = await sb.auth.setSession({ access_token: t.access_token, refresh_token: t.refresh_token });
        if (error) throw err("Signing in didn't finish: " + error.message);
      } catch (e) { signInProblem = msgOf(e); }
    }
  }
  const { data: { session } } = await sb.auth.getSession();
  if (!session) { S.me = null; go("auth"); return; }
  S.me = session.user.id; authUser = session.user;
  try { await loadAll(); }
  catch (e) {
    console.warn(e);
    $("#main").replaceChildren(h("div", { class: "wrap" }, h("div", { class: "empty" }, h("p", { text: "Couldn't load Basement Club. Reload the page to try again." }),
      h("p", { class: "muted small", style: "margin-top:8px", text: `Details: ${e?.message || e}${e?.code ? ` (${e.code})` : ""}` }))));
    return;
  }
  subscribeLive();
  if (me()?.site_theme || me()?.card_size) { const p = { theme: me().site_theme || currentPrefs().theme, size: me().card_size || currentPrefs().size }; applyPrefs(p); rememberPrefs(p); }
  if (!me()) { go("onboard"); return; }
  if (!cardsOf(S.me).length && !myLinks().length) { go("make", { onboarding: true }); return; }
  go("home");
  syncListened();
}
boot();
