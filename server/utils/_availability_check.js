
export const _availability_check = (var_value) => {

    if( !var_value || var_value == '' || var_value == undefined || var_value == null) {
        return false
    }

    return true
}