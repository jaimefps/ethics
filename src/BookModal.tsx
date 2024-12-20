import "./BookModal.css"
import React, { forwardRef, useEffect, useRef, useState } from "react"
import Slide from "@mui/material/Slide"
import Dialog from "@mui/material/Dialog"
import CloseIcon from "@mui/icons-material/Close"
import { TransitionProps } from "@mui/material/transitions/transition"
import { useExploreContext } from "./context/ExploreContext"
import BookmarkIcon from "@mui/icons-material/Bookmark"
import StarIcon from "@mui/icons-material/Star"
import MenuBookIcon from "@mui/icons-material/MenuBook"
import IconButton from "@mui/material/IconButton"
import PassPageIcon from "@mui/icons-material/ArrowForwardIos"
import ChatIcon from "@mui/icons-material/Chat"
import ArrowDownwardIcon from "@mui/icons-material/KeyboardArrowDown"
import { bookGraph, getNodeIdx, getNodeText } from "./lib/graph"
import { useStorageContext } from "./context/StorageContext"
import PanToolAltIcon from "@mui/icons-material/PanToolAlt"
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import Snackbar from "@mui/material/Snackbar"
import AddCommentIcon from "@mui/icons-material/Save"
import { Tooltip } from "@mui/material"
import { EntryMenu } from "./EntryMenu"
import { formatDate, usePrevious } from "./lib/utils"
import { logAnalytics } from "./lib/analytics"
import { isMobile } from "react-device-detect"
import { Translations } from "./Translations"
import { book } from "./lib/book"
import cs from "clsx"
import { FeedbackFish } from "@feedback-fish/react"

const UpdateAlert = () => {
  const [alert, setAlert] = useState<any>(undefined)
  const { storage } = useStorageContext()

  const prev = usePrevious(storage.bookmark)
  const curr = storage.bookmark

  useEffect(() => {
    if (prev && curr && prev !== curr) {
      setAlert(
        <>
          Bookmark moved from <b>{prev}</b> to <b>{curr}</b>
        </>
      )
    }
  }, [prev, curr])

  return (
    <Snackbar
      key="bookmark-update"
      open={!!alert}
      autoHideDuration={5000}
      message={alert}
      onClose={() => setAlert(undefined)}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      action={
        <IconButton
          size="small"
          color="inherit"
          aria-label="close"
          onClick={() => setAlert(undefined)}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      }
      ContentProps={{
        style: {
          color: "black",
          background: "darkseagreen",
          fontSize: "1.1rem",
        },
      }}
    />
  )
}

const placeHolderItem = [
  {
    createdAt: 1,
    text: (
      <>
        <PanToolAltIcon
          fontSize="medium"
          style={{
            marginBottom: `-0.4rem`,
            transform: "rotate(180deg)",
          }}
        />{" "}
        Take your first note below.
      </>
    ),
  },
]

const Notes: React.FC<{
  noteText: string
  setNoteText: (s: string) => void
  demoId: string
}> = ({ noteText, setNoteText, demoId }) => {
  const { storage, addNote, clearNote } = useStorageContext()
  const { focusNode } = useExploreContext()

  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollToEnd = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current?.scrollHeight
    }
  }

  // todo: consider if there is
  // a better way than this:
  if (!focusNode) {
    throw new Error("Failed to render notes section")
  }

  // can have empty array after
  // adding and deleting notes:
  const notes = storage.notes[focusNode]?.length
    ? storage.notes[focusNode]
    : placeHolderItem

  useEffect(() => scrollToEnd(), [notes])

  function handleSubmit(targetNode: string) {
    if (!noteText.length) {
      window.alert("Write something first!")
      return
    }
    logAnalytics("take-notes")
    addNote(targetNode, noteText)
    setNoteText("")
  }

  return (
    <div data-demo={demoId} className="book-entry-notes">
      <div ref={scrollRef} className="book-entry-notes-stored-group">
        {notes.map((note, idx) => {
          const thisKey = `${note.text}_${note.createdAt}`
          const isPlaceholder = note.createdAt === 1
          const dateStr = formatDate(note.createdAt)
          return (
            <div
              key={thisKey}
              className="book-entry-notes-stored"
              style={{
                // boxShadow: isPlaceholder ? "none" : undefined,
                background: isPlaceholder ? "beige" : undefined,
                color: isPlaceholder ? "darkslategray" : undefined,
                opacity: isPlaceholder ? 0.5 : undefined,
              }}
            >
              <div
                className="note-triangle-corner"
                style={{
                  borderBottomColor: isPlaceholder ? "beige" : undefined,
                }}
              />
              <div className="notes-stored-left">
                <div>{note.text}</div>
                {!isPlaceholder && (
                  <div className="note-stored-date">{dateStr}</div>
                )}
              </div>

              <div className="notes-stored-right">
                {!isPlaceholder && (
                  <Tooltip title="delete note">
                    <IconButton
                      aria-label="delete note"
                      onClick={() => clearNote(focusNode, idx)}
                      style={{ border: "1px solid lightgray" }}
                      size="small"
                    >
                      <DeleteForeverIcon
                        style={{
                          color: "lightgray",
                          fontSize: "1rem",
                        }}
                        sx={{
                          ":focus": {
                            opacity: 0.8,
                          },
                          ":hover": {
                            opacity: 0.8,
                          },
                        }}
                      />
                    </IconButton>
                  </Tooltip>
                )}
              </div>
            </div>
          )
        })}
      </div>
      <div className="book-entry-notes-form">
        <textarea
          value={noteText}
          placeholder="Your insights here..."
          className="book-entry-form-input"
          onChange={(ev) => setNoteText(ev.target.value)}
          onKeyDown={(ev) => {
            if (ev.key === "Enter") {
              ev.preventDefault()
              handleSubmit(focusNode)
            }
          }}
        />
        <IconButton
          size="medium"
          aria-label="save note for entry"
          style={{
            marginLeft: "0.8rem",
            background: "orangered",
          }}
          onClick={() => handleSubmit(focusNode)}
        >
          <AddCommentIcon style={{ color: "white" }} />
        </IconButton>
      </div>
    </div>
  )
}

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />
})

