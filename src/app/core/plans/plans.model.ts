export interface Plan {
    id?: number,
    plan: string,
    cover: number,
    premium: number,
    main_members: number,
    member_age_restriction: boolean,
    member_minimum_age: string,
    member_maximum_age: string,
    extended_age_restriction: boolean,
    extended_minimum_age: string,
    extended_maximum_age: string,
    dependants: string,
    consider_age: boolean,
    dependant_minimum_age: number,
    dependant_maximum_age: number,
    additional_extended_consider_age: boolean,
    additional_extended_minimum_age: number,
    additional_extended_maximum_age: number,
    has_benefits: boolean,
    benefits: string,
    parlour: number
}


export function newPlan() {
    return {
        plan: null,
        cover: null,
        premium: null,
        main_members: null,
        member_age_restriction: false,
        member_minimum_age: null,
        member_maximum_age: null,
        extended_age_restriction: false,
        extended_minimum_age: null,
        extended_maximum_age: null,
        dependants: false,
        consider_age: false,
        dependant_minimum_age: null,
        dependant_maximum_age: null,
        additional_extended_consider_age: false,
        additional_extended_minimum_age: null,
        additional_extended_maximum_age: null,
        has_benefits: false,
        benefits: null,
        parlour: null
    };
  }