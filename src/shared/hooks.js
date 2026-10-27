import { useEffect, useMemo, useState } from 'react';
import { certifications, projects } from './content.js';

export function useProjectFilter() {
  const [filter, setFilter] = useState('all');
  const list = useMemo(() => (filter === 'all' ? projects : projects.filter((p) => p.category === filter)), [filter]);
  const available = useMemo(() => new Set(projects.map((p) => p.category)), []);
  return { filter, setFilter, list, available };
}

const TOP = 6;
const SEARCH_THRESHOLD = 8;

export function useCertList() {
  const [showAll, setShowAll] = useState(false);
  const [query, setQuery] = useState('');
  const [issuer, setIssuer] = useState('all');
  const searchable = certifications.length > SEARCH_THRESHOLD;
  const issuers = useMemo(() => [...new Set(certifications.map((c) => c.issuer))].sort(), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return certifications.filter(
      (c) =>
        (issuer === 'all' || c.issuer === issuer) &&
        (!q || [c.name, c.issuer, ...c.skills].some((s) => s.toLowerCase().includes(q))),
    );
  }, [query, issuer]);

  const filtering = searchable && (query || issuer !== 'all');
  const list = showAll || filtering ? filtered : filtered.slice(0, TOP);
  return {
    list,
    total: certifications.length,
    hasMore: !filtering && certifications.length > TOP,
    showAll,
    toggleAll: () => setShowAll((v) => !v),
    searchable,
    query,
    setQuery,
    issuer,
    setIssuer,
    issuers,
  };
}

// Closes popovers on outside click / Escape.
export function useDismiss(open, ref, onClose) {
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && onClose();
    const onKey = (e) => e.key === 'Escape' && onClose(true);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, ref, onClose]);
}

// Tracks which section is under the nav for aria-current highlighting.
export function useActiveSection(ids) {
  const [active, setActive] = useState('');
  const key = ids.join(',');
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!els.length || !('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-35% 0px -60% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return active;
}
