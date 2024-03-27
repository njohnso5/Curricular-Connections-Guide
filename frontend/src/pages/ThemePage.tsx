import React, { useState, useEffect } from 'react';
import themesService from '../services/themes-service';
import "../css/ThemePage.css"
import { Theme } from "../models/programModels";
import { Modal, ModalButton, ModalNewThemeBody, DeleteThemeModalButton, DeleteThemeBody } from "../components/Modal.tsx";

interface TableBodyRowsProps {
    id: number;
}

const NewThemeTab: React.FC = () => {

    const [id, setId] = useState<number | undefined>(undefined);
    const [themes, setThemes] = useState<Theme[], undefined>(undefined);

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

    return (
        <div className="container-fluid">
            <div className='d-flex flex-row align-items-center justify-content-between w-100'>
                <div className="add-button-wrapper">
                    <ModalButton modalTarget="uploadModal" buttonMessage="Add a Theme" />
                    <Modal modalTarget="uploadModal" modalTitle="CREATE A NEW THEME" modalBody={<ModalNewThemeBody handleUpload={handleThemeUpload} />} />
                </div>
                <div className="delete-button-wrapper">
                    <DeleteThemeModalButton modalTarget="DeleteThemeModal" buttonMessage="Delete a Theme" />
                    <Modal modalTarget="DeleteThemeModal" modalTitle="DELETE A THEME" modalBody={<DeleteThemeBody />} />
                </div>
            </div>
            <div className='grid-container'>
                <div className="grid-item">
                    {themes ? themes.map((theme) => (
                        <button type="button" className="theme-button" value={theme.id}>{theme.name}</button>
                    )) : undefined}
                </div>
            </div>
            {id !== undefined && <TableBodyRows id={id} />}
        </div >
    )
}

const TableBodyRows: React.FC<TableBodyRowsProps> = ({ id }) => {
    const[theme, setTheme] = useState<Theme | undefined>(undefined);
    const [themeId, setThemeId] = useState<number | undefined>(undefined);
    const [themes, setThemes] = useState<Theme[] | undefined>();
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
                    <ul className="pagination">
                        <li className="page-item disabled">
                            <span className="page-link">Previous</span>
                        </li>
                        <li className="page-item"><a className="page-link" href="#">1</a></li>
                        <li className="page-item active">
                            <span className="page-link">
                                2
                                <span className="sr-only">(current)</span>
                            </span>
                        </li>
                        <li className="page-item"><a className="page-link" href="#">3</a></li>
                        <li className="page-item">
                            <a className="page-link" href="#">Next</a>
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