import { Card } from "@/components/Card";

export function ConnectionNotice({
  title = "يلزم تسجيل الدخول",
  description = "افتح زر الاتصال في الشريط العلوي، ثم اربط لوحة التحكم بالـ Backend عبر البريد وكلمة المرور أو الرمز اليدوي.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <Card className="border-dashed border-white/15 bg-white/[0.03]">
      <div className="space-y-3 text-center">
        <p className="text-lg font-semibold text-white">{title}</p>
        <p className="mx-auto max-w-2xl text-sm leading-7 text-slate-300">{description}</p>
      </div>
    </Card>
  );
}
