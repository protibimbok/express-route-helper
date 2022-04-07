export const log = (req, res, next)=>{
    console.log('Logged');
    next();
}

export const log2 = (req, res, next)=>{
    console.log('Logged 2');
    next();
}