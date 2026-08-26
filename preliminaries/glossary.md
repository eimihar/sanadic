# Glossary — Hadith Sciences Terminology

Terms referenced while designing the database schema, grouped by category.
Arabic script is included where useful; transliteration follows common
academic convention (not strict IJMES/ALA-LC).

---

## Core Concepts

**Hadith** (حديث) — A reported saying, action, or approval attributed to the
Prophet Muhammad. Has two structural parts: the *matn* and the *sanad*.
Maps to the `Hadith` table.

**Matn** (متن) — The actual text/content of a hadith report — what was
said or done. Distinct from the chain of people who transmitted it. Maps to
`Hadith.matnAr` / `Hadith.matnEn`.

**Sanad** (سند) — The chain of narrators through which a hadith was
transmitted, from the compiler back to the Prophet (or a Companion). Used
interchangeably with *isnad* in most contexts. Maps to the `Sanad` table.

**Isnad** (إسناد) — Near-synonym of *sanad*; literally "the act of
supporting/attributing." Often used specifically for the methodology of
verifying a report by scrutinizing its chain. "Isnad-cum-matn analysis" is
the academic method of cross-checking chain and text together to date and
verify a report's origin.

**Tariq**, pl. **Turuq** (طريق / طرق) — Literally "route" or "path." Refers
to one specific transmission route for a given hadith. A single hadith
(matn) can have multiple *turuq* — this is why `Sanad` is modeled as its
own table with a `tarafIndex`, rather than being a single field on
`Hadith`.

**Rawi**, pl. **Ruwat** or **Rijal** (راوي / رواة / رجال) — A narrator;
literally "one who relates/reports." *Rijal* (literally "men") is also used
as the name for the entire biographical discipline dedicated to cataloguing
narrators. Maps to the `Narrator` table.

**Ilm al-Rijal** (علم الرجال) — "The science of men" — the biographical
discipline that catalogues narrators' names, generations, teachers,
students, and reliability. This is the discipline the `Narrator`,
`NarratorNameVariant`, `NarratorGrade`, and `NarratorRelation` tables
collectively try to represent.

---

## Narration & Transmission Phrasing

These are the verbs a narrator uses to describe *how* they received a
report from the person before them in the chain. They matter because some
phrasings imply more certainty of direct contact than others — especially
for narrators known to obscure gaps in their chain. Maps to
`SanadLink.transmissionVerb`.

**Haddathana** (حدثنا) — "He narrated to us" / "told us directly." Implies
direct oral transmission, generally considered the strongest phrasing.

