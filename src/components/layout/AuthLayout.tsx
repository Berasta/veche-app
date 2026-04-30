import { useAuth } from "@store/hooks/useAuth";
import { useEffect } from "react";
import { Outlet, useNavigate, useSearchParams } from "react-router";

export const AuthLayout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  useEffect(() => {
    if (isAuthenticated) {
      const redirect = searchParams.get("redirect");
      navigate(redirect && redirect !== "/" ? redirect : "/app");
    }
  }, [isAuthenticated]);

  return (
    <div className="size-full flex items-center justify-center bg-gradient-to-br from-background via-background to-card relative overflow-hidden">
      {/* Фоновая текстура */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' /%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />

      {/* Декоративные элементы */}
      <div className="hidden md:block absolute top-10 left-10 w-32 h-32 border-2 border-primary/10 rounded-lg rotate-12" />
      <div className="hidden md:block absolute bottom-20 right-20 w-40 h-40 border-2 border-accent/10 rounded-lg -rotate-6" />

      <div className="w-full max-w-md px-4 md:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4 ring-2 ring-primary/10">
            <span className="text-2xl font-bold text-primary" style={{ fontFamily: "'Old Standard TT', Georgia, serif" }}>В</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 tracking-wide" style={{ fontFamily: "'Old Standard TT', Georgia, serif" }}>
            Вече
          </h1>
          <div className="ornament-divider justify-center mb-3">
            <span>❦</span>
          </div>
          <p className="text-sm text-muted-foreground">Войдите въ свой градъ</p>
        </div>
        <Outlet />

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>© 7534 отъ сотворенія мира</p>
          <p className="mt-1">Градословъ • Древнерусскій мессенджеръ</p>
        </div>
      </div>
    </div>
  );
};
