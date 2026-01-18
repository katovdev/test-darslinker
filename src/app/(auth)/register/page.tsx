"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "@/hooks/use-locale";
import authService from "@/services/auth";

export default function RegisterPage() {
  const t = useTranslations();

  return (
    <Card>
      <CardContent className="p-6">
        <h1 className="mb-1 text-center text-xl font-semibold">
          {t("auth.register")}
        </h1>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          {t("auth.registerViaTelegram")}
        </p>

        <Button
          onClick={() => authService.openTelegramBot()}
          className="w-full bg-[#0088cc] text-white hover:bg-[#0077b3]"
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.015-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.44-.751-.245-1.349-.374-1.297-.789.027-.216.324-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.141.12.098.153.228.166.331.014.103.03.336.017.519z" />
          </svg>
          {t("auth.openTelegramToRegister")}
        </Button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t("auth.hasAccount")}{" "}
          <Link href="/login" className="font-medium text-link hover:underline">
            {t("auth.signIn")}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
