import React, { useState, useEffect } from 'react';
import themesService from '../services/themes-service';
import "../css/ThemePage.css"
import { Theme } from "../models/programModels";
import { Modal, ModalButton, ModalNewThemeBody, DeleteThemeModalButton, DeleteThemeBody } from "../components/Modal.tsx";

interface TableBodyRowsProps {
    id: number;
}

const NewThemeTab: React.FC = () => {

    const [id, setId] = useState<number | null>(null);
    const [themes, setThemes] = useState<Theme[], null>(null);

    useEffect(() => {
        
        themesService.getTags()
            .then((response) => {
                setThemes(response.data);
            })

    }, []);

    const handleThemeUpload = (theme: Theme) => {
        setThemes((previous) => {
            return[theme, ...previous ?? []]
        })
    }

    const handleClick = (id: number) => {
        setId(id);
    };

    return (
        <div className="container-fluid">
            <div className='d-flex align-items-center justify-content-between w-100'>
                <div className="btn-group" role="toolbar">
                    <ModalButton modalTarget="uploadModal" buttonMessage="Add a theme" />
                    <Modal modalTarget="uploadModal" modalTitle="CREATE A NEW THEME" modalBody={<ModalNewThemeBody handleUpload={handleThemeUpload} />} />
                    {themes ? themes.map((theme) => (
                        <button type="button" className="btn btn-default" value={theme.id} onClick={() => handleClick(theme.id)}>{theme.name}</button>
                    )) : null}
                </div>
                <div className="delete-button-wrapper">
                    <DeleteThemeModalButton modalTarget="DeleteThemeModal" buttonMessage="Delete a theme" />
                    <Modal modalTarget="DeleteThemeModal" modalTitle="DELETE A THEME" modalBody={<DeleteThemeBody />} />
                </div>
            </div>
            {id !== null && <TableBodyRows id={id} />}
        </div >
    )
}

const TableBodyRows: React.FC<TableBodyRowsProps> = ({ id }) => {
    const[theme, setTheme] = useState<Theme | undefined>(undefined);
    const [themeId, setThemeId] = useState<number | null>(null);
    const [themes, setThemes] = useState<Theme[] | null>();
    const [themeName, setThemeName] = useState<string | undefined>();

    useEffect(() => {
        themesService.getTheme(id)
            .then((response) => {
                setThemes((prevThemes) => {
                    console.log(prevThemes);
                    return response.data;
                });
            });
    }, [id]);

    const handleClick = (themeId: number) => {
        setThemeId(themeId);
    };

    const setThemeType = (themeId: number) => {
        if (themes) {
            themes.forEach((theme) => {
                if (theme.id === themeId) {
                    setTheme(theme);
                }
            });
        }
    }

    const setThemeNameClick = (themeId: number) => {
        if (themes) {
            themes.forEach((theme) => {
                if (theme.id === themeId) {
                    setThemeName(theme.name_long);
                }
            });
        }
    };

    return (
        <div>
            <table className="table">
                <thead>
                    <tr>
                        <th scope="col">Theme Name</th>
                    </tr>
                </thead>
                <tbody>
                    {themes && themes.map((theme) => (
                        <tr key={theme.id} value={theme.id} onClick={() => { handleClick(theme.id); setThemeNameClick(theme.id); setThemeType(theme.id) }} data-toggle="modal" data-target="#themeInfoDisplay">
                            <th scope="row">{theme.name}</th>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div>
                <nav aria-label="...">
                    <ul class="pagination">
                        <li class="page-item disabled">
                            <span class="page-link">Previous</span>
                        </li>
                        <li class="page-item"><a class="page-link" href="#">1</a></li>
                        <li class="page-item active">
                            <span class="page-link">
                                2
                                <span class="sr-only">(current)</span>
                            </span>
                        </li>
                        <li class="page-item"><a class="page-link" href="#">3</a></li>
                        <li class="page-item">
                            <a class="page-link" href="#">Next</a>
                        </li>
                    </ul>
                </nav>
            </div>
            {course && (<Modal modalTarget="themeInfoDisplay" modalTitle={themeName} modalBody={<ShowThemeInfo theme={theme} />} />)}
        </div >
    );
}

const ShowThemeInfo: React.FC<{ theme: Theme }> = ({ theme }) => {

    return (
        <div className="modal-body">
            <h6><strong>Name: </strong>{theme.name}</h6>
        </div>     
    )
}

const ThemePage: React.FC = () => {


    return (
        <>
            <NewThemeTab />
        </>
    );
}

export default ThemePage;