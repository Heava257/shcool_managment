import dayjs  from "dayjs";


export const dateclient = (date,format = "DD/MM/YYYY")=>{
    if (date){
        return dayjs(date).format(format);
    }
    return null;
}

export const dateServer = (date,format = "DD/MM/YYYY")=>{
    if (date){
        return dayjs(date).format(format);
    }
    return null;
}