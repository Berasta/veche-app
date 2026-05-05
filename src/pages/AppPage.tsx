import { Navigate } from "react-router";
import { motion } from "motion/react";
import { Castle, MessageSquare, Volume2, Users, ArrowRight } from "lucide-react";

export const AppPage = () => {
  const onboardingSeen = localStorage.getItem("onboarding_seen");

  if (!onboardingSeen) {
    return <Navigate to="/app/onboarding" replace />;
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-background relative overflow-hidden min-w-0">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 -left-32 w-96 h-96 bg-foreground/[0.02] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-foreground/[0.015] rounded-full blur-3xl" />
      </div>

      <motion.div
        className="relative z-10 text-center px-6 max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Logo */}
        <motion.div
          className="w-16 h-16 rounded-2xl bg-foreground/[0.03] flex items-center justify-center mx-auto mb-6"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
        >
          <Castle className="w-8 h-8 text-foreground/30" strokeWidth={1.5} />
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-xl font-semibold text-foreground/80 mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          Вече
        </motion.h1>

        <motion.p
          className="text-sm text-foreground/40 leading-relaxed mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          Выберите или создайте градъ, чтобы начать бесѣду
        </motion.p>

        {/* Features */}
        <motion.div
          className="space-y-2 text-left"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          {[
            { icon: MessageSquare, label: "Текстовыя палаты", desc: "Общайтесь грамотами" },
            { icon: Volume2, label: "Голосовыя палаты", desc: "Говорите въ голосъ" },
            { icon: Users, label: "Грады и люди", desc: "Собирайте вмѣстѣ" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-foreground/[0.02]">
              <div className="w-8 h-8 rounded-lg bg-foreground/[0.03] flex items-center justify-center flex-shrink-0">
                <item.icon className="w-4 h-4 text-foreground/30" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground/60">{item.label}</p>
                <p className="text-[10px] text-foreground/30">{item.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Hint */}
        <motion.p
          className="text-[11px] text-foreground/20 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <ArrowRight className="w-3 h-3 inline mr-1" strokeWidth={1.5} />
          Выберите градъ слѣва или создайте новый
        </motion.p>
      </motion.div>
    </div>
  );
};
