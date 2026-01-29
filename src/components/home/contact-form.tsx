"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Send, Loader2, Mail, Phone, Instagram, MessageCircle } from "lucide-react";
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
        <div className="rounded-[40px] bg-gradient-to-br from-[#7ea2d4] to-[#5b8ac4] px-6 py-16 sm:px-8 lg:px-12 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left Side - Text Content */}
            <div className="flex flex-col justify-center">
              <h2 className="text-3xl font-bold text-white dark:text-gray-900 sm:text-4xl lg:text-5xl">
                {t("home.contactTitle")}
              </h2>
              <p className="mt-4 text-lg text-white/80 dark:text-gray-700">
                {t("home.contactSubtitle")}
              </p>

              {/* Additional info */}
              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 dark:bg-gray-900/50">
                    <Mail className="h-5 w-5 text-white dark:text-gray-900" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white dark:text-gray-900">Email</h3>
                    <p className="text-sm text-white/70 dark:text-gray-700">support@darslinker.uz</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 dark:bg-gray-900/50">
                    <Phone className="h-5 w-5 text-white dark:text-gray-900" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white dark:text-gray-900">Telefon</h3>
                    <p className="text-sm text-white/70 dark:text-gray-700">+998 90 123 45 67</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 dark:bg-gray-900/50">
                    <Instagram className="h-5 w-5 text-white dark:text-gray-900" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white dark:text-gray-900">Instagram</h3>
                    <p className="text-sm text-white/70 dark:text-gray-700">@darslinker</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 dark:bg-gray-900/50">
                    <MessageCircle className="h-5 w-5 text-white dark:text-gray-900" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white dark:text-gray-900">Telegram</h3>
                    <p className="text-sm text-white/70 dark:text-gray-700">@darslinker_support</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Contact Form */}
            <form onSubmit={handleSubmit} className="flex flex-col justify-center">
          <div className="rounded-2xl border border-white/20 bg-white/10 p-6 shadow-lg dark:border-gray-700 dark:bg-gray-900/50 sm:p-8">
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-white dark:text-gray-900"
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
                  className="w-full rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-white placeholder-white/60 transition-colors outline-none focus:border-white focus:ring-1 focus:ring-white dark:border-gray-600 dark:bg-gray-800/50 dark:text-gray-900 dark:placeholder-gray-500 dark:focus:border-gray-900"
                />
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium text-white dark:text-gray-900"
                >
                  {t("home.contactPhone")}
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center gap-2 pl-4">
                    <span className="text-lg">🇺🇿</span>
                    <span className="text-sm text-white/80 dark:text-gray-700">+998</span>
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    placeholder="XX XXX XX XX"
                    className="w-full rounded-xl border border-white/30 bg-white/10 py-3 pr-4 pl-24 text-white placeholder-white/60 transition-colors outline-none focus:border-white focus:ring-1 focus:ring-white dark:border-gray-600 dark:bg-gray-800/50 dark:text-gray-900 dark:placeholder-gray-500 dark:focus:border-gray-900"
                  />
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="mt-6">
              <label
                htmlFor="message"
                className="mb-2 block text-sm font-medium text-white dark:text-gray-900"
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
                className="w-full resize-none rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-white placeholder-white/60 transition-colors outline-none focus:border-white focus:ring-1 focus:ring-white dark:border-gray-600 dark:bg-gray-800/50 dark:text-gray-900 dark:placeholder-gray-500 dark:focus:border-gray-900"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7ea2d4] to-[#5b8ac4] px-8 py-4 font-semibold text-white shadow-lg shadow-[#7ea2d4]/25 transition-all hover:shadow-xl hover:shadow-[#7ea2d4]/30 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-900 dark:text-white sm:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin dark:text-white" />
                  {t("common.loading")}
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 dark:text-white" />
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
