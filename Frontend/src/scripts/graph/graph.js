/**
 * A data structure that stores an array of objects as keys in a Map, with their values holding an array
 * indicating some kind of connection to the other keys. This graph's edges are one-directional
 */
 export class Graph {

    multidirectional = true;
    
    /**
     * Constructs a graph from no parameters, only vertices, or vertices and edges.
     * @param {*} vertices An array of objects to use as vertices. If these objects contain the properties
     *      'name,' 'x,' and 'y,' they will be able to be displayed using the GraphView class.
     * @param {*} edges An array of arrays that contain the two indices of the vertices that 
     *      have an incident edge.
     */
    constructor(vertices, edges, multidirectional = true) {
    
        this.verticies = [];
        this.neighbors = new Map();
        this.setEdgeMultidirectional(multidirectional);

        // Adds vertices if passed in
        if (vertices != undefined) {
            this.addVertices(vertices);
        }

        // Adds edges if passed in
        if (edges != undefined) {
            this.addEdges(edges);
        }
    }

    /**
     * Sets whether edges are additionally added from the second vertex to the first (muiltidirectional)
     * or only added the direction specified.
     * 
     * @param {boolean} multidirectional A boolean value indicating whether edges added go both ways or only the
     * first vertex to the second.
     */
    setEdgeMultidirectional (multidirectional) {
        this.multidirectional = multidirectional;
    }

    /**
     * Gets a vertex at the specified index.
     * 
     * @param {*} v the (relative) index of a vertex within neighbors.keys(), whose value is determined by
     *      the order elements were inserted and flunctuates on the deletion of previously inserted keys.
     * @returns the vertex at the relative index within neighbors.keys()
     */
    vertexAt(i) {
        if (i < 0 || i >= this.verticies.length) {
            throw new TypeError("Index " + i + " not within length of total vertices.");
        }

        return this.verticies[i];
    }

    /**
     * Gets the index of the specified vertex.
     * 
     * @param {*} v the vertex to retrieve the index of.
     * @returns the index, if found, or -1 if not.
     */
    indexOf(v) {
        
        if (!v?.id) return -1;

        let count = 0;
        for (let vertex of this.verticies) {
            if (vertex.id == v.id) {
                return count;
            }
            count++;
        }

        return -1;
    }

    /**
     * Adds a vertex to the graph.
     * 
     * @param {*} v the vertex to add.
     */
    addVertex(v) {
        this.verticies.push(v);
        this.neighbors.set(v.id, []);
    }

    /**
     * Adds an array of vertice objects to the graph.
     * 
     * @param {*} vertices an array of the vertices to add.
     */
    addVertices (vertices) {
        if (!(Array.isArray(vertices))) {
            throw new TypeError("param 'vertices' must be an Array.");
        } else {
            for (let vertex of vertices) {
                this.addVertex(vertex);
            }
        }
    }

    /**
     * Adds an edge to the graph, passing either the vertices themselves or the relative 
     * indices to the vertices.
     * 
     * @param {*} u the first vertex of the edge, or the relative index to the vertex.
     * @param {*} v the second vertex, or the relative index to the vertex.
     * @returns true if the insertion was a success and false if not.
     */
    addEdge(u, v, weight = null) {
        
        
        // adding by element
        if (isNaN(u) && isNaN(v)) {
            
            if (this.neighbors.has(u?.id) && this.neighbors.has(v?.id)) {
                
                binaryAddEdgeById(this.neighbors.get(u.id), v, weight ?? 0);
                if (this.multidirectional) {
                    binaryAddEdgeById(this.neighbors.get(v.id), u, weight ?? 1);
                }

                return true;
            }

        // adding by relative index
        } else { 
            if (u < 0 || u >= this.neighbors.size) {
                console.log("Couldn't add first edge index '" + u + "': index out of bounds.");
                return -1;
            }
            if (v < 0 || v >= this.neighbors.size) {
                console.log("Couldn't add second edge index '" + v + "': index out of bounds.");
                return -1;
            }

            let v1 = this.vertexAt(u);
            let v2 = this.vertexAt(v);

            let wasAdded = binaryAddEdgeById(this.neighbors.get(v1?.id), v2, weight ?? 0);
            if (this.multidirectional) {
                wasAdded = (binaryAddEdgeById(this.neighbors.get(v2?.id), v1, weight ?? 1)) ? wasAdded : false;
            }

            return wasAdded;
        }

        // Binary insert edge to a vertex's neighboring array: O(n)
        function binaryAddEdgeById (neighborsArr, v, weight) {

            if (!Array.isArray(neighborsArr)) return false;
            
            let high = neighborsArr.length - 1, low = 0, mid = 0|(high / 2);
            while (high >= low) {
                if (neighborsArr[mid].id > v.id) { // less than mid
                    high = mid - 1;
                    mid = 0|(low + (high - low) / 2);
                } else { // greater than mid
                    low = mid + 1;
                    mid = 0|(low + (high - low) / 2);
                }
            }

            neighborsArr.splice(Math.max(low, high), 0, { v: { id: v.id }, weight });
            return true;
        }

        return false;
    }

    addEdges (edges) {
        if (!(Array.isArray(edges))) {
            throw new TypeError("param \'edges\' must be an Array.");
        } else {
            for (let edge of edges) {
                if (Array.isArray(edge)) {
                    this.addEdge(edge[0], edge[1], edge[2] ?? undefined);
                } else {
                    this.addEdge(edge.u, edge.v, edge.weight ?? undefined);
                }
            }
        }
    }

    /**
     * Removes a vertex from the graph by a parameter of either the vertex itself or the 
     * relative index of the vertex.
     * 
     * @param {*} v The vertex or index as a Number of the vertex to remove.
     * @returns true if the element was successfully removed and false if not.
     */
    removeVertex(v) {

        const i = (typeof v === 'number') ? v : null;
        let vertex = (v?.hasOwnProperty('id')) ? v : this.vertexAt(i);

        if (!(this.neighbors.has(vertex?.id))) {
            throw new TypeError("v must be a vertex in the graph or an index to one.");
        }

        // Finds and removes the duplicated edge in the connected neighbors edges if multidirectional
        if (this.multidirectional) {
            const sortedEdges = this.neighbors.get(vertex.id);

            for (let edge of sortedEdges) {
                const neighborEdges = this.neighbors.get(edge.v.id);

                // Deletes vertex in the neighboring edge array with binary select: O(log n)
                let low = 0, high = neighborEdges.length - 1, mid = 0|(low + (high - low) / 2);
                while (high >= low) {
                    if (v.id > neighborEdges[mid].id) { // Greater than mid
                        low = mid + 1;
                        mid = 0|(low + (high - low) / 2);
                    } else if (v.id < neighborEdges[mid].id) { // Less than mid
                        high = mid - 1;
                        mid = 0|(low + (high - low) / 2);
                    } else { // Found
                        neighborEdges.splice(mid, 1);
                        high = low - 1;
                    }
                }
            }
        }

        this.neighbors.delete(vertex.id);

        // Removes vertex
        if (i) {
            this.verticies.splice(i, 1);   
        } else {
            this.verticies.find((ver, i, arr) => {
                if (ver.id === vertex.id) {
                    arr.splice(i, 1);
                    return true;
                }
            });
        }
        
        return true;
    }

    /**
     * Removes an edge from the graph.
     * 
     * @param {*} u The first index of a vertex, or a vertex itself, that the edge connects to.
     * @param {*} v The second index of a vertex, or a vertex itself, that the edge connects to.
     * @returns True if successfully removed, false if otherwise.
     */
    removeEdge(u, v) {

        let v1 = u;
        let v2 = v;

        // remove by relative index of insertion order
        if (typeof u == 'number' && typeof v == 'number') {
            if (u < 0 || u >= this.neighbors.size) {
                console.log("u cannot be removed because it does not exist.");
            }
            if (v < 0 || v >= this.neighbors.size) {
                console.log("v cannot be removed because it does not exist.");
            }

            v1 = this.vertexAt(u);
            v2 = this.vertexAt(v);
        }

        if (this.neighbors.has(v1.id) && this.neighbors.has(v2.id)) {

            const vertices = (this.multidirectional) ? [v1, v2] : [v1];

            for (let vertex of vertices) {
                const edges = this.neighbors.get(vertex.id);
                const oppV = (vertex === v1) ? v2 : v1;

                for (let i = edges.length - 1; i >= 0; i--) { 
                    if (edges[i].v.id === oppV.id) {
                        edges.splice(i, 1);
                        break; // doesn't check for duplicates in edges
                    }
                }
            }
            
            return true;
        }

        return false;
    }

    /**
     * Returns a vertex by its index as a Number, or its 'id' property as a String, if existing. Returns 
     * null otherwise.
     * 
     * @param {*} v The index of the vertex as a Number, or the 'id' of the vertex as a String.
     * @returns The vertex if existing. Otherwise, returns null.
     */
    getVertex(v) {
        if (typeof v == 'number') return this.verticies[v] ?? null;
        else if (typeof v == 'string') return this.verticies.find(vertex => v == vertex.id) ?? null;

        return null;
    }

    /**
     * Returns all of the vertices of the graph in an array.
     * 
     * @returns The vertices of the graph as an array.
     */
    getVertices () {
        return JSON.parse(JSON.stringify(this.verticies));
    }

    /**
     * Returns the neighboring vertices of a vertex.
     * 
     * @param {*} v The index of the vertex as a Number, the 'id' of the vertex as a String, 
     * or the vertex itself.
     * @returns The neighboring 'id's of the vertex as an array in ascending order.
     */
    getVertexNeighbors(v) {
        if (typeof v == 'number') return this.neighbors.get(this.getVertex(v)?.id)?.concat();
        else if (typeof v == 'string') return this.neighbors.get(Number(v))?.concat();
        else if (v?.hasOwnProperty('id')) return this.neighbors.get(v?.id)?.concat();

        return null;
    }

    getVertexNeighborsWithWeightZero (v) {
        if (!(typeof v == 'number' || typeof v == 'string')) return [];
        return this.getVertexNeighbors(v).filter(edge => edge.weight === 0);
    }

    /**
     * Returns all of the neighbors of every vertex in the graph in an array.
     * 
     * @returns The neighboring arrays of all the vertices within an array.
     */
    getNeighbors () {
        return JSON.parse(JSON.stringify([...this.neighbors.values()]));
    }

    /**
     * Returns the 'weight' (or distance) of an edge (connection) in the graph if the edge has a weight.
     * @param {*} u The first connecting vertex of the connection, using a relative index or the actual 
     * vertex itself.
     * @param {*} v The second connecting vertex of the connection, using a relative index or the actual 
     * vertex itself.
     * @returns The 'weight' (i.e. distance) of the edge.
     */
    getWeight(u, v) {
        if (typeof u == 'number' && typeof v == 'number') {
            if (u < 0 || u >= this.neighbors.size) {
                console.log("Cannot get weight of edge with u because " + u + " is not within index bounds.");
            }
            if (v < 0 || v >= this.neighbors.size) {
                console.log("Cannot get weight of edge with v because " + v + "is not within index bounds.");
            }

            u = this.vertexAt(u);
            v = this.vertexAt(v);
        }

        for (let edge of this.neighbors.get(u.id)) {
            if (edge.v.id == v.id) {
                return edge.weight;
            }
        }

        return null;
    }

    /**
     * Updates a vertex in the graph.
     *  
     * @param {*} v The object to update the vertex to.
     * @param {number} i (optional) The index of the vertex to update in the graph.
     */
    updateVertex (v, i) {

        // Validates parameters
        if (!v?.id) throw new TypeError('The updating vertex must have an \'id\' property.');

        if (i && typeof i !== 'number') throw new TypeError('The index must be a number.');
        if (i && (i < 0 || i >= this.size())) throw new TypeError('The index to update is out of bounds: ' + i);
        
        // Finds index using 'id' property
        if (i === undefined) i = this.indexOf(v); 
        if (i === -1) { // Adds vertex if no matching 'id' is found
            i = this.size();
            this.addVertex(v);
        }

        // Updates neighbors if different 'id'
        const prevId = this.verticies[i].id;
        if (v.id !== prevId) {
            this.neighbors.set(v.id, this.neighbors.get(prevId));
            this.neighbors.delete(prevId);
        }

        // Updates object
        this.verticies[i] = v;

        return true;
    }

    /**
     * Updates an edge's weight, specified either by the indices of the vertices that are connected, or the
     * vertices' objects themselves.
     * 
     * @param {*} u The first vertex of the edge to set the weight of, indicated either by index in the
     * graph or the actual vertex object itself.
     * @param {*} v The second vertex of the edge to set the weight of, indicated either by index in the
     * graph or the actual vertex object itself.
     * @param {number} weight The new weight of the edge.
     * @returns true if successful and false otherwise.
     */
    updateWeight(u, v, newWeight) {

        if (typeof u == 'number' && typeof v == 'number') {
            if (u < 0 || u >= this.neighbors.size) {
                console.log("Cannot get weight of edge with u because " + u + " is not within index bounds.");
            }
            if (v < 0 || v >= this.neighbors.size) {
                console.log("Cannot get weight of edge with v because " + v + "is not within index bounds.");
            }

            u = this.vertexAt(u);
            v = this.vertexAt(v);

        } else if (!u?.id && !v?.id) {
            throw new TypeError("The first and second parameters must either be indices of vertices in " 
            + "the graph, or the connecting edge objects themselves, to specify the weight of the edge to set.");
        
        } else if (isNaN(newWeight)) {
            throw new TypeError("The weight parameter must be a Number object.");
        }

        for (let edge of this.neighbors.get(u.id)) {
            if (edge.v == v) {
                Object.defineProperty(edge, 'weight', {value: newWeight});
            }
        }
        for (let edge of this.neighbors.get(v.id)) {
            if (edge.v == u) {
                Object.defineProperty(edge, 'weight', {value: newWeight});
                return true;
            }
        }

        return false;
    }

    isDisplayable () {
        return this.getVertices().every((val) => 'x' in val && 'y' in val && 'id' in val);
    }

    hasVertexInRadius (point, radius) {
        for (let [v, neighs] of this.neighbors) {
            let vDistance = Math.sqrt((point.x - v.x) * (point.x - v.x) + (point.y - v.y) * (point.y - v.y));
            if (vDistance <= radius) {
                return v;
            }
        }

        return null;
    }

    /**
     * Returns the number of vertices in the graph.
     * 
     * @returns The size of the number of vertices in the graph.
     */
    size() {
        return this.neighbors.size;
    }

    print() {
        var i = 0;
        this.neighbors.forEach((edges, vertex) => {
            let edgesString = (edges.length == 0) ? "-" : edges.reduce((prev, curr) => (prev.v) ? prev.v.id : prev + ", " + curr.v.id);
            console.log("vertex[" + vertex.id + "]: x: " + vertex.x + ", y: " + vertex.y + " -> " + edgesString);
            i++;
        });
    }

    /**
     * Returns a clone of a graph parameter.
     * 
     * @param {Graph} graph The graph object to clone.
     * @returns A clone of the graph object.
     */
    clone() {

        // Clones the vertices
        const g = new Graph(this.getVertices(), null, false); // Would reduplicate edges if multidirectional
        // Manually clones each neighbor
        let neighbors = this.getNeighbors();
        for (let i = 0; i < this.size(); i++) {

            const v = g.getVertex(i);
            const vNeighbors = neighbors[i], len = vNeighbors.length;
            for (let neighI = 0; neighI < len; neighI++) {
                const edge = vNeighbors[neighI];
                if (edge.weight !== 1) g.addEdge(v, edge.v);
            }
        }

        g.setEdgeMultidirectional(true);
        return g;
    }

    dfs(v) {
        if (typeof v == 'number') {
            v = this.vertexAt(v);
        }
        if (v == null) {
            throw new TypeError("Must pass in a vertex or an index to a vertex to search the graph.");
        }

        var visited = {};
        var searchOrder = [];
        var parent = {};

        this.dfsRecursive(v, parent, searchOrder, visited);

        return new SearchTree(v, parent, searchOrder);
    }

    dfsRecursive(vertex, parent, searchOrder, visited) {
        searchOrder.push(vertex);
        visited[JSON.stringify(vertex)] = true;

        let neighbors = this.neighbors.get(vertex);

        for (let neighbor of neighbors) {
            if (!visited[JSON.stringify(neighbor.v)]) {
                parent[JSON.stringify(neighbor.v)] = JSON.stringify(vertex);
                this.dfsRecursive(neighbor.v, parent, searchOrder, visited);
            }
        }
    }

    bfs(v) {
        if (typeof v == 'number') {
            v = this.vertexAt(v);
        }
        if (v == null) {
            throw new TypeError("Must pass in a vertex or an index to a vertex to search the graph.");
        }

        var searchOrder = [];
        var parents = {};
        var queue = [v];
        var visited = {};
        visited[JSON.stringify(queue[0])] = true;
        
        while (queue.length != 0) {
            let u = queue.shift();
            let neighbors = this.neighbors.get(u);

            for (let neighbor of neighbors) {
                if (!visited[JSON.stringify(neighbor.v)]) {
                    searchOrder.push(neighbor.v);
                    queue.push(neighbor.v);
                    parents[JSON.stringify(neighbor.v)] = JSON.stringify(u);
                    visited[JSON.stringify(neighbor.v)] = true;
                }
            }
        }

        return new SearchTree(v, parents, searchOrder);
    }

    getMinimumSpanningTree (startingVertex) {
        if (typeof startingVertex === 'number') {
            startingVertex = this.vertexAt(startingVertex);

            if (startingVertex === null) {
                throw new TypeError("Vertex must be a vertex or an index of " +
                "a vertix in the graph to get a minimum spanning tree.");
            }
        }

        let parents = {};
        var totalWeight = 0;

        let T = [];
        T.push(startingVertex);

        while(T.length < this.size()) {
            let u = -1, v = -1;
            let currentMinCost = Number.MAX_VALUE;
            for (let i of T) {
                for (let edge of this.neighbors.get(i)) {
                    if (!T.includes(edge.v) && (edge.weight < currentMinCost)) {
                        currentMinCost = edge.weight;
                        u = i;
                        v = edge.v;
                    }
                }
            }

            if (v == -1) {
                break;
            } else {
                T.push(v);
                parents[JSON.stringify(v)] = JSON.stringify(u);
            }
            totalWeight += currentMinCost;
        }

        return new MST(startingVertex, parents, T, totalWeight);
    }

    getShortestPath(sourceVertex) {

        if (typeof sourceVertex === 'number') {
            sourceVertex = this.vertexAt(sourceVertex);

            if (sourceVertex === null) {
                throw new TypeError("Vertex must be a vertex or an index of " +
                "a vertix in the graph to get its shortest path.");
            }
        }

        let cost = {};
        for (let vertex of this.neighbors.keys()) {
            cost[JSON.stringify(vertex)] = Number.MAX_VALUE;
        }
        cost[JSON.stringify(sourceVertex)] = 0;

        let parents = {};

        let T = [];

        while (T.length < this.size()) {
            var u = -1;
            var currentMinCost = Number.MAX_VALUE;

            for (let [vertex, edges] of this.neighbors) {
                if (!T.includes(vertex) && cost[JSON.stringify(vertex)] < currentMinCost) {
                    currentMinCost = cost[JSON.stringify(vertex)];
                    u = vertex;
                }
            }

            if (u == -1) {
                break;
            } else {
                T.push(u);
            }

            for (let edge of this.neighbors.get(u)) {
                if (!T.includes(edge.v) && cost[JSON.stringify(edge.v)] > cost[JSON.stringify(u)] + edge.weight) {
                    cost[JSON.stringify(edge.v)] = cost[JSON.stringify(u)] + edge.weight;
                    parents[JSON.stringify(edge.v)] = JSON.stringify(u);
                }
            }
        }

        return new ShortestPath(sourceVertex, parents, T, cost);
    }
}

