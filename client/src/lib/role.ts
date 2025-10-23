// src/lib/role.js
export const Roles = {
    Admin: 'admin',
    Collector: 'collector',
    Resident: 'resident',
};

export const roleHome = {
    [Roles.Admin]: '/admin/dashboard',
    [Roles.Collector]: '/collector/dashboard',
    [Roles.Resident]: '/app/home',
};
