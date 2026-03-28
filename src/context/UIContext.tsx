"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ar' | 'en';
type Theme = 'dark' | 'light';

interface UIContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  toggleTheme: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  t: (key: string) => string;
}

const translations = {
  ar: {
    dashboard: 'لوحة التحكم',
    users: 'المستخدمين',
    students: 'المستخدمين',
    content: 'المحتوى',
    vocal_content: 'المحتوى المسموع',
    spiritual_journey: 'مسار التعلم',
    rooms: 'الغرف',
    audio_rooms: 'الغرف الصوتية',
    workshops: 'الورش',
    notifications: 'التنبيهات',
    reports: 'التقارير',
    active_rooms: 'الغرف النشطة',
    total_users: 'إجمالي المستخدمين',
    total_content: 'إجمالي المحتوى',
    daily_activity: 'النشاط اليومي',
    platform_overview: 'نظرة عامة على المنصة',
    welcome_admin: 'أهلاً بك مجدداً، أيها المسؤول. إليك ما يحدث في ترتيلية اليوم.',
    search: 'بحث...',
    settings: 'الإعدادات',
    logout: 'تسجيل الخروج',
    articles: 'المقالات',
    crm: 'نظام CRM',
    marketing: 'التسويق',
    school_name: 'المدرسة الترتيلية',
    users_desc: 'إدارة أدوار الطلاب والمدربين ومتابعة حالات الحسابات.',
    role_column: 'الرتبة',
    registration_column: 'التسجيل',
    invite_user: 'دعوة مستخدم',
    role_student: 'طالب',
    role_trainer: 'مدرب',
    role_admin: 'مسؤول',
    no_description: 'لا يوجد وصف متاح.',
    edit: 'تعديل',
    delete: 'حذف',
    view: 'عرض',
    crm_title: 'نظام CRM',
    crm_desc: 'جمع وبحث وتحليل بيانات المشتركين والمستخدمين.',
    export_data: 'تصدير البيانات',
    total_customers: 'إجمالي العملاء',
    recently_active: 'نشطين مؤخراً',
    pending_requests: 'طلبات معلقة',
    search_placeholder: 'ابحث بالاسم أو البريد الإلكتروني...',
    user_column: 'المستخدم',
    email_column: 'البريد الإلكتروني',
    join_date_column: 'تاريخ الانضمام',
    status_column: 'الحالة',
    actions_column: 'الإجراءات',
    active_status: 'نشط',
    no_results: 'لم يتم العثور على نتائج',
    add_content: 'إضافة محتوى',
    content_desc: 'ارفع الفيديوهات، أدر الدورات، وانشر المقالات.',
    title_label: 'العنوان',
    type_label: 'النوع',
    upload_file_label: 'رفع ملف (اختياري)',
    description_label: 'الوصف',
    thumbnail_url_label: 'رابط الصورة المصغرة',
    content_url_label: 'رابط مباشر (إذا لم يتم الرفع)',
    cancel: 'إلغاء',
    save_content: 'حفظ المحتوى',
    uploading: 'جاري الرفع...',
    marketing_title: 'التسويق المباشر',
    marketing_desc: 'إرسال حملات البريد الإلكتروني واستهداف فئات محددة من المشتركين.',
    create_campaign: 'إنشاء حملة جديدة',
    subject_label: 'عنوان البريد (Subject)',
    target_audience: 'استهداف الجمهور',
    all_users: 'جميع المستخدمين',
    active_subscribers: 'المشتركين النشطين فقط',
    inactive_subscribers: 'المشتركين غير النشطين',
    new_subscribers: 'المشتركين الجدد (آخر 30 يوم)',
    design_template: 'قالب التصميم',
    classic_template: 'كلاسيكي (نصي)',
    modern_template: 'عصري (مع صور)',
    promo_template: 'ترويجي (أزرار بارزة)',
    message_content: 'محتوى الرسالة',
    message_placeholder: 'اكتب محتوى الرسالة هنا...',
    launch_campaign: 'إطلاق الحملة الآن',
    sending: 'جاري الإرسال...',
    campaign_stats: 'إحصائيات الحملة',
    delivery_rate: 'معدل الوصول',
    open_rate: 'معدل الفتح',
    spam_rate: 'رسائل سبام',
    audience_segments: 'شرائح الجمهور',
    golden_subscribers: 'المشتركون الذهبيون',
  },
  en: {
    dashboard: 'Dashboard',
    users: 'Users',
    students: 'Users',
    content: 'Content',
    vocal_content: 'Audio Content',
    spiritual_journey: 'Learning Path',
    rooms: 'Rooms',
    audio_rooms: 'Audio Rooms',
    workshops: 'Workshops',
    notifications: 'Notifications',
    reports: 'Reports',
    active_rooms: 'Active Rooms',
    total_users: 'Total Users',
    total_content: 'Total Content',
    daily_activity: 'Daily Activity',
    platform_overview: 'Platform Overview',
    welcome_admin: "Welcome back, Admin. Here's what's happening on Tartelea today.",
    search: 'Search...',
    settings: 'Settings',
    logout: 'Logout',
    articles: 'Articles',
    crm: 'CRM System',
    marketing: 'Marketing',
    school_name: 'Tartelea School',
    crm_title: 'CRM System',
    crm_desc: 'Collect, search, and analyze subscriber and user data.',
    export_data: 'Export Data',
    total_customers: 'Total Customers',
    recently_active: 'Recently Active',
    pending_requests: 'Pending Requests',
    search_placeholder: 'Search by name or email...',
    user_column: 'User',
    email_column: 'Email',
    join_date_column: 'Join Date',
    status_column: 'Status',
    actions_column: 'Actions',
    active_status: 'Active',
    no_results: 'No results found',
    add_content: 'Add Content',
    content_desc: 'Upload videos, manage courses, and publish articles.',
    title_label: 'Title',
    type_label: 'Type',
    upload_file_label: 'Upload file (Optional)',
    description_label: 'Description',
    thumbnail_url_label: 'Thumbnail URL',
    content_url_label: 'Direct URL (if not uploaded)',
    cancel: 'Cancel',
    save_content: 'Save Content',
    uploading: 'Uploading...',
    marketing_title: 'Direct Marketing',
    marketing_desc: 'Send email campaigns and target specific subscriber groups.',
    create_campaign: 'Create New Campaign',
    subject_label: 'Email Subject',
    target_audience: 'Target Audience',
    all_users: 'All Users',
    active_subscribers: 'Active Subscribers Only',
    inactive_subscribers: 'Inactive Subscribers',
    new_subscribers: 'New Subscribers (Last 30 days)',
    design_template: 'Design Template',
    classic_template: 'Classic (Text)',
    modern_template: 'Modern (with images)',
    promo_template: 'Promotional (Bold buttons)',
    message_content: 'Message Content',
    message_placeholder: 'Write message content here...',
    launch_campaign: 'Launch Campaign Now',
    sending: 'Sending...',
    campaign_stats: 'Campaign Statistics',
    delivery_rate: 'Delivery Rate',
    open_rate: 'Open Rate',
    spam_rate: 'Spam Rate',
    audience_segments: 'Audience Segments',
    golden_subscribers: 'Golden Subscribers',
  }
};

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('ar');
  const [theme, setTheme] = useState<Theme>('dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [language, theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  
  const t = (key: string) => {
    return (translations[language] as any)[key] || key;
  };

  return (
    <UIContext.Provider value={{ language, setLanguage, theme, toggleTheme, sidebarOpen, setSidebarOpen, t }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within UIProvider');
  return context;
}
