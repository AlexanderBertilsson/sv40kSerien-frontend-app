# Warhammer 40k Faction Icons

Icons sourced from [wh40k-icon](https://github.com/Certseeds/wh40k-icon) repository.

## How to Download Additional Icons

1. Browse available icons at: https://certseeds.github.io/wh40k-icon/
2. Find the icon you want in the GitHub repo structure:
   - **Imperium**: `src/svgs/human_imperium/`
   - **Chaos**: `src/svgs/chaos/` and `src/svgs/chaos/legions/`
   - **Xenos**: `src/svgs/xenos/` with subdirectories for each race

3. Download using the raw URL pattern:
   ```
   https://raw.githubusercontent.com/Certseeds/wh40k-icon/master/src/svgs/{category}/{filename}.svg
   ```

### Example Downloads

**Imperium:**
```bash
curl -O https://raw.githubusercontent.com/Certseeds/wh40k-icon/master/src/svgs/human_imperium/adeptus-astartes.svg
curl -O https://raw.githubusercontent.com/Certseeds/wh40k-icon/master/src/svgs/human_imperium/grey-knights.svg
```

**Chaos Legions:**
```bash
curl -O https://raw.githubusercontent.com/Certseeds/wh40k-icon/master/src/svgs/chaos/legions/black-legion.svg
curl -O https://raw.githubusercontent.com/Certseeds/wh40k-icon/master/src/svgs/chaos/legions/death-guard.svg
```

**Xenos:**
```bash
curl -O https://raw.githubusercontent.com/Certseeds/wh40k-icon/master/src/svgs/xenos/tyranids.svg
curl -O https://raw.githubusercontent.com/Certseeds/wh40k-icon/master/src/svgs/xenos/orks/orks.svg
curl -O https://raw.githubusercontent.com/Certseeds/wh40k-icon/master/src/svgs/xenos/tau_empire/tau-sept.svg
curl -O https://raw.githubusercontent.com/Certseeds/wh40k-icon/master/src/svgs/xenos/necrons/szarekhan.svg
curl -O https://raw.githubusercontent.com/Certseeds/wh40k-icon/master/src/svgs/xenos/eldar/craftworld-eldar.svg
```

## Adding New Icons to the App

After downloading an SVG file to this directory:

1. Add an import in `src/components/FactionIcon.tsx`
2. Add a mapping entry in the `FACTION_ICONS` object
3. Optionally add aliases in `FACTION_ALIASES` for alternative names

## Repository Structure

```
src/svgs/
├── chaos/
│   ├── legions/          # Traitor Legions (Black Legion, Death Guard, etc.)
│   ├── gods/             # Chaos Gods (Khorne, Nurgle, etc.)
│   └── *.svg             # General chaos icons
├── human_imperium/
│   ├── space_marines/    # Chapter-specific icons
│   └── *.svg             # Imperium factions
├── xenos/
│   ├── eldar/            # Craftworlds, Aspect Warriors
│   ├── tau_empire/       # Septs and castes
│   ├── necrons/          # Dynasties
│   ├── orks/             # Clans
│   └── *.svg             # General xenos icons
└── general/              # Battlefield roles, weapons, etc.
```

## License

Icons are from the wh40k-icon project under AGPL-3.0 and CC-BY-NC-SA-4.0 licenses.
