## todo

- now: search flow
- then: set focus on query response = to searched thing

- write validation function to ensure that all entry names and all elements in "proof"
  line up with each other, run it on the build script in package.json

- get proof tree (complex)
- get consequences (complex)
- get connection (complex)

- highlight/colorize the source node that the user searched for?

- command+click allows for multi-selection of nodes.
  see if we can disable this or if we want to use.

- get number of proof/consequence/connection trees

- text search that shows what entries include said concept

- do Part I only for everything,
  then do the rest of the book once all features are implemented

- plain version of the book, but any mentioned to previous text is a ling to that part of the book (or open a modal with that text?)

- highlight the path (or nodes?) that is common to all versions, when multiple are found

- use gutenberg project for translations of the ethics;
  email edwin curley (or someone) asking for permition to use edwin's translation

- give credit to all other tools, and gutenberg project

- max zoom relative to number of nodes in results

- start with plain text, but later move towards having react component (formatted and with links) that is later parsed when doing text search. (see chatgpt link for code samples)

// function makeDomEntry(title: string, content: string) {
// return `//   <div className="entry">
//     <h3 className="entry-title"></h3>
//     <p className="entry-text"></p>
//   </div>
//  `
// }

// function stripHtmlWithDOMParser(html: string) {
// const parser = new DOMParser()
// const doc = parser.parseFromString(html, "text/html")
// return doc.body.textContent || ""
// }
