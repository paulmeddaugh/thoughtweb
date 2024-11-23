import { useCallback, useEffect, useMemo, useRef } from 'react';
import styles from '../../styles/NoteBox/CustomSelect.module.css';
import NoteBoxNotebook from './NoteBoxNotebook';
import useUpdateState from '../../hooks/useUpdateState';
import { createPortal } from 'react-dom';

const CustomSelect = ({ items, onSelect, onDeleteNotebook, onRenameNotebook, onAddNotebook, defaultValues }) => {

    const option = useRef(null);
    const nbOptions = useRef(null);

    const [selectedOptionProps, setSelectOptionProps] = useUpdateState({  
        innerHtml: defaultValues?.innerHTML, 
        idNotebook: defaultValues?.id,
        optionsVisible: false,
        containerStyle: null,
        style: null
    });

    // Calls onSelect function when the option element is mutated to simulate selecting a value
    const changeNotebookObserver = useMemo(() => new MutationObserver((mutations) => {
        const isAttributesMutation = mutations.find((mutation) => mutation.type === "attributes");
        if (isAttributesMutation) {
            const { innerHTML, value, dataset } = option.current;
            onSelect?.(innerHTML, value, dataset.idnotebook);
        }
    }), [onSelect]);

    useEffect(() => {
        changeNotebookObserver.observe(option.current, { attributes: true });
    }, [changeNotebookObserver]);

    const handleSelectClick = (e) => {
        e.preventDefault();
        const optionsVisible = !selectedOptionProps?.optionsVisible;
        const { left, top, width, height } = optionsVisible
                ? document.getElementById(styles.select)?.getBoundingClientRect()
                : {}
        setSelectOptionProps(prev => ({
            ...prev, 
            optionsVisible: !selectedOptionProps.optionsVisible,
            containerStyle: optionsVisible ? { left, top: `${parseInt(top) + parseInt(height)}px` } : null,
            style: optionsVisible ? { width } : null,
        }));
    };

    const handleOptionClick = useCallback((notebook) => {
        const { id, name } = notebook ?? {};
        setSelectOptionProps({
            innerHtml: name, 
            idNotebook: id, 
            optionsVisible: false 
        });
    }, [setSelectOptionProps])

    useEffect(() => {
        const onResizeId = window.addEventListener("resize", e => {
            setSelectOptionProps(prev => ({ ...prev, optionsVisible: false }));
        })
        return () => {
            window.removeEventListener("resize", onResizeId);
        }
    }, [setSelectOptionProps]);

    // const handleNbOptionsBlur = () => setSelectedOptionProps({ optionsVisible: false });

    return (
        <div id={styles.selectContainer} className={styles.configs}>
            <div className={styles.nbDropdown}>
                <select 
                    id={styles.select}  
                    defaultValue={defaultValues.innerHTML} 
                    onMouseDown={handleSelectClick}
                >
                    <option 
                        id={styles.option} 
                        ref={option}
                        data-idnotebook={selectedOptionProps.idNotebook}
                    >
                        {selectedOptionProps.innerHtml}
                    </option>
                </select>
                <div className={styles.addNotebookIcon}></div>
            </div>
            {createPortal((
                <div 
                    className={styles.nbOptionsContainer}
                    style={selectedOptionProps?.containerStyle}
                >
                    <div 
                        id={styles.nbOptions} 
                        className={selectedOptionProps?.optionsVisible ? null : styles.nbOptionsInvisible}
                        style={selectedOptionProps?.style}
                        ref={nbOptions} 
                        tabIndex={20}
                        autoFocus
                    >
                        {items?.map(nb => (
                            <NoteBoxNotebook 
                                notebook={nb} 
                                onSelected={handleOptionClick}
                                onDeleteClick={onDeleteNotebook}
                                onRenameClick={onRenameNotebook}
                                onAddNotebook={onAddNotebook}
                                key={nb?.id}
                            />
                        ))}
                    </div>
                </div>
            ), document.getElementById('portals'))}
        </div>
    );
}

export default CustomSelect;