import React from 'react';

// Mock imports for self-contained file (as if using react-router-dom)
const useLocation = () => ({ pathname: "/unit-company" });
const Link = ({ to, className, children, title }) => (
    <a href={to} className={className} title={title}>{children}</a>
);

export default function SidebarItem({ icon, label, to, open }) {
    // Note: The active path logic below should be adjusted if 'to' is a parent path 
    // (e.g., just '/masters') and the actual path is a child (e.g., '/masters/unit-company'). 
    // For simple links, this works perfectly.
    const { pathname } = useLocation();
    const active = pathname === to;

    return (
        <Link
            to={to}
            title={!open ? label : undefined} // native tooltip when collapsed
            className={`
                group flex items-center transition-all duration-200 relative
                ${open ? 'gap-4 px-3 py-2.5 mx-3 my-1' : 'justify-center p-3 mx-auto my-2 w-14'}
                rounded-xl cursor-pointer
                ${active
                    ? "bg-emerald-50 text-emerald-700 font-semibold"
                    : "text-slate-700 hover:bg-gray-100 hover:text-emerald-500"
                }
            `}
        >
            {/* Active Indicator Bar */}
            {active && (
                <div className="absolute left-0 top-1 bottom-1 w-1 bg-emerald-500 rounded-r-lg"></div>
            )}

            {/* Icon container - centers icon when collapsed */}
            <div className={`
                flex items-center justify-center transition-all duration-200
                ${active ? 'text-emerald-500' : 'text-slate-400 group-hover:text-emerald-500'}
                ${open ? 'w-6 h-6' : 'w-full h-auto text-xl'}
            `}>
                <span className="text-xl">{icon}</span>
            </div>

            {/* Label container - hidden when collapsed */}
            <span 
                className={`text-sm font-medium transition-all duration-150 truncate 
                    ${open ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}
                `}
            >
                {label}
            </span>
        </Link>
    );
}
