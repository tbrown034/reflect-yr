// Export all list theme components
export { default as ListThemeAwards } from "./ListThemeAwards";
export { default as ListThemeBracket } from "./ListThemeBracket";
export { default as ListThemeClassic } from "./ListThemeClassic";
export { default as ListThemeCountdown } from "./ListThemeCountdown";
export { default as ListThemeFamilyFeud } from "./ListThemeFamilyFeud";
export { default as ListThemeMagazine } from "./ListThemeMagazine";
export { default as ListThemeMinimalist } from "./ListThemeMinimalist";
export { default as ListThemeNewspaper } from "./ListThemeNewspaper";
export { default as ListThemePodium } from "./ListThemePodium";
export { default as ListThemePolaroid } from "./ListThemePolaroid";
export { default as ListThemePosterGrid } from "./ListThemePosterGrid";
export { default as ListThemeScoreboard } from "./ListThemeScoreboard";
export { default as ListThemeVHS } from "./ListThemeVHS";
export { default as ListThemeVinyl } from "./ListThemeVinyl";
export { default as ListThemeWrapped } from "./ListThemeWrapped";

// Theme renderer component
import ListThemeAwards from "./ListThemeAwards";
import ListThemeBracket from "./ListThemeBracket";
import ListThemeClassic from "./ListThemeClassic";
import ListThemeCountdown from "./ListThemeCountdown";
import ListThemeFamilyFeud from "./ListThemeFamilyFeud";
import ListThemeMagazine from "./ListThemeMagazine";
import ListThemeMinimalist from "./ListThemeMinimalist";
import ListThemeNewspaper from "./ListThemeNewspaper";
import ListThemePodium from "./ListThemePodium";
import ListThemePolaroid from "./ListThemePolaroid";
import ListThemePosterGrid from "./ListThemePosterGrid";
import ListThemeScoreboard from "./ListThemeScoreboard";
import ListThemeVHS from "./ListThemeVHS";
import ListThemeVinyl from "./ListThemeVinyl";
import ListThemeWrapped from "./ListThemeWrapped";

const THEME_COMPONENTS = {
  awards: ListThemeAwards,
  bracket: ListThemeBracket,
  classic: ListThemeClassic,
  countdown: ListThemeCountdown,
  "family-feud": ListThemeFamilyFeud,
  magazine: ListThemeMagazine,
  minimalist: ListThemeMinimalist,
  newspaper: ListThemeNewspaper,
  podium: ListThemePodium,
  polaroid: ListThemePolaroid,
  "poster-grid": ListThemePosterGrid,
  scoreboard: ListThemeScoreboard,
  vhs: ListThemeVHS,
  vinyl: ListThemeVinyl,
  wrapped: ListThemeWrapped,
};

export function ListThemeRenderer({
  list,
  theme = "classic",
  accentColor,
  isEditable = false,
  onUpdateComment,
  onUpdateRating,
}) {
  const ThemeComponent = THEME_COMPONENTS[theme] || ListThemeClassic;

  return (
    <ThemeComponent
      list={list}
      accentColor={accentColor || list?.accentColor}
      isEditable={isEditable}
      onUpdateComment={onUpdateComment}
      onUpdateRating={onUpdateRating}
    />
  );
}
