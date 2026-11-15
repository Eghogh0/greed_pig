import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import pig0 from "../assets/pig-0.png";
import pig2 from "../assets/pig-2.png";
import pig7 from "../assets/pig-7.png";
import pig12 from "../assets/pig-12.png";
import dice2 from "../assets/dice_2.png";
import dice3 from "../assets/dice_3.png";
import dice4 from "../assets/dice_4.png";
import dice5 from "../assets/dice_5.png";
import dice6 from "../assets/dice_6.png";
import { saveOnboardingCompletion } from "../utils/onboarding";

const diceFaces = { 2: dice2, 3: dice3, 4: dice4, 5: dice5, 6: dice6 };

const steps = [
  {
    eyebrow: "WELCOME",
    title: "Meet Greedy Pig",
    body: "Greedy Pig is a turn-based dice game for friends. Your goal is to be the first player to reach the target score.",
    tip: "The default target is 100 points, and you can change it before the game starts.",
  },
  {
    eyebrow: "STEP 1 OF 3",
    title: "Roll to build your turn score",
    body: "On your turn, roll the die. A result from 2 to 6 is added to your running points, and you can roll again.",
    tip: "Running points are not yet safe: they only become part of your total when you pass.",
  },
  {
    eyebrow: "STEP 2 OF 3",
    title: "Choose when to pass",
    body: "Press PASS to bank your running points and hand the turn to the next player.",
    tip: "If you roll a 1, you lose the running points from that turn and the next player goes. The choice is yours: keep rolling or play it safe.",
  },
  {
    eyebrow: "STEP 3 OF 3",
    title: "Set up your table",
    body: "Add at least two players, enter their names, and use the arrows to choose their pig avatars. You can also change the target score.",
    tip: "When everyone is ready, choose Start Game. Have fun!",
  },
];

function StepVisual({ index }) {
  if (index === 0) {
    return (
      <div className="mb-6 flex items-center justify-center">
        <img
          alt="The Greedy Pig mascot"
          src={pig0}
          width={112}
          className="h-auto w-24 drop-shadow-[0_10px_30px_rgba(211,12,188,0.45)] sm:w-28"
        />
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="mb-6 flex items-end justify-center gap-2 sm:gap-4">
        {Object.entries(diceFaces).map(([face, image]) => (
          <div key={face} className="flex flex-col items-center gap-1.5">
            <img
              alt={`Die showing ${face}`}
              src={image}
              width={40}
              className="h-auto w-10 rounded-md sm:w-12"
            />
            <span className="text-xs font-bold text-[#76C9F1] sm:text-sm">
              +{face}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (index === 2) {
    return (
      <div className="mb-6 flex items-center justify-center gap-3 sm:gap-5">
        <div className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-center">
          <p className="text-[10px] font-bold tracking-[0.2em] text-white/60">
            RUNNING
          </p>
          <p className="pri-font text-2xl text-white sm:text-3xl">14</p>
        </div>
        <span aria-hidden="true" className="text-xl text-[#F17BE3] sm:text-2xl">
          →
        </span>
        <div className="rounded-xl border border-[#76C9F1]/40 bg-[#76C9F1]/10 px-5 py-3 text-center">
          <p className="text-[10px] font-bold tracking-[0.2em] text-[#76C9F1]">
            BANKED
          </p>
          <p className="pri-font text-2xl text-[#76C9F1] sm:text-3xl">+14</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 flex items-center justify-center gap-3 sm:gap-5">
      {[pig2, pig7, pig12].map((image, position) => (
        <div key={image} className="flex flex-col items-center gap-2">
          <div className="rounded-full border-2 border-white/20 bg-white/10 p-1">
            <img
              alt={`Example pig avatar ${position + 1}`}
              src={image}
              width={56}
              className="h-12 w-12 rounded-full object-cover sm:h-14 sm:w-14"
            />
          </div>
          <span className="text-xs text-white/60">
            Player {position + 1}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function FirstTimeOnboarding({ open, onClose }) {
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (open) setStepIndex(0);
  }, [open]);

  if (!open) return null;

  const step = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  function finishTutorial() {
    saveOnboardingCompletion();
    onClose();
    navigate("/live-game/setup");
  }

  function skipTutorial() {
    saveOnboardingCompletion();
    onClose();
  }

  function next() {
    if (isLastStep) {
      finishTutorial();
      return;
    }

    setStepIndex((currentIndex) => currentIndex + 1);
  }

  function back() {
    setStepIndex((currentIndex) => Math.max(0, currentIndex - 1));
  }

  return (
    <div
      className="onboarding-backdrop fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm"
      onKeyDown={(event) => {
        if (event.key === "Escape") skipTutorial();
        if (event.key === "ArrowRight") next();
        if (event.key === "ArrowLeft") back();
      }}
    >
      <section
        aria-labelledby="onboarding-title"
        aria-modal="true"
        className="onboarding-card w-full max-w-xl rounded-2xl border border-white/20 bg-[#17131c] p-6 text-white shadow-2xl sm:p-9"
        role="dialog"
      >
        <div className="mb-7 flex items-center justify-between gap-4">
          <p className="pri-font text-xs tracking-[0.2em] text-[#F17BE3]">
            GREEDY PIG GUIDE
          </p>
          <button
            className="rounded px-2 py-1 text-sm text-white/70 underline decoration-white/40 underline-offset-4 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#F17BE3]"
            onClick={skipTutorial}
            type="button"
          >
            Skip tutorial
          </button>
        </div>

        <div
          aria-label={`Step ${stepIndex + 1} of ${steps.length}`}
          className="mb-6 flex gap-2"
          role="group"
        >
          {steps.map((item, index) => (
            <span
              aria-current={index === stepIndex ? "step" : undefined}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                index <= stepIndex ? "bg-[#D30CBD]" : "bg-white/15"
              }`}
              key={item.title}
            />
          ))}
        </div>

        <div aria-live="polite">
          <div className="onboarding-step" key={stepIndex}>
            <StepVisual index={stepIndex} />
            <p className="mb-2 text-xs font-bold tracking-[0.18em] text-[#76C9F1]">
              {step.eyebrow}
            </p>
            <h2
              className="pri-font mb-4 text-2xl leading-snug sm:text-3xl"
              id="onboarding-title"
            >
              {step.title}
            </h2>
            <p className="text-base leading-7 text-white/85 sm:text-lg">
              {step.body}
            </p>
            <p className="mt-5 rounded-lg border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white/75 sm:text-base">
              {step.tip}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <button
            className="rounded-lg border border-white/25 px-5 py-3 font-semibold text-white/80 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#76C9F1] disabled:cursor-not-allowed disabled:opacity-40"
            disabled={stepIndex === 0}
            onClick={back}
            type="button"
          >
            Back
          </button>
          <button
            autoFocus
            className="rounded-lg bg-[#D30CBD] px-6 py-3 font-bold text-white transition hover:bg-[#ed20d5] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#17131c]"
            onClick={next}
            type="button"
          >
            {isLastStep ? "Let's play" : "Next"}
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-white/40">
          You can replay this guide any time from the home screen.
        </p>
      </section>
    </div>
  );
}
