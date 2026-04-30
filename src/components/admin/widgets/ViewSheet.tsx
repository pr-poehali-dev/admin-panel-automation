import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ViewSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  badge?: { text: string; color?: string };
  icon?: string;
  iconBg?: string;
  initials?: string;
  children: ReactNode;
  onEdit?: () => void;
}

export default function ViewSheet({
  open, onClose, title, subtitle, badge, icon, iconBg = 'bg-primary', initials, children, onEdit
}: ViewSheetProps) {
  return (
    <Sheet open={open} onOpenChange={o => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-[560px] p-0 flex flex-col bg-gradient-to-b from-slate-50 to-white">
        <SheetHeader className="px-5 pt-5 pb-4 bg-white border-b">
          <div className="flex items-start gap-3">
            {initials ? (
              <Avatar className="w-12 h-12 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">{initials}</AvatarFallback>
              </Avatar>
            ) : icon && (
              <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm', iconBg)}>
                <Icon name={icon} size={22} className="text-white" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <SheetTitle className="text-base font-bold leading-tight">{title}</SheetTitle>
                {badge && <Badge className={cn('text-[10px] border-0', badge.color)}>{badge.text}</Badge>}
              </div>
              {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
            </div>
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={onEdit} className="shrink-0 gap-1.5 h-8">
                <Icon name="Pencil" size={13} /> Изменить
              </Button>
            )}
          </div>
        </SheetHeader>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {children}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

// === Two-column grid helper for view ===
export function ViewGrid({ children, cols = 2 }: { children: ReactNode; cols?: 1 | 2 | 3 }) {
  return <div className={cn('grid gap-3', cols === 1 ? 'grid-cols-1' : cols === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2 md:grid-cols-3')}>{children}</div>;
}
