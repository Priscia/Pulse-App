import { MessageSquareQuote, ThumbsUp, ThumbsDown, Minus, TrendingUp, TrendingDown, Star } from 'lucide-react';

export interface VocFeedbackItem {
  id: string;
  customerName: string;
  company: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  comment: string;
  category: string;
  daysAgo: number;
  isVIP: boolean;
}

export interface VocTheme {
  label: string;
  count: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  change: number;
}

const FEEDBACK: VocFeedbackItem[] = [
  { id: 'v1', customerName: 'Alice Thompson', company: 'Apex Dynamics', sentiment: 'positive', score: 5, comment: 'Resolved our critical API issue within the hour. Exceptional response time and clear communication throughout.', category: 'API Integration', daysAgo: 1, isVIP: true },
  { id: 'v2', customerName: 'Bob Martinez', company: 'Nexus Corp', sentiment: 'negative', score: 2, comment: 'Third time raising the same billing discrepancy. Escalated twice — still unresolved after 10 days.', category: 'Billing & Payments', daysAgo: 2, isVIP: true },
  { id: 'v3', customerName: 'Hiroshi Yamamoto', company: 'Pacific Technologies', sentiment: 'positive', score: 5, comment: 'Agent was thorough and patient. The onboarding walkthrough saved us days of setup time.', category: 'Onboarding', daysAgo: 2, isVIP: true },
  { id: 'v4', customerName: 'Natalie Cheng', company: 'Singapore FinTech', sentiment: 'negative', score: 2, comment: 'Dashboard performance is getting worse every week. I need a roadmap for the fixes, not just "we are investigating".', category: 'Performance Issues', daysAgo: 3, isVIP: false },
  { id: 'v5', customerName: 'Jake Wilson', company: 'Cloud Ventures', sentiment: 'positive', score: 4, comment: 'Quick turnaround on the data export bug. Could improve communication on workarounds while fix is in progress.', category: 'Data Export', daysAgo: 4, isVIP: false },
  { id: 'v6', customerName: 'Sandra Mills', company: 'Global Healthcare', sentiment: 'neutral', score: 3, comment: 'Issue was resolved but took longer than our SLA. Appreciated the regular updates during the delay.', category: 'Security & Compliance', daysAgo: 4, isVIP: true },
  { id: 'v7', customerName: 'Kevin Okafor', company: 'StartupHub', sentiment: 'positive', score: 5, comment: 'Best support experience I have had. Fixed in 20 minutes and explained the root cause clearly.', category: 'Account Access', daysAgo: 5, isVIP: false },
  { id: 'v8', customerName: 'Claire Dubois', company: 'Euro Finance SA', sentiment: 'negative', score: 1, comment: 'Unacceptable — our audit log gaps have compliance implications and the team seems unaware of urgency.', category: 'Security & Compliance', daysAgo: 6, isVIP: true },
];

const THEMES: VocTheme[] = [
  { label: 'Response Speed', count: 38, sentiment: 'positive', change: 12 },
  { label: 'Billing Accuracy', count: 27, sentiment: 'negative', change: -8 },
  { label: 'Technical Expertise', count: 24, sentiment: 'positive', change: 5 },
  { label: 'Performance / Latency', count: 21, sentiment: 'negative', change: -14 },
  { label: 'Communication Quality', count: 19, sentiment: 'positive', change: 3 },
  { label: 'Resolution Time', count: 17, sentiment: 'neutral', change: 0 },
];

function SentimentIcon({ sentiment, size = 14 }: { sentiment: VocFeedbackItem['sentiment']; size?: number }) {
  if (sentiment === 'positive') return <ThumbsUp size={size} className="text-emerald-600" />;
  if (sentiment === 'negative') return <ThumbsDown size={size} className="text-red-500" />;
  return <Minus size={size} className="text-amber-500" />;
}

function StarRow({ score }: { score: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={10}
          className={i <= score ? 'text-amber-400 fill-amber-400' : 'text-deloitte-light-gray fill-deloitte-light-gray'}
        />
      ))}
    </div>
  );
}

interface Props {
  compact?: boolean;
}

