import React from 'react';
import styles from "../../css/SearchNavBar.module.css"
import Select from 'react-select';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import TagsInput from 'react-tagsinput'
import 'react-tagsinput/react-tagsinput.css'
import ProgramsService from '../../services/programs-services'
import ThemesService from '../../services/themes-service'
import { AxiosResponse } from 'axios';
import SearchService from '../../services/search-service';
import { SearchQuery } from '../../models/searchModels';

// TOGGLE BUTTON BETWEEN COURSES AND PROGRAMS

{/* <div className={`d-inline-flex gap-1`}>
        <button className={`btn btn-sm btn-primary ${styles.btn}`}>Programs</button>
        <button className={`btn btn-sm btn-primary ${styles.btn}`}>Courses</button>
    </div> */
}

interface Theme {
    id: number,
    name: string,
}

interface Departments {
    departments: string[]
}

interface SelectOption {
    label: string,
    value: string
}

interface Tag {
    name: string,
    type: SearchDropdown,
    id?: number
}

enum SearchDropdown {
    DEPARTMENTS = 'departments',
    THEMES = 'themes',
    DATE = 'date',
}

const initialQuery: SearchQuery = {
    title: '',
    departments: undefined,
    themes: undefined,
    date: undefined
}

const SearchNavBar: React.FC<{setResults: Function}> = ({setResults}) => {

    const [themes, setThemes] = React.useState<SelectOption[]>([])
    const [deparments, setDepartments] = React.useState<SelectOption[]>([])
    const [selectedTags, setSelectedTags] = React.useState<Tag[]>([]);
    const [displayDayPicker, setDisplayDayPicker] = React.useState<boolean>(false);
    const datePickerRef = React.useRef<HTMLDivElement | null>(null);
    const [searchQuery, setSearchQuery] = React.useState<SearchQuery>(initialQuery);

    const handleAddTag = (tagName: string, type: SearchDropdown) => {
        switch(type) {
            case SearchDropdown.DEPARTMENTS:
                setDepartments(prev => prev.filter(department => department.value !== tagName))
                break;
            case SearchDropdown.THEMES:
                setThemes(prev => prev.filter(theme => theme.value !== tagName))
                break;
        }

        if (!selectedTags.some((selectedTag) => selectedTag.name === tagName)) {
            setSelectedTags((prev) => [...prev, {name: tagName, type: type }]);
        }
    };

    const handleOutsideClick = (event: any) => {
        if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
            setDisplayDayPicker(false);
        }
    };

    React.useEffect(() => {
        ThemesService.getTags().then((response: AxiosResponse<Theme[]>) => {
            setThemes(response.data.map(theme => {  return {label: theme.name, value: theme.name} }))
        })
        .catch((_) => {
            console.log("Failed to load themes...");
        })

        ProgramsService.getDepartments().then((response: AxiosResponse<Departments>) => {
            setDepartments(response.data.departments.map(department => { return {label: department, value: department} }))
        })
        .catch(_ => {
            console.log(_);
            console.log("Failed to fetch departments...")
        })

        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
          document.removeEventListener('mousedown', handleOutsideClick);
        };

    }, [])

    const handleTagDelete = (_tag: any, _changedTags: any, changedIndexes: number[]) => {
        const tag = selectedTags[changedIndexes[0]]
        switch(tag.type) {
            case SearchDropdown.DEPARTMENTS:
                setDepartments(prev => [...prev, {label: tag.name, value: tag.name}].sort((a, b) => a.label.localeCompare(b.label)))
                break;
            case SearchDropdown.THEMES:
                setThemes(prev => [...prev, {label: tag.name, value: tag.name}].sort((a, b) => a.label.localeCompare(b.label)))
                break;
        }

        setSelectedTags((prev) => prev.filter((_, index) => !changedIndexes.includes(index)));
    }

    const handleDateSelected = (date: Date | undefined) => {
        if(date) { handleAddTag(date.toDateString(), SearchDropdown.DATE); }
        setDisplayDayPicker(prev => !prev)
    }

    const handleCreateDropdown = (placeholder: string, options: SelectOption[], type: SearchDropdown) => {
        return (
            <Select
                id="tagInput"
                options={options}
                value={null}
                onChange={(event: any) => handleAddTag(event[0].value, type)}
                isSearchable
                isMulti
                placeholder={placeholder}
                styles={{control: (provided) => ({
                    ...provided,
                    width: '175px'
                })}}
            />
        )
    }

    function handleQueryChange(event: any) {
        const {name, value} = event.target;
        setSearchQuery((prevValues) => ({...prevValues, [name]: value}));
    }

    function handleSearch() {
        console.log(selectedTags);
        searchQuery.departments = selectedTags.filter(tag => tag.type == "departments").map(tag => tag.name);
        searchQuery.themes = selectedTags.filter(tag => tag.type == "themes").map(tag => tag.name);
        
        // date{
        //     "name": "Fri Feb 09 2024",
        //     "type": "date"
        // }
        searchQuery.dates = selectedTags.filter(tag => tag.type == "date").map(tag => tag.name);
        console.log(searchQuery);
        SearchService.getSearchResults(searchQuery)
        .then(response => {
            setResults(response.data);
        })
        .catch(_ => {
            console.error("Could not make the requested search");
        })
    }

    return(
        <>
            <div className='row'>
                <div className="col-md-6">
                    <div className={`d-inline-flex align-items-center ${styles.searchtogglecontainer}`}>
                        {handleCreateDropdown("Departments...", deparments, SearchDropdown.DEPARTMENTS)}
                        {handleCreateDropdown("Themes...", themes, SearchDropdown.THEMES)}
                        <div className={`${styles.clearButton}`}>
                            <i className={`fa fa-calendar ${styles.calandarIcon}`} aria-hidden="true" onClick={() => setDisplayDayPicker(true)}></i>
                            {displayDayPicker && 
                                <div ref={datePickerRef}>
                                    <DayPicker    
                                        mode="single"
                                        onSelect={handleDateSelected}
                                        style={{ position: 'absolute', top: '10px', left: '20px', backgroundColor: 'white', zIndex: '1', border: '1px solid black'}}
                                    />
                                </div>
                            }
                        </div>
                    </div>
                </div>
                <div className="col-md-6 d-flex justify-content-end">
                    <div className='d-inline-flex align-items-center gap-1'>
                        <input name="title" className={`form-control mr-sm-2 ${styles.searhField}`} type="search" placeholder="Search" aria-label="Search" value={searchQuery.title} onChange={handleQueryChange}/>
                        <button className='btn btn-small btn-primary' onClick={() => handleSearch()}>Search</button>
                    </div>
                </div>
            </div>
            <div className='row'>
                {selectedTags.length !== 0 && <div className="col-12">
                    <TagsInput 
                        value={selectedTags.map(tag => tag.name)} 
                        onChange={handleTagDelete} 
                        inputProps={{placeholder: undefined, readOnly: true, style: { border: 'none', outline: 'none' } }}
                    />
                </div>
                }
            </div>
        </>
    )
}

export default SearchNavBar;