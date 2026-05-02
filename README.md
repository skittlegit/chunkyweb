# ChunkyWeb

Next.js (App Router) console for the "Lost in Space" hackathon. Talks to
[ChunkyAPI](../chunkyapi) — runs the planner, scores the schedule, renders
coverage maps, score cards, and a frame table.

## Scoring

Per-case score: `S_orbit = C · (1 + 0.25·η_E + 0.10·η_T) · Q_smear`

Mission total uses the contest weights from `chunkyapi/HANDOFF.md`:

```
S_total = 0.25·S_case1 + 0.35·S_case2 + 0.40·S_case3
```

Reference run against the bundled test cases: `S_total ≈ 1.18`.

## Local development

```powershell
# Backend (separate shell)
cd ..\chunkyapi
.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload

# Frontend
npm install
npm run dev
```

Open http://localhost:3000. Set `NEXT_PUBLIC_API_URL` if the API isn't on
`http://localhost:8000`.

## Layout

- `app/page.tsx` — main console, mission strip, per-case cards
- `components/` — score card, frame table, coverage map, timeline
- `hooks/useRunPass.ts` — plan → simulate → store flow
- `lib/api.ts` — fetch + adapter between the flat backend shape and the
  rich UI types
- `lib/constants.ts` — weight scheme, score ceilings, palette
- `store/useAppStore.ts` — Zustand store (selected case, sliders, results)

## Notes

- Attitude (~35k samples) is sent at full resolution to `/api/simulate`
  because the endpoint differentiates adjacent samples for body rates;
  any stride straddles slew transitions and tanks `Q_smear`. After
  simulate returns, `useRunPass` strips the array before storing the
  plan in Zustand to keep the cache small.
- `settle_margin_s` defaults to `0.3` to match the backend planner.
- Only one weight scheme is exposed (contest weights).
