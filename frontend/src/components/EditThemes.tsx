import 'react-tagsinput/react-tagsinput.css';
import Select from 'react-select';
import React, {useEffect} from 'react';
import ThemesService from '../services/themes-service';
import { Theme, ProgramData } from '../models/programModels';
import { Course } from '../CourseModels/courseModels';
const EditThemes: React.FC<{obj: Course | ProgramData, update: Function}> = ({obj, update }: {obj: any, update: Function}) => {
    const [themes, setThemes] = React.useState<Theme[], null>([])
    const [selectedThemes, setSelectedThemes] = React.useState<number | null>(null)
    useEffect(() => {
        // console.log(id);
        ThemesService.getTags()
            .then((response) => {
                setThemes(response.data);
                // console.log(themes);
            });
        if(obj) {
            setSelectedThemes(obj.themes);
        }

    }, [obj]);
    function isPorgramData(obj: any): obj is ProgramData {
        console.log((obj as ProgramData).department !== undefined);
        return (obj as ProgramData).department !== undefined;
    }

    function saveThemes() {
        if (!isPorgramData(obj)) {
            ThemesService.updateCourseThemes(selectedThemes, obj.id)
                .then((response) => {
                    update();
                });

        } else {
            ThemesService.updateProgramThemes(selectedThemes, obj.id)
                .then((response) => {
                    update();
                });
        }

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