class SearchTree {
    root;
    parents;
    searchOrder;

    /**
     * Takes in the root object, array of parents determined in the search, and the order of vertices searched
     * in an array.
     * 
     * @param {*} root 
     * @param {*} parent assumes the array of parent vertices is in JSON stringified form, and parses it
     * @param {*} searchOrder 
     */
    constructor(root, parents, searchOrder) {
        this.root = root;
        this.parents = parents;
        this.searchOrder = searchOrder;
    }

    /**
     * @returns the root vertex.
     */
    getRoot() {
        return JSON.parse(JSON.stringify(this.root));
    }

    /**
     * @returns stringified versions of both the vertex (property) and the parent of that vertex (value).
     */
    getParents() {
        return this.parents;
    }

    /**
     * @returns the number of vertices traversed during the search.
     */
    getNumberOfVerticesFound() {
        return this.searchOrder.length;
    }

    /**
     * 
     * @param {*} vertex the vertex to begin the search
     * @returns 
     */
    getPath(vertex) {

        if (typeof vertex != 'string') {
            vertex = JSON.stringify(vertex);
        }
        let path = [];

        do {
            path.push(vertex);
            vertex = this.parents[vertex];
        } while (this.parents[vertex] != null);

        return path;
    }

    getSearchOrder() {
        return [...this.searchOrder];
    }

    printTree () {
        console.log("Root: " + this.root);
        console.log("Edges: ");

        for (let vertex in this.parents) {
            console.log("(" + this.parents[vertex] + ", " + vertex + ")");
        }
    }
}

class MST extends SearchTree {
    totalWeight;

    constructor(root, parents, searchOrder, totalWeight) {
        super(root, parents, searchOrder);
        this.totalWeight = totalWeight;
    }

    getTotalWeight() {
        return this.totalWeight;
    }
}

class ShortestPath extends SearchTree {
    cost;

    constructor(root, parents, searchOrder, cost) {
        super(root, parents, searchOrder);
        this.cost = cost;
    }

    getCost(v) {
        if (typeof v === 'number') {
            v = this.vertexAt(v);

            if (v === null) {
                throw new TypeError("Vertex must be a vertex or an index of " +
                "a vertix in the graph to get its cost.");
            }
        }

        return this.cost[JSON.stringify(v)];
    }
}

export default Graph;
export { SearchTree };