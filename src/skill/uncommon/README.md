# uncommon

A portable Claude skill for art-directed, interactive websites with a point of view. It combines a practical creative workflow, reference research, motion engineering, and an honest shipping standard. It works from real sources such as Skiper UI, GSAP, Motion, Anime.js, Bklit UI, Land-book, and Codrops, choosing each for the problem at hand rather than installing everything. For a requested or appropriate dimensional logo, 3D Logo Lab is an optional resource, subject to asset rights, consent, legitimate access, and verified exports.

## Install in Claude Code

Extract the `uncommon` folder into your project's `.claude/skills` directory. The result must be:

```text
.claude/skills/uncommon/SKILL.md
```

From the project root on a system with unzip:

```sh
mkdir -p .claude/skills
unzip ~/Downloads/uncommon.zip -d .claude/skills
```

Adjust the path to your actual download location. To make the skill available across projects, put the folder in `~/.claude/skills/` instead. Start Claude Code in your project and ask it to use uncommon, or invoke `/uncommon` if supported by your version.

## Install in Claude.ai

Open Customize > Skills and upload the ZIP, then enable it. The ZIP must contain the `uncommon` directory itself, with `SKILL.md` inside. Account capabilities and menu labels can vary. Follow the current official instructions at https://claude.com/docs/skills/how-to if your interface differs.

The skill does not grant browser or file-system tools. Browsing research requires tools available in your Claude environment. A chat-only environment may produce an implementation artifact rather than edit a local repository.

## Example Request

"Use uncommon to build an expressive site for an independent sound studio. Make it tactile and precise, with one signature interaction and a clear inquiry action. Research real references, explain what you adapt, and verify the mobile and reduced-motion versions."

## Contents

- `SKILL.md`: the end-to-end workflow and non-negotiable standards.
- `references/art-direction.md`: composition, typography, imagery, specificity.
- `references/research-and-sourcing.md`: browsing workflow, official sources, licenses.
- `references/interaction-patterns.md`: twelve behavior families and when to use them.
- `references/3d-branding.md`: optional 3D Logo Lab workflow, mark permissions, dimensional assets, and performant character scenes.
- `references/motion-recipes.md`: scoped React animation recipes and engineering rules.
- `references/quality-assurance.md`: functional, accessibility, responsive, and performance checks.
- `assets/creative-brief.md`: a practical direction and motion-score template.
- `evals/test-prompts.md`: scenarios for evaluating the skill against an unassisted baseline.

## Use and Attribution

The original instructions and templates in this skill may be freely used, modified, and shared. They do not include third-party component source. All external code, libraries, fonts, photography, and assets retain their own licenses and access conditions. Verify those conditions for your intended use.

The motion recipes are starting patterns, not a guarantee of compatibility with every project. Check current official documentation, adapt to the installed version, and run your build and interaction tests.

This is an independent resource. It is not an official Anthropic, Skiper UI, GSAP, or Motion product and is not endorsed by them.