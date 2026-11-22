class Library {
    #categories;
    constructor() {
        this.#categories = [];
    }

    addCategory(title) {
        if(this.#findCategory(title) !== -1) {
            throw new Error(`Category with title "${title}" already exists.`);
        }
        this.#categories.push(new Category(title));
    }

    addArtifactToCategory(categoryTitle, artifactTitle, artifactType, artifactSnippet) {
        this.#validateAndFindCategory(categoryTitle).addArtifact(
            artifactTitle,
            artifactType,
            artifactSnippet
        );
    }

    removeArtifactFromCategory(categoryTitle, artifactTitle) {
        this.#validateAndFindCategory(categoryTitle).removeArtifact(artifactTitle);
    }

    modifyArtifactInCategory(categoryTitle, artifactTitle, newArtifactTitle, newArtifactType, newArtifactSnippet) {
        this.#validateAndFindCategory(categoryTitle).modifyArtifact(
            artifactTitle,
            newArtifactTitle,
            newArtifactType,
            newArtifactSnippet
        );
    }

    copyArtifact(categoryFromTitle, categoryToTitle, title) {
        const fromCategory = this.#validateAndFindCategory(categoryFromTitle);
        const toCategory = this.#validateAndFindCategory(categoryToTitle);

        try {
            const artifact = fromCategory.getArtifact(title);
            toCategory.addArtifact(artifact.title, artifact.type, artifact.snippet);
        } catch (error) {
            throw new Error(`Failed to copy artifact with title "${title}" from category "${fromCategory.getTitle()}" to category "${toCategory.getTitle()}": ${error.message}`);
        }
    }

    moveArtifact(categoryFromTitle, categoryToTitle, title) {
        const fromCategory = this.#validateAndFindCategory(categoryFromTitle);
        const toCategory = this.#validateAndFindCategory(categoryToTitle);

        try {
            this.copyArtifact(categoryFromTitle, categoryToTitle, title);
        } catch (error) {
            throw new Error(`Failed to move artifact with title "${title}" from category "${fromCategory.getTitle()}" to category "${toCategory.getTitle()}": ${error.message}`);
        }
        // remove the artifact from the other category if it was successfully added to this category
        fromCategory.removeArtifact(title);
    }

    #validateTitle(title) {
        if(!title || typeof title !== 'string') {
            throw new Error(`Supplied title is not a valid string.`);
        }
        if(title.trim().length === 0) {
            throw new Error(`Supplied title is an empty string.`);
        }
        return true;
    }

    #validateAndFindCategory(title) {
        const index = this.#findCategory(title);
        if(index === -1) {
            throw new Error(`Category with title "${title}" not found in library.`);
        }
        return this.#categories[index];
    }

    #findCategory(title) {
        this.#validateTitle(title);
        return this.#categories.findIndex((category) => category.getTitle() === title);
    }

    getCategories() {
        return this.#categories.map((category) => (category.getTitle()));
    }

    getCategoryArtifacts(title) {
        return this.#validateAndFindCategory(title).getArtifacts();
    }

    getArtifact(categoryTitle, artifactTitle) {
       return this.#validateAndFindCategory(categoryTitle).getArtifact(artifactTitle);
    }

    static fromJSON(jsonString) {
        const object = JSON.parse(jsonString);
        const library = new Library();

        if (object === null || typeof object !== "object" || Array.isArray(object)) {
            throw new Error("Data must be an object.");
        }

        if (object.schemaVersion !== 1) {
            throw new Error(`Unsupported schema version "${object.schemaVersion}".`);
        }

        if(!object.categories || !Array.isArray(object.categories)) {
            throw new Error(`Data must contain categories array`);
        }

        object.categories.forEach(category => {
            if (category === null || typeof category !== "object" || Array.isArray(category)) {
                throw new Error("Category entry must be an object.");
            }
            library.addCategory(category.title);
            if(!Array.isArray(category.artifacts)) {
                throw new Error(`Category with title "${category.title}" does not contain an artifacts array.`);
            }
            category.artifacts.forEach(artifact => {
                if (artifact === null || typeof artifact !== "object" || Array.isArray(artifact)) {
                    throw new Error("Artifact entry must be an object.");
                }
                library.addArtifactToCategory(category.title, artifact.title, artifact.type, artifact.snippet);
            });
        });
        return library;
    }

    toJSON() {
        let object = {
            schemaVersion: 1,
            categories: []
        };
        this.#categories.forEach(category => {
            let _object = {title: category.getTitle(), artifacts: []};
            category.getArtifacts().forEach(artifact => {
                _object.artifacts.push(category.getArtifact(artifact));
            });
            object.categories.push(_object);
        });
        return object;
    }
}

class Category {
    #title;
    /** @type {Artifact[]} */
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
        if(this.#findArtifact(title) !== -1) {
            throw new Error(`Artifact with title "${title}" already exists in category "${this.#title}".`);
        }
        this.#artifacts.push(new Artifact(title, type, snippet));
    }
    
    // remove an artifact from the category
    removeArtifact(title) {
        const index = this.#findArtifact(title);
        if(index !== -1) {
            this.#artifacts.splice(index, 1);
        } else {
            throw new Error(`Artifact with title "${title}" does not exist in category "${this.#title}".`);
        }
    }

    // modify an artifact in the category
    modifyArtifact(title, newTitle, newType, newSnippet) {
        const index = this.#findArtifact(title);
        if(index === -1) {
            throw new Error(`Artifact with title "${title}" does not exist in category "${this.#title}".`);
        }
        const artifact = this.#artifacts[index];
        if(newTitle != null && this.#findArtifact(newTitle) !== -1 && newTitle !== title) {
            throw new Error(`Artifact with title "${newTitle}" already exists in category "${this.#title}".`);
        } else {
            if(newTitle && this.#validateTitle(newTitle)) {
                this.#artifacts[index].title = newTitle;
            }
            this.#artifacts[index].type = newType ?? artifact.type;
            this.#artifacts[index].snippet = newSnippet ?? artifact.snippet;
        }
    }

    // check if a supplied title is valid for use in an artifact or category
    #validateTitle(title) {
        if(!title || typeof title !== 'string') {
            throw new Error(`Supplied title is not a valid string.`);
        }
        if(title.trim().length === 0) {
            throw new Error(`Supplied title is an empty string.`);
        }
        return true;
    }

    // find an artifact by its title
    #findArtifact(title) {
        this.#validateTitle(title);
        return this.#artifacts.findIndex((artifact) => artifact.title === title);
    }

    getArtifacts() {
        return this.#artifacts.map((artifact) => (artifact.getTitle()));
    }

    getArtifact(title) {
        const index = this.#findArtifact(title);
        if(index === -1) {
            throw new Error(`Artifact with title "${title}" does not exist in category "${this.#title}".`);
        }
        const artifact = this.#artifacts[index];
        return {title: artifact.getTitle(), type: artifact.getType(), snippet: artifact.getSnippet()};
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

module.exports = { Library };