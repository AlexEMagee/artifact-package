class ArtifactCategory {
    #title;
    #artifacts;
    constructor(title) {
        this.#title = title;
        this.#artifacts = [];
    }

    getTitle() {
        return this.#title;
    }

    // add an artifact to the category
    addArtifact(title, type, snippet) {
        if(this.findArtifact(title) !== -1) {
            throw new Error(`Artifact with title "${title}" already exists in category "${this.#title}".`);
        }
        this.#artifacts.push(new Artifact(title, type, snippet));
    }
    
    // remove an artifact from the category
    removeArtifact(title) {
        const index = this.findArtifact(title);
        if(index !== -1) {
            this.#artifacts.splice(index, 1);
        } else {
            throw new Error(`Artifact with title "${title}" does not exist in category "${this.#title}".`);
        }
    }

    // modify an artifact in the category
    modifyArtifact(title, newTitle, newType, newSnippet) {
        const index = this.findArtifact(title);
        if(index === -1) {
            throw new Error(`Artifact with title "${title}" does not exist in category "${this.#title}".`);
        }
        const artifact = this.#artifacts[index];
        if(newTitle != null && this.findArtifact(newTitle) !== -1 && newTitle !== title) {
            throw new Error(`Artifact with title "${newTitle}" already exists in category "${this.#title}".`);
        } else {
            if(newTitle && this.validateTitle(newTitle)) {
                this.#artifacts[index].title = newTitle;
            }
            this.#artifacts[index].type = newType ?? artifact.type;
            this.#artifacts[index].snippet = newSnippet ?? artifact.snippet;
        }
    }

    copyArtifactFrom(artifactCategory, title) {
        if(!(artifactCategory instanceof ArtifactCategory)) {
            throw new Error(`Supplied artifactCategory is not an instance of ArtifactCategory.`);
        }
        try {
            const index = artifactCategory.findArtifact(title);
            if(index === -1) {
                throw new Error(`Artifact with title "${title}" does not exist in category "${artifactCategory.getTitle()}".`);
            }
            const artifact = artifactCategory.#artifacts[index];
            this.addArtifact(artifact.getTitle(), artifact.getType(), artifact.getSnippet());
        } catch (error) {
            throw new Error(`Failed to copy artifact with title "${title}" from category "${artifactCategory.getTitle()}" to category "${this.getTitle()}": ${error.message}`);
        }
    }

    moveArtifactFrom(artifactCategory, title) {
        if(!(artifactCategory instanceof ArtifactCategory)) {
            throw new Error(`Supplied artifactCategory is not an instance of ArtifactCategory.`);
        }
        try {
            this.copyArtifactFrom(artifactCategory, title);
        } catch (error) {
            throw new Error(`Failed to move artifact with title "${title}" from category "${artifactCategory.getTitle()}" to category "${this.getTitle()}": ${error.message}`);
        }
        // remove the artifact from the other category if it was successfully added to this category
        artifactCategory.removeArtifact(title);
    }

    // check if a supplied title is valid for use in an artifact or category
    validateTitle(title) {
        if(!title || typeof title !== 'string') {
            throw new Error(`Supplied title is not a valid string.`);
        }
        if(title.trim().length === 0) {
            throw new Error(`Supplied title is an empty string.`);
        }
        return true;
    }

    // find an artifact by its title
    findArtifact(title) {
        this.validateTitle(title);
        return this.#artifacts.findIndex((artifact) => artifact.title === title);
    }
}

class Artifact {
    constructor(title, type, snippet) {
        this.title = title;
        this.type = type;
        this.snippet = snippet;
    }

    getTitle() {
        return this.title;
    }

    getType() {
        return this.type;
    }

    getSnippet() {
        return this.snippet;
    }

    setTitle(title) {
        this.title = title;
    }

    setType(type) {
        this.type = type;
    }

    setSnippet(snippet) {
        this.snippet = snippet;
    }
}

module.exports = { Artifact, ArtifactCategory };