export default function VoiceOfCustomer({ compact = false }: Props) {
  const positiveCount = FEEDBACK.filter(f => f.sentiment === 'positive').length;
  const negativeCount = FEEDBACK.filter(f => f.sentiment === 'negative').length;
  const neutralCount = FEEDBACK.filter(f => f.sentiment === 'neutral').length;
  const totalCount = FEEDBACK.length;
  const sentimentScore = Math.round(((positiveCount - negativeCount) / totalCount) * 100);
  const displayFeedback = compact ? FEEDBACK.slice(0, 2) : FEEDBACK.slice(0, 4);

  return (
    <div className="bg-white rounded-xl border border-deloitte-light-gray overflow-hidden">
      <div className="px-4 py-3 border-b border-deloitte-light-gray/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-sky-50 rounded-lg flex items-center justify-center">
            <MessageSquareQuote size={13} className="text-sky-600" />
          </div>
          <div>
            <h3 className="font-semibold text-deloitte-black text-sm">Voice of the Customer</h3>
            <p className="text-xs text-deloitte-med-gray">Recent feedback &amp; sentiment themes</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className={`text-sm font-bold ${sentimentScore >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {sentimentScore >= 0 ? '+' : ''}{sentimentScore}
          </div>
          <div className="text-xs text-deloitte-med-gray">NPS</div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2 text-center">
            <div className="flex justify-center mb-0.5"><ThumbsUp size={12} className="text-emerald-600" /></div>
            <p className="text-base font-bold text-emerald-700">{positiveCount}</p>
            <p className="text-xs text-emerald-600">Positive</p>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-2 text-center">
            <div className="flex justify-center mb-0.5"><Minus size={12} className="text-amber-500" /></div>
            <p className="text-base font-bold text-amber-600">{neutralCount}</p>
            <p className="text-xs text-amber-500">Neutral</p>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-lg p-2 text-center">
            <div className="flex justify-center mb-0.5"><ThumbsDown size={12} className="text-red-500" /></div>
            <p className="text-base font-bold text-red-600">{negativeCount}</p>
            <p className="text-xs text-red-500">Negative</p>
          </div>
        </div>

        {!compact && (
          <div>
            <p className="text-xs font-semibold text-deloitte-dark-gray uppercase tracking-wide mb-1.5">Top Themes</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {THEMES.slice(0, 4).map(theme => (
                <div key={theme.label} className="flex items-center justify-between bg-deloitte-light-gray/20 rounded-lg px-2.5 py-1.5">
                  <div className="flex items-center gap-1.5">
                    <SentimentIcon sentiment={theme.sentiment} size={11} />
                    <span className="text-xs font-medium text-deloitte-dark-gray">{theme.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-deloitte-med-gray">{theme.count}</span>
                    <div className={`flex items-center gap-0.5 text-xs font-medium ${theme.change > 0 ? 'text-emerald-600' : theme.change < 0 ? 'text-red-500' : 'text-deloitte-med-gray'}`}>
                      {theme.change > 0 ? <TrendingUp size={9} /> : theme.change < 0 ? <TrendingDown size={9} /> : null}
                      {theme.change !== 0 && `${Math.abs(theme.change)}%`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="text-xs font-semibold text-deloitte-dark-gray uppercase tracking-wide mb-1.5">Recent Feedback</p>
          <div className="space-y-2">
            {displayFeedback.map(item => (
              <div key={item.id} className={`rounded-lg border p-2.5 ${item.sentiment === 'negative' ? 'border-red-100 bg-red-50/40' : item.sentiment === 'positive' ? 'border-emerald-100 bg-emerald-50/30' : 'border-deloitte-light-gray bg-deloitte-light-gray/20'}`}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <SentimentIcon sentiment={item.sentiment} size={12} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-xs font-semibold text-deloitte-black">{item.customerName}</span>
                        <span className="text-xs text-deloitte-med-gray truncate">{item.company}</span>
                        {item.isVIP && (
                          <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 px-1 py-0 rounded-full font-medium shrink-0">VIP</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <StarRow score={item.score} />
                        <span className="text-xs text-deloitte-med-gray">{item.category}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-deloitte-med-gray shrink-0">{item.daysAgo}d ago</span>
                </div>
                <p className="text-xs text-deloitte-dark-gray leading-relaxed italic line-clamp-2">"{item.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
