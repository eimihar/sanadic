# Glossary — Hadith Sciences Terminology

Terms referenced while designing the database schema, grouped by category.
Arabic script is included where useful; transliteration follows common
academic convention (not strict IJMES/ALA-LC).

Most entries below include an **Example** drawn from one real, well-known
hadith so the abstract terms have something concrete to attach to. See the
box immediately below for the source text and its full chain.

---

## Running Example — "Actions are but by intentions"

This is the opening hadith of *Sahih al-Bukhari*, chosen because its
isnad happens to use nearly every transmission verb in the glossary within
a single chain, and because it's one of the most-discussed hadiths in
academic isnad-analysis literature.

**Full text (Arabic), as recorded by al-Bukhari:**

> حَدَّثَنَا الْحُمَيْدِيُّ عَبْدُ اللَّهِ بْنُ الزُّبَيْرِ، قَالَ حَدَّثَنَا
> سُفْيَانُ، قَالَ حَدَّثَنَا يَحْيَى بْنُ سَعِيدٍ الأَنْصَارِيُّ، قَالَ
> أَخْبَرَنِي مُحَمَّدُ بْنُ إِبْرَاهِيمَ التَّيْمِيُّ، أَنَّهُ سَمِعَ
> عَلْقَمَةَ بْنَ وَقَّاصٍ اللَّيْثِيَّ، يَقُولُ سَمِعْتُ عُمَرَ بْنَ
> الْخَطَّابِ رضى الله عنه عَلَى الْمِنْبَرِ قَالَ سَمِعْتُ رَسُولَ اللَّهِ
> صلى الله عليه وسلم يَقُولُ: «إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا
> لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى دُنْيَا
> يُصِيبُهَا أَوْ إِلَى امْرَأَةٍ يَنْكِحُهَا فَهِجْرَتُهُ إِلَى مَا هَاجَرَ
> إِلَيْهِ.»

**English rendering:** Al-Humaydi 'Abdullah ibn al-Zubayr told us: Sufyan
told us: Yahya ibn Sa'id al-Ansari told us: Muhammad ibn Ibrahim al-Taymi
informed me that he heard 'Alqamah ibn Waqqas al-Laythi say: I heard 'Umar
ibn al-Khattab, on the pulpit, say: I heard the Messenger of God say:
"Actions are only by intentions, and every person will get what they
intended. Whoever's migration was for worldly gain or to marry a woman,
his migration is to whatever he migrated for."

Note the matn itself isn't just the abstract opening line — it ends with a
concrete illustration (the migration example), which is exactly the kind
of detail a `matnEn` field needs to preserve in full; truncating it loses
half the point being made.

**Sanad (compiler → Prophet, as al-Bukhari recorded it):**

| # | Narrator | Verb used |
|---|----------|-----------|
| 1 | Al-Bukhari (compiler) received from → | — |
| 2 | Al-Humaydi, 'Abdullah ibn al-Zubayr | *haddathana* ("told us") |
| 3 | Sufyan ibn 'Uyaynah | *haddathana* |
| 4 | Yahya ibn Sa'id al-Ansari | *haddathana* |
| 5 | Muhammad ibn Ibrahim al-Taymi | *akhbarani* ("informed me") |
| 6 | 'Alqamah ibn Waqqas al-Laythi | *sami'a* ("heard [him] say") |
| 7 | 'Umar ibn al-Khattab | *sami'tu* ("I heard") |
| — | The Prophet Muhammad | (originator) |

This table is what a fully-populated run of `SanadLink` rows for one
`Sanad` would look like — `position` 1 through 7, each carrying its own
`transmissionVerb`.

---

## Core Concepts

**Hadith** (حديث) — A reported saying, action, or approval attributed to the
Prophet Muhammad. Has two structural parts: the *matn* and the *sanad*.
Maps to the `Hadith` table.
> **Example:** The "actions are but by intentions" report above is a single
> hadith, recorded at `Hadith.referenceCode = "Bukhari 1:1:1"`.

