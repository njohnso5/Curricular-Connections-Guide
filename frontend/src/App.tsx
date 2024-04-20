import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import UtilityBar from './components/UtilityBar'
import PageContent from './components/PageContent'
import ProgramPage from './pages/ProgramPage'
import CoursePage from './pages/CoursePage'
import LoggingPage from './pages/LoggingPage';
import AuthorizationPage from './pages/Authorization/AuthorizationPage'
import ProtectedRoute from './components/ProtectedRoute'
import { useUser, useUserUpdate } from './hooks/UserContext';
import './css/App.css'
import UserService from './services/users-service';
import { AxiosResponse } from 'axios';
import { User } from './types/models';
import Alert from './components/Alert';
import { useAlert } from './hooks/AlertContext';
import AdminHomePage from './pages/AdminHomePage';
import NotFound from './components/NotFound'
import SearchPage from './pages/Search/SearchPage';
import ProgramPageDetail from './pages/Program/ProgramDetailPage';
import AdministratorNavBar from './components/AdministratorNavBar';
import ThemePage from './pages/ThemePage';

function App() {

  const user = useUser()
  const alert = useAlert();
  const setUser = useUserUpdate()
  const [isUserFetching, setIsUserFetching] = useState(true);

  React.useEffect(() => {
    UserService.getCurrentUser().then((response: AxiosResponse<User>) => {
        setUser(response.data)
    })
    .catch(_ => {
        setUser(null);
    })
    .finally(() => {
      setIsUserFetching(false);
    })
}, [setUser])

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/admin/*" element={<ProtectedRoute user={user} redirectPath="/" />} >
              <Route element={<AdministratorNavBar />}>
                <Route index element={<AdminHomePage />} />
                <Route path="programs" element={<PageContent pageTitle="Manage Programs" page={<ProgramPage />} />} />
                <Route path="courses" element={<PageContent pageTitle="Manage Courses" page={<CoursePage />} />} />
                <Route path="themes" element={<PageContent pageTitle="Manage Themes" page={<ThemePage />} />} />
                <Route path="administrators" element={<PageContent pageTitle="Administrators" page={<AuthorizationPage />} />}/>
                <Route path="logging" element={<PageContent pageTitle="Logging" page={<LoggingPage />}/>}/>
              </Route>
          </Route>
          <Route element={<UtilityBar />}>
            <Route path="/" element={<SearchPage />} />
            <Route path="/programs/:id"  element={<ProgramPageDetail />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
      {alert?.alert.open && <Alert />}
    </>
  )
}

export default App
