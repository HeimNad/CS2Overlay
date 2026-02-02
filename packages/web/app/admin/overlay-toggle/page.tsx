import OverlayToggle from '@/components/admin/OverlayToggle';
import ThemeSelector from '@/components/admin/ThemeSelector';

export default function OverlayTogglePage() {
  return (
    <div className="space-y-8">
      <OverlayToggle />
      <ThemeSelector />
    </div>
  );
}
