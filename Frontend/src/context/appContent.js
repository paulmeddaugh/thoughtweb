import { createContext, useContext, useEffect, useState } from "react";
import loadJournal from "../scripts/graph/loadJournal";
import { useLoading } from "./loading";
import { useUser } from "./user";

const AppContentContext = createContext(null);

/**
 * Provides useContext
 */
export const AppContentProvider = ({ children }) => {

    const { user } = useUser();
    const { setLoading } = useLoading();

    const [graph, setGraph] = useState(null);
    const [userOrder, setUserOrder] = useState([]);
    const [notebooks, setNotebooks] = useState([]);
    const [selected, setSelected] = useState({}); // format: { note: ___, index: ___ }
    const [filters, setFilters] = useState({});
    const [newNoteId, setNewNoteId] = useState(-1);

    useEffect(() => {
        if (user?.id) {
            loadJournal(user.id, (g, nbs, userOrder) => {

                // Notebooks
                nbs.unshift({ name: 'All Notebooks' });
                setNotebooks(nbs);

                // Selected Note
                const firstNoteGraphIndex = userOrder[0]?.graphIndex;
                if (firstNoteGraphIndex) {
                    setSelected({ note: g.getVertex(firstNoteGraphIndex), index: firstNoteGraphIndex });
                } else {
                    setSelected({ note: g.getVertex(0), index: 0 });
                }

                // Graph and note order
                setUserOrder(userOrder);
                setGraph(g);

                setLoading(false);
            });
        }
    }, [user, setLoading]);

    return (
        <AppContentContext.Provider value={{ 
            graph,
            setGraph,
            userOrder,
            setUserOrder,
            selected,
            setSelected,
            notebooks,
            setNotebooks,
            filters,
            setFilters,
            newNoteId,
            setNewNoteId,
        }}>
            {children}
        </AppContentContext.Provider>
    );
}

export function useAppContent() {
    return useContext(AppContentContext);
}