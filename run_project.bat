@echo off
setlocal

REM Function to generate a random password
setlocal EnableDelayedExpansion
set "chars=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
set "password="
for /L %%i in (1,1,16) do (
    set /A rand=!RANDOM! %% 62
    for %%A in (!rand!) do set "char=!chars:~%%A,1!"
    set "password=!password!!char!"
)
endlocal & set "MYSQL_PASSWORD=%password%" & set "MYSQL_ROOT_PASSWORD=%password%"

REM Function to generate a random secret key
setlocal EnableDelayedExpansion
set "chars=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
set "secret="
for /L %%i in (1,1,16) do (
    set /A rand=!RANDOM! %% 62
    for %%A in (!rand!) do set "char=!chars:~%%A,1!"
    set "secret=!secret!!char!"
)
endlocal & set "SECRET_KEY=%secret%"


REM Set default options to false
set "BUILD="
set "CREATE_ENV="
set "DETACHED="
set "USAGE="

REM Process command line arguments
:process_args
if "%~1" == "--build" (
    set "BUILD=1"
    shift /1
    goto :process_args
)
if "%~1" == "--env" (
    set "CREATE_ENV=1"
    shift /1
    goto :process_args
)
if "%~1" == "-d" (
    set "DETACHED=1"
    shift /1
    goto :process_args
)
if "%~1" == "--usage" (
    set "USAGE=1"
    shift /1
    goto :process_args
)

REM Check if at least one option is provided
if "%USAGE%" == "1" (
    echo Usage: %0 [--build] [--env] [-d] [--usage]
    echo   --build   Build Docker images before starting the containers; optional
    echo   --env     Create .env file with environment variables and secure passwords; optional
    echo   -d        Run containers in detached mode; optional
    echo   --usage   Display usage information; optional
    exit /b 1
)

REM Create .env file if --env flag is set
if defined CREATE_ENV (
    echo MYSQL_USER=myuser > .env
    echo MYSQL_PASSWORD=%MYSQL_PASSWORD% >> .env
    echo MYSQL_ROOT_PASSWORD=%MYSQL_ROOT_PASSWORD% >> .env
    echo MYSQL_DATABASE=mydatabase >> .env
    echo MYSQL_HOST=database >> .env
    echo SECRET_KEY=%SECRET_KEY% >> .env 
)

REM Run docker-compose with or without build and/or detached mode based on arguments
if defined BUILD (
    if defined DETACHED (
        echo BUILDING DOCKER CONTAINERs
        echo RUNNING DOCKER IN DETACHED STATE
        echo RUN docker compose down to stop containers
        docker compose up --build -d
    ) else (
        echo BUILDING DOCKER CONTAINERs
        echo RUNNING DOCKER - CTRL-C TO STOP
        docker compose up --build
    )
) else (
    if defined DETACHED (
        echo RUNNING DOCKER IN DETACHED STATE
        echo RUN docker compose down to stop containers
        docker compose up -d
    ) else (
        echo RUNNING DOCKER - CTRL-C to exit
        docker compose up
    )
)
