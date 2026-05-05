import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { getInviteByCode, incrementInviteUse } from "@shared/api/inviteApi";
import { addServerMember } from "@shared/api/memberApi";
import { pb, PB_URL } from "@shared/api/pb";
import { Loader2, Crown, Users, ArrowRight } from "lucide-react";

export function InvitePage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "ready" | "invalid">("loading");
  const [serverName, setServerName] = useState("");
  const [serverAvatar, setServerAvatar] = useState<string | null>(null);
  const [serverId, setServerId] = useState("");
  const [memberCount, setMemberCount] = useState(0);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!code) { setStatus("invalid"); return; }

    (async () => {
      try {
        const invite = await getInviteByCode(code);
        if (!invite) { setStatus("invalid"); return; }
        if (invite.expires_at && new Date(invite.expires_at) < new Date()) { setStatus("invalid"); return; }
        if (invite.max_uses && invite.use_count >= invite.max_uses) { setStatus("invalid"); return; }

        const sid = invite.server_id;
        setServerId(sid);

        try {
          const server = await pb.collection("servers").getOne(sid);
          setServerName(server.name || "Градъ");
          setServerAvatar(server.avatar ? `${PB_URL}/api/files/${server.collectionId}/${server.id}/${server.avatar}` : null);
        } catch {}

        try {
          const members = await pb.collection("server_members").getFullList({ filter: `server_id = "${sid}"` });
          setMemberCount(members.length);
        } catch {}

        setStatus("ready");
      } catch {
        setStatus("invalid");
      }
    })();
  }, [code]);

  const handleJoin = async () => {
    if (!code || joining) return;
    setJoining(true);
    try {
      const invite = await getInviteByCode(code);
      if (!invite) return;
      await addServerMember(invite.server_id);
      await incrementInviteUse(invite.id);
      navigate(`/app/server/${invite.server_id}`);
    } catch {
      setJoining(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-background">
      <div className="w-full max-w-sm mx-4">
        {status === "loading" && (
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-foreground/20 mx-auto" />
            <p className="text-xs text-foreground/30 mt-3">Провѣрка приглашенiя...</p>
          </div>
        )}

        {status === "ready" && (
          <div className="bg-foreground/[0.02] backdrop-blur-xl rounded-2xl overflow-hidden border border-foreground/5">
            {/* Banner */}
            <div className="relative h-20 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10">
              {serverAvatar && (
                <img src={serverAvatar} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
              )}
            </div>

            <div className="px-5 pb-5 -mt-8">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-foreground/10 ring-4 ring-background flex items-center justify-center mb-3 shadow-lg">
                {serverAvatar ? (
                  <img src={serverAvatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Crown className="w-7 h-7 text-foreground/30" strokeWidth={1.5} />
                )}
              </div>

              {/* Info */}
              <h2 className="text-lg font-bold text-foreground/90 mb-0.5">{serverName || "Градъ"}</h2>
              <div className="flex items-center gap-1.5 text-xs text-foreground/40 mb-4">
                <Users className="w-3 h-3" strokeWidth={1.5} />
                <span>{memberCount} участник{memberCount === 1 ? "" : memberCount < 5 ? "а" : "ов"}</span>
              </div>

              {/* Server ID subtle */}
              <p className="text-[10px] text-foreground/15 font-mono mb-4">id: {serverId.slice(0, 8)}</p>

              {/* Join button */}
              <button onClick={handleJoin} disabled={joining}
                className="w-full py-2.5 rounded-xl bg-foreground/10 hover:bg-foreground/15 text-foreground/80 text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-40">
                {joining ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <><ArrowRight className="w-4 h-4" strokeWidth={1.5} /> Присоединиться</>
                )}
              </button>
            </div>
          </div>
        )}

        {status === "invalid" && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-destructive/50" strokeWidth={1.5} />
            </div>
            <h2 className="text-base font-semibold text-foreground/80 mb-1">Приглашенiе не дѣйствительно</h2>
            <p className="text-xs text-foreground/40">Срокъ истекъ или превышенъ лимитъ использованiй</p>
          </div>
        )}
      </div>
    </div>
  );
}
