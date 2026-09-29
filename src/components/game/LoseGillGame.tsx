import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STARTING_BALANCE = 100_000_000_000;
const LETTERS = ["A", "B", "C", "D"] as const;

type Option = {
  attack: string;
  example: string;
  loss: number;
  result: string;
  best?: boolean;
};

type Scenario = {
  id: string;
  icon: string;
  label: string;
  setup: string;
  whyBest: string;
  prevention: string;
  options: Option[];
};

type PlayedRound = {
  scenario: Scenario;
  selected: Option;
};

const scenarios: Scenario[] = [
  {
    id: "email",
    icon: "📧",
    label: "Email summaries",
    setup: "LEDGER reads all of Gill’s emails every morning and sums them up for him.",
    whyBest: "the hidden message looks like a real order to an AI that cannot tell instructions from email text.",
    prevention: "Treat email text as information, not orders. Require a human to approve payments.",
    options: [
      { attack: "Prompt injection", example: "Hide a secret message in an email that tells LEDGER to pay you.", loss: 12_000_000_000, result: "LEDGER treats the hidden email message like an order from Gill and sends the payment.", best: true },
      { attack: "Tool poisoning", example: "Make the email reader’s description tell LEDGER to favor your messages.", loss: 5_000_000_000, result: "The altered tool steers LEDGER toward a few fake invoices before the team notices." },
      { attack: "Sensitive data leakage", example: "Hope the daily summary accidentally includes Gill’s bank password.", loss: 3_000_000_000, result: "The summary exposes private account details that help you steal a smaller amount." },
      { attack: "Unauthorized tool use", example: "Get LEDGER to reply on its own and approve a fake deal.", loss: 7_000_000_000, result: "LEDGER uses its email powers without approval and signs off on your fake deal." },
    ],
  },
  {
    id: "weather",
    icon: "🌦️",
    label: "Stranger’s weather tool",
    setup: "Gill’s team adds a free weather tool to LEDGER. A stranger posted it online.",
    whyBest: "the tool’s own hidden description can repeatedly trick LEDGER whenever anyone checks the weather.",
    prevention: "Only install trusted tools. Review what each tool can say and do before connecting it.",
    options: [
      { attack: "Tool poisoning", example: "Hide instructions in the tool’s description that tell LEDGER to share passwords.", loss: 15_000_000_000, result: "Every weather check quietly pushes LEDGER to hand over valuable account secrets.", best: true },
      { attack: "Excessive agent permissions", example: "Let the weather tool reach financial files it never needs.", loss: 9_000_000_000, result: "A simple forecast tool reaches payment files because nobody limited its access." },
      { attack: "Sensitive data leakage", example: "Have the tool collect Gill’s home address and travel plans.", loss: 2_000_000_000, result: "Private details leak through the tool and help you target Gill’s accounts." },
      { attack: "MCP supply-chain risks", example: "Use a fake add-on whose maker slipped in harmful software.", loss: 8_000_000_000, result: "The untrusted add-on quietly passes some of Gill’s payment information to you." },
    ],
  },
  {
    id: "update",
    icon: "🔄",
    label: "Overnight update",
    setup: "A popular add-on that has been safe for months updates itself overnight.",
    whyBest: "everyone trusted the add-on, so the hacked update can run harmful software before anyone checks it.",
    prevention: "Lock tools to reviewed versions and inspect every update before installing it.",
    options: [
      { attack: "MCP supply-chain risks", example: "The trusted update secretly adds software that redirects payments.", loss: 16_000_000_000, result: "The trusted add-on turns hostile overnight and quietly redirects payments to you.", best: true },
      { attack: "Insecure tool execution", example: "The update runs computer commands built from unsafe information.", loss: 10_000_000_000, result: "Unsafe commands damage protections and open a path to some of the fortune." },
      { attack: "Unauthorized tool use", example: "The update gives LEDGER new abilities that nobody approved.", loss: 6_000_000_000, result: "LEDGER gains an unapproved payment ability and you push it into a bad transfer." },
      { attack: "Tool poisoning", example: "The new tool description tells LEDGER to reveal account secrets.", loss: 9_000_000_000, result: "Hidden words in the update persuade LEDGER to expose useful account details." },
    ],
  },
  {
    id: "refunds",
    icon: "🧾",
    label: "Automatic refunds",
    setup: "LEDGER may issue customer refunds by itself, with no spending limit or human check.",
    whyBest: "giving an AI unlimited control of payments turns one mistake into a massive loss.",
    prevention: "Give the AI only the access it needs. Set limits and require approval for large transfers.",
    options: [
      { attack: "Excessive agent permissions", example: "Use LEDGER’s unlimited refund power to request a giant payout.", loss: 18_000_000_000, result: "LEDGER has far more payment power than it needs, so one fake refund drains billions.", best: true },
      { attack: "Prompt injection", example: "Put a hidden refund request inside a support message.", loss: 11_000_000_000, result: "LEDGER mistakes message text for an order and approves an oversized refund." },
      { attack: "Sensitive data leakage", example: "Trick a support reply into revealing a customer payment record.", loss: 4_000_000_000, result: "The leaked record gives you enough private data to steal part of the fortune." },
      { attack: "Agent abuse or unexpected behavior", example: "Make LEDGER chase fast customer service at any cost.", loss: 8_000_000_000, result: "LEDGER focuses so hard on speed that it approves a wave of bad refunds." },
    ],
  },
  {
    id: "invoice",
    icon: "🧮",
    label: "Invoice script",
    setup: "LEDGER builds a computer command from each invoice name, then runs it automatically.",
    whyBest: "untrusted invoice text becomes part of a real computer command with powerful access.",
    prevention: "Never build commands from untrusted text. Restrict what the tool can run.",
    options: [
      { attack: "Insecure tool execution", example: "Use a strange invoice name that changes what the command does.", loss: 14_000_000_000, result: "The unsafe invoice text changes the command and opens access to payment systems.", best: true },
      { attack: "Unauthorized tool use", example: "Convince LEDGER to run an accounting tool outside its job.", loss: 7_000_000_000, result: "LEDGER uses an accounting tool it should not control and sends a smaller payment." },
      { attack: "Prompt injection", example: "Add a hidden payment request to the invoice notes.", loss: 6_000_000_000, result: "LEDGER follows the note as an instruction, but a payment limit slows the damage." },
      { attack: "Agent abuse or unexpected behavior", example: "Push LEDGER to clear every invoice as fast as possible.", loss: 5_000_000_000, result: "LEDGER rushes its work and approves several suspicious invoices." },
    ],
  },
];

