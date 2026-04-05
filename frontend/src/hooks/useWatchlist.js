import { useState, useEffect } from 'react';

const WATCHLIST_KEY = 'ews_watchlist';

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(WATCHLIST_KEY)) || [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
  }, [watchlist]);

  const toggle = (isoCode) => {
    setWatchlist(prev =>
      prev.includes(isoCode) ? prev.filter(c => c !== isoCode) : [...prev, isoCode].slice(0, 5)
    );
  };

  const isWatched = (isoCode) => watchlist.includes(isoCode);

  return { watchlist, toggle, isWatched };
}
