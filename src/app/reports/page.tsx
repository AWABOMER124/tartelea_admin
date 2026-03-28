"use client";

import { useEffect, useState } from 'react';
import { Card } from '@/components/Card';
import { supabase } from '@/lib/supabase';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  Download, 
  Calendar,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUI } from '@/context/UIContext';

const COLORS = ['#ca8a04', '#eab308', '#facc15', '#a16207', '#854d0e'];

const registrationData = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 500 },
  { name: 'Jun', value: 900 },
];

const userTypeData = [
  { name: 'Students', value: 850 },
  { name: 'Trainers', value: 120 },
  { name: 'Admins', value: 15 },
];

export default function ReportsPage() {
  const { t, theme } = useUI();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">{t('reports')}</h2>
          <p className="text-foreground/50">Detailed platform analytics, user growth, and engagement metrics.</p>
        </div>
        <div className="flex gap-4">
          <button className="bg-foreground/5 border border-border p-2.5 rounded-xl hover:bg-foreground/10 transition-colors">
            <Filter size={20} className="text-primary" />
          </button>
          <button className="bg-primary hover:bg-primary/80 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20">
            <Download size={20} />
            <span>تصدير التقرير</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <StatItem title="نمو المستخدمين" value="+24%" subValue="آخر 30 يوم" icon={Users} color="gold" />
        <StatItem title="وقت الاستماع" value="1,240h" subValue="+12% زيادة" icon={Clock} color="gold" />
        <StatItem title="المحتوى النشط" value={85} subValue="تمت إضافة 5 اليوم" icon={TrendingUp} color="gold" />
        <StatItem title="معدل الاحتفاظ" value="78%" subValue="مستقر" icon={TrendingUp} color="gold" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="إحصائيات التسجيل الشهري" className="border-border bg-card">
          <div className="h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={registrationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(202, 138, 4, 0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="currentColor" fontSize={12} tickLine={false} axisLine={false} className="text-foreground/40" />
                <YAxis stroke="currentColor" fontSize={12} tickLine={false} axisLine={false} className="text-foreground/40" />
                <Tooltip 
                   contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#0a0a0a' : '#fff', 
                    border: '1px solid var(--border)', 
                    borderRadius: '12px' 
                  }}
                  itemStyle={{ color: 'var(--primary)' }}
                />
                <Bar dataKey="value" fill="#ca8a04" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-8">
          <Card title="توزيع المستخدمين" className="border-border bg-card">
            <div className="h-64 w-full flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {userTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip 
                     contentStyle={{ 
                      backgroundColor: theme === 'dark' ? '#0a0a0a' : '#fff', 
                      border: '1px solid var(--border)', 
                      borderRadius: '12px' 
                    }}
                    itemStyle={{ color: 'var(--primary)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-1/2 space-y-4">
                {userTypeData.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                      <span className="text-xs font-bold text-foreground/60 uppercase">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card title="معدل التفاعل خلال الأسبوع" className="border-border bg-card">
            <div className="h-44 w-full">
               <ResponsiveContainer width="100%" height="100%">
                <LineChart data={registrationData}>
                  <Line type="monotone" dataKey="value" stroke="#ca8a04" strokeWidth={3} dot={false} />
                  <Tooltip 
                     contentStyle={{ 
                      backgroundColor: theme === 'dark' ? '#0a0a0a' : '#fff', 
                      border: '1px solid var(--border)', 
                      borderRadius: '12px' 
                    }}
                    itemStyle={{ color: 'var(--primary)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatItem({ title, value, subValue, icon: Icon, color }: any) {
  return (
    <Card className="p-6 border-border bg-card shadow-sm group">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:scale-110 transition-transform shadow-sm">
          <Icon size={24} />
        </div>
        <div>
          <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{title}</p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-2xl font-black text-foreground">{value}</h4>
            <span className="text-[10px] font-bold text-emerald-500">{subValue}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