**Akhbarana** (أخبرنا) — "He informed us." Similar strength to
*haddathana*; sometimes used for material read back to a teacher for
confirmation (*qira'ah*) rather than heard directly.

**Anba'ana** (أنبأنا) — "He informed us." A less common variant of
*akhbarana*, sometimes associated with written/certified transmission
(*ijazah*) rather than direct hearing.

**Sami'tu** (سمعت) — "I heard [him say]." Explicit first-person hearing —
one of the strongest possible phrasings since it leaves no ambiguity about
direct contact.

**'An** (عن) — "From." The most ambiguous transmission phrase — it doesn't
explicitly state direct hearing, only that the report came "from" that
person. Critical for detecting *tadlis* (see below).

**Qala** (قال) — "He said." Generic reporting verb, ambiguous about the
transmission method.

**Tadlis** (تدليس) — The practice (sometimes deliberate, sometimes
technical) of narrating from someone using ambiguous phrasing (like *'an*)
in a way that obscures a missing link or an unmet source. A narrator known
for this is a **mudallis** (مدلس). This is precisely why
`transmissionVerb` is tracked per-link rather than assumed — an *'an*
report from a known mudallis is treated differently in analysis than one
from a non-mudallis.

**Common Link** — Not an Arabic term, but a key concept from Western
hadith-critical scholarship (associated with Joseph Schacht and later G.H.A.
Juynboll): the narrator at whom multiple otherwise-independent chains
(turuq) converge. Identifying common links is one of the main payoffs of
modeling sanads as a graph rather than a flat list.

---

## Narrator Reliability Grading (Jarh wa Ta'dil)

**Jarh wa Ta'dil** (الجرح والتعديل) — Literally "wounding and validating" —
the critical discipline of scholars evaluating and grading individual
narrators' trustworthiness and accuracy. Maps to the `NarratorGrade` table,
where `graderScholar` records *who* made the judgment (since scholars often
disagree).

**Thiqah** (ثقة) — "Trustworthy." The highest general reliability grade —
accurate memory and known honesty.

**Saduq** (صدوق) — "Truthful." One step below *thiqah* — generally honest
but with some minor criticism (e.g. occasional memory slips).

**Maqbul** (مقبول) — "Acceptable." A narrator whose reports are accepted,
typically when corroborated by other chains, but who doesn't independently
reach *thiqah* or *saduq* status.

**Layyin** (لين) — "Soft" / "pliable." A mild weakness grade — not
outright rejected, but flagged as unreliable enough to note.

**Da'if** (ضعيف) — "Weak." A narrator (or, separately, a hadith) whose
reliability falls short of acceptance for establishing religious rulings on
its own.

**Matruk** (متروك) — "Abandoned" / "discarded." A more severe weakness
grade than *da'if* — the narrator's reports are set aside entirely.

**Kadhdhab** (كذاب) — "Habitual liar." The most severe negative grade — a
narrator accused of deliberately fabricating reports.

**Majhul** (مجهول) — "Unknown." Used when there isn't enough biographical
information to grade the narrator at all — distinct from being graded
weak; it simply means insufficient data. Relevant when populating
`NarratorGrade`: absence of a grade should be distinguished from an
explicit *majhul* judgment.

---

## Hadith Authenticity Grading

These grade the hadith report as a whole (chain + text together), not an
individual narrator. Maps to `HadithGradeOpinion.grade`.

**Sahih** (صحيح) — "Authentic/sound." The highest grade — a continuous
chain of reliable, precise narrators with no hidden defects or
contradictions.

**Hasan** (حسن) — "Good." One tier below *sahih* — generally reliable but
with a narrator or two of slightly lesser precision (often *saduq* rather
than *thiqah*).

**Da'if** (ضعيف) — "Weak." (Same word as the narrator grade above, applied
here to the report as a whole — usually because it contains one or more
weak narrators, a broken chain, or a contradiction with more reliable
reports.)

**Mawdu'** (موضوع) — "Fabricated." A report with no genuine basis —
effectively a forgery attributed to the Prophet.

**Munkar** (منكر) — "Rejected/denounced." A weak-narrator's report that
directly contradicts a report from more reliable narrators.

**Shadhdh** (شاذ) — "Anomalous/irregular." A reliable narrator's report
that nonetheless contradicts a version transmitted by even more numerous or
more reliable narrators.

---

## Narrator Biographical & Naming Terms

**Kunya** (كنية) — A teknonym, typically "Abu [child's name]" (father of)
or "Umm [child's name]" (mother of) — e.g. *Abu Hurairah*. Often the name a
narrator is best known by, sometimes more common in sources than the given
name. Maps to `Narrator.kunya`.

**Laqab** (لقب) — An honorific title, nickname, or epithet — e.g.
*al-Siddiq*. Maps to `Narrator.laqab`.

**Nasab** (نسب) — The lineage/genealogy portion of a name — a chain of
"ibn [father]" (son of) relationships tracing ancestry. Maps to
`Narrator.nasab`.

**Sahabi**, pl. **Sahabah** (صحابي / صحابة) — A "Companion" — someone who
met the Prophet Muhammad as a believer and died a believer. Companions hold
a distinct evidentiary status: in mainstream Sunni methodology all
Companions are considered reliable narrators by default, so they often
lack the *jarh wa ta'dil* records that later narrators have. Maps to
`Narrator.isCompanion`.

**Tabaqah**, pl. **Tabaqat** (طبقة / طبقات) — "Generation" or "class" — a
system for ranking narrators by which generation after the Prophet they
belong to. Maps to `Narrator.tabaqah`.

**Tabi'i**, pl. **Tabi'un** (تابعي / تابعون) — A "Successor" — someone who
met at least one Companion (but not the Prophet directly) as a believer.
One generation removed from the Prophet.

**Kibar al-Tabi'in** (كبار التابعين) — "Senior Successors" — Successors
who had more, or more direct, contact with the Companions; considered a
stronger sub-generation than later Successors.

**Tabi' al-Tabi'in** (تابع التابعين) — "Successor of the Successors" — the
generation after the *Tabi'un*, two generations removed from the Prophet.

---

## Calendar

**Hijri** (هجري) — Referring to the Islamic lunar calendar, dated from the
Prophet's migration (*hijrah*) from Mecca to Medina in 622 CE. Birth/death
years in classical sources are almost always given in Hijri years, often
approximate. Maps to `Narrator.birthYearHijri` / `deathYearHijri`, each
paired with an `Approx` boolean flag since exact dates are frequently
disputed or unrecorded.
