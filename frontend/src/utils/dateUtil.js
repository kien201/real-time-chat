function format(date, format) {
    const dateObj = new Date(date)
    return format
        .replace('yyyy', dateObj.getFullYear())
        .replace('MM', pad(dateObj.getMonth() + 1))
        .replace('dd', pad(dateObj.getDate()))
        .replace('hh', pad(dateObj.getHours()))
        .replace('mm', pad(dateObj.getMinutes()))
        .replace('ss', pad(dateObj.getSeconds()))
        .replace('fff', pad(dateObj.getMilliseconds()))
}

function pad(value) {
    const str = String(value)
    return str.length === 1 ? '0' + str : str
}

function dynamicFormat(date) {
    const dateObj = new Date(date)
    const now = new Date()
    if (now.getFullYear() === dateObj.getFullYear()) {
        if (now.getMonth() === dateObj.getMonth()) {
            if (now.getDate() === dateObj.getDate()) {
                return dateUtil.format(date, 'hh:mm')
            }
        }
        return dateUtil.format(date, 'dd thg MM')
    }
    return dateUtil.format(date, 'dd thg MM, yyyy')
}

const dateUtil = { format, dynamicFormat }
export default dateUtil
