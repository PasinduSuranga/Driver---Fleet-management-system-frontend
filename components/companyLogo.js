"use client";

import React from "react";

export default function CompanyLogo() {
    return (
        <div className="flex items">
            <img
            src="/logo.jpeg"
            alt="Company Logo"
            className="w-32 h-auto object contain"
            loading="lazy"
            />
        </div>
    );
}
