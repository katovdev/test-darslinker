"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
    <section className="bg-gray-800 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Section Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            {t("home.contactTitle")}
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            {t("home.contactSubtitle")}
          </p>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="mt-12 space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300">
                {t("home.contactName")}
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="border-gray-600 bg-gray-700/50 text-white placeholder:text-gray-500"
                placeholder={t("home.contactName")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-300">
                {t("home.contactPhone")}
              </Label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center gap-2 pl-4">
                  <span className="text-lg">🇺🇿</span>
                  <span className="text-sm text-gray-400">+998</span>
                </div>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="XX XXX XX XX"
                  className="border-gray-600 bg-gray-700/50 pl-24 text-white placeholder:text-gray-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-gray-300">
              {t("home.contactMessage")}
            </Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, message: e.target.value }))
              }
              rows={5}
              className="border-gray-600 bg-gray-700/50 text-white placeholder:text-gray-500"
              placeholder={t("home.contactMessage")}
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full bg-gradient-to-r from-[#7EA2D4] to-[#5A85C7] text-white hover:opacity-90 sm:w-auto"
            disabled={isLoading}
          >
            {isLoading ? t("common.loading") : t("home.contactSubmit")}
          </Button>
        </form>
      </div>
    </section>
  );
}
