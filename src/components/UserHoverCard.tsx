import { Loader2, MicOff, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { getUserById, User as TUser } from "@api/userApi";

interface UserHoverCardProps {
  id: string;
  isMuted: boolean;
  isSpeaking: boolean;
  isLocal: boolean;
}

export function UserHoverCard({
  id,
  isMuted,
  isSpeaking,
  isLocal,
}: UserHoverCardProps) {
  const dispatch = useAppDispatch();
  const volume = useAppSelector((state) => state.room.volumes[id] || 100);

  const [isHovered, setIsHovered] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [loading, setLoading] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<any>(null);

  const [userData, setUserData] = useState<TUser | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      const data = await getUserById(id);
      setUserData({ ...data } as any);
      setLoading(false);
    };

    fetchUserData();
  }, [id]);

  const Icon = userData?.avatar_url || User;

  useEffect(() => {
    if (isHovered && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const cardWidth = 320;
      const cardHeight = 280;

      let left = rect.right + 10;
      let top = rect.top;

      // Проверяем, не выходит ли карточка за правый край экрана
      if (left + cardWidth > window.innerWidth) {
        left = rect.left - cardWidth + 20;
      }

      // Проверяем, не выходит ли карточка за нижний край экрана
      if (top + cardHeight > window.innerHeight) {
        top = window.innerHeight - cardHeight - 10;
      }

      // Проверяем, не выходит ли карточка за верхний край экрана
      if (top < 10) {
        top = 10;
      }

      setPosition({ top, left });
    }
  }, [isHovered]);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 500);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsHovered(false);
  };

  if (loading || !userData) {
    return (
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block"
      >
        <Loader2 size={16} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block"
      >
        <div
          title={userData.username}
          className={`
              relative
              w-7 h-7 rounded-full border-2 border-background
              flex items-center justify-center text-xs font-bold
              ${isSpeaking ? "border-primary shadow-lg shadow-primary/20" : ""}
              ${isLocal ? "bg-violet-600 text-white" : "bg-muted text-foreground"}
            `}
        >
          {isMuted && (
            <MicOff
              size={12}
              className="
      absolute -bottom-1 -right-1
      text-red-500 bg-background rounded-full p-[1px]
    "
            />
          )}
          {userData.avatar_url ? (
            <img
              src={userData.avatar_url}
              alt="Avatar"
              className="w-7 h-7 rounded-full object-cover"
            />
          ) : (
            userData.username
          )}
        </div>
      </div>
    </>
  );
}