**Matn** (متن) — The actual text/content of a hadith report — what was
said or done. Distinct from the chain of people who transmitted it. Maps to
`Hadith.matnAr` / `Hadith.matnEn`.
> **Example:** "Actions are judged according to the intentions behind
> them..." is the matn — it stays the same regardless of which of the
> narrators below is reporting it.

**Sanad** (سند) — The chain of narrators through which a hadith was
transmitted, from the compiler back to the Prophet (or a Companion). Used
interchangeably with *isnad* in most contexts. Maps to the `Sanad` table.
> **Example:** The 7-row table above — al-Humaydi through 'Umar — is one
> `Sanad` row (`tarafIndex = 1`) for this hadith.

**Isnad** (إسناد) — Near-synonym of *sanad*; literally "the act of
supporting/attributing." Often used specifically for the methodology of
verifying a report by scrutinizing its chain. "Isnad-cum-matn analysis" is
the academic method of cross-checking chain and text together to date and
verify a report's origin.
> **Example:** Scholars doing isnad-cum-matn analysis on this very hadith
> have used the *shape* of its transmission (see "Common Link" below) to
> argue about when and by whom the report actually began circulating.

**Tariq**, pl. **Turuq** (طريق / طرق) — Literally "route" or "path." Refers
to one specific transmission route for a given hadith. A single hadith
(matn) can have multiple *turuq* — this is why `Sanad` is modeled as its
own table with a `tarafIndex`, rather than being a single field on
`Hadith`.
> **Example:** The chain above is one *tariq*. Later, hundreds of other
> scholars transmitted the same matn starting from Yahya ibn Sa'id through
> different students — each of those is a separate *tariq*, i.e. a
> separate `Sanad` row pointing at the same `Hadith.id`.

**Rawi**, pl. **Ruwat** or **Rijal** (راوي / رواة / رجال) — A narrator;
literally "one who relates/reports." *Rijal* (literally "men") is also used
as the name for the entire biographical discipline dedicated to cataloguing
narrators. Maps to the `Narrator` table.
> **Example:** 'Umar ibn al-Khattab, 'Alqamah ibn Waqqas, and the other five
> people in the chain above are each a *rawi* — each gets one row in
> `Narrator`.

**Ilm al-Rijal** (علم الرجال) — "The science of men" — the biographical
discipline that catalogues narrators' names, generations, teachers,
students, and reliability. This is the discipline the `Narrator`,
`NarratorNameVariant`, `NarratorGrade`, and `NarratorRelation` tables
collectively try to represent.
> **Example:** The fact that we can even say *when* 'Alqamah ibn Waqqas
> lived, who his teachers were, and how scholars graded him, is the output
> of centuries of *ilm al-rijal* work — your database is essentially a
> structured version of that literature.

---

## Narration & Transmission Phrasing

These are the verbs a narrator uses to describe *how* they received a
report from the person before them in the chain. They matter because some
phrasings imply more certainty of direct contact than others — especially
for narrators known to obscure gaps in their chain. Maps to
`SanadLink.transmissionVerb`.

**Haddathana** (حدثنا) — "He narrated to us" / "told us directly." Implies
direct oral transmission, generally considered the strongest phrasing.
> **Example:** Al-Humaydi, Sufyan, and Yahya ibn Sa'id all use *haddathana*
> in this chain — rows 2, 3, and 4 in the table above.

**Akhbarana** (أخبرنا) — "He informed us." Similar strength to
*haddathana*; sometimes used for material read back to a teacher for
confirmation (*qira'ah*) rather than heard directly.
> **Example:** Muhammad ibn Ibrahim al-Taymi's link uses the singular form
> *akhbarani* ("informed **me**") — row 5.

**Anba'ana** (أنبأنا) — "He informed us." A less common variant of
*akhbarana*, sometimes associated with written/certified transmission
(*ijazah*) rather than direct hearing.
> Not used in this particular chain, but functionally interchangeable with
> *akhbarana* where it appears in other isnads.

**Sami'tu** (سمعت) — "I heard [him say]." Explicit first-person hearing —
one of the strongest possible phrasings since it leaves no ambiguity about
direct contact.
> **Example:** 'Umar ibn al-Khattab says *sami'tu* ("I heard") when
> reporting directly from the Prophet — row 7, the strongest possible link
> in the whole chain.

**'An** (عن) — "From." The most ambiguous transmission phrase — it doesn't
explicitly state direct hearing, only that the report came "from" that
person. Critical for detecting *tadlis* (see below).
> Not used anywhere in this particular chain — one reason it's considered
> an unusually clean isnad; every link explicitly states direct
> hearing.

**Qala** (قال) — "He said." Generic reporting verb, ambiguous about the
transmission method.
> Not used in this chain, but common elsewhere, e.g. "Ibn 'Abbas *qala*
> ('said')..." without specifying how he received the report.

**Tadlis** (تدليس) — The practice (sometimes deliberate, sometimes
technical) of narrating from someone using ambiguous phrasing (like *'an*)
in a way that obscures a missing link or an unmet source. A narrator known
for this is a **mudallis** (مدلس). This is precisely why
`transmissionVerb` is tracked per-link rather than assumed — an *'an*
report from a known mudallis is treated differently in analysis than one
from a non-mudallis.
> **Example (hypothetical, for contrast):** If row 5 instead read "Muhammad
> ibn Ibrahim, *'an* Yahya ibn Sa'id" and Muhammad were a known mudallis,
> a rijal specialist would flag that link as possibly skipping an
> intermediate, unnamed narrator — worth surfacing as a warning in your
> analysis layer.

**Common Link** — Not an Arabic term, but a key concept from Western
hadith-critical scholarship (associated with Joseph Schacht and later G.H.A.
Juynboll): the narrator at whom multiple otherwise-independent chains
(turuq) converge. Identifying common links is one of the main payoffs of
modeling sanads as a graph rather than a flat list.
> **Example:** This exact hadith is one of the most-cited textbook examples
> in that literature. For three generations it travelled through a single
> line — 'Alqamah → Muhammad ibn Ibrahim → Yahya ibn Sa'id — and then
> suddenly fans out: dozens of Yahya's own students (including Sufyan ibn
> 'Uyaynah, Malik ibn Anas, and Shu'ba ibn al-Hajjaj) each transmitted it
> onward independently. Yahya ibn Sa'id al-Ansari is therefore commonly
> pointed to as the *common link* for this hadith — exactly the kind of
> narrator your graph-analysis pass (fan-out count per `SanadLink.narratorId`)
> should surface automatically.

---

## Narrator Reliability Grading (Jarh wa Ta'dil)

**Jarh wa Ta'dil** (الجرح والتعديل) — Literally "wounding and validating" —
the critical discipline of scholars evaluating and grading individual
narrators' trustworthiness and accuracy. Maps to the `NarratorGrade` table,
where `graderScholar` records *who* made the judgment (since scholars often
disagree).
> **Example:** Every narrator in the chain above — al-Humaydi, Sufyan,
> Yahya, Muhammad ibn Ibrahim, 'Alqamah — has multiple `NarratorGrade` rows
> from different classical critics; that's *jarh wa ta'dil* in action.

**Thiqah** (ثقة) — "Trustworthy." The highest general reliability grade —
accurate memory and known honesty.
> **Example:** All seven narrators in this chain are graded *thiqah* by
> the overwhelming majority of rijal critics — part of why this hadith is
> graded *sahih* despite (or arguably because of) its narrow single-strand
> transmission for its first three generations.

**Saduq** (صدوق) — "Truthful." One step below *thiqah* — generally honest
but with some minor criticism (e.g. occasional memory slips).
> No narrator in this chain carries this grade — included here as the next
> rung down for contrast.

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
> **Example:** By contrast with everyone in this chain, imagine a minor
> narrator who appears in only one obscure chain with no biographical
> record — that narrator would get `gradeCategory: "majhul"` rather than
> simply having zero rows in `NarratorGrade`, so your schema can tell
> "nobody graded this person" apart from "no information exists to grade
> this person."

---

## Hadith Authenticity Grading

These grade the hadith report as a whole (chain + text together), not an
individual narrator. Maps to `HadithGradeOpinion.grade`.

**Sahih** (صحيح) — "Authentic/sound." The highest grade — a continuous
chain of reliable, precise narrators with no hidden defects or
contradictions.
> **Example:** This hadith is graded *sahih* by consensus — it's the
> opening hadith of what's traditionally considered the most authentic
> hadith collection, *Sahih al-Bukhari*, precisely because every link in
> its chain is *thiqah* and explicitly connected (no *'an*, no gaps).

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
> **Example:** 'Umar ibn al-Khattab's kunya is *Abu Hafs* — sources refer
> to him both ways, which is exactly the kind of variation
> `NarratorNameVariant` exists to capture without creating a duplicate
> `Narrator` row.

**Laqab** (لقب) — An honorific title, nickname, or epithet — e.g.
*al-Siddiq*. Maps to `Narrator.laqab`.
> **Example:** 'Umar ibn al-Khattab's laqab is *al-Faruq* ("the one who
> distinguishes truth from falsehood") — again, a name variant worth
> tracking alongside his given name.

**Nasab** (نسب) — The lineage/genealogy portion of a name — a chain of
"ibn [father]" (son of) relationships tracing ancestry. Maps to
`Narrator.nasab`.
> **Example:** In "'Alqamah **ibn Waqqas** al-Laythi," the "ibn Waqqas"
> portion is his nasab — it identifies him as the son of Waqqas, distinct
> from any other 'Alqamah.

**Sahabi**, pl. **Sahabah** (صحابي / صحابة) — A "Companion" — someone who
met the Prophet Muhammad as a believer and died a believer. Companions hold
a distinct evidentiary status: in mainstream Sunni methodology all
Companions are considered reliable narrators by default, so they often
lack the *jarh wa ta'dil* records that later narrators have. Maps to
`Narrator.isCompanion`.
> **Example:** 'Umar ibn al-Khattab (row 7) is a Sahabi —
> `Narrator.isCompanion = true`. Notice he has no `NarratorGrade` entries
> in the same way Sufyan or Yahya do; his reliability isn't independently
> assessed the way later narrators' is.

**Tabaqah**, pl. **Tabaqat** (طبقة / طبقات) — "Generation" or "class" — a
system for ranking narrators by which generation after the Prophet they
belong to. Maps to `Narrator.tabaqah`.

**Tabi'i**, pl. **Tabi'un** (تابعي / تابعون) — A "Successor" — someone who
met at least one Companion (but not the Prophet directly) as a believer.
One generation removed from the Prophet.
> **Example:** 'Alqamah ibn Waqqas (row 6) met 'Umar directly but not the
> Prophet — he is a Tabi'i, `Narrator.tabaqah = "tabiin"`.

**Kibar al-Tabi'in** (كبار التابعين) — "Senior Successors" — Successors
who had more, or more direct, contact with the Companions; considered a
stronger sub-generation than later Successors.

**Tabi' al-Tabi'in** (تابع التابعين) — "Successor of the Successors" — the
generation after the *Tabi'un*, two generations removed from the Prophet.
> **Example:** Muhammad ibn Ibrahim al-Taymi (row 5), who narrates from
> 'Alqamah rather than from any Companion directly, falls into this
> generation — `Narrator.tabaqah = "tabi_tabiin"`.

---

## Calendar

**Hijri** (هجري) — Referring to the Islamic lunar calendar, dated from the
Prophet's migration (*hijrah*) from Mecca to Medina in 622 CE. Birth/death
years in classical sources are almost always given in Hijri years, often
approximate. Maps to `Narrator.birthYearHijri` / `deathYearHijri`, each
paired with an `Approx` boolean flag since exact dates are frequently
disputed or unrecorded.
> **Example:** Sufyan ibn 'Uyaynah (row 3) died in 198 AH —
> `deathYearHijri: 198`. Al-Bukhari himself died in 256 AH. Note the ~58
> Hijri-year gap between them despite being only two links apart in the
> chain, which is normal — narrators' lifespans overlap generously, they
> don't hand off the report the year one of them dies.
