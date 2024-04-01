import 'react-tagsinput/react-tagsinput.css';
import Select from 'react-select';
import React, {useEffect} from 'react';
import ThemesService from '../services/themes-service';
import { Theme } from '../models/programModels';

const EditThemes: React.FC<{id: number, updateProgram: Function}> = ({id, updateProgram}: {id: number, updateProgram: Function}) => {
    const [themes, setThemes] = React.useState<Theme[], null>([])
    const [selectedThemes, setSelectedThemes] = React.useState<number | null>(null)

    useEffect(() => {
        // console.log(id);
        ThemesService.getTags()
            .then((response) => {
                setThemes(response.data);
                // console.log(themes);
            });
        
        ThemesService.getProgramThemes(id)
            .then((response) => {
                setSelectedThemes(response.data);
                // console.log(selectedThemes);

            });
    }, [id]);

    function saveThemes() {
        // console.log("Saving themes...");
        ThemesService.updateProgramThemes(selectedThemes, id)
            .then((response) => {
                // console.log(response.data);
                updateProgram();
            });
            
    }
    
    return (
        <React.Fragment>
            <form id="edit-theme" className="modal-body d-flex flex-column justify-content-between">
                <div className="col-12">
                    <Select
                        options={themes.map((theme: Theme) => ({label: theme.name, value: theme.id}))}
                        value={selectedThemes ? selectedThemes.map((theme: Theme) => ({label: theme.name, value: theme.id})) : []}
                        isMulti
                        onChange={(selectedOptions) => {
                            const selectedThemes = selectedOptions.map(option => themes.find(theme => theme.id === option.value));
                            setSelectedThemes(selectedThemes);
                        }}
                    />
                </div>
                <div className="d-flex justify-content-end mt-3">
                    <button type="button" className="btn btn-primary" onClick={saveThemes}>Save</button>
                </div>
            </form>
        </React.Fragment>
    )
};



export default EditThemes;
