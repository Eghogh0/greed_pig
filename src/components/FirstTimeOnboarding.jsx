import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import pig0 from "../assets/pig-0.png";
import pig2 from "../assets/pig-2.png";
import pig7 from "../assets/pig-7.png";
import pig12 from "../assets/pig-12.png";
import dice1 from "../assets/dice_1.png";
import dice2 from "../assets/dice_2.png";
import dice3 from "../assets/dice_3.png";
import dice4 from "../assets/dice_4.png";
import dice5 from "../assets/dice_5.png";
import dice6 from "../assets/dice_6.png";
import { hasSeenOnboarding, saveOnboardingCompletion } from "../utils/onboarding";
import "./FirstTimeOnboarding.css";

// Every screen the tutorial teaches is described once here, then rendered by
// the generic step layout. Adding or re-ordering a step is a data change.
const steps = [
  {
    id: "welcome",
    eyebrow: "WELCOME",
    title: "Meet Greedy Pig",
    body: "A fast, friendly dice game for two or more players. Take turns rolling the die, and be the first to reach the target score.",
    tip: "The target defaults to 100 points, and you can change it before the game starts.",
  },
  {
    id: "roll",
    eyebrow: "STEP 1 · THE DICE",
    title: "Roll to build your turn score",
    body: "Tap the die to roll. Anything from 2 to 6 is added to your running points, and you choose whether to roll again.",
    tip: "Running points are not safe yet. They only count toward your total when you bank them.",
  },
  {
    id: "bank",
    eyebrow: "STEP 2 · BANK OR BUST",
    title: "Know when to pass",
    body: "Press Pass to bank your running points into your total, and the turn moves to the next player. But the moment you roll a 1, that whole turn's running points are wiped.",
    tip: "That is the gamble at the heart of Greedy Pig: push for a bigger bank, or play it safe.",
  },
  {
    id: "shield",
    eyebrow: "STEP 3 · THE POWER-UP",
    title: "Earn a Lucky Shield",
    body: "Chain five safe rolls in a row to earn a Lucky Shield. If you roll a 1 while holding one, you get a choice: use the shield to save your running points, or let them go.",
    tip: "Watch the five-pip shield meter on the stats screen during the game. A shield protects you from one 1.",
  },
  {
    id: "table",
    eyebrow: "LAST · TABLE TIME",
    title: "Set up your table",
    body: "Add at least two players, give them names, and use the arrows to pick their pig avatars. Set the target score, then choose Start Game and pass the device around.",
    tip: "Your game is saved on the server. If you step away, the setup screen offers Resume Game so you can pick up where you left off.",
  },
];

const diceFaces = { 2: dice2, 3: dice3, 4: dice4, 5: dice5, 6: dice6 };

