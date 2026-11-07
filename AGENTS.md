# Agent instructions — Login & Register Studio

## Unslop (Codex-ready)

When humanizing or rewriting **user-facing copy** (UI labels, tips, toasts, empty states, OTP, dock, bot lines — Thai or English):

1. Read **`.agents/skills/unslop/SKILL.md`**
2. Read **`.agents/skills/unslop/references/core-contract.md`** (authoritative rewrite contract)
3. For short UI strings, use preset **`.agents/skills/unslop/presets/crisp-human.md`**
4. Follow rewrite flow in **`.agents/skills/unslop/references/commands/rewrite.md`**

**Shipped path (use this):** `.agents/skills/unslop/`  
**Local full clone (optional, not in git):** `/workspace/unslop`

Do not invent marketing filler. Prefer human, short, concrete Thai for ม.5. Leave product facts (teacher code flow, export behavior, density lock) intact.

## Product notes (don’t fight these)

- Layout B: hero + canvas + thin dock; soft blue accent; Spark-soft surfaces
- Canvas: freer grid (side-by-side / resize); **inline click-to-type** for ชื่อ; compact ประเภท select on the item
- Density lock: calm first viewport (`approved-clean-layout`)
- Bot name: **ครูชิโร่**; clear confirm before destructive wipe
