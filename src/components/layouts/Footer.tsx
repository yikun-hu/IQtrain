// Footer.tsx
import { Link } from "react-router-dom";
import { SupportedLanguages, useLanguage } from "@/contexts/LanguageContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Language } from "@/types/types";
import { Instagram, Facebook, MessageCircle } from "lucide-react";

export function Footer() {
  const { language, setLanguage, t } = useLanguage();
  const tf = t.footer;

  return (
    <footer className="w-full border-t border-white/10 bg-[#031b34] text-white">
      <div className="container mx-auto px-4 py-10">
        {/* Top */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-3">
              <img src="/images/logo/iqtrain-logo1-white.png" alt="IQ Train" className="h-16" />
              {/* <div className="text-2xl font-semibold tracking-tight">
                {tf.brandName}
              </div> */}
            </div>

            <p className="mt-3 text-sm leading-relaxed text-white/70 max-w-sm">
              {t.common?.subtitle ?? tf.subtitleFallback}
            </p>
          </div>

          {/* Columns */}
          <div className="md:col-span-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
              {/* Customer Support */}
              <div>
                <div className="text-base font-semibold">{tf.customerSupport}</div>
                <div className="mt-4 flex flex-col gap-3 text-sm text-white/75">
                  <a
                    href="mailto:support@iqtrain.ai"
                    className="hover:text-white transition-colors"
                  >
                    {tf.supportEmailLabel}{" "}
                    <span className="text-white/90">support@iqtrain.ai</span>
                  </a>
                </div>
              </div>

              {/* Legal */}
              <div>
                <div className="text-base font-semibold">{tf.legal}</div>
                <div className="mt-4 flex flex-col gap-3 text-sm text-white/75">
                  <Link
                    to="/privacy-policy"
                    className="hover:text-white transition-colors"
                  >
                    {tf.privacyPolicy}
                  </Link>
                  <Link to="/terms" className="hover:text-white transition-colors">
                    {tf.termsConditions}
                  </Link>
                  <Link
                    to="/cookie-policy"
                    className="hover:text-white transition-colors"
                  >
                    {tf.cookiePolicy}
                  </Link>
                  <Link
                    to="/terms#section-4"
                    className="hover:text-white transition-colors"
                  >
                    {tf.refundPolicy}
                  </Link>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <div className="text-base font-semibold">{tf.quickLinks}</div>
                <div className="mt-4 flex flex-col gap-3 text-sm text-white/75">
                  <Link to="/" className="hover:text-white transition-colors">
                    {tf.home}
                  </Link>
                  <Link to="/#country-iq" className="hover:text-white transition-colors">
                    {tf.countryIq}
                  </Link>
                  <Link to="/test" className="hover:text-white transition-colors">
                    {tf.startTest}
                  </Link>
                  <Link to="/#testimonials" className="hover:text-white transition-colors">
                    {tf.testimonials}
                  </Link>
                  <Link to="/#how-it-works" className="hover:text-white transition-colors">
                    {tf.howItWorks}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-10 border-t border-white/10 pt-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            {/* Left legal text */}
            <div className="max-w-3xl text-sm text-white/70 leading-relaxed">
              <div>{tf.copyrightLine}</div>
              <div className="mt-1">{tf.trademarkLine}</div>
              <div className="mt-1">{tf.disclaimerLine}</div>
            </div>

            {/* Right controls */}
            <div className="flex flex-col items-start gap-4 md:items-end">
              <Select
                value={language}
                onValueChange={(value) => setLanguage(value as Language)}
              >
                <SelectTrigger className="h-11 w-[180px] rounded-2xl border-white/30 bg-white/5 text-white hover:bg-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SupportedLanguages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Payment badges (可替换为你的真实 logo 图片) */}
              <div className="flex flex-wrap items-center justify-end gap-3">
                {["Visa.png", "Mastercard.svg", "PayPal.svg", "UnionPay.svg"].map((name) => (
                  <img 
                    key={name}
                    src={`/images/payment/${name}`}
                    alt={name}
                    className="h-8 w-auto rounded-md bg-white p-2"
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                  />
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