// The illustrated "stage" for each step. Each one previews the real game UI
// the player will meet, using the same assets the game itself uses.
function Stage({ index }) {
  switch (index) {
    case 0:
      return (
        <div className="flex flex-col items-center gap-3">
          <img
            src={pig0}
            alt="The Greedy Pig mascot"
            width={120}
            className="h-auto w-24 drop-shadow-[0_10px_28px_rgba(211,12,188,0.4)] sm:w-28"
          />
          <div className="flex items-center gap-2.5 rounded-full border border-[#76C9F1]/40 bg-[#76C9F1]/10 px-4 py-1.5">
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#76C9F1]">
              TARGET
            </span>
            <span className="pri-font text-lg text-white">100</span>
          </div>
        </div>
      );

    case 1:
      return (
        <div className="flex items-end justify-center gap-1.5 sm:gap-2.5">
          {Object.entries(diceFaces).map(([face, image]) => (
            <div key={face} className="flex flex-col items-center gap-1">
              <img
                src={image}
                alt={`Die showing ${face}`}
                width={36}
                className="h-auto w-9 rounded-md sm:w-11"
              />
              <span className="text-[10px] font-bold text-[#76C9F1] sm:text-xs">
                +{face}
              </span>
            </div>
          ))}
        </div>
      );

    case 2:
      return (
        <div className="flex w-full flex-col items-center gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="rounded-lg border border-white/15 bg-white/5 px-3.5 py-2 text-center">
              <p className="text-[9px] font-bold tracking-[0.2em] text-white/50">
                RUNNING
              </p>
              <p className="pri-font text-xl text-white">14</p>
            </div>
            <span aria-hidden="true" className="text-lg text-[#F17BE3]">
              →
            </span>
            <div className="rounded-lg border border-[#76C9F1]/40 bg-[#76C9F1]/10 px-3.5 py-2 text-center">
              <p className="text-[9px] font-bold tracking-[0.2em] text-[#76C9F1]">
                BANKED
              </p>
              <p className="pri-font text-xl text-[#76C9F1]">+14</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-[#D30C0C]/50 bg-[#D30C0C]/15 px-3 py-2">
            <img src={dice1} alt="Die showing 1" width={28} className="h-auto w-5 rounded" />
            <span className="text-[11px] font-bold tracking-wide text-[#ff8a7a] sm:text-xs">
              A 1 WIPES THE TURN
            </span>
          </div>
        </div>
      );

    case 3:
      return (
        <div className="flex w-full flex-col items-center gap-3">
          <span aria-hidden="true" className="text-4xl leading-none">
            🛡️
          </span>
          <div className="w-full max-w-[190px]">
            <div className="flex gap-1.5" aria-hidden="true">
              {[1, 2, 3, 4, 5].map((pip) => (
                <span key={pip} className="h-2 flex-1 rounded-full bg-[#4ade80]" />
              ))}
            </div>
            <p className="mt-1.5 text-center text-[10px] font-bold tracking-[0.18em] text-white/45">
              5 SAFE ROLLS = 1 SHIELD
            </p>
          </div>
          <p className="rounded-full border border-[#4ade80]/40 bg-[#4ade80]/10 px-3.5 py-1 text-[11px] font-bold text-[#86efac]">
            SHIELD SAVED YOUR 14 POINTS
          </p>
        </div>
      );

    default:
      return (
        <div className="flex items-center justify-center gap-2.5 sm:gap-3.5">
          {[pig2, pig7, pig12].map((image, position) => (
            <div key={image} className="flex flex-col items-center gap-1.5">
              <div className="rounded-full border-2 border-white/20 bg-white/10 p-1">
                <img
                  src={image}
                  alt={`Example pig avatar ${position + 1}`}
                  width={52}
                  className="h-12 w-12 rounded-full object-cover sm:h-14 sm:w-14"
                />
              </div>
              <span className="text-[10px] font-semibold text-white/55">
                PLAYER {position + 1}
              </span>
            </div>
          ))}
        </div>
      );
  }
}

export default function FirstTimeOnboarding() {
  const navigate = useNavigate();
  // The guide shows itself on the first visit; afterwards it stays available
  // through the "How to play?" button rendered at the bottom of this file.
  const [isOpen, setIsOpen] = useState(() => !hasSeenOnboarding());
  const [stepIndex, setStepIndex] = useState(0);
  const panelRef = useRef(null);
  const lastFocusedRef = useRef(null);

  const totalSteps = steps.length;
  const step = steps[stepIndex];
  const isLastStep = stepIndex === totalSteps - 1;

  // Every time the guide is opened, start from the first step.
  useEffect(() => {
    if (isOpen) setStepIndex(0);
  }, [isOpen]);

  // Move focus into the dialog while it is open, and hand focus back to
  // wherever it was when we closed.
  useEffect(() => {
    if (!isOpen) return undefined;
    lastFocusedRef.current = document.activeElement;
    panelRef.current?.focus();
    return () => {
      lastFocusedRef.current?.focus?.();
    };
  }, [isOpen]);

  function openGuide() {
    setIsOpen(true);
  }

  // Skip and finish both mark the guide as seen, so we never interrupt
  // the player again.
  function skipGuide() {
    saveOnboardingCompletion();
    setIsOpen(false);
  }

  function finishGuide() {
    saveOnboardingCompletion();
    setIsOpen(false);
    navigate("/live-game/setup");
  }

  function next() {
    if (isLastStep) {
      finishGuide();
      return;
    }
    setStepIndex((current) => current + 1);
  }

  function back() {
    setStepIndex((current) => Math.max(0, current - 1));
  }

  // Keep Tab / Shift+Tab cycling inside the dialog so keyboard users
  // cannot drift into the page behind the overlay.
  function trapFocus(event) {
    const panel = panelRef.current;
    if (!panel) return;
    const focusables = panel.querySelectorAll(
      'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;
    const inside = panel.contains(active);

    if (event.shiftKey) {
      if (!inside || active === first) {
        event.preventDefault();
        last.focus();
      }
    } else if (!inside || active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function handleKeyDown(event) {
    switch (event.key) {
      case "Escape":
        skipGuide();
        break;
      case "ArrowRight":
        next();
        break;
      case "ArrowLeft":
        back();
        break;
      case "Tab":
        trapFocus(event);
        break;
      default:
        break;
    }
  }

  if (!isOpen) {
    // Closed state: a small floating entry point so the guide can be
    // replayed by anyone sitting at the table.
    return (
      <button
        type="button"
        onClick={openGuide}
        aria-label="Replay the how-to-play guide"
        className="onboarding-replay sec-font fixed bottom-5 right-5 z-40 flex items-center gap-2.5 rounded-full border border-white/15 bg-[#17131c]/90 py-2 pl-2.5 pr-5 text-sm font-semibold text-white/85 shadow-xl backdrop-blur transition hover:border-[#F17BE3]/60 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#F17BE3]"
      >
        <span
          aria-hidden="true"
          className="pri-font grid h-7 w-7 place-items-center rounded-full bg-[#D30CBD] text-sm text-white"
        >
          ?
        </span>
        How to play?
      </button>
    );
  }

  return (
    <div
      className="onboarding-backdrop fixed inset-0 z-50 overflow-y-auto bg-[#0b0711]/90 p-4 backdrop-blur-sm sm:p-6"
      onKeyDown={handleKeyDown}
    >
      <div className="flex min-h-full items-center justify-center py-4">
        <section
          ref={panelRef}
          tabIndex={-1}
          aria-labelledby="onboarding-title"
          aria-modal="true"
          aria-describedby="onboarding-description"
          className="onboarding-card w-full max-w-3xl overflow-hidden rounded-xl border border-white/15 bg-[#17131c] text-white shadow-2xl outline-none"
          role="dialog"
        >
          <div
            aria-hidden="true"
            className="h-1.5 w-full bg-gradient-to-r from-[#D30CBD] via-[#F17BE3] to-[#76C9F1]"
          />

          <header className="flex items-center justify-between gap-4 px-5 pt-5 sm:px-7 sm:pt-6">
            <div className="flex items-center gap-2.5">
              <img src={pig0} alt="" aria-hidden="true" width={30} className="h-auto w-7" />
              <p className="pri-font text-[11px] tracking-[0.22em] text-[#F17BE3] sm:text-xs">
                GREEDY PIG · HOW TO PLAY
              </p>
            </div>
            <button
              type="button"
              onClick={skipGuide}
              className="rounded px-2 py-1 text-sm text-white/60 underline decoration-white/40 underline-offset-4 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-[#F17BE3]"
            >
              Skip
            </button>
          </header>

          <div className="px-5 pt-4 sm:px-7">
            <p aria-hidden="true" className="text-[10px] font-bold tracking-[0.25em] text-white/40">
              STEP {stepIndex + 1} OF {totalSteps}
            </p>
            <div aria-label="Tutorial progress" className="mt-2 flex gap-1.5" role="group">
              {steps.map((item, index) => (
                <span
                  aria-current={index === stepIndex ? "step" : undefined}
                  className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                    index <= stepIndex ? "bg-[#D30CBD]" : "bg-white/15"
                  }`}
                  key={item.id}
                />
              ))}
            </div>
          </div>

          <div className="grid gap-4 p-5 sm:grid-cols-[minmax(0,230px)_1fr] sm:gap-6 sm:p-7">
            <div className="flex min-h-[170px] items-center justify-center rounded-lg border border-white/10 bg-black/30 p-4 sm:min-h-[210px]">
              <div key={`stage-${stepIndex}`} className="onboarding-stage flex w-full items-center justify-center">
                <Stage index={stepIndex} />
              </div>
            </div>
            <div aria-live="polite" className="flex flex-col justify-center" id="onboarding-description">
              <div key={`text-${stepIndex}`} className="onboarding-step">
                <p className="mb-1.5 text-[11px] font-bold tracking-[0.2em] text-[#76C9F1]">
                  {step.eyebrow}
                </p>
                <h2 className="pri-font mb-3 text-2xl leading-snug sm:text-[28px]" id="onboarding-title">
                  {step.title}
                </h2>
                <p className="text-[15px] leading-6 text-white/85 sm:text-base sm:leading-7">
                  {step.body}
                </p>
                <p className="mt-4 rounded-lg border border-white/10 bg-white/5 p-3.5 text-[13px] leading-5 text-white/70 sm:text-sm sm:leading-6">
                  {step.tip}
                </p>
              </div>
            </div>
          </div>

          <footer className="flex flex-col-reverse gap-3 border-t border-white/10 bg-black/20 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-5">
            <button
              type="button"
              disabled={stepIndex === 0}
              onClick={back}
              className="rounded-lg border border-white/20 px-5 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#76C9F1] disabled:cursor-not-allowed disabled:opacity-35"
            >
              Back
            </button>
            <button
              type="button"
              onClick={next}
              className="-skew-x-6 rounded-lg bg-[#D30CBD] px-7 py-2.5 text-base font-bold text-white transition duration-300 hover:scale-95 hover:skew-x-0 hover:bg-[#ed20d5] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#17131c]"
            >
              {isLastStep ? "Start playing" : "Next"}
            </button>
          </footer>

          <p className="px-5 pb-4 text-center text-[11px] text-white/35">
            Replay this guide any time with the “How to play?” button on the home screen.
          </p>
        </section>
      </div>
    </div>
  );
}
