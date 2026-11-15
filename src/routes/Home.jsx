import { useState } from "react";
import logo from "../assets/pig-0.png";
import { Link } from "react-router-dom";
import FirstTimeOnboarding from "../components/FirstTimeOnboarding";
import { hasSeenOnboarding } from "../utils/onboarding";

export default function Home() {
  const [tutorialOpen, setTutorialOpen] = useState(
    () => !hasSeenOnboarding()
  );

  return (
    <>
      <section className="flex min-h-screen w-full flex-col items-center justify-center">
        <figure>
          <img src={logo} alt="Greedy Pig mascot" width={400} />
        </figure>
        <div className="flex flex-col gap-8 text-center text-[#F9F7E8]">
          <h1 className="pri-font text-3xl sm:text-5xl lg:text-6xl">
            Greedy Pig
          </h1>
          <div className="flex flex-col gap-4">
            {/* <Link
            to={`/play-computer`}
            className=" sec-font text-xl rounded px-8 py-4 bg-[#d30cbcc0] font-bold duration-500 skew-x-6 hover:skew-x-0 hover:scale-95 hover:bg-[#d30cbc] "
          >
            Play Computer
          </Link>
          <Link
            to={`/play-remote-game`}
            className=" sec-font text-xl rounded px-8 py-4 bg-[#d30cbcc0] font-bold duration-500 -skew-x-6 hover:bg-[#d30cbc] hover:skew-x-0 hover:scale-95  "
          >
            Play Friends (Remote)
          </Link> */}
            <Link
              to="/live-game/setup"
              className="sec-font skew-x-6 rounded bg-[#d30cbcc0] px-8 py-4 text-xl font-bold duration-500 hover:scale-95 hover:skew-x-0 hover:bg-[#d30cbc]"
            >
              Play Friends (Live)
            </Link>
            <button
              onClick={() => setTutorialOpen(true)}
              type="button"
              className="sec-font flex flex-col items-center gap-1 rounded px-4 py-1 text-sm text-[#F9F7E8]/70 transition hover:text-[#F9F7E8] focus:outline-none focus:ring-2 focus:ring-[#F17BE3]"
            >
              <span className="font-bold underline decoration-white/30 underline-offset-4">
                How to play?
              </span>
              <span className="text-xs">Replay the quick guide any time</span>
            </button>
          </div>
        </div>
      </section>
      <FirstTimeOnboarding
        open={tutorialOpen}
        onClose={() => setTutorialOpen(false)}
      />
    </>
  );
}
