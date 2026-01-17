"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "@/hooks/use-locale";
import authService, { TELEGRAM_BOT } from "@/services/auth";

export default function RegisterPage() {
  const t = useTranslations();

  const openTelegramBot = () => {
    authService.openTelegramBot();
  };

  return (
    <Card className="border-0 bg-white/5 shadow-xl backdrop-blur-sm">
      <CardContent className="p-8">
        <div className="mb-6 flex items-center">
          <Link
            href="/login"
            className="mr-4 rounded-full p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-white">
            {t("auth.register")}
          </h1>
        </div>

        <div className="space-y-6">
          {/* Info box */}
          <div className="rounded-lg bg-blue-900/20 p-4">
            <p className="text-sm text-blue-300">
              {t("auth.registerViaTelegram")}
            </p>
          </div>

          {/* Telegram bot section */}
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#0088cc]/20">
              <svg
                className="h-10 w-10 text-[#0088cc]"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.015-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.44-.751-.245-1.349-.374-1.297-.789.027-.216.324-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.141.12.098.153.228.166.331.014.103.03.336.017.519z" />
              </svg>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white">
                @{TELEGRAM_BOT}
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                {t("auth.telegramBotDescription")}
              </p>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-lg bg-gray-800/50 p-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#7EA2D4] text-xs font-bold text-white">
                1
              </div>
              <p className="text-sm text-gray-300">{t("auth.registerStep1")}</p>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-gray-800/50 p-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#7EA2D4] text-xs font-bold text-white">
                2
              </div>
              <p className="text-sm text-gray-300">{t("auth.registerStep2")}</p>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-gray-800/50 p-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#7EA2D4] text-xs font-bold text-white">
                3
              </div>
              <p className="text-sm text-gray-300">{t("auth.registerStep3")}</p>
            </div>
          </div>

          {/* Open Telegram button */}
          <Button
            type="button"
            onClick={openTelegramBot}
            className="w-full bg-[#0088cc] text-white hover:bg-[#0077b3]"
          >
            <svg
              className="mr-2 h-5 w-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.015-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.44-.751-.245-1.349-.374-1.297-.789.027-.216.324-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.141.12.098.153.228.166.331.014.103.03.336.017.519z" />
            </svg>
            {t("auth.openTelegramToRegister")}
          </Button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            {t("auth.hasAccount")}{" "}
            <Link
              href="/login"
              className="font-medium text-[#7EA2D4] hover:underline"
            >
              {t("auth.signIn")}
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
