import { Crown, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "@store/slices/authSlice";
import type { RootState, AppDispatch } from "@app/store";
import { useNavigate, useSearchParams } from "react-router";
import { AppRoutes } from "@routes/routes";
import { translatePbError } from "@api/pbErrors";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading, error } = useSelector(
    (state: RootState) => state.auth,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const resultAction = await dispatch(
      loginUser({ email: email.trim(), password }),
    );
    if (loginUser.fulfilled.match(resultAction)) {
      const redirect = searchParams.get("redirect");
      navigate(redirect || "/app");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
      <div className="bg-card/40 backdrop-blur-xl border border-border rounded-lg p-4 md:p-6 shadow-xl">
        <div className="space-y-4">
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
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full cursor-pointer mt-6 px-4 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
          disabled={loading}
        >
          {loading ? "Входим..." : "Войти въ градъ"}
        </button>
        {error && (
          <div className="mt-2 text-red-500 text-sm text-center">
            {translatePbError(error)}
          </div>
        )}
      </div>

      {/* Register Link */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Нѣтъ входа въ градъ?{" "}
          <button
            type="button"
            className="text-primary hover:text-primary/80 font-medium transition-colors"
            onClick={() => navigate(AppRoutes.REGISTER)}
          >
            Зарегистрироваться
          </button>
        </p>
      </div>
    </form>
  );
};
