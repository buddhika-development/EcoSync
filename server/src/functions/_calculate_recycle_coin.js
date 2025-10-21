import { e_waste_price_per_kg, metal_waste_price_per_kg, paper_waste_price_per_kg } from "../../waste_config.js"

export const _calculate_waste_recycle_coin = (waste_type = null, waste_weight = null) => {
    if(waste_type == null || waste_weight == null) {
        return 0
    }

    switch(waste_type) {
        case 'e-waste':
            return _calculate_e_waste_recycle_coin(waste_weight)
        case 'metal-waste':
            return _calculate_metal_waste_recycle_coin(waste_weight)
        case 'paper-waste':
            return _calculate_paper_waste_recycle_coin(waste_weight)
        default:
            return 0
    }
}


const _calculate_paper_waste_recycle_coin = (weight) => {
    return paper_waste_price_per_kg * weight
}

const _calculate_e_waste_recycle_coin = (weight) => {
    return e_waste_price_per_kg * weight
}

const _calculate_metal_waste_recycle_coin = (weight) => {
    return metal_waste_price_per_kg * weight
}
