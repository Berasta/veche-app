import { MessageSquare } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";

interface Props {
  channelId: string;
  channelName: string;
  serverId: string;
  index: number;
}

export function TextPalata({ channelId, channelName, serverId, index }: Props) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/app/server/${serverId}/text/${channelId}`);
  };

  return (
    <motion.button
      onClick={handleClick}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ y: -2 }}
      className="cursor-pointer w-full px-2 py-1.5 rounded-md text-left transition-all duration-100 flex items-center gap-2 group hover:bg-muted/50 text-muted-foreground hover:text-foreground"
    >
      <MessageSquare size={16} strokeWidth={2} />
      <span>{channelName}</span>
    </motion.button>
  );
}
