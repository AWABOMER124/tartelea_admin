"use client";

import { useState } from 'react';
import { Card } from '@/components/Card';
import { 
  Mail, 
  Send, 
  Users, 
  Target, 
  Layers, 
  Type, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useUI } from '@/context/UIContext';
import { motion } from 'framer-motion';

export default function MarketingPage() {
  const { t } = useUI();
  const [sending, setSending] = useState(false);
  const [campaign, setCampaign] = useState({
    subject: '',
    segment: 'all',
    content: '',
    template: 'classic'
  });

  async function handleSendCampaign() {
    if (!campaign.subject || !campaign.content) {
      toast.error('يرجى ملء عنوان ومحتوى الحملة');
      return;
    }

    setSending(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast.success('تم إرسال الحملة بنجاح إلى ' + (campaign.segment === 'all' ? t('all_users') : t('active_subscribers')));
    setCampaign({ subject: '', segment: 'all', content: '', template: 'classic' });
    setSending(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">{t('marketing_title')}</h2>
          <p className="text-foreground/50">{t('marketing_desc')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card title={t('create_campaign')}>
            <div className="space-y-6 mt-4">
              <div>
                <label className="block text-xs font-bold text-foreground/60 mb-2 uppercase tracking-wider">{t('subject_label')}</label>
                <input 
                  type="text" 
                  className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all text-sm"
                  value={campaign.subject}
                  onChange={(e) => setCampaign({...campaign, subject: e.target.value})}
                  placeholder="مثال: خصم خاص لمشتركي ترتيلية المميزين"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-foreground/60 mb-2 uppercase tracking-wider">{t('target_audience')}</label>
                  <select 
                    className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all text-sm"
                    value={campaign.segment}
                    onChange={(e) => setCampaign({...campaign, segment: e.target.value})}
                  >
                    <option value="all">{t('all_users')}</option>
                    <option value="active">{t('active_subscribers')}</option>
                    <option value="inactive">{t('inactive_subscribers')}</option>
                    <option value="new">{t('new_subscribers')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground/60 mb-2 uppercase tracking-wider">{t('design_template')}</label>
                  <select 
                    className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all text-sm"
                    value={campaign.template}
                    onChange={(e) => setCampaign({...campaign, template: e.target.value})}
                  >
                    <option value="classic">{t('classic_template')}</option>
                    <option value="modern">{t('modern_template')}</option>
                    <option value="promo">{t('promo_template')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground/60 mb-2 uppercase tracking-wider">{t('message_content')}</label>
                <div className="border border-border rounded-xl overflow-hidden">
                  <div className="bg-foreground/5 p-2 border-b border-border flex gap-2">
                    <button className="p-1.5 hover:bg-foreground/10 rounded text-foreground/60"><Type size={16} /></button>
                    <button className="p-1.5 hover:bg-foreground/10 rounded text-foreground/60"><ImageIcon size={16} /></button>
                  </div>
                  <textarea 
                    className="w-full bg-transparent p-4 focus:outline-none min-h-[300px] text-sm leading-loose"
                    value={campaign.content}
                    onChange={(e) => setCampaign({...campaign, content: e.target.value})}
                    placeholder={t('message_placeholder')}
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleSendCampaign}
                  disabled={sending}
                  className="w-full md:w-auto px-8 py-3 rounded-xl bg-primary hover:bg-primary/80 text-white font-bold transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {sending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t('sending')}
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      {t('launch_campaign')}
                    </>
                  )}
                </button>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title={t('campaign_stats')}>
            <div className="space-y-4 mt-4">
              <StatRow icon={<CheckCircle2 size={18} />} iconBg="bg-emerald-500/10 text-emerald-500" label={t('delivery_rate')} value="98%" />
              <StatRow icon={<Target size={18} />} iconBg="bg-blue-500/10 text-blue-500" label={t('open_rate')} value="42%" />
              <StatRow icon={<AlertCircle size={18} />} iconBg="bg-amber-500/10 text-amber-500" label={t('spam_rate')} value="0.1%" />
            </div>
          </Card>

          <Card title={t('audience_segments')}>
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 flex items-center gap-4">
                <Users className="text-primary" size={24} />
                <div>
                  <p className="text-sm font-bold">{t('all_users')}</p>
                  <p className="text-xs text-foreground/40">1,250 مستخدم</p>
                </div>
              </div>
              <div className="p-4 bg-foreground/5 rounded-xl border border-border flex items-center gap-4">
                <Layers className="text-foreground/40" size={24} />
                <div>
                  <p className="text-sm font-bold">{t('golden_subscribers')}</p>
                  <p className="text-xs text-foreground/40">342 مستخدم</p>
                </div>
              </div>
            </div>
          </Card>

          <Card title={`📬 ${t('marketing')}`}>
            <div className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/20 text-center">
              <Mail className="text-primary mx-auto mb-2" size={32} />
              <p className="text-sm font-bold text-foreground">Resend / Mailgun</p>
              <p className="text-xs text-foreground/40 mt-1">API Integration Ready</p>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}

function StatRow({ icon, iconBg, label, value }: { icon: React.ReactNode; iconBg: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-foreground/5 rounded-xl border border-border">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${iconBg}`}>{icon}</div>
        <span className="text-sm font-bold">{label}</span>
      </div>
      <span className="text-lg font-bold">{value}</span>
    </div>
  );
}
