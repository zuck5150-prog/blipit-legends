# Baseball Playoff Roguelite

This fork uses Ballgame as the proven baseball simulation foundation.

## Non-negotiable development rule

Do not rewrite the baseball simulation engine during the initial roguelite conversion. Existing baseball tests remain the safety net. New gameplay systems are layered around the engine.

## Core run loop

1. New Run
2. Choose a team
3. Generate postseason bracket
4. Play a playoff game using the existing Ballgame engine
5. Update best-of-series result
6. If the player wins, continue the series or advance
7. Award a roguelite reward at defined checkpoints
8. Apply roster/perk changes to the current run
9. Lose the elimination game/series -> run ends
10. Win the championship -> run victory

## Initial playoff structure

- Wild Card: best-of-3
- Division Series: best-of-5
- Championship Series: best-of-7
- Championship: best-of-7

The bracket/run layer owns progression. Ballgame owns baseball-game resolution.

## Milestone 0 — Baseline

- Preserve GPL-3.0 license and upstream attribution.
- CI must pass typecheck, tests, coverage, and production build.
- Confirm an unchanged complete baseball game can be played.

## Milestone 1 — Playoff Run shell

- `RunState` model independent from baseball simulation state.
- New Run / Continue Run entry points.
- Team selection.
- Bracket generation and bracket screen.
- Current series screen with wins/losses and next game.
- Elimination and championship states.
- Local persistence only; no Supabase requirement.

## Milestone 2 — Rewards

- Postgame/postseries reward screen.
- Three-choice reward draft.
- Persistent run-only upgrades.
- Initial reward families: hitter boost, pitcher boost, stamina recovery, scouting, bullpen, defense, baserunning.

## Milestone 3 — Roster building

- Acquire players during a run.
- Postseason roster management.
- Bench/bullpen/rotation decisions.
- Reward and roster effects feed into Ballgame through a narrow adapter instead of modifying core rules.

## Architecture boundary

`Roguelite Run -> Game Adapter -> Existing Ballgame Engine -> Game Result -> Run Progression`

The run system may alter player/team inputs and consume game results. It must not duplicate balls, strikes, outs, baserunner, inning, substitution, or scoring rules.

## Testing gate

Every milestone must keep the existing CI green. Add deterministic tests for bracket progression, elimination, rewards, persistence, and run victory before expanding the feature set.
