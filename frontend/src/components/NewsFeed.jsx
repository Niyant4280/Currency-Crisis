import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const NewsFeed = ({ countryName, countryCode }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Use rss2json API to convert Google News RSS to JSON (CORS-free)
        const query = encodeURIComponent(`${countryName} economy currency crisis`);
        const rssUrl = `https://news.google.com/rss/search?q=${query}&hl=en&gl=US&ceid=US:en`;
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&count=5`;
        
        const res = await fetch(apiUrl);
        const data = await res.json();
        
        if (data.status === 'ok' && data.items) {
          setArticles(data.items.slice(0, 5));
        }
      } catch (e) {
        console.warn('News fetch failed', e);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [countryName]);

  const timeAgo = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000 / 3600);
    if (diff < 1) return 'Just now';
    if (diff < 24) return `${diff}h ago`;
    return `${Math.floor(diff / 24)}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
          <span>📰</span>
          <span>Latest News</span>
        </h3>
        <span className="text-xs text-slate-500 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">via Google News</span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="animate-pulse h-14 bg-slate-800/60 rounded-xl"></div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <p className="text-slate-500 text-center py-6">No recent news found</p>
      ) : (
        <div className="space-y-3">
          {articles.map((article, i) => (
            <motion.a
              key={i}
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ x: 4 }}
              className="flex items-start space-x-3 p-3 rounded-xl hover:bg-slate-800/60 transition-all group border border-transparent hover:border-slate-700/50"
            >
              <div className="flex-shrink-0 w-1 h-full min-h-[2rem] bg-gradient-to-b from-indigo-500 to-transparent rounded-full mt-1"></div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-200 text-sm font-medium leading-snug group-hover:text-white transition line-clamp-2">
                  {article.title}
                </p>
                <p className="text-slate-500 text-xs mt-1">{article.author || 'Unknown'} · {timeAgo(article.pubDate)}</p>
              </div>
              <svg className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </motion.a>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default NewsFeed;
