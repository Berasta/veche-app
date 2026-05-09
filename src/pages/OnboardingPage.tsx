import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { MessageSquare, Volume2, Users, Crown, ArrowRight } from "lucide-react";

const OFFICIAL_INVITE_CODE = "2kgUSlAXMN4E";

const STEPS = [
  {
    icon: MessageSquare,
    title: "Палаты",
    desc: "Текстовыя и голосовыя палаты для общенiя съ людьми града своего",
  },
  {
    icon: Volume2,
    title: "Гласъ",
    desc: "Голосовая связь съ шумоподавленiемъ и демонстрацiей экрана",
  },
  {
    icon: Users,
    title: "Люди",
    desc: "Списокъ участниковъ съ распредѣленiемъ по ролямъ",
  },
  {
    icon: Crown,
    title: "Грады",
    desc: "Создавайте собственныя сообщества и приглашайте людей",
  },
];

export function OnboardingPage() {
  const navigate = useNavigate();

  const handleJoinOfficial = () => {
    localStorage.setItem("onboarding_seen", "true");
    navigate(`/invite/${OFFICIAL_INVITE_CODE}`, { replace: true });
  };

  const handleSkip = () => {
    localStorage.setItem("onboarding_seen", "true");
    navigate("/app", { replace: true });
  };

  return (
    <div className="h-dvh w-screen overflow-y-auto bg-gradient-to-b from-background via-background to-muted/20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-6 pt-16 pb-12">
        {/* Logo & Title */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 mb-5 ring-1 ring-primary/20">
            <span className="text-3xl font-serif text-primary">В</span>
          </div>
          <h1 className="text-3xl font-semibold text-foreground mb-2 tracking-tight">
            Добро пожаловать въ <span className="text-primary">Вече</span>
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            Древнерусскiй мессенджеръ — общайтесь гласомъ и грамотою въ палатахъ своихъ
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-3 mb-10">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
              className="flex items-start gap-4 p-4 rounded-xl bg-card/40 backdrop-blur-sm border border-border/50 hover:border-primary/20 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <step.icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-foreground mb-0.5">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Official server invite */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 ring-1 ring-primary/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0 ring-1 ring-primary/20">
                <span className="text-lg font-serif text-primary">В</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">Официальный градъ Вече</p>
                <p className="text-xs text-muted-foreground">Общайтесь с командой и другими пользователями</p>
              </div>
            </div>
            <button
              onClick={handleJoinOfficial}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98]"
            >
              Вступить въ градъ
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <button
            onClick={handleSkip}
            className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors underline underline-offset-2"
          >
            Пропустить и войти самостоятельно
          </button>
        </motion.div>

        {/* Footer ornament */}
        <div className="mt-12 text-center text-[10px] text-muted-foreground/30 tracking-[0.3em] font-serif">
          ~ Вече ~
        </div>
      </div>
    </div>
  );
}
