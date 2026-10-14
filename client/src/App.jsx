
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ArrowDownRight, ArrowUpRight, BarChart3, Check, ChevronRight, CircleHelp, Copy, ExternalLink, Link2, LoaderCircle, MousePointer2, Plus, Search, ShieldCheck, Sparkles, Trash2, Zap } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const shortUrl = (code) => `${API}/${code}`;
const formatDate = (date) => new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date));
const host = (value) => { try { return new URL(value).hostname.replace(/^www\./, ''); } catch { return value; } };

export default function App() {
  const [urls, setUrls] = useState([]);
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [copied, setCopied] = useState('');

  const loadUrls = useCallback(async () => {
    try {
      const response = await fetch(`${API}/api/urls`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not load links.');
      setUrls(data.urls || []);
      setError('');
    } catch (err) {
      setError(`${err.message} Make sure the API and MongoDB are running.`);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadUrls(); }, [loadUrls]);

  const totalClicks = useMemo(() => urls.reduce((sum, item) => sum + (item.clicks || 0), 0), [urls]);
  const filtered = useMemo(() => urls.filter((item) => `${item.originalUrl} ${item.shortCode}`.toLowerCase().includes(search.toLowerCase())), [urls, search]);

  async function createLink(event) {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    try {
      const response = await fetch(`${API}/api/urls`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalUrl: originalUrl.trim(), customAlias: customAlias.trim() })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not create your link.');
      setUrls((current) => [data.url, ...current.filter((item) => item._id !== data.url._id)]);
      setOriginalUrl(''); setCustomAlias(''); setNotice('Your short link is ready to share.');
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  async function copyLink(code) {
    try {
      await navigator.clipboard.writeText(shortUrl(code));
      setCopied(code); setTimeout(() => setCopied(''), 1800);
    } catch { setError('Clipboard access was blocked. Copy the short link manually.'); }
  }

  async function deleteLink(id) {
    if (!window.confirm('Delete this short link? This cannot be undone.')) return;
    try {
      const response = await fetch(`${API}/api/urls/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not delete link.');
      setUrls((current) => current.filter((item) => item._id !== id));
      setNotice('Link deleted.');
    } catch (err) { setError(err.message); }
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#top" aria-label="QuickLink home"><span className="brand-icon"><Link2 size={21}/></span><span>quicklink<span className="brand-dot">.</span></span></a>
      <div className="workspace-label">WORKSPACE</div>
      <a className="nav-item active" href="#dashboard"><BarChart3 size={18}/> Overview</a>
      <a className="nav-item" href="#links"><Link2 size={18}/> My links <span className="nav-count">{urls.length}</span></a>
      <div className="sidebar-bottom"><div className="help-card"><span className="help-icon"><CircleHelp size={17}/></span><strong>Need a hand?</strong><p>Make your links work harder. Create, share, and track in one place.</p><a href="#how-it-works">How it works <ChevronRight size={14}/></a></div><div className="profile"><div className="avatar">Q</div><div className="profile-copy"><strong>QuickLink</strong><span>Personal workspace</span></div><span className="online-dot"/></div></div>
    </aside>

    <main className="main-content" id="top">
      <header className="topbar"><div className="breadcrumb">Workspace <ChevronRight size={14}/> <strong>Overview</strong></div><div className="topbar-right"><span className="status-dot"/> All systems operational <span className="topbar-divider"/><span className="topbar-date">{new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date())}</span></div></header>
      <section className="page-heading" id="dashboard"><div><div className="eyebrow"><Sparkles size={13}/> YOUR LINK HUB</div><h1>Make every link <span>count.</span></h1><p className="subtitle">Shorten long URLs, share them anywhere, and keep an eye on every click.</p></div><div className="heading-mark"><div className="mark-circle mark-circle-one"/><div className="mark-circle mark-circle-two"/><Link2 size={25}/></div></section>

      <section className="stats-grid" aria-label="Link statistics">
        <article className="stat-card"><div className="stat-top"><span>Total links</span><span className="stat-icon purple"><Link2 size={17}/></span></div><div className="stat-value">{urls.length.toLocaleString()}</div><div className="stat-foot"><span className="neutral-pill">All time</span><span>Links created</span></div></article>
        <article className="stat-card"><div className="stat-top"><span>Total clicks</span><span className="stat-icon blue"><MousePointer2 size={17}/></span></div><div className="stat-value">{totalClicks.toLocaleString()}</div><div className="stat-foot"><span className="neutral-pill"><ArrowUpRight size={12}/> Live count</span><span>Across all links</span></div></article>
        <article className="stat-card"><div className="stat-top"><span>Avg. clicks / link</span><span className="stat-icon orange"><BarChart3 size={17}/></span></div><div className="stat-value">{urls.length ? (totalClicks / urls.length).toFixed(1) : '0.0'}</div><div className="stat-foot"><span className="neutral-pill">Average</span><span>Engagement snapshot</span></div></article>
      </section>

      <section className="create-card"><div className="create-intro"><div className="create-icon"><Zap size={20} fill="currentColor"/></div><div><h2>Shorten a new link</h2><p>Paste a long URL and get a clean, shareable link in seconds.</p></div></div>
        <form className="shorten-form" onSubmit={createLink}><label htmlFor="originalUrl">Destination URL</label><div className="url-input-wrap"><Link2 size={18}/><input id="originalUrl" type="url" placeholder="https://example.com/your/very/long/link..." value={originalUrl} onChange={(e) => setOriginalUrl(e.target.value)} required maxLength={2048}/><button className="shorten-button" type="submit" disabled={busy}>{busy ? <LoaderCircle className="spin" size={17}/> : <><span>Shorten link</span><ArrowUpRight size={16}/></>}</button></div><div className="form-bottom"><div className="alias-field"><label htmlFor="customAlias">Custom alias <span>(optional)</span></label><div className="alias-input-wrap"><span>{API.replace(/^https?:\/\//, '')}/</span><input id="customAlias" placeholder="my-link" value={customAlias} onChange={(e) => setCustomAlias(e.target.value)} maxLength={30}/></div></div><div className="secure-note"><ShieldCheck size={15}/> Your links are stored securely</div></div></form>
        {error && <div className="feedback error" role="alert">{error}</div>}{notice && !error && <div className="feedback success" role="status"><Check size={15}/>{notice}</div>}
      </section>

      <section className="links-section" id="links"><div className="section-heading"><div><h2>Your links <span className="count-badge">{urls.length}</span></h2><p>Manage and share your shortened URLs.</p></div><div className="search-wrap"><Search size={16}/><input aria-label="Search links" placeholder="Search links..." value={search} onChange={(e) => setSearch(e.target.value)}/></div></div>
        <div className="table-card"><div className="table-scroll"><table><thead><tr><th>DESTINATION</th><th>SHORT LINK</th><th>CLICKS</th><th>CREATED</th><th aria-label="Actions"/></tr></thead><tbody>
          {loading ? <tr><td colSpan="5" className="empty-state"><LoaderCircle className="spin" size={20}/> Loading your links...</td></tr> : filtered.length === 0 ? <tr><td colSpan="5" className="empty-state"><div className="empty-icon"><Link2 size={22}/></div><strong>{search ? 'No matching links' : 'Your next great link starts here'}</strong><span>{search ? 'Try a different search term.' : 'Create your first short link using the form above.'}</span></td></tr> : filtered.map((item) => <tr key={item._id}><td><div className="destination-cell"><div className="favicon">{host(item.originalUrl).slice(0, 1).toUpperCase()}</div><div className="destination-copy"><a href={item.originalUrl} target="_blank" rel="noreferrer" title={item.originalUrl}>{host(item.originalUrl)}</a><span title={item.originalUrl}>{item.originalUrl}</span></div></div></td><td><div className="short-cell"><a href={shortUrl(item.shortCode)} target="_blank" rel="noreferrer">{shortUrl(item.shortCode).replace(/^https?:\/\//, '')}</a><button className={`icon-button copy-button ${copied === item.shortCode ? 'copied' : ''}`} onClick={() => copyLink(item.shortCode)} aria-label="Copy short link" title="Copy short link">{copied === item.shortCode ? <Check size={15}/> : <Copy size={15}/>}</button><a className="icon-button open-button" href={shortUrl(item.shortCode)} target="_blank" rel="noreferrer" aria-label="Open short link" title="Open short link"><ExternalLink size={14}/></a></div></td><td><span className="click-count"><MousePointer2 size={13}/>{(item.clicks || 0).toLocaleString()}</span></td><td><span className="created-date">{formatDate(item.createdAt)}</span></td><td><button className="icon-button delete-button" onClick={() => deleteLink(item._id)} aria-label="Delete link" title="Delete link"><Trash2 size={15}/></button></td></tr>)}
        </tbody></table></div><div className="table-footer"><span>Showing <strong>{filtered.length}</strong> of <strong>{urls.length}</strong> links</span><button className="refresh-button" onClick={loadUrls}><ArrowUpRight size={14}/> Refresh data</button></div></div>
      </section>
      <section className="bottom-note" id="how-it-works"><div className="note-icon"><Plus size={17}/></div><div><strong>Simple links. Useful insights.</strong><p>Every click is counted when someone visits your short link. Keep sharing and watch your reach grow.</p></div><div className="note-decoration"><ArrowDownRight size={29}/></div></section>
      <footer>Made for sharing, built for simplicity. <span>QUICKLINK © {new Date().getFullYear()}</span></footer>
    </main>
  </div>;
}
