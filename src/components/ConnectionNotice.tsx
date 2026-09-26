import { LogIn } from "lucide-react";
import { Card } from "@/components/Card";

export function ConnectionNotice({
  title = "يلزم تسجيل الدخول",
  description = "سجّل دخولك إلى لوحة الإدارة للوصول إلى بيانات المنصة وإجراءات الإدارة.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <Card className="border-dashed">
      <div className="mx-auto flex max-w-2xl flex-col items-center py-6 text-center sm:py-10">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
          <LogIn size={20} />
        </div>
        <p className="text-lg font-bold text-[var(--foreground)]">{title}</p>
        <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{description}</p>
        <p className="mt-3 text-xs text-[var(--muted)]">
          استخدم زر «تسجيل الدخول» في الشريط العلوي.
        </p>
      </div>
    </Card>
  );
}
