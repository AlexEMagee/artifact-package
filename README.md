# artifact-package

A small JavaScript package for creating and managing in-memory artifact libraries. A library contains categories, and each category contains artifacts with a title, type, and snippet.

The package does not read or write files or depend on VS Code APIs. The consuming application is responsible for choosing where serialized library data is stored.

## Installation

Install the package from its GitHub repository:

```sh
npm install git+https://github.com/AlexEMagee/artifact-package.git
```

The package uses CommonJS:

```js
const { Library } = require("artifact-package");
```

## Usage

```js
const { Library } = require("artifact-package");

const library = new Library();

library.addCategory("JavaScript");
library.addArtifactToCategory(
  "Debug Utilities",
  "Print Hello World",
  "js",
  "console.log('Hello, world!');"
);

console.log(library.getCategories());
// ["Debug Utilities"]

console.log(library.getCategoryArtifacts("JavaScript"));
// ["Print Hello World"]

console.log(library.getArtifact("JavaScript", "Hello World"));
// {
//   title: "Hello World",
//   type: "js",
//   snippet: "console.log('Hello, world!');"
// }
```

Titles must be non-empty strings. Category titles must be unique within a library, and artifact titles must be unique within their category. Comparisons are exact and case-sensitive.

## API

- `new Library()` — create an empty library.
- `addCategory(title)` — add a category.
- `getCategories()` — return category titles.
- `addArtifactToCategory(categoryTitle, artifactTitle, artifactType, artifactSnippet)` — add an artifact.
- `getCategoryArtifacts(categoryTitle)` — return artifact titles in a category.
- `getArtifact(categoryTitle, artifactTitle)` — return an artifact data object.
- `modifyArtifactInCategory(categoryTitle, artifactTitle, newArtifactTitle, newArtifactType, newArtifactSnippet)` — update an artifact. Pass `null` or `undefined` for fields to leave unchanged.
- `removeArtifactFromCategory(categoryTitle, artifactTitle)` — remove an artifact.
- `copyArtifact(categoryFromTitle, categoryToTitle, artifactTitle)` — copy an artifact to another category.
- `moveArtifact(categoryFromTitle, categoryToTitle, artifactTitle)` — move an artifact to another category.
- `toJSON()` — return a plain data object suitable for `JSON.stringify`.
- `Library.fromJSON(jsonString)` — validate and create a library from a JSON string.

Invalid titles, missing categories or artifacts, and duplicate titles throw errors.

## Saving and loading

Serialize the library to a JSON string, then store it using the host application's preferred storage mechanism:

```js
const savedData = JSON.stringify(library, null, 2);

// For example, write savedData to a file or extension storage.
```

Restore a library from that string:

```js
const restoredLibrary = Library.fromJSON(savedData);
```

The serialized data includes a `schemaVersion` field. `Library.fromJSON` currently accepts schema version `1`.
