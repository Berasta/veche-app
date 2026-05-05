import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "@store/slices/authSlice";
import type { RootState, AppDispatch } from "@app/store";
import { useNavigate, useSearchParams } from "react-router";
import { AppRoutes } from "@routes/routes";
import { translatePbError } from "@api/pbErrors";

export const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (password !== confirmPassword) {
      setLocalError("Тайныꙗ слова не совпадаютъ");
      return;
    }

    const resultAction = await dispatch(
      registerUser({
        username: username.trim(),
        email: email.trim(),
        password,
      }),
    );
    if (registerUser.fulfilled.match(resultAction)) {
      const redirect = searchParams.get("redirect");
      navigate(redirect || "/app");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
      <div className="bg-card/40 backdrop-blur-xl border border-border rounded-lg p-4 md:p-6 shadow-xl">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border/50">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center ring-1 ring-primary/20 flex-shrink-0">
            <img src="/logo.svg" alt="Вече" className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Вступити въ градъ</h3>
            <p className="text-[11px] text-muted-foreground">Создайте своё имя боярина</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Имя боярина
            </label>
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                strokeWidth={2}
              />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Посадникъ Василій"
                className="w-full bg-input-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Электронная грамота
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                strokeWidth={2}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vasily@novgorod.rus"
                className="w-full bg-input-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Тайное слово
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                strokeWidth={2}
              />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-input-background border border-border rounded-lg pl-10 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" strokeWidth={2} />
                ) : (
                  <Eye className="w-4 h-4" strokeWidth={2} />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Повторите тайное слово
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                strokeWidth={2}
              />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-input-background border border-border rounded-lg pl-10 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" strokeWidth={2} />
                ) : (
                  <Eye className="w-4 h-4" strokeWidth={2} />
                )}
              </button>
            </div>
          </div>

          {/* Terms */}
          <div className="flex items-start gap-2">
            <input type="checkbox" required className="mt-1" />
            <label className="text-xs text-muted-foreground">
              Я принимаю{" "}
              <button
                type="button"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                Правила града
              </button>{" "}
              и{" "}
              <button
                type="button"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                Политику конфиденціальности
              </button>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full mt-6 px-4 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 cursor-pointer"
          disabled={loading}
        >
          {loading ? "Входимъ..." : "Вступити въ градъ"}
        </button>
        {(localError || error) && (
          <div className="mt-2 text-red-500 text-sm text-center">
            {translatePbError(localError || error || "")}
          </div>
        )}
      </div>

      {/* Login Link */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Уже есть входъ?{" "}
          <button
            type="button"
            className="text-primary hover:text-primary/80 font-medium transition-colors cursor-pointer"
            onClick={() => navigate(AppRoutes.LOGIN)}
          >
            Войти
          </button>
        </p>
      </div>
    </form>
  );
};
