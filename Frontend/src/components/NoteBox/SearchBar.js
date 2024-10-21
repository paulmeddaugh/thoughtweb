import { useRef } from 'react';
import styles from '../../styles/NoteBox/SearchBar.module.css';
import { triggerNativeEventFor } from '../../scripts/utility/utility';

export default function SearchBar ({ value, onChange, optionsList, children }) {

    const inputRef = useRef(null);

    const handleClear = (e) => {
        triggerNativeEventFor(inputRef.current, { event: 'input', value: '' });
    }

    return (
        <div id={styles.searchBar} className={styles.configs}>
            {/* <label id={styles.searchLabel} htmlFor="searchInput">Search:</label> */}
            <div id={styles.searchInputContainer}>
                <input 
                    type="text" 
                    list='noteOptions'
                    id={styles.searchInput} 
                    placeholder="Search by title, text"
                    value={value ?? ''}
                    onChange={onChange}
                    ref={inputRef}
                />
                <div id={styles.searchInputClear} onClick={handleClear} />
            </div>
            <datalist id='noteOptions'>
                {optionsList?.map((note, index) => (
                    <option value={note.title} key={index}>
                        {note.title}
                    </option>
                ))}
            </datalist>
            {/* <div id={styles.filter}>
                <img src={filterIcon} alt="filter" />
            </div> */}
            {children}
        </div>
    );
}