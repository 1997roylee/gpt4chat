const logger = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    log: (...message: any[]) => console.log(message),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: (...message: any[]) => console.error(message),
}

export default logger