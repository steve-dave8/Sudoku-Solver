class TreeNode {
    constructor(data, id) {
        this.grid = data;
        this.parent = null;
        this.children = [];
        this.hasDeadEnd = null;
        this.id = id;
    }
}

class Tree {
    constructor(data, id) {
        this.root = new TreeNode(data, id);
        this.size = 1;
    }

    /**
     * Find the node that has the given ID or null. Uses a depth-first search.
     */
    findByID(id, node = this.root) {
        // if the current node matches the data, return it
        if (node.id == id) return node;

        // recurse on each child node
        for (let child of node.children) {
            // if the data is found in any child node it will be returned here
            if (this.findByID(id, child)) return this.findByID(id, child);
        }

        // otherwise, the data was not found
        return null;
    }

    /**
     * Create a new node with the given data and add it to the specified parent node.
     * @returns {boolean} boolean indicating if the operation was successful.
     */
    add(data, id, parentID) {
        let node = new TreeNode(data, id);
        let parent = this.findByID(parentID);
    
        if (parent) {
            parent.children.push(node);
            node.parent = parent;
            this.size++;
            return true;
        }
    
        return false;
    }

    /**
     * Find the first node leaf which does not have a dead end. Uses a depth-first search.
     * @returns node leaf which does not have a dead end or null if none is found.
     */
    findLiveLeaf(node = this.root) {
        if (!node.children.length && !node.hasDeadEnd) return node;

        // recurse on each child node
        for (let child of node.children) {
            // if the data is found in any child node it will be returned here
            if (this.findLiveLeaf(child)) return child;
        }

        return null;
    }
}