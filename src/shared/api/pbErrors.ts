const errorMap: Record<string, string> = {
  "Failed to authenticate.": "Не удалось войти. Провѣрьте почту и тайное слово",
  "Invalid login credentials.": "Не вѣрная почта или тайное слово",
  "The password must be at least 8 characters.": "Тайное слово должно быть не короче 8 знаков",
  "The password must be at least 8 characters": "Тайное слово должно быть не короче 8 знаков",
  "The username is not a valid email address.": "Электронная грамота не вѣрна",
  "The username must be at least 3 characters.": "Имя боярина должно быть не короче 3 знаков",
  "The username must be at least 3 characters": "Имя боярина должно быть не короче 3 знаков",
  "The username must be less than 128 characters.": "Имя боярина слишком длинное",
  "The username must be less than 128 characters": "Имя боярина слишком длинное",
  "The email domain is not allowed.": "Доменъ электронной грамоты не поддерживается",
  "Email is not a valid email.": "Электронная грамота не вѣрна",
  "The email must be a valid email address.": "Электронная грамота не вѣрна",
  "The email must be a valid email address": "Электронная грамота не вѣрна",
  "The email domain is not allowed": "Доменъ электронной грамоты не поддерживается",
};

export function translatePbError(error: string): string {
  for (const [key, value] of Object.entries(errorMap)) {
    if (error.includes(key)) return value;
  }

  if (error.includes("username already exists")) return "Имя боярина уже занято";
  if (error.includes("email already exists")) return "Сія электронная грамота уже зарегистрирована";
  if (error.includes("Validation failed")) {
    const field = error.match(/\/\w+\.(\w+)/)?.[1];
    if (field === "username") return "Имя боярина не подходитъ";
    if (field === "email") return "Электронная грамота не подходитъ";
    if (field === "password") return "Тайное слово не подходитъ";
    return "Провѣрьте правильность заполненія полей";
  }

  if (error.includes("connect ETIMEDOUT") || error.includes("Failed to fetch"))
    return "Не удалось соединиться съ градомъ. Провѣрьте соединеніе";

  return error;
}
