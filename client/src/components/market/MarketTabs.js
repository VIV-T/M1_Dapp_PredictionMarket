import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function MarketTabs() {
  const location = useLocation();
  
  // On détecte si on est dans la vue Global ou Personal
  const viewPrefix = location.pathname.includes('/personal') ? '/personal' : '/global';

  const tabs = [
    { key: "active", label: "Active", path: `${viewPrefix}/active` },
    { key: "pending", label: "Pending Resolution", path: `${viewPrefix}/pending` },
    { key: "resolved", label: "Resolved", path: `${viewPrefix}/resolved` },
  ];

  return (
    <div className="market-tabs-container">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          to={tab.path}
          className={`market-tab ${location.pathname === tab.path ? "active" : ""}`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}