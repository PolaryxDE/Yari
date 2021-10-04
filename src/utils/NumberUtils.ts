/**
 * The number utils class offers special utility functions for the overall OnsetHub
 * software.
 */
export default class NumberUtils {

    /**
     * Parses the given value to a number. If it fails the default value will be returned.
     * @param val The value to be parsed.
     * @param def The fallback value if the parsing fails.
     */
    public static parseNumber(val: string | undefined, def: number = 0): number {
        if (!val) {
            return def;
        }
        let parsedVal: number = parseFloat(val);
        if (isNaN(parsedVal)) {
            return def;
        }
        return parsedVal;
    }

    public static formatTimestamp(timestamp: number): string {
        let time: Date = new Date(timestamp);
        return [time.getDate(), time.getMonth() + 1 >= 10
                ? time.getMonth() + 1
                : "0" + (time.getMonth() + 1), time.getFullYear()].join('.')
            + ' '
            + [(time.getHours() >= 10 ? time.getHours() : "0" + time.getHours()),
                (Math.floor(time.getMinutes()) >= 10 ? time.getMinutes() : "0" + time.getMinutes()),
                (time.getSeconds() >= 10 ? time.getSeconds() : "0" + time.getSeconds())].join(':');
    }

    /**
     * Parses the given value to a number. If it fails the default value will be returned.
     * @param val The value to be parsed.
     * @param def The fallback value if the parsing fails.
     */
    public static parseNumberNullable(val: string | undefined, def: number | undefined = undefined): number | undefined {
        if (!val) {
            return def;
        }
        let parsedVal: number = parseFloat(val);
        if (isNaN(parsedVal)) {
            return def;
        }
        return parsedVal;
    }

}
