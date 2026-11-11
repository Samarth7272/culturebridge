export type Workshop = { id: string; title: string; cat: string; date: string; capacity: number; registered: number; completed: number; facilitator: string; status: "Published" | "Draft" };
export const CATS = ["Inclusive communication", "Global meeting etiquette", "Cross-cultural feedback", "Remote & hybrid teams", "Allyship & bias", "Client-facing etiquette"];
export const SEED: Workshop[] = [
  { id: "w1", title: "Code Review Feedback Across Cultures", cat: CATS[2], date: "2026-11-24", capacity: 30, registered: 26, completed: 21, facilitator: "Meera Iyer", status: "Published" },
  { id: "w2", title: "Running Inclusive Sprint Meetings", cat: CATS[1], date: "2026-12-02", capacity: 25, registered: 19, completed: 12, facilitator: "Daniel Okafor", status: "Published" },
  { id: "w3", title: "Time-Zone Handovers & Incident Etiquette", cat: CATS[3], date: "2026-12-09", capacity: 40, registered: 33, completed: 27, facilitator: "Meera Iyer", status: "Published" },
  { id: "w4", title: "Allyship and Psychological Safety", cat: CATS[4], date: "2026-12-16", capacity: 20, registered: 8, completed: 0, facilitator: "Sofia Lindqvist", status: "Draft" },
];
export const PEOPLE = ["Ananya Rao", "Lukas Meyer", "Chidi Eze", "Yuki Tanaka", "Priya Nair", "Mateo Silva", "Hana Cho", "Omar Haddad"];
export const SCENARIOS = [
  { id: "s1", title: "The silent stand-up", ctx: "In a distributed stand-up, a new teammate never speaks, even when you ask for blockers.",
    opts: [{ t: "Call them out by name in front of everyone.", fb: "Public pressure can make people withdraw. Ask privately and offer other ways to contribute.", best: false },
      { t: "Offer a written blocker thread and check in 1:1 afterwards.", fb: "Good: you give more than one way to contribute and ask the person instead of assuming.", best: true },
      { t: "Assume they have no blockers and move on.", fb: "This may miss real issues. Silence has many possible meanings, so ask.", best: false }], take: "Offer several ways to participate; ask, don't assume." },
  { id: "s2", title: "Direct code review comment", ctx: "A reviewer in another country writes 'This is wrong.' on your pull request. You feel hurt.",
    opts: [{ t: "Reply defensively in the PR.", fb: "This escalates. Direct wording is often a style difference, not hostility.", best: false },
      { t: "Ask what they would change and agree on a review-comment style.", fb: "Good: you clarify intent and build a shared norm for the team.", best: true },
      { t: "Stop requesting reviews from them.", fb: "Avoidance harms collaboration and removes useful feedback.", best: false }], take: "Clarify intent, then agree team norms." },
  { id: "s3", title: "Meeting at 7 a.m. for half the team", ctx: "You always schedule the weekly sync at a time convenient only for your office.",
    opts: [{ t: "Rotate meeting times and record the session with notes.", fb: "Good: the burden of inconvenience is shared and absent people stay included.", best: true },
      { t: "Keep the time; others can catch up.", fb: "This repeatedly excludes the same people.", best: false },
      { t: "Ask only the senior people to join.", fb: "Choosing by seniority hides colleagues from decisions.", best: false }], take: "Share scheduling cost fairly." },
  { id: "s4", title: "Talked over on a client call", ctx: "On a client call, a teammate who is still building confidence in English is repeatedly talked over by a senior colleague.",
    opts: [{ t: "Let it pass to keep the call smooth.", fb: "Silence lets the pattern continue and the client misses useful input.", best: false },
      { t: "Invite them back in: 'I'd like to hear the rest of that point.'", fb: "Good: you protect their turn without singling them out or speaking for them.", best: true },
      { t: "Tell them afterwards that they should speak up more.", fb: "This puts the fix on the person being interrupted instead of the meeting habits.", best: false }], take: "Make room for others in the moment." },
  { id: "s5", title: "A name that keeps being shortened", ctx: "A teammate's name is often mispronounced or shortened in meetings, and they have never said anything.",
    opts: [{ t: "Give them an easier nickname everyone can use.", fb: "Choosing a name for someone removes their say. Let them decide how they are addressed.", best: false },
      { t: "Ask how they like their name said, practise it, and correct yourself.", fb: "Good: you ask, respect their answer and model it for others.", best: true },
      { t: "Say nothing; it is a small thing.", fb: "Small things add up. Names are part of belonging.", best: false }], take: "Ask how people want to be addressed." },
];
export const QUIZ = [
  { q: "Country-level cultural patterns are best treated as:", opts: ["Rules that apply to every person from that country", "Possible context to check with the individual", "A score to rank colleagues"], a: 1, why: "Patterns are context only. Individuals vary, so ask and listen." },
  { q: "A colleague gives very short written feedback. A good first step is to:", opts: ["Ask how they prefer to give and receive feedback", "Assume they are being rude", "Reply with equally short comments"], a: 0, why: "Style differences are common. Asking avoids guessing about intent." },
  { q: "For a weekly meeting across several time zones, the fairest approach is to:", opts: ["Always use head-office time", "Skip people in far time zones", "Rotate times and share a recording with notes"], a: 2, why: "Sharing the inconvenience keeps everyone included." },
  { q: "Psychological safety means:", opts: ["Nobody ever disagrees", "People can raise concerns without fear of embarrassment or punishment", "Only managers give feedback"], a: 1, why: "Safe teams disagree openly and respectfully." },
  { q: "You witness an exclusionary comment in a meeting. A good response is to:", opts: ["Ignore it", "Address it calmly, support the affected person and report if needed", "Publicly shame the colleague"], a: 1, why: "Calm action supports the person affected and keeps the focus on behaviour." },
];