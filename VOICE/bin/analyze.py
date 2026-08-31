#!/usr/bin/env python3
"""Measure the idiolect in a folder of transcripts. No generation, only counting.

Usage: analyze.py <transcripts_dir> <out_dir>
"""
import os, re, sys, json, collections

SUFFIX_NOMINAL = ("tion", "sion", "ment", "ness", "ity", "ance", "ence",
                  "ism", "ization", "isation")

HEDGES = ["kind of", "sort of", "i think", "i guess", "maybe", "probably",
          "a little", "somewhat", "i mean", "basically", "pretty much",
          "more or less", "or whatever", "i don't know", "i dunno"]

INTENSIFIERS = ["really", "very", "so ", "totally", "completely", "absolutely",
                "actually", "literally", "super", "way ", "insanely", "hugely"]

DISCOURSE = ["so", "and", "but", "then", "because", "okay", "right", "well",
             "look", "anyway", "yeah", "no", "like", "i mean", "the thing is"]

AI_TELLS = ["leverage", "robust", "seamless", "delve", "tapestry", "landscape",
            "underscore", "moreover", "furthermore", "holistic", "synergy",
            "utilize", "facilitate", "comprehensive", "intricate", "realm",
            "testament", "pivotal", "crucial", "elevate", "empower", "unlock",
            "streamline", "cutting-edge", "game-changer", "deep dive", "foster",
            "myriad", "plethora", "nuanced", "multifaceted", "paradigm",
            "bespoke", "curated", "meticulous", "vibrant", "transformative",
            "harness", "spearhead", "embark", "resonate", "actionable",
            "impactful", "best-in-class", "world-class", "north star",
            "ensure", "align", "journey", "navigate", "orchestrate",
            "meaningful", "thoughtful", "intentional", "surface", "lens"]

STOP = set("""a an the and or but if of to in on at by for with from as is are was
were be been being it its this that these those i me my we our you your he she
they them his her their there here what which who whom how when where why not
no do does did done have has had will would can could should may might must
just about into over under again more most some any all than then so very s t
re ve ll d m o y""".split())


def sentences(text):
    parts = re.split(r"(?<=[.!?])\s+", text.strip())
    return [p.strip() for p in parts if p.strip()]


def words(text):
    return re.findall(r"[a-z']+", text.lower())


def phrase_count(text_l, phrases):
    return {p: text_l.count(p) for p in phrases if text_l.count(p) > 0}


def main():
    src, out = sys.argv[1], sys.argv[2]
    files = sorted(f for f in os.listdir(src) if f.endswith(".txt"))
    if not files:
        sys.exit("no .txt transcripts in %s" % src)

    text = "\n".join(open(os.path.join(src, f), encoding="utf-8").read()
                     for f in files)
    tl = text.lower()
    sents = sentences(text)
    wl = words(text)
    n = len(wl)
    if n < 1500:
        print("WARNING: only %d words. Sample is too small to trust. "
              "Aim for 4000+ (about 30 minutes of talking)." % n)

    lens = sorted(len(words(s)) for s in sents)
    mean = sum(lens) / len(lens)
    median = lens[len(lens) // 2]
    p90 = lens[int(len(lens) * 0.9)]
    short = sum(1 for x in lens if x <= 8) / len(lens)
    longs = sum(1 for x in lens if x >= 25) / len(lens)

    openers = collections.Counter()
    for s in sents:
        w = words(s)
        if w:
            openers[w[0]] += 1

    freq = collections.Counter(wl)
    content = collections.Counter({w: c for w, c in freq.items()
                                   if w not in STOP and len(w) > 2})

    bigrams = collections.Counter(zip(wl, wl[1:]))
    trigrams = collections.Counter(zip(wl, wl[1:], wl[2:]))

    nominal = [w for w in wl if len(w) > 6 and w.endswith(SUFFIX_NOMINAL)]
    contractions = len(re.findall(r"\b\w+'(s|t|re|ve|ll|d|m)\b", tl))
    first_person = sum(freq[w] for w in ("i", "me", "my", "we", "our"))
    second = sum(freq[w] for w in ("you", "your"))
    questions = sum(1 for s in sents if s.endswith("?"))

    lex = sorted(set(wl))

    def pct(x):
        return round(100.0 * x / n, 2)

    stats = {
        "files": files,
        "words": n,
        "sentences": len(sents),
        "sentence_mean": round(mean, 1),
        "sentence_median": median,
        "sentence_p90": p90,
        "pct_short_sentences": round(100 * short, 1),
        "pct_long_sentences": round(100 * longs, 1),
        "nominalization_per_100w": pct(len(nominal)),
        "contractions_per_100w": pct(contractions),
        "first_person_per_100w": pct(first_person),
        "second_person_per_100w": pct(second),
        "questions_pct": round(100.0 * questions / len(sents), 1),
        "lexicon_size": len(lex),
        "type_token_ratio": round(len(lex) / float(n), 3),
    }

    hedges = phrase_count(tl, HEDGES)
    intens = phrase_count(tl, INTENSIFIERS)
    tells = phrase_count(tl, AI_TELLS)

    os.makedirs(out, exist_ok=True)
    with open(os.path.join(out, "lexicon.txt"), "w", encoding="utf-8") as f:
        f.write("\n".join(lex))
    with open(os.path.join(out, "stats.json"), "w", encoding="utf-8") as f:
        json.dump(stats, f, indent=2)

    L = []
    A = L.append
    A("# Voiceprint")
    A("")
    A("Measured from %d words across %d transcript(s). Counting only, "
      "nothing here was written for you." % (n, len(files)))
    A("")
    A("## Rhythm")
    A("")
    A("| measure | you |")
    A("|---|---|")
    A("| mean sentence length | %.1f words |" % mean)
    A("| median sentence length | %d words |" % median)
    A("| 90th percentile | %d words |" % p90)
    A("| sentences of 8 words or fewer | %.1f%% |" % (100 * short))
    A("| sentences of 25 words or more | %.1f%% |" % (100 * longs))
    A("| contractions per 100 words | %.2f |" % pct(contractions))
    A("| nominalizations per 100 words | %.2f |" % pct(len(nominal)))
    A("| I/we per 100 words | %.2f |" % pct(first_person))
    A("| you per 100 words | %.2f |" % pct(second))
    A("")
    A("Median length is the number to defend. If a draft's median runs more than "
      "about three words above yours, it stopped being speech.")
    A("")
    A("## How you start sentences")
    A("")
    for w, c in openers.most_common(20):
        A("- `%s` x%d" % (w, c))
    A("")
    A("## Your words")
    A("")
    for w, c in content.most_common(50):
        A("- %s (%d)" % (w, c))
    A("")
    A("## Two-word habits")
    A("")
    for g, c in bigrams.most_common(30):
        if c > 1:
            A("- \"%s\" x%d" % (" ".join(g), c))
    A("")
    A("## Three-word habits")
    A("")
    for g, c in trigrams.most_common(25):
        if c > 1:
            A("- \"%s\" x%d" % (" ".join(g), c))
    A("")
    A("## Hedges you actually use")
    A("")
    for p, c in sorted(hedges.items(), key=lambda x: -x[1]):
        A("- \"%s\" x%d" % (p, c))
    A("")
    A("These are not flaws to strip out. They are load-bearing. A draft with none "
      "of them is not a cleaner version of you, it is a different person.")
    A("")
    A("## Intensifiers")
    A("")
    for p, c in sorted(intens.items(), key=lambda x: -x[1]):
        A("- \"%s\" x%d" % (p.strip(), c))
    A("")
    A("## Borrowed vocabulary found in your own speech")
    A("")
    if tells:
        A("These showed up when you were talking, which means they have already "
          "migrated inward. Worth deciding, one at a time, whether each is yours.")
        A("")
        for p, c in sorted(tells.items(), key=lambda x: -x[1]):
            A("- \"%s\" x%d" % (p, c))
    else:
        A("None. Your speech is clean of the standard tells.")
    A("")
    A("## Nominalizations you reach for")
    A("")
    for w, c in collections.Counter(nominal).most_common(20):
        A("- %s (%d)" % (w, c))
    A("")

    with open(os.path.join(out, "voiceprint.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(L) + "\n")

    print("wrote %s/voiceprint.md, lexicon.txt, stats.json" % out)
    print("%d words, median sentence %d, lexicon %d" % (n, median, len(lex)))


if __name__ == "__main__":
    main()
