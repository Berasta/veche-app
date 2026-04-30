import { motion } from "motion/react";
import { Castle } from "lucide-react";

export const AppPage = () => {
  return (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
      {/* Декоративный фон */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        className="w-full max-w-md mx-auto px-6 relative z-10 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Иконка */}
        <motion.div
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 mb-6"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Castle className="w-10 h-10 text-primary" strokeWidth={1.5} />
        </motion.div>

        {/* Приветствие */}
        <motion.h1
          className="text-3xl font-semibold text-foreground mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Добро пожаловать
        </motion.h1>

        <motion.p
          className="text-muted-foreground leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Выберите градъ изъ списка слѣва или створите новый,
          <br />
          чтобы начать общение
        </motion.p>
      </motion.div>
    </div>
  );
};
