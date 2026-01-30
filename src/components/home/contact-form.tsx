"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Send, Loader2, Phone, Instagram, MessageCircle } from "lucide-react";
import { useTranslations } from "@/hooks/use-locale";
import { formatPhoneNumber } from "@/services/auth";
import { api } from "@/lib/api";

export function ContactForm() {
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    message: "",
  });

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData((prev) => ({ ...prev, phone: formatted }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.phone || !formData.message.trim()) {
      toast.error(t("common.fillRequiredFields"));
      return;
    }

    setIsLoading(true);

    try {
      await api.post("/advices", {
        name: formData.name.trim(),
        phone: `+998${formData.phone.replace(/\s/g, "")}`,
        comment: formData.message.trim(),
      });

      toast.success(t("home.contactSuccess"));
      setFormData({ name: "", phone: "", message: "" });
    } catch (error) {
      toast.error(t("errors.generalError"));
      console.error("Contact form error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section
      id="contact"
      className="relative px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
      style={{ scrollMarginTop: "100px" }}
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="rounded-[24px] sm:rounded-[32px] lg:rounded-[40px] bg-gradient-to-br from-[#7ea2d4] to-[#5b8ac4] px-4 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
          <div className="grid gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left Side - Text Content */}
            <div className="flex flex-col justify-center">
              <h2 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl lg:text-6xl">
                Keling, gaplashamiz.
              </h2>

              {/* Mobile - Icons with phone number */}
              <div className="sm:hidden mt-4 flex items-center gap-3">
                <a href="https://t.me/DarslinkerSupport" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                  <MessageCircle className="h-5 w-5 text-white" />
                </a>
                <a href="https://instagram.com/darslinker" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                  <Instagram className="h-5 w-5 text-white" />
                </a>
                <a href="tel:+998773054755" className="text-sm font-medium text-white/90">
                  +998 77-305-47-55
                </a>
              </div>

              <p className="hidden sm:block mt-3 sm:mt-4 text-base sm:text-lg text-white/80">
                Savollaringiz bo'lsa yoki batafsil ma'lumot olmoqchi bo'lsangiz raqamingizni qoldiring, o'zimiz aloqaga chiqamiz.
              </p>

              {/* Contact info */}
              <div className="hidden sm:flex mt-8 sm:mt-10 flex-col gap-3 sm:gap-4">
                <a href="tel:+998773054755" className="flex items-center gap-4 hover:bg-white/5 rounded-lg p-3 transition-colors">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 flex-shrink-0">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Telefon</h3>
                    <p className="text-sm text-white/70">+998 77-305-47-55</p>
                  </div>
                </a>
                <a href="https://t.me/DarslinkerSupport" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 hover:bg-white/5 rounded-lg p-3 transition-colors">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 flex-shrink-0">
                    <MessageCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Telegram</h3>
                    <p className="text-sm text-white/70">@DarslinkerSupport</p>
                  </div>
                </a>
                <a href="https://instagram.com/darslinker" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 hover:bg-white/5 rounded-lg p-3 transition-colors">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 flex-shrink-0">
                    <Instagram className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Instagram</h3>
                    <p className="text-sm text-white/70">@darslinker</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Right Side - Contact Form */}
            <form onSubmit={handleSubmit} className="flex flex-col justify-center">
          <div className="rounded-2xl border border-white/20 bg-white/10 p-6 shadow-lg sm:p-8">
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-white"
                >
                  {t("home.contactName")}
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder={t("home.contactName")}
                  className="w-full rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-white placeholder-white/60 transition-colors outline-none focus:border-white focus:ring-1 focus:ring-white"
                />
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium text-white"
                >
                  {t("home.contactPhone")}
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center gap-2 pl-4">
                    <span className="text-lg">🇺🇿</span>
                    <span className="text-sm text-white/80">+998</span>
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    placeholder="XX XXX XX XX"
                    className="w-full rounded-xl border border-white/30 bg-white/10 py-3 pr-4 pl-24 text-white placeholder-white/60 transition-colors outline-none focus:border-white focus:ring-1 focus:ring-white"
                  />
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="mt-6">
              <label
                htmlFor="message"
                className="mb-2 block text-sm font-medium text-white"
              >
                {t("home.contactMessage")}
              </label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, message: e.target.value }))
                }
                rows={5}
                placeholder={t("home.contactMessage")}
                className="w-full resize-none rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-white placeholder-white/60 transition-colors outline-none focus:border-white focus:ring-1 focus:ring-white"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-[#5b8ac4] shadow-lg transition-all hover:bg-white/90 disabled:cursor-not-allowed sm:w-auto ${
                formData.name.trim() && formData.phone && formData.message.trim()
                  ? "opacity-100"
                  : "opacity-30"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {t("common.loading")}
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  {t("home.contactSubmit")}
                </>
              )}
            </button>
          </div>
        </form>
          </div>
        </div>
      </div>
    </section>
  );
}
