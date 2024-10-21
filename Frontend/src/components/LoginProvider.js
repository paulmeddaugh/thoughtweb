import { createContext, useContext, useState } from "react";

const UserOrderContext = createContext(null);
const SetUserOrderContext = createContext(null);

const GraphContext = createContext(null);
const SetGraphContext = createContext(null);

const SelectedContext = createContext(null);
const SetSelectedContext = createContext(null);

const NotebooksContext = createContext(null);
const SetNotebooksContext = createContext(null);

const UserIdContext = createContext(null);

const FiltersContext = createContext(null);
const SetFiltersContext = createContext(null);

/**
 * Provides useContext
 */
export const LoginProvider = ({ children, graph, setGraph, userOrder, setUserOrder, selected, setSelected,
    notebooks, setNotebooks, userId }) => {

    const [filters, setFilters] = useState({});

    return (
        <GraphContext.Provider value={graph}>
            <SetGraphContext.Provider value={setGraph}>

                <UserOrderContext.Provider value={userOrder}>
                    <SetUserOrderContext.Provider value={setUserOrder}>

                        <SelectedContext.Provider value={selected}>
                            <SetSelectedContext.Provider value={setSelected}>

                                <NotebooksContext.Provider value={notebooks}>
                                    <SetNotebooksContext.Provider value={setNotebooks}>

                                        <UserIdContext.Provider value={userId}>

                                            <FiltersContext.Provider value={filters}>
                                                <SetFiltersContext.Provider value={setFilters}>
                                                    {children}
                                                </SetFiltersContext.Provider>
                                            </FiltersContext.Provider>    
                                            
                                        </UserIdContext.Provider>

                                    </SetNotebooksContext.Provider>
                                </NotebooksContext.Provider>

                            </SetSelectedContext.Provider>
                        </SelectedContext.Provider>

                    </SetUserOrderContext.Provider>
                </UserOrderContext.Provider>

            </SetGraphContext.Provider>
        </GraphContext.Provider>
    );
}

export function useGraph() {
    return useContext(GraphContext);
}

export function useSetGraph() {
    return useContext(SetGraphContext);
}

export function useUserOrder() {
    return useContext(UserOrderContext);
}

export function useSetUserOrder() {
    return useContext(SetUserOrderContext);
}

export function useSelected() {
    return useContext(SelectedContext);
}

export function useSetSelected() {
    return useContext(SetSelectedContext);
}

export function useNotebooks() {
    return useContext(NotebooksContext);
}

export function useSetNotebooks() {
    return useContext(SetNotebooksContext);
}

export function useUserId() {
    return useContext(UserIdContext);
}

export function useFilters() {
    return useContext(FiltersContext);
}

export function useSetFilters() {
    return useContext(SetFiltersContext);
}