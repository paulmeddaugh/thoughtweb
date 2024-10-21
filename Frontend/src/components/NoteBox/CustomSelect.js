import { useEffect, useRef } from 'react';
import styles from '../../styles/NoteBox/CustomSelect.module.css';
import NoteBoxNotebook from './NoteBoxNotebook';
import useUpdateState from '../../hooks/useUpdateState';

const CustomSelect = ({ items, onSelect, onDeleteClick, onAddClick, defaultValues }) => {

    const option = useRef(null);
    const nbOptions = useRef(null);

    const [selectProps, setSelectProps] = useUpdateState({  
        optionInnerHTML: defaultValues.innerHTML, 
        'optionData-idnotebook': null,
        nbOptionsVisible: false 
    });

    useEffect(() => {
        changeNotebookObserver.observe(option.current, { attributes: true });
        nbOptions.current.tabIndex = 20; // Makes nbOptions focusable
    }, [items]);

    const selectOnClick = (e) => {
        e.preventDefault();
        setSelectProps({ nbOptionsVisible: !selectProps.nbOptionsVisible });
        nbOptions.current.focus();
    };

    // Calls onSelect function when the option element is mutated to simulate selecting a value
    const changeNotebookObserver = new MutationObserver((mutations) => {
        if (mutations.find((mutation) => mutation.type === "attributes")) {
            onSelect?.(option.current.innerHTML, option.current.value, 
                option.current.getAttribute('data-idnotebook'));
        }
    });

    return (
        <div id={styles.selectContainer} className={styles.configs}>
            <div className={styles.nbDropdown}>
                <select 
                    id={styles.select}  
                    defaultValue={defaultValues.innerHTML} 
                    onMouseDown={selectOnClick}
                >
                    <option 
                        id={styles.option} 
                        ref={option}
                        data-idnotebook={selectProps['optionData-idnotebook']}
                    >
                        {selectProps.optionInnerHTML}
                    </option>
                </select>
                <div 
                    id={styles.nbOptions} 
                    ref={nbOptions} 
                    onBlur={() => setSelectProps({ nbOptionsVisible: false })}
                    className={selectProps?.nbOptionsVisible ? null : styles.nbOptionsInvisible}
                >
                    {items?.map((nb, index) => (
                        <NoteBoxNotebook 
                            notebook={nb} 
                            liftSelectProps={setSelectProps}
                            onDeleteClick={onDeleteClick}
                            onAddClick={onAddClick}
                            key={index}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default CustomSelect;