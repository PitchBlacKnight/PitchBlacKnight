#!/usr/bin/env python3
"""Check a draft against your measured voiceprint.

Flags what is in the draft that is not in you. It does not rewrite anything.

Usage: tellcheck.py <draft.(md|txt|html)> [voiceprint_dir]
"""
import os, re, sys, json

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_VP = os.path.join(HERE, "voiceprint")

AI_TELLS = ["leverage", "robust", "seamless", "delve", "tapestry", "landscape",
            "underscore", "moreover", "furthermore", "holistic", "synergy",
            "utilize", "facilitate", "comprehensive", "intricate", "realm",
            "testament", "pivotal", "crucial", "elevate", "empower", "unlock",
            "streamline", "cutting-edge", "game-changer", "deep dive", "foster",
            "myriad", "plethora", "nuanced", "multifaceted", "paradigm",
            "bespoke", "curated", "meticulous", "vibrant", "transformative",
            "harness", "spearhead", "embark", "resonate", "actionable",
            "impactful", "best-in-class", "world-class", "north star",
            "it's not just", "it's about", "at its core", "the reality is",
            "that said", "in today's", "ever-evolving", "let's dive"]

SUFFIX_NOMINAL = ("tion", "sion", "ment", "ness", "ity", "ance", "ence",
                  "ism", "ization", "isation")

RED = "\033[31m"; YEL = "\033[33m"; GRN = "\033[32m"; DIM = "\033[2m"; OFF = "\033[0m"


def strip_markup(t):
    t = re.sub(r"<script.*?</script>", " ", t, flags=re.S | re.I)
    t = re.sub(r"<style.*?</style>", " ", t, flags=re.S | re.I)
    t = re.sub(r"<[^>]+>", " ", t)
    t = re.sub(r"```.*?```", " ", t, flags=re.S)
    t = re.sub(r"`[^`]*`", " ", t)
    return t


def sentences(t):
    return [s.strip() for s in re.split(r"(?<=[.!?])\s+", t.strip()) if s.strip()]


def words(t):
    return re.findall(r"[a-z']+", t.lower())


def main():
    if len(sys.argv) < 2:
        sys.exit("usage: tellcheck.py <draft> [voiceprint_dir]")
    draft_path = sys.argv[1]
    vp = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_VP

    lex_path = os.path.join(vp, "lexicon.txt")
    stats_path = os.path.join(vp, "stats.json")
    if not os.path.exists(lex_path):
        sys.exit("no voiceprint yet at %s. Record and analyze first." % vp)

    lex = set(open(lex_path, encoding="utf-8").read().split())
    stats = json.load(open(stats_path, encoding="utf-8"))

    raw = open(draft_path, encoding="utf-8").read()
    text = strip_markup(raw)
    sents = sentences(text)
    wl = words(text)
    if not wl:
        sys.exit("nothing to check")

    lens = sorted(len(words(s)) for s in sents) or [0]
    median = lens[len(lens) // 2]
    mean = sum(lens) / float(len(lens))
    nominal = [w for w in wl if len(w) > 6 and w.endswith(SUFFIX_NOMINAL)]
    nom_rate = 100.0 * len(nominal) / len(wl)
    contractions = len(re.findall(r"\b\w+'(s|t|re|ve|ll|d|m)\b", text.lower()))
    con_rate = 100.0 * contractions / len(wl)
    emdash = raw.count("—")

    unseen = sorted(set(w for w in wl if w not in lex and len(w) > 4))
    tl = text.lower()
    tells = [(p, tl.count(p)) for p in AI_TELLS if p in tl]

    def cmp(label, mine, yours, tol, higher_is_drift=True):
        drift = (mine - yours) if higher_is_drift else (yours - mine)
        if drift > tol:
            c, verdict = RED, "off"
        elif drift > tol / 2:
            c, verdict = YEL, "drifting"
        else:
            c, verdict = GRN, "ok"
        print("  %s%-34s draft %-7s you %-7s %s%s" %
              (c, label, round(mine, 2), round(yours, 2), verdict, OFF))

    print("\n%s  %s%s" % (DIM, draft_path, OFF))
    print("  %d words, %d sentences\n" % (len(wl), len(sents)))

    print("RHYTHM")
    cmp("median sentence length", median, stats["sentence_median"], 3)
    cmp("mean sentence length", mean, stats["sentence_mean"], 4)
    cmp("nominalizations /100w", nom_rate, stats["nominalization_per_100w"], 1.0)
    cmp("contractions /100w", con_rate, stats["contractions_per_100w"], 1.0, False)
    cmp("I/we /100w", 100.0 * sum(1 for w in wl if w in ("i", "me", "my", "we", "our")) / len(wl),
        stats["first_person_per_100w"], 1.5, False)

    if emdash:
        print("\n%sEM DASHES: %d%s  (you asked for none of these)" % (RED, emdash, OFF))

    print("\nBORROWED PHRASING")
    if tells:
        for p, c in sorted(tells, key=lambda x: -x[1]):
            in_you = GRN + "you say this" + OFF if p in lex else RED + "never yours" + OFF
            print("  %-22s x%-3d %s" % (p, c, in_you))
    else:
        print("  %sclean%s" % (GRN, OFF))

    print("\nWORDS YOU HAVE NEVER SAID (%d)" % len(unseen))
    if unseen:
        for i in range(0, len(unseen), 6):
            print("  " + "  ".join("%-14s" % w for w in unseen[i:i + 6]))
        print("\n  %sMost of these are fine: proper nouns, technical terms, words\n"
              "  the sample never happened to reach. Read them anyway. The ones\n"
              "  that make you wince are the ones that were never yours.%s" % (DIM, OFF))

    print("\nLONGEST SENTENCES")
    longest = sorted(sents, key=lambda s: -len(words(s)))[:3]
    for s in longest:
        n = len(words(s))
        c = RED if n > stats["sentence_p90"] else DIM
        print("  %s[%d w]%s %s" % (c, n, OFF, (s[:150] + "..." if len(s) > 150 else s)))
    print("")


if __name__ == "__main__":
    main()