export const BookModal = () => {
  const [noteText, setNoteText] = useState("")
  const { focusNode, setFocusNode, openNotes, setOpenNotes, lang } =
    useExploreContext()
  const { storage, setBookmark, clearBookmark, setFavorite, clearFavorite } =
    useStorageContext()

  // if the focus node changes, make sure to hide
  // the notes, to avoid adding notes to wrong entry:
  useEffect(() => {
    setOpenNotes(false)
  }, [setOpenNotes, focusNode])

  // todo: consider if there is
  // a better way than this:
  if (!focusNode) {
    return null
  }

  const focusIdx = getNodeIdx(focusNode)
  const parents = bookGraph.getParents(focusNode)
  const isFavorite = storage.favorites[focusNode]
  const isFirstEntry = focusIdx === 0
  const isLastEntry = focusIdx === book.length - 1

  function handleClose() {
    setFocusNode(undefined)
    setOpenNotes(false)
  }

  return (
    <Dialog
      fullScreen
      open={!!focusNode}
      onClose={handleClose}
      TransitionComponent={Transition}
      transitionDuration={300}
    >
      <UpdateAlert />
      <div className="book-modal">
        <div className="book-appbar">
          <div className="book-appbar-col-left">
            <div className="book-appbar-logo">
              <MenuBookIcon className="book-appbar-reader-icon" />
              <span className="book-appbar-logo-ext">book</span> reader
            </div>
            {/* Safari has issues getting to this demo step for some reason... */}
            <div data-demo="book-controls" id="book-controls-demo-anchor">
              <EntryMenu />
            </div>
          </div>

          <div className="book-appbar-col-right">
            <IconButton
              aria-label="close"
              style={{ color: "ghostwhite" }}
              onClick={handleClose}
            >
              <CloseIcon />
            </IconButton>
          </div>
        </div>
        <div className="book-content">
          <div className="book-content-col-left">
            <div data-demo="entry-header" className="book-entry-name">
              <Tooltip title="previous entry">
                <span>
                  <IconButton
                    aria-label="go to previous entry"
                    disabled={isFirstEntry}
                    onClick={() => {
                      const newNodeName = book[focusIdx - 1][0]
                      setFocusNode(newNodeName)
                    }}
                  >
                    <PassPageIcon
                      className="book-pagination-icon"
                      style={{
                        transform: "rotate(180deg)",
                        opacity: isFirstEntry ? 0.3 : 1,
                      }}
                    />
                  </IconButton>
                </span>
              </Tooltip>
              {/* SPLIT */}
              <div
                id="demo-book-entry-name"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <Tooltip title="Bookmark this entry">
                  <IconButton
                    aria-label="bookmark this entry"
                    onClick={() => {
                      if (storage.bookmark === null) {
                        setBookmark(focusNode)
                        return
                      }
                      if (storage.bookmark === focusNode) {
                        const confirm = window.confirm(
                          "If you clear the bookmark, you'll start from the beginning the next time you open the book reader."
                        )
                        if (confirm) clearBookmark()
                        return
                      }
                      if (storage.bookmark !== null) {
                        // const confirm = window.confirm(
                        //   `Are you sure you want to change your bookmark from ${storage.bookmark} to ${focusNode}?`
                        // )
                        // if (confirm)
                        setBookmark(focusNode)
                        return
                      }
                    }}
                  >
                    <BookmarkIcon
                      className="book-entry-name-icon"
                      style={{
                        color:
                          storage.bookmark === focusNode
                            ? "orangered"
                            : undefined,
                      }}
                    />
                  </IconButton>
                </Tooltip>
                <div className="book-entry-name-text">{focusNode}</div>
                <Tooltip title="Save to favorites">
                  <IconButton
                    aria-label="save to favorites"
                    onClick={() => {
                      logAnalytics("favorite-entry")
                      if (storage.favorites[focusNode]) {
                        clearFavorite(focusNode)
                      } else {
                        setFavorite(focusNode)
                      }
                    }}
                  >
                    <StarIcon
                      className="book-entry-name-icon"
                      style={{
                        color: isFavorite ? "gold" : undefined,
                      }}
                    />
                  </IconButton>
                </Tooltip>
                <Tooltip title="open notes">
                  <IconButton
                    size="small"
                    data-demo="mobile-open-notes"
                    aria-label="open notes"
                    className="book-entry-notes-button"
                    onClick={() => setOpenNotes(true)}
                  >
                    <ChatIcon
                      style={{
                        color: "darkseagreen",
                        marginBottom: -4,
                      }}
                    />
                  </IconButton>
                </Tooltip>
              </div>
              {/* SPLIT */}
              <Tooltip title="next entry">
                <span>
                  <IconButton
                    aria-label="go to next entry"
                    disabled={isLastEntry}
                    onClick={() => {
                      const newNodeName = book[focusIdx + 1][0]
                      setFocusNode(newNodeName)
                    }}
                  >
                    <PassPageIcon
                      className="book-pagination-icon"
                      style={{
                        opacity: isLastEntry ? 0.3 : 1,
                      }}
                    />
                  </IconButton>
                </span>
              </Tooltip>
            </div>
            <div data-demo="book-entry-content" className="book-entry-content">
              <div className="book-entry-content-text">
                {getNodeText(focusNode, lang)}
                {parents.length > 0 && (
                  <div
                    data-demo="entry-proofs"
                    className="book-entry-proof-group"
                  >
                    <div className="book-entry-proof-info">
                      <Tooltip
                        arrow
                        title={
                          <div
                            style={{
                              textAlign: "justify",
                            }}
                          >
                            If the proof list seems incorrect, please verify
                            against the Latin version of the text. Translations
                            sometimes include mistakes. Otherwise, feel free to{" "}
                            <FeedbackFish projectId="13ad8b26700cb2">
                              <button
                                style={{
                                  all: "unset",
                                  color: "rgb(102, 179, 255)",
                                  cursor: "pointer",
                                }}
                              >
                                share feedback
                              </button>
                            </FeedbackFish>
                            .
                          </div>
                        }
                      >
                        <InfoOutlinedIcon
                          fontSize="small"
                          sx={{
                            color: "darkseagreen",
                            background: "white",
                            borderRadius: "50%",
                          }}
                        />
                      </Tooltip>
                    </div>
                    <p className="book-proofs-label">depends on:</p>
                    {parents.map((proof, idx, list) => (
                      <React.Fragment key={proof}>
                        <Tooltip title="jump to entry">
                          <button
                            className="book-entry-proof"
                            onClick={() => setFocusNode(proof)}
                          >
                            {proof}
                          </button>
                        </Tooltip>
                        {idx < list.length - 1 && ","}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
              <Translations />
            </div>
          </div>
          <div className="book-content-col-right">
            <Notes
              demoId={isMobile ? "" : "book-notes"}
              noteText={noteText}
              setNoteText={setNoteText}
            />
          </div>
          <div
            className={cs("book-notes-drawer", {
              open: openNotes,
            })}
          >
            <div className="book-notes-drawer-appbar">
              <p className="book-notes-drawer-appbar-title">
                notes on{" "}
                <b
                  style={{
                    fontWeight: 900,
                  }}
                >
                  {focusNode}
                </b>
              </p>
              <Tooltip title="hide notes">
                <IconButton
                  aria-label="close notes drawer"
                  onClick={() => setOpenNotes(false)}
                >
                  <ArrowDownwardIcon />
                </IconButton>
              </Tooltip>
            </div>
            <Notes
              demoId={isMobile ? "book-notes" : ""}
              noteText={noteText}
              setNoteText={setNoteText}
            />
          </div>
        </div>
      </div>
    </Dialog>
  )
}
