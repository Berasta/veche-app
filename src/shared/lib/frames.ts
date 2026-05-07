export const FRAME_CLASSES: Record<string, string> = {
  frame_royal: "ring-2 ring-yellow-500",
  frame_violet: "ring-2 ring-violet-500",
  frame_ruby: "ring-2 ring-red-500",
  frame_ancient: "ring-2 ring-transparent animate-[frame-ancient_2s_ease-in-out_infinite]",
  frame_arcane: "ring-2 ring-transparent animate-[frame-arcane_2.5s_ease-in-out_infinite]",
  frame_rainbow: "ring-2 ring-transparent animate-[frame-rainbow_3s_linear_infinite]",
  frame_neon: "ring-2 ring-transparent animate-[frame-neon_1.5s_ease-in-out_infinite]",
  frame_fire: "ring-2 ring-transparent animate-[frame-flame_3s_ease-in-out_infinite]",
  frame_ice: "ring-2 ring-transparent animate-[frame-ice_3s_ease-in-out_infinite]",
  frame_shadow: "ring-2 ring-transparent animate-[frame-shadow_2s_ease-in-out_infinite]",
  frame_shine: "ring-2 ring-transparent animate-[frame-shine_3s_linear_infinite]",
  frame_aura: "ring-2 ring-transparent animate-[frame-aura_2.5s_ease-in-out_infinite]",
  frame_holo: "ring-2 ring-transparent animate-[frame-holo_4s_linear_infinite]",
  frame_pulsar: "ring-2 ring-transparent animate-[frame-pulsar_3s_ease-in-out_infinite]",
  frame_matrix: "ring-2 ring-transparent animate-[frame-matrix_2s_linear_infinite]",
  frame_stardust: "ring-2 ring-transparent animate-[frame-stardust_4s_ease-in-out_infinite]",
  frame_arc: "ring-2 ring-transparent animate-[frame-arc_2s_linear_infinite]",
  frame_storm: "ring-2 ring-transparent animate-[frame-storm_6s_ease-in-out_infinite]",
};

export const FRAME_LABELS: Record<string, string> = {
  frame_royal: "Царская",
  frame_violet: "Боярская",
  frame_ruby: "Рубиновая",
  frame_ancient: "Древнее сіяніе",
  frame_arcane: "Чародѣйскій",
  frame_rainbow: "Радужная",
  frame_neon: "Неоновая",
  frame_fire: "Пламенная",
  frame_ice: "Ледяная",
  frame_shadow: "Призрачная",
  frame_shine: "Блестящая",
  frame_aura: "Аура",
  frame_holo: "Голографическая",
  frame_pulsar: "Пульсар",
  frame_matrix: "Матрица",
  frame_stardust: "Звѣздная пыль",
  frame_arc: "Электродуга",
  frame_storm: "Гроза",
};

export const FRAME_IDS = Object.keys(FRAME_CLASSES);

export function getFrameClass(frame: string): string {
  return FRAME_CLASSES[frame] || "ring-2 ring-card";
}
