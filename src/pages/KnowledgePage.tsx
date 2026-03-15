import { useState } from 'react';
import { BookOpen, ThumbsUp, ThumbsDown, Eye, Search, AlertCircle, TrendingUp, Calendar } from 'lucide-react';
import Header from '../components/layout/Header';
import { mockService } from '../data/mockService';
import type { KnowledgeArticle } from '../types';

export default function KnowledgePage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const articles = mockService.getArticles();
  const failedSearches = mockService.getFailedSearches();

  const filtered = articles.filter(a => {
    if (search && !a.title.toLowerCase().includes(search.toLowerCase()) && !a.category.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter && a.category !== categoryFilter) return false;
    return true;
  });

  const categories = [...new Set(articles.map(a => a.category))];
  const totalViews = articles.reduce((sum, a) => sum + a.views, 0);
  const avgHelpfulRate = articles.reduce((sum, a) => sum + a.helpfulRate, 0) / articles.length;
  const staleArticles = articles.filter(a => {
    const days = (Date.now() - new Date(a.lastUpdated).getTime()) / 86400000;
    return days > 14;
  });

  return (
    <div>
      <Header title="Knowledge Base" subtitle="Article health, deflection metrics, and search insights" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Published Articles', value: articles.filter(a => a.status === 'published').length, icon: BookOpen, color: 'bg-deloitte-green/10 text-deloitte-green' },
            { label: 'Total Views (30d)', value: totalViews.toLocaleString(), icon: Eye, color: 'bg-deloitte-light-gray/60 text-deloitte-dark-gray' },
            { label: 'Avg Helpful Rate', value: `${(avgHelpfulRate * 100).toFixed(0)}%`, icon: ThumbsUp, color: avgHelpfulRate > 0.8 ? 'bg-deloitte-green/10 text-deloitte-green' : 'bg-amber-100 text-amber-600' },
            { label: 'Stale Articles', value: staleArticles.length, icon: Calendar, color: staleArticles.length > 3 ? 'bg-red-100 text-red-600' : 'bg-deloitte-light-gray/40 text-deloitte-dark-gray' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-xl border border-deloitte-light-gray p-5">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm text-deloitte-med-gray">{label}</p>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}><Icon size={16} /></div>
              </div>
              <p className="text-2xl font-bold text-deloitte-black">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-deloitte-light-gray overflow-hidden">
            <div className="px-5 py-4 border-b border-deloitte-light-gray/60">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="font-semibold text-deloitte-black">Articles</h3>
                <div className="relative flex-1 min-w-[200px] max-w-xs">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-deloitte-med-gray" />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-sm border border-deloitte-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-deloitte-green"
                  />
                </div>
                <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="text-sm border border-deloitte-light-gray rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-deloitte-green text-deloitte-dark-gray">
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="bg-deloitte-light-gray/20 border-b border-deloitte-light-gray/60">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-deloitte-dark-gray uppercase tracking-wide">Article</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-deloitte-dark-gray uppercase tracking-wide">Views</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-deloitte-dark-gray uppercase tracking-wide">Helpful</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-deloitte-dark-gray uppercase tracking-wide">Linked Tickets</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-deloitte-dark-gray uppercase tracking-wide">Updated</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-deloitte-dark-gray uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-deloitte-light-gray/40">
                  {filtered.map(article => <ArticleRow key={article.id} article={article} />)}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-deloitte-light-gray overflow-hidden">
              <div className="px-5 py-4 border-b border-deloitte-light-gray/60 flex items-center gap-2">
                <AlertCircle size={15} className="text-red-500" />
                <h3 className="font-semibold text-deloitte-black">Top Failed Searches</h3>
              </div>
              <div className="divide-y divide-deloitte-light-gray/40">
                {failedSearches.map((fs, i) => (
                  <div key={i} className="px-5 py-3 flex items-center gap-3">
                    <span className="text-xs font-bold text-deloitte-light-gray w-5">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-deloitte-black truncate font-medium">"{fs.query}"</p>
                      <p className="text-xs text-deloitte-med-gray mt-0.5">{fs.count} searches • {new Date(fs.lastSearched).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${fs.hasArticle ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                      {fs.hasArticle ? 'Exists' : 'Missing'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-deloitte-light-gray p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={15} className="text-deloitte-green" />
                <h3 className="font-semibold text-deloitte-black">Deflection Insights</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Tickets with matched article', value: '68%', progress: 68, color: 'bg-deloitte-green' },
                  { label: 'Avg helpful rate', value: `${(avgHelpfulRate * 100).toFixed(0)}%`, progress: avgHelpfulRate * 100, color: avgHelpfulRate > 0.8 ? 'bg-deloitte-green' : 'bg-amber-500' },
                  { label: 'Articles needing update', value: `${((staleArticles.length / articles.length) * 100).toFixed(0)}%`, progress: (staleArticles.length / articles.length) * 100, color: staleArticles.length > 3 ? 'bg-red-500' : 'bg-deloitte-dark-gray' },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between mb-1 text-xs">
                      <span className="text-deloitte-dark-gray">{item.label}</span>
                      <span className="font-semibold text-deloitte-black">{item.value}</span>
                    </div>
                    <div className="h-1.5 bg-deloitte-light-gray/60 rounded-full">
                      <div className={`h-1.5 rounded-full ${item.color}`} style={{ width: `${item.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={15} className="text-amber-600" />
                <h3 className="font-semibold text-amber-800">Content Gaps</h3>
              </div>
              <p className="text-xs text-amber-700 mb-3">Articles missing for top ticket categories:</p>
              {['Bulk Export API', 'SSO with Azure AD', 'Mobile SDK Offline Mode'].map(gap => (
                <div key={gap} className="flex items-center gap-2 text-xs text-amber-800 mb-1.5">
                  <div className="w-1.5 h-1.5 bg-amber-600 rounded-full shrink-0" />
                  {gap}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArticleRow({ article }: { article: KnowledgeArticle }) {
  const isStale = (Date.now() - new Date(article.lastUpdated).getTime()) / 86400000 > 14;
  const helpfulPct = Math.round(article.helpfulRate * 100);
  return (
    <tr className="hover:bg-deloitte-light-gray/20 transition-colors">
      <td className="px-5 py-3">
        <p className="text-sm font-medium text-deloitte-black">{article.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-deloitte-med-gray">{article.category}</span>
          <span className="text-xs text-deloitte-light-gray">•</span>
          <span className="text-xs text-deloitte-med-gray">{article.product}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-deloitte-dark-gray">{article.views.toLocaleString()}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-12 h-1.5 bg-deloitte-light-gray/60 rounded-full">
            <div className={`h-1.5 rounded-full ${helpfulPct > 80 ? 'bg-deloitte-green' : helpfulPct > 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${helpfulPct}%` }} />
          </div>
          <span className={`text-xs font-medium ${helpfulPct > 80 ? 'text-deloitte-green' : helpfulPct > 60 ? 'text-amber-600' : 'text-red-600'}`}>{helpfulPct}%</span>
        </div>
        <div className="flex items-center gap-1 mt-1 text-xs text-deloitte-med-gray">
          <ThumbsDown size={10} />
          <span>{article.unhelpfulCount} unhelpful</span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-deloitte-dark-gray">{article.linkedTicketCount}</td>
      <td className="px-4 py-3">
        <span className={`text-xs ${isStale ? 'text-amber-600 font-medium' : 'text-deloitte-med-gray'}`}>
          {new Date(article.lastUpdated).toLocaleDateString()}
          {isStale && ' (stale)'}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${article.status === 'published' ? 'bg-deloitte-green/10 text-deloitte-green' : article.status === 'draft' ? 'bg-amber-100 text-amber-700' : 'bg-deloitte-light-gray/40 text-deloitte-dark-gray'}`}>
          {article.status}
        </span>
      </td>
    </tr>
  );
}
