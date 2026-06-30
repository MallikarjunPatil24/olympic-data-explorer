import React, { createContext, useReducer, useContext } from 'react';

const FilterContext = createContext();

const initialState = {
  year: null,
  season: null,
  country: null, // Mapped to NOC code
  sport: null,
  gender: null, // Mapped to sex (M/F)
  medal: null,  // Mapped to medal type (Gold/Silver/Bronze/None)
};

function filterReducer(state, action) {
  switch (action.type) {
    case 'SET_FILTER':
      return {
        ...state,
        [action.payload.key]: action.payload.value || null,
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function FilterProvider({ children }) {
  const [state, dispatch] = useReducer(filterReducer, initialState);

  const setFilter = (key, value) => {
    dispatch({ type: 'SET_FILTER', payload: { key, value } });
  };

  const resetFilters = () => {
    dispatch({ type: 'RESET' });
  };

  return (
    <FilterContext.Provider value={{ filters: state, setFilter, resetFilters }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
}
export default FilterContext;
