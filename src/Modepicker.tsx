import { useExploreContext } from "./context/ExploreContext"
import MenuBookIcon from "@mui/icons-material/MenuBook"
import HubIcon from "@mui/icons-material/Hub"
import { GraphMode } from "./types"
import "./ModePicker.css"

export const ModePicker: React.FC<{
  setMode: (m: GraphMode) => void
}> = ({ setMode }) => {
  const { setFocusNode } = useExploreContext()
  return (
    <div className="mode-picker">
      <h2 className="mode-picker-header">
        What do you want to explore in the Ethics?
      </h2>
      <button
        className="mode-picker-button"
        onClick={() => setMode("connection")}
      >
        <div className="mode-picker-button-label">
          <HubIcon fontSize="small" /> Connection
        </div>
        <div className="mode-picker-button-description">
          Illustrate the chain of arguments that connects any two statements.
        </div>
      </button>
      <button
        className="mode-picker-button"
        onClick={() => setMode("descendancy")}
      >
        <div className="mode-picker-button-label">
          <HubIcon fontSize="small" /> Descendancy
        </div>
        <div className="mode-picker-button-description">
          Illustrate the complete chain of consequences for a single statement.
        </div>
      </button>
      <button
        className="mode-picker-button"
        onClick={() => setMode("ancestry")}
      >
        <div className="mode-picker-button-label">
          <HubIcon fontSize="small" /> Ancestry
        </div>
        <div className="mode-picker-button-description">
          Illustrate the complete chain of proofs for a single statement.
        </div>
      </button>
      <button
        className="mode-picker-button"
        // todo: get this value from localStorage!!
        onClick={() => setFocusNode("e1apx")}
      >
        <div className="mode-picker-button-label">
          <MenuBookIcon fontSize="small" /> Book reader
        </div>
        <div className="mode-picker-button-description">
          You just want to read the Ethics, maybe take notes or save your
          favorite entries.
        </div>
      </button>
    </div>
  )
}
