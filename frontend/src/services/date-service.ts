class DateService {

    WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    /**
     * Gets the month date from a Date object
     * 
     * @returns a month date in the format MONTH/DAY
     */
    getMonthDate = (date: Date) => {
        const dayNumber = date.getDate();
        const monthDate = (date.getMonth() + 1) + "/" + dayNumber;

        return monthDate;
    }

    /**
     * Gets the weekday from a date object
     * @param date is the date object to parse
     * @returns the weekday for the date object
     */
    getWeekday = (date: Date) => {
        const weekday = this.WEEKDAYS[date.getDay()];
        return weekday
    }
}

export default new DateService();