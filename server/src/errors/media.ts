class CustomException extends Error{
    constructor(message){
        super(message);

        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = {
    UnknownFormatException: class extends Error{
        constructor(){
            super(`File cannot be converted.`);
        }
    },
    CreationFailureException: class extends Error{
        constructor(type) {
            super(`Failure of ${type} file failed`);
        }
    }
}