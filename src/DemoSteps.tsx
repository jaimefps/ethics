import { Steps } from "intro.js-react"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useDemoContext } from "./context/DemoContext"
import { useExploreContext } from "./context/ExploreContext"
import { isMobile } from "react-device-detect"
import { logAnalytics } from "./lib/analytics"

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// demo selector:
function ds(demoId: string) {
  return `[data-demo="${demoId}"]`
}

const steps = [
  {
    // 0
    intro:
      "Welcome to a 1 min tour of the app. Just click 'next', and I'll take care of the rest.",
  },
  {
    // 1
    element: ds("spinoza"),
    intro:
      "If you don't know about Spinoza, I highly recommend you read about him, but let's move on to the app!",
  },
  {
    // 2
    element: ds("notation"),
    intro:
      "The 'about' tab also has a section explaining how we reference entries in Spinoza's Ethics. For example, e1p2 means Proposition 2 of Part 1 of the Ethics.",
  },
  {
    // 3
    element: ds("book-picker"),
    intro: "Over on the 'explore' tab, you can read the Ethics...",
  },
  {
    // 4
    element: ds("connection-picker"),
    intro:
      "or better yet, you can illustrate the logical structure of the book. Let's try to find a connection between two entries!",
  },
  {
    // 5
    element: ds("entry-pickers"),
    intro:
      "Here you can pick what entries you want to illustrate via a logical dependency graph.",
  },
  {
    // 6
    element: ds("entry-preview-tabs"),
    intro: "You can preview any selected entries here.",
  },
  {
    // 7
    element: ds("submit-query"),
    intro: "And once you're satisfied, you can submit to generate.",
  },
  {
    // 8
    element: ds("query-details"),
    intro: `Woah, a graph has appeared! You can ${
      isMobile ? "pinch" : "scroll"
    } on the graph to zoom, drag the nodes around, or click any node to open the Reader for it.`,
  },
  {
    // 9
    element: ds("book-entry-content"),
    intro:
      "When you click a node, you'll open the Reader where you can study that entry as well as...",
  },
  {
    // 10
    element: ds("entry-header"),
    intro: "thumb through entries, bookmark, or set your favorites.",
  },
  {
    // 11
    element: ds("entry-proofs"),
    intro: "You can skip over to any of the proofs for this specific entry.",
  },
  {
    // 12
    element: ds("book-controls"),
    intro: "Or instantly navigate to any of the entries in the book.",
  },
  {
    // 13: only on small screens:
    element: ds("mobile-open-notes"),
    intro: "You can open the notes section here.",
  },
  {
    // 14
    element: ds("book-notes"),
    intro:
      "And take notes about the entry, which will be stored on your browser/device.",
  },
  {
    // 15
    element: ds("graph-controls"),
    intro:
      "If you close the book, you can continue exploring the graph, or reset to generate different graphs.",
    position: isMobile ? "bottom" : "left",
  },
  {
    // 16
    element: ds("about-me"),
    intro:
      "And this is me! Thanks for taking a look around. I hope you find this app useful. Bye!",
  },
]

export const DemoSteps = () => {
  const navigate = useNavigate()
  const { setMode, reset, setInputNodes, setOpenNotes, setFocusNode } =
    useExploreContext()
  const { tourRef, enabled, setEnabled, demoNodes, stepNum, setStepNum } =
    useDemoContext()

  useEffect(() => {
    // induce syncs between steps:
    if (enabled && tourRef.current) {
      tourRef.current.updateStepElement(stepNum ?? 0)
    }
  }, [enabled, stepNum, tourRef])

  useEffect(() => {
    // if user clicks back during the
    // demo, we simply kill the demo:
    const handleBackButton = () => tourRef.current?.introJs.exit()
    window.addEventListener("popstate", handleBackButton)
    return () => window.removeEventListener("popstate", handleBackButton)
  }, [tourRef])

  return (
    <Steps
      options={{
        showProgress: true,
        showBullets: false,
        disableInteraction: true,
        exitOnOverlayClick: false,
      }}
      steps={steps}
      ref={tourRef}
      enabled={enabled}
      initialStep={0} // always from 0
      onAfterChange={async (step) => {
        const smallScreen = window.innerWidth < 850
        if (step === 13 && tourRef.current?.introJs._direction === "forward") {
          if (!smallScreen) tourRef.current?.introJs.nextStep()
        }
        if (step === 13 && tourRef.current?.introJs._direction === "backward") {
          if (!smallScreen) tourRef.current?.introJs.previousStep()
        }
      }}
      onBeforeChange={async (step) => {
        // force resync:
        setStepNum(step)
        // for conditional steps:
        const smallScreen = window.innerWidth < 850

        if (step === 0) {
          // do & undo
          navigate("/")
        }
        if (step === 1) {
          // do & undo
          navigate("/about/spinoza")
        }
        if (step === 2) {
          // do & undo
          navigate("/about/notation")
        }
        if (step === 3) {
          // do & undo
          navigate("/explore")
        }

        if (step === 4) {
          // undo 5
          setMode(undefined)
        }
        if (step === 5) {
          // do
          setMode("connection")
        }
        if (step === 7) {
          // undo 8
          setInputNodes(undefined)
        }
        if (step === 8) {
          // undo 9
          setFocusNode(undefined)
          // do
          setInputNodes([demoNodes.from, demoNodes.to])
        }
        if (step === 9) {
          setFocusNode(demoNodes.to)
          await delay(500) // wait for transitions to finish
          tourRef.current?.updateStepElement(step)
        }

        if (step === 12) {
          // safari on iOS is shit and breaks on this step.
          // careful if order of steps is changed, as
          // this error will pop up somewhere else:
          window.scrollTo(0, 0)
          await delay(100)
          tourRef.current?.updateStepElement(step)
        }

        // how to open notes
        // on small screen:
        if (step === 13) {
          if (smallScreen) {
            // undo 14
            setOpenNotes(false)
          }
        }

        // where to take notes,
        // based on screen size:
        if (step === 14) {
          // undo 15
          if (tourRef.current?.introJs._direction === "backward") {
            setFocusNode(demoNodes.to) // open book
            await delay(400) // transition
            tourRef.current?.updateStepElement(step)
          }

          if (smallScreen) {
            // do & undo
            setOpenNotes(true) // open notes
            await delay(400) // transition
            tourRef.current?.updateStepElement(step)
          }
        }

        if (step === 15) {
          // undo 16
          navigate("/explore")
          // do
          setOpenNotes(false) // close notes
          setFocusNode(undefined) // close book
          // tourRef.current?.updateStepElement(step)
        }

        if (step === 16) {
          // do
          navigate("/about/credits")
          logAnalytics("tour-complete")
        }
      }}
      onStart={() => {
        reset()
      }}
      onExit={() => {
        navigate("/")
        setEnabled(false)
        setStepNum(0)
        reset()
      }}
    />
  )
}
