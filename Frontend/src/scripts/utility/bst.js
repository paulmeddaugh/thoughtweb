class Node {
    constructor (element, weight) {
        this.element = element;
        this.weight = weight;
        this.right = null;
        this.left = null;
    }
}

export default class BinarySearchTree {
    constructor (bst) {
        if (arguments.length == 0) {
            this.root = null;
            this.size = 0;
        } else if (bst && bst.hasOwnProperty('root') && bst.hasOwnProperty('size')) { // A passed in BST
            this.root = bst.root;
            this.size = bst.size;
        }
    }

    insert (element, weight) {
        const node = new Node(element, weight);

        if (this.root == null) {
            this.root = node;
        } else {
            this.insertNode(this.root, node);
        }

        this.size++;
    }

    insertNode (node, newNode) {
        if (newNode.element < node.element) {
            if (node.left === null) {
                node.left = newNode;
            } else {
                this.insertNode(node.left, newNode);
            }
        } else {
            if (node.right === null) {
                node.right = newNode;
            } else {
                this.insertNode(node.right, newNode);
            }
        }
    }

    remove(element) {
        let parent = null, current = this.root;

        while (current != null) {
            if (current.element < element) {
                parent = current;
                current = current.right;
            } else if (current.element > element) {
                parent = current;
                current = current.left;
            } else {
                break;
            }
        }

        if (current == null) {
            return false;
        }

        // Case 1: Doesn't have a left child
        if (current.left == null) {
            if (parent == null) { // At base of tree, no iteration
                this.root = current.right;
            } else {
                if (element < parent.element) {
                    parent.left = current.right;
                } else {
                    parent.right = current.right;
                }
            }

        /* Case 2: Has a left child
            * Locate the right-most node with its parent
            * Replace current with the right-most node element
            * Append its left subtree (no more right) to the
            * right-most parent's right (replace right-most) */
        } else {
            let parentOfRightMost = current;
            let rightMost = current.left;

            while (rightMost.right) {
                parentOfRightMost = rightMost;
                rightMost = rightMost.right;
            }

            current.element = rightMost.element;

            if (parentOfRightMost.right == current) {
                parentOfRightMost.left = rightMost;
            } else {
                parentOfRightMost.right = rightMost;
            }
        }
        
        this.size--;
        return true;
    }

    getRootNode() {
        return this.root;
    }

    getSize() {
        return this.size;
    }

    /**
     * Returns the {@link BinarySearchTree} as an array sorted in ascending order.
     * 
     * @param {Node} node The node to start searching from in the tree. Defaults to the root of the tree.
     * @param {*} arr The array of sorted elements. Used recursively.
     * @returns An array of the elements of the {@link BinarySearchTree} in order.
     */
    inorder(node = this.root, arr = []) {
        if (node !== null) {
            if (node?.left) this.inorder(node.left, arr);
            arr.push(node.element);
            if (node?.right) this.inorder(node.right, arr);
        }

        if (arr.length == this.getSize()) return arr;
    }
}