/* ========================================================================
 * @author: Steven Jackson
 * ======================================================================== */
 
const today = new Date();
const year = today.getFullYear();
const timeComparator = today.getTime() - 86400000;

const Calendar = {
  today,
  year,
  yearMin: year - 10,
  yearMax: year + 40,
  yearViewMax: year + 16,
  monthName: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  monthAbbrev: [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'June',
    'July',
    'Aug',
    'Sept',
    'Oct',
    'Nov',
    'Dec',
  ],
  dayName: [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ],
  dayAbbrev: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  data: {},
  daysInMonth(yearVal, monthVal) {
    return new Date(yearVal, monthVal, 0).getDate();
  },
  isExpired(checkDate) {
    return checkDate.getTime() < timeComparator;
  },
};

let iterYear = parseInt(Calendar.yearMin, 10);

while (iterYear <= Calendar.yearMax) {
  iterYear += 1;
  const y = iterYear;
  const monthData = {};
  for (let m = 0; m < 12; m += 1) {
    const monthDate = new Date(y, m, 1);
    const firstDayOfWeek = monthDate.getDay();
    const weekData = {};
    if (firstDayOfWeek > 0) {
      monthDate.setDate(monthDate.getDate() - firstDayOfWeek);
    }
    for (let w = 0; w < 5; w += 1) {
      const weekArray = [];
      for (let day = 0; day < 7; day += 1) {
        const isEnabled = monthDate.getTime() >= timeComparator;
        weekArray.push({
          day: monthDate.getDate(),
          month: monthDate.getMonth(),
          year: monthDate.getFullYear(),
          enabled: isEnabled,
        });
        monthDate.setDate(monthDate.getDate() + 1);
      }
      weekData[w] = weekArray;
    }
    monthData[m] = weekData;
  }
  Calendar.data[y] = monthData;
}

export default Calendar;
