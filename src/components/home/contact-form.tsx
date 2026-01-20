"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Send, Loader2 } from "lucide-react";
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
    <section className="relative px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      {/* Background with gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-gray-800 to-gray-900" />

      <div className="mx-auto max-w-3xl">
        {/* Section Header */}
        <div className="text-center">
          <span className="inline-block rounded-full bg-purple-500/10 px-4 py-1.5 text-sm font-medium text-purple-400">
            {t("home.contactLabel") || "Contact"}
          </span>
          <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            {t("home.contactTitle")}
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            {t("home.contactSubtitle")}
          </p>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="mt-12">
          <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-sm sm:p-8">
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-gray-300"
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
                  className="w-full rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-3 text-white placeholder-gray-500 transition-colors outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  {t("home.contactPhone")}
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center gap-2 pl-4">
                    <span className="text-lg">🇺🇿</span>
                    <span className="text-sm text-gray-500">+998</span>
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    placeholder="XX XXX XX XX"
                    className="w-full rounded-xl border border-gray-700 bg-gray-800/50 py-3 pr-4 pl-24 text-white placeholder-gray-500 transition-colors outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="mt-6">
              <label
                htmlFor="message"
                className="mb-2 block text-sm font-medium text-gray-300"
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
                className="w-full resize-none rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-3 text-white placeholder-gray-500 transition-colors outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-4 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
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
    </section>
  );
}
