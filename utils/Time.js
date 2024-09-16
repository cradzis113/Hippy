function parseTimeToMinutes(timeString) {
    const [time, period] = timeString.split(' ');
    const [hours, minutes] = time.split(':').map(Number);   
    return hours * 60 + minutes; 
}

function isMoreThan30Minutes(time1, time2) {
    const minutes1 = parseTimeToMinutes(time1);
    const minutes2 = parseTimeToMinutes(time2);
    const difference = Math.abs(minutes2 - minutes1); 
    return difference > 30; 
}

export default isMoreThan30Minutes