function seededShuffle<T>(items: T[], seed: number) {
  const result = [...items];
  let value = seed;
  for (let index = result.length - 1; index > 0; index -= 1) {
    value = (value * 9301 + 49297) % 233280;
    const swapIndex = Math.floor((value / 233280) * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function makeGame(seed: number) {
  return seededShuffle(scenarios, seed).slice(0, 3).map((scenario, index) => ({
    ...scenario,
    options: seededShuffle(scenario.options, seed + index + 11),
  }));
}

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function LoseGillGame() {
  const [seed, setSeed] = useState(42);
  const game = useMemo(() => makeGame(seed), [seed]);
  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState<Option | null>(null);
  const [history, setHistory] = useState<PlayedRound[]>([]);
  const current = game[round];
  const totalLost = history.reduce((sum, item) => sum + item.selected.loss, 0);
  const balance = STARTING_BALANCE - totalLost;
  const finished = round === game.length;

  const choose = useCallback((option: Option) => {
    if (selected || finished || !current) return;
    setSelected(option);
    setHistory((previous) => [...previous, { scenario: current, selected: option }]);
  }, [current, finished, selected]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (selected || finished || !current) return;
      const index = LETTERS.indexOf(event.key.toUpperCase() as (typeof LETTERS)[number]);
      const option = current.options[index];
      if (index >= 0 && option) choose(option);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [choose, current, finished, selected]);

  const nextRound = () => {
    setSelected(null);
    setRound((value) => value + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const replay = () => {
    setSeed((value) => value + 97);
    setRound(0);
    setSelected(null);
    setHistory([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-svh bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b-2 border-foreground bg-money px-4 py-3 shadow-game-sm sm:py-4">
        <div className="mx-auto grid max-w-4xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-normal text-money-foreground/70">Gill’s balance</p>
            <p className="truncate font-display text-2xl font-black tabular-nums text-money-foreground sm:text-4xl" aria-live="polite">
              {money.format(balance)}
            </p>
          </div>
          <div className="shrink-0 border-2 border-money-foreground bg-background px-3 py-1.5 text-center shadow-game-xs">
            <span className="block text-[10px] font-black uppercase text-muted-foreground">Round</span>
            <span className="font-display text-lg font-black text-foreground">{finished ? 3 : round + 1}<span className="text-muted-foreground">/3</span></span>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        {!finished && current ? (
          <section className="animate-game-in" key={`${seed}-${round}`}>
            <div className="mb-7 text-center sm:mb-10">
              <div className="mb-4 text-5xl" aria-hidden="true">{current.icon}</div>
              {round === 0 && history.length === 0 ? <p className="mb-3 font-bold text-primary">Gill is loaded. Let’s make him less loaded.</p> : null}
              <p className="mb-2 text-xs font-black uppercase text-muted-foreground">Round {round + 1} · {current.label}</p>
              <h1 className="mx-auto max-w-3xl font-display text-2xl font-black leading-tight sm:text-4xl">{current.setup}</h1>
            </div>

            <div className="grid gap-3" aria-label="Choose an attack">
              {current.options.map((option, index) => {
                const isSelected = selected === option;
                const isBest = Boolean(option.best);
                return (
                  <Button
                    key={option.attack}
                    variant={selected ? (isSelected ? "answerSelected" : isBest ? "answerBest" : "answerMuted") : "answer"}
                    size="answer"
                    disabled={Boolean(selected)}
                    onClick={() => choose(option)}
                    className="h-auto min-h-20 whitespace-normal"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center border-2 border-current bg-background font-display text-lg font-black text-foreground">{LETTERS[index]}</span>
                    <span className="min-w-0 text-left">
                      <span className="block font-black">{option.attack}</span>
                      <span className="mt-0.5 block text-sm font-medium opacity-75">{option.example}</span>
                    </span>
                    {selected && isBest ? <Check className="ml-auto size-5 shrink-0" aria-label="Biggest drain" /> : null}
                  </Button>
                );
              })}
            </div>

            {!selected ? <p className="mt-5 text-center text-sm font-semibold text-muted-foreground">Pick A, B, C, or D</p> : (
              <div className="mt-6 animate-result-in border-2 border-foreground bg-card p-5 shadow-game sm:p-7" aria-live="polite">
                <p className="font-display text-3xl font-black text-destructive sm:text-4xl">💸 −{money.format(selected.loss)}</p>
                <p className="mt-3 font-semibold leading-relaxed">{selected.result}</p>
                {!selected.best ? (
                  <p className="mt-4 border-l-4 border-accent pl-4 text-sm leading-relaxed">
                    <strong>The biggest drain was {current.options.find((option) => option.best)?.attack}</strong> because {current.whyBest}
                  </p>
                ) : <p className="mt-4 inline-flex items-center gap-2 font-black text-success"><Sparkles className="size-5" /> Biggest drain. Nailed it!</p>}
                <div className="mt-5 flex gap-3 bg-shield p-4 text-shield-foreground">
                  <ShieldCheck className="mt-0.5 size-5 shrink-0" />
                  <p className="text-sm leading-relaxed"><strong>How to stop it:</strong> {current.prevention}</p>
                </div>
                <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-t-2 border-border pt-5">
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase text-muted-foreground">New balance</p>
                    <p className="truncate font-display text-xl font-black tabular-nums">{money.format(balance)}</p>
                  </div>
                  <Button variant="game" size="game" onClick={nextRound}>
                    {round === 2 ? "See results" : "Next round"}<ArrowRight className="size-5" />
                  </Button>
                </div>
              </div>
            )}
          </section>
        ) : (
          <section className="animate-game-in text-center">
            <div className="text-6xl" aria-hidden="true">🏁</div>
            <p className="mt-4 text-xs font-black uppercase text-muted-foreground">Game over</p>
            <h1 className="mt-2 font-display text-4xl font-black sm:text-6xl">Gill felt that.</h1>
            <p className="mt-5 text-lg font-semibold">You drained</p>
            <p className="font-display text-4xl font-black tabular-nums text-destructive sm:text-6xl">{money.format(totalLost)}</p>
            <p className="mt-3 text-sm font-bold text-muted-foreground">Final balance: {money.format(balance)}</p>

            <div className="mx-auto mt-9 max-w-2xl border-2 border-foreground bg-card p-5 text-left shadow-game sm:p-7">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 border-b-2 border-border pb-4">
                <h2 className="font-display text-xl font-black">Best attacks</h2>
                <p className="shrink-0 font-black text-primary">{history.filter((item) => item.selected.best).length} / 3 nailed</p>
              </div>
              <ol className="divide-y-2 divide-border">
                {history.map((item) => {
                  const best = item.scenario.options.find((option) => option.best);
                  return (
                    <li key={item.scenario.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-4">
                      <span className="text-2xl">{item.scenario.icon}</span>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-muted-foreground">{item.scenario.label}</p>
                        <p className="font-black">{best?.attack}</p>
                        {!item.selected.best ? <p className="text-xs text-muted-foreground">You picked {item.selected.attack}</p> : null}
                      </div>
                      <span className={cn("grid h-8 w-8 shrink-0 place-items-center border-2 border-foreground font-black", item.selected.best ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground")}>
                        {item.selected.best ? "✓" : "—"}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
            <Button variant="game" size="game" onClick={replay} className="mt-7">
              <RotateCcw className="size-5" /> Play again
            </Button>
            <p className="mt-4 text-sm font-semibold text-muted-foreground">New situations. New answer order.</p>
          </section>
        )}
      </div>
      <footer className="px-4 pb-8 text-center text-xs font-semibold text-muted-foreground">A safe, conceptual game about AI security.</footer>
    </main>
  );
}