import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { getInviteByCode, incrementInviteUse } from "@api/inviteApi";
import { addServerMember } from "@api/memberApi";
import { pb } from "@api/pb";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

function setMeta(title: string, description: string, image?: string) {
  document.title = title;
  const set = (name: string, content: string) => {
    let el = document.querySelector(`meta[property="${name}"]`) as HTMLMetaElement | null;
    if (!el) { el = document.createElement("meta"); el.setAttribute("property", name); document.head.appendChild(el); }
    el.setAttribute("content", content);
  };
  set("og:title", title);
  set("og:description", description);
  set("twitter:title", title);
  set("twitter:description", description);
  if (image) { set("og:image", image); set("twitter:image", image); }
}

export function InvitePage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "valid" | "invalid">("loading");
  const [serverName, setServerName] = useState<string | null>(null);

  useEffect(() => {
    if (!code) { setStatus("invalid"); return; }

    setMeta("Вече — Приглашенiе", "Провѣрка приглашенiя...");

    (async () => {
      try {
        const invite = await getInviteByCode(code);
        if (!invite) { setStatus("invalid"); return; }
        if (invite.expires_at && new Date(invite.expires_at) < new Date()) { setStatus("invalid"); return; }
        if (invite.max_uses && invite.use_count >= invite.max_uses) { setStatus("invalid"); return; }

        let name = "Градъ";
        try {
          const server = await pb.collection("servers").getOne(invite.server_id);
          name = server.name;
          setServerName(name);
          setMeta(
            `Приглашенiе въ "${name}"`,
            `Васъ приглашаютъ въ градъ "${name}" на Вече. Присоединяйтесь къ бесѣдѣ!`,
            undefined,
          );
        } catch {}

        await addServerMember(invite.server_id);
        await incrementInviteUse(invite.id);
        setStatus("valid");

        setTimeout(() => navigate(`/app/server/${invite.server_id}`), 1500);
      } catch {
        setMeta("Приглашенiе не дѣйствительно", "Срокъ истекъ или превышенъ лимитъ использованiй");
        setStatus("invalid");
      }
    })();
  }, [code, navigate]);

  return (
    <div className="h-screen w-full flex items-center justify-center bg-background">
      <div className="text-center">
        {status === "loading" && (
          <>
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Провѣрка приглашенiя...</p>
          </>
        )}
        {status === "valid" && (
          <>
            <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-4" />
            <p className="text-sm text-foreground font-medium mb-1">Приглашенiе принято!</p>
            <p className="text-xs text-muted-foreground">
              {serverName ? `Входъ въ "${serverName}"...` : "Перенаправляемъ въ градъ..."}
            </p>
          </>
        )}
        {status === "invalid" && (
          <>
            <XCircle className="w-10 h-10 text-destructive mx-auto mb-4" />
            <p className="text-sm text-foreground font-medium mb-1">Приглашенiе не дѣйствительно</p>
            <p className="text-xs text-muted-foreground">
              Срокъ истекъ или превышенъ лимитъ использованiй
            </p>
          </>
        )}
      </div>
    </div>
  );
}
