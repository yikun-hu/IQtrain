import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function Footer() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <footer className="w-full border-t border-border bg-[#0f0f19ff] text-sidebar-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Logo and Description */}
          <div>
            <h3 className="text-xl font-bold mb-2">IQ Train</h3>
            <p className="text-sm text-muted-foreground">
              {t.home.hero.subtitle}
            </p>
          </div>

          {/* Language Selector */}
          <div>
            <h4 className="font-semibold mb-4">
              {t.home.footer.language}
            </h4>
            <Select value={language} onValueChange={(value) => setLanguage(value as 'en' | 'zh')}>
              <SelectTrigger className="w-full max-w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='en'>English</SelectItem>
                <SelectItem value='zh'>中文</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t border-border pt-8 flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
          <p className="text-sm text-muted-foreground">
            © 2025 IQ Train. {t.home.footer.rightsReserved}
          </p>
          <div className="flex space-x-4">
            <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              {t.home.footer.privacy}
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              {t.home.footer.terms}
            </Link>
            <Link to="/cookie-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              {t.header.cookie_policy}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
