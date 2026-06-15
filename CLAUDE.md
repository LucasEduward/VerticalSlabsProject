# CLAUDE.md

This file provides guidance for AI assistants (and other contributors) working
in this repository.

## Project overview

**Vertical Slabs** is a Minecraft: Bedrock Edition addon (behavior pack) that
adds vertical slab blocks (slabs oriented on a vertical face instead of the
usual horizontal half-block). It's a single-pack addon combining data
(blocks, loot tables) and a server-side script (`@minecraft/server` API).

- Pack name (manifest): `Vertical Slabs`
- Namespace/prefix used throughout: `vs:` (e.g. `vs:oak_planks_vertical_slab`)
- Target API: `@minecraft/server` `2.7.0`
- `min_engine_version`: `1.21.100`

## Repository layout

```
manifest.json              # Addon manifest (data module + script module)
package.json               # npm deps (@minecraft/server, etc.)
package-lock.json

blocks/rc_vs/               # Custom block definitions (JSON)
  new_slab.json              # Template/skeleton for new vertical slab blocks
  oak_planks_vertical_slab.json
  cherry_planks_vertical_slab.json

loot_tables/blocks/vertical_slabs/
  vertical_slab_table.json    # Drops 1 slab item (single slab broken)
  vs_double_slab_table.json   # Drops 2 slab items (double/combined slab broken)

scripts/rc_vs/
  main.js                 # Entry point (registered in manifest as the script module)
  lucas_functions.js      # Helper functions used by main.js

.AddCompLib/global.json   # Config for an "Add-on Component Library" build tool
                           # (tracks "simple" files to merge — currently empty)
```

## How vertical slabs work (core mechanic)

Each vertical slab block has a `vs:half` block state (`"front"`, `"back"`,
and for some blocks `"double"`), plus a `minecraft:cardinal_direction` trait
for placement rotation.

- `scripts/rc_vs/main.js`:
  - Listens to `playerInteractWithBlock` (before event) to figure out which
    half of the block space the player is targeting, based on the face
    clicked (`Up`/`Down` vs. side faces) and the player's cardinal facing
    direction (via `getCardinalDir`).
  - Computes `slab_region` (`"front"` / `"back"`) which is then applied to
    the block being placed via a custom component.
  - If a player clicks an existing vertical slab with a matching slab item on
    the *opposite* exposed face, the two slabs are merged into a `"double"`
    (full block) state instead of placing a new block.
  - Registers a custom block component `vs:slab_placement` (via
    `blockComponentRegistry.registerCustomComponent` in
    `system.beforeEvents.startup`) whose `beforeOnPlayerPlace` hook applies
    the computed `vs:half` state to the placed permutation.

- `scripts/rc_vs/lucas_functions.js`:
  - `getCardinalDir(player)` — maps player yaw to `"north"/"south"/"east"/"west"`.
  - `getOppositeFace(block, blockface)` — given the currently visible half
    (`vs:half`) of a block and the face being clicked, determines whether the
    opposite face is exposed (used for double-slab merging).
  - `fixInvertedValue(...)` — normalizes face-hit coordinates depending on
    block position sign and cardinal direction, since raw face coordinates
    are mirrored depending on which side of the world origin the block is on.

- Block JSON files (`blocks/rc_vs/*.json`):
  - Define `vs:half` states, geometry (`geometry.v_slab`), textures, collision
    and selection boxes for each half (front/back/double), redstone
    conductivity, liquid detection, and loot tables.
  - Use `permutations` blocks keyed on `q.block_state('vs:half')` and
    `q.block_state('minecraft:cardinal_direction')` to swap geometry,
    collision/selection boxes, and rotation per state.
  - `cherry_planks_vertical_slab.json` and `oak_planks_vertical_slab.json`
    are slightly inconsistent in their state naming (cherry uses a single
    `vs:half` with a `"double"` value; oak uses a separate `vs:is_double`
    boolean alongside `vs:half`). Be aware of this when adding new wood
    variants — match the convention of whichever existing block you're
    extending, and consider unifying eventually.

## Adding a new vertical slab wood type

1. Copy an existing block JSON (prefer `cherry_planks_vertical_slab.json`'s
   `vs:half` ["front","back","double"] convention for new blocks) or use
   `blocks/rc_vs/new_slab.json` as a bare-bones starting skeleton.
2. Update `description.identifier` to `vs:<wood>_vertical_slab` and update all
   `texture` references under `minecraft:material_instances` /
   `minecraft:item_visual` to the new wood's texture name.
3. Point `minecraft:loot` to
   `loot_tables/blocks/vertical_slabs/vertical_slab_table.json` (single) and
   the `"double"`/`"is_double"` permutation to
   `loot_tables/blocks/vertical_slabs/vs_double_slab_table.json`, updating the
   `name` field in both loot tables to the new block's identifier if you
   create wood-specific loot tables.
4. The custom component `vs:slab_placement` and the interaction logic in
   `scripts/rc_vs/main.js` are generic — they apply to any block whose
   `typeId` starts with `vs:` and ends with `_vertical_slab`, so no script
   changes are needed for a straightforward new wood variant.

## Conventions

- All custom identifiers (blocks, block states, components, loot tables) use
  the `vs:` namespace.
- Block geometry identifier is shared across all slab blocks:
  `geometry.v_slab`.
- Debug logging uses `console.warn(...)`, often with `JSON.stringify` and
  Minecraft `§`-color codes — many of these are left in as commented-out
  debug lines; follow existing style if adding more temporary debug output,
  but prefer removing/cleaning up debug logging in finished features.

## Development notes

- This is a content/script addon for Minecraft Bedrock — there is no build
  step, test suite, or linter configured. Validate changes by loading the
  pack in Minecraft Bedrock (or Bedrock Dedicated Server) with the behavior
  pack applied to a world.
- `node_modules/` is gitignored; `package.json` only lists `@minecraft/server`
  (and an unrelated placeholder `node.js` dependency) for editor
  type-checking/IntelliSense — it is not used at runtime by the game.
- `.AddCompLib/global.json` belongs to an external "Add-on Component Library"
  tool (for merging/splitting "simple" JSON files); it's currently empty and
  not actively used but should be left in place.
