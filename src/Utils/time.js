const timeStringToXAgo = (timeString) => {
    const timeDifferenceInMS = new Date() - new Date(timeString);
    const secondsAgo = Math.floor(timeDifferenceInMS / 1000);
    const minutesAgo = Math.floor(timeDifferenceInMS / 1000 / 60);
    const hoursAgo = Math.floor(timeDifferenceInMS / 1000 / 60 / 60);

    if (secondsAgo < 60) {
        return `${secondsAgo} second${secondsAgo > 1 ? 's' : ''}`;
    } else if (minutesAgo < 60) {
        return `${minutesAgo} minute${minutesAgo > 1 ? 's' : ''}`;
    } else if (minutesAgo >= 60) {
        return `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''}`;
    }
}

const secondsAgoToString = (secondsAgo) => {
    const minutesAgo = Math.floor(secondsAgo / 60);
    const hoursAgo = Math.floor(secondsAgo / 60 / 60);
    if (secondsAgo < 60) {
        return `${secondsAgo} second${secondsAgo > 1 ? 's' : ''}`;
    } else if (minutesAgo < 60) {
        return `${minutesAgo} minute${minutesAgo > 1 ? 's' : ''}`;
    } else if (minutesAgo >= 60) {
        return `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''}`;
    }
}

const dateToTime = (date) => {
    // Format the time i.e. 08:28:01 PM
    return date.toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: 'numeric', second: 'numeric' }); // 08:28:01
}

export {
    timeStringToXAgo,
    secondsAgoToString,
    dateToTime
